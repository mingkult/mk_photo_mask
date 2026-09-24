#!/usr/bin/env bash
set -euo pipefail

VERSION="4.2"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT_DIR/app"
TEMPLATE="$ROOT_DIR/launcher/launcher.template.s"
OUTPUT_DIR="$ROOT_DIR/output"
WORK_DIR="$(mktemp -d)"

cleanup() {
  rm -rf -- "$WORK_DIR"
}
trap cleanup EXIT

for cmd in as ld objcopy objdump zip unzip sha256sum python3 sed cmp; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "缺少建置工具：$cmd"
    echo "請先執行：sudo apt update && sudo apt install -y binutils zip unzip python3"
    exit 1
  }
done

test -f "$APP_DIR/index.html" || { echo "缺少 app/index.html"; exit 1; }
test -f "$APP_DIR/server.ps1" || { echo "缺少 app/server.ps1"; exit 1; }
test -f "$APP_DIR/icon.ico" || { echo "缺少 app/icon.ico"; exit 1; }

mkdir -p "$OUTPUT_DIR" "$WORK_DIR/payload"
rm -f -- "$OUTPUT_DIR"/*.exe
cp -a "$APP_DIR/." "$WORK_DIR/payload/"

# 統一顯示版本；只修改工作副本，不改動 app 原始檔。
sed -i -E "s/(單檔版 v)[0-9]+(\.[0-9]+)*/\1${VERSION}/g" \
  "$WORK_DIR/payload/index.html" "$WORK_DIR/payload/server.ps1"

(
  cd "$WORK_DIR/payload"
  zip -r -9 "$WORK_DIR/payload.zip" . >/dev/null
)
unzip -t "$WORK_DIR/payload.zip" >/dev/null

PAYLOAD_HASH="$(sha256sum "$WORK_DIR/payload.zip" | awk '{print $1}')"
HASH12="${PAYLOAD_HASH:0:12}"

sed \
  -e "s/@@VERSION@@/${VERSION}/g" \
  -e "s/@@HASH12@@/${HASH12}/g" \
  "$TEMPLATE" > "$WORK_DIR/launcher.s"
cp "$APP_DIR/icon.ico" "$WORK_DIR/icon.ico"

(
  cd "$WORK_DIR"
  as --64 -o launcher.o launcher.s
  ld -m i386pep \
    --subsystem windows \
    --entry launcher_entry \
    --image-base 0x140000000 \
    --file-alignment 0x200 \
    --section-alignment 0x1000 \
    --disable-dynamicbase \
    --disable-high-entropy-va \
    --disable-reloc-section \
    --nxcompat \
    -o launcher_base.exe launcher.o
)

PAYLOAD_VMA="$(python3 - "$WORK_DIR/launcher_base.exe" <<'PY'
import struct, sys

path = sys.argv[1]
data = open(path, 'rb').read()
pe = struct.unpack_from('<I', data, 0x3c)[0]
count = struct.unpack_from('<H', data, pe + 6)[0]
opt_size = struct.unpack_from('<H', data, pe + 20)[0]
opt = pe + 24
image_base = struct.unpack_from('<Q', data, opt + 24)[0]
section_alignment = struct.unpack_from('<I', data, opt + 32)[0]
section_table = opt + opt_size
end_rva = 0
for i in range(count):
    off = section_table + i * 40
    virtual_size = struct.unpack_from('<I', data, off + 8)[0]
    virtual_address = struct.unpack_from('<I', data, off + 12)[0]
    raw_size = struct.unpack_from('<I', data, off + 16)[0]
    end_rva = max(end_rva, virtual_address + max(virtual_size, raw_size))
end_rva = (end_rva + section_alignment - 1) & ~(section_alignment - 1)
print(hex(image_base + end_rva))
PY
)"

OUTPUT_FILE="$OUTPUT_DIR/PhotoPrivacyTool_v${VERSION}.exe"
objcopy \
  --add-section .payload="$WORK_DIR/payload.zip" \
  --set-section-flags .payload=alloc,load,readonly,data \
  --change-section-vma .payload="$PAYLOAD_VMA" \
  --change-section-lma .payload="$PAYLOAD_VMA" \
  "$WORK_DIR/launcher_base.exe" "$OUTPUT_FILE"

objcopy --dump-section .payload="$WORK_DIR/payload_check.zip" "$OUTPUT_FILE"
cmp "$WORK_DIR/payload.zip" "$WORK_DIR/payload_check.zip"
objdump -h "$OUTPUT_FILE" | grep -q '\.payload'

echo "建置完成：$OUTPUT_FILE"
echo "版本：$VERSION"
echo "內嵌資料 SHA-256：$PAYLOAD_HASH"
