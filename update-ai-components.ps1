param(
    [string]$Version = "1.0.1"
)
$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$App = Join-Path $Root "app"
if (-not (Test-Path (Join-Path $App "index.html"))) { throw "app\index.html not found." }
$Dest = Join-Path $App "mediapipe-tasks"
$Wasm = Join-Path $Dest "wasm"
$Models = Join-Path $Dest "models"
New-Item -ItemType Directory -Force -Path $Dest,$Wasm,$Models | Out-Null

$Base = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@$Version"
$Files = @(
    @{ Url="$Base/vision_bundle.mjs"; Path=(Join-Path $Dest "vision_bundle.mjs") },
    @{ Url="$Base/wasm/vision_wasm_internal.js"; Path=(Join-Path $Wasm "vision_wasm_internal.js") },
    @{ Url="$Base/wasm/vision_wasm_internal.wasm"; Path=(Join-Path $Wasm "vision_wasm_internal.wasm") },
    @{ Url="$Base/wasm/vision_wasm_module_internal.js"; Path=(Join-Path $Wasm "vision_wasm_module_internal.js") },
    @{ Url="$Base/wasm/vision_wasm_module_internal.wasm"; Path=(Join-Path $Wasm "vision_wasm_module_internal.wasm") },
    @{ Url="$Base/wasm/vision_wasm_nosimd_internal.js"; Path=(Join-Path $Wasm "vision_wasm_nosimd_internal.js") },
    @{ Url="$Base/wasm/vision_wasm_nosimd_internal.wasm"; Path=(Join-Path $Wasm "vision_wasm_nosimd_internal.wasm") }
)

Write-Host "Downloading MediaPipe Tasks Vision $Version from official npm CDN..." -ForegroundColor Cyan
foreach ($f in $Files) {
    $name = Split-Path -Leaf $f.Path
    Write-Host "  -> $name"
    Invoke-WebRequest -UseBasicParsing -Uri $f.Url -OutFile $f.Path
    if (-not (Test-Path $f.Path) -or (Get-Item $f.Path).Length -le 0) { throw "Download failed: $name" }
}

# Reuse the already bundled official BlazeFace model files. Their model architecture is
# the same official MediaPipe Face Detector model family used by Tasks Vision.
Copy-Item (Join-Path $App "mediapipe\face_detection_full_range.tflite") (Join-Path $Models "blaze_face_full_range.tflite") -Force
Copy-Item (Join-Path $App "mediapipe\face_detection_short_range.tflite") (Join-Path $Models "blaze_face_short_range.tflite") -Force

$manifest = [ordered]@{
    component = "@mediapipe/tasks-vision"
    version = $Version
    installed_at = (Get-Date).ToString("s")
    source = "https://www.npmjs.com/package/@mediapipe/tasks-vision"
    mode = "offline-local-assets"
}
$manifest | ConvertTo-Json | Set-Content -Encoding UTF8 (Join-Path $Dest "version.json")
Write-Host "MediaPipe Tasks Vision $Version installed to app\mediapipe-tasks." -ForegroundColor Green
Write-Host "Run build-windows-singlefile.cmd again to embed the updated AI runtime into the EXE." -ForegroundColor Yellow
