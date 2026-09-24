param(
    [string]$Version = "4.4",
    [string]$SignPfxPath = "",
    [string]$SignPfxPassword = "",
    [string]$SignThumbprint = "",
    [string]$TimestampUrl = "http://timestamp.digicert.com",
    [switch]$SkipSigning,
    [switch]$RequireSigning
)

$ErrorActionPreference = "Stop"

function Align-Value([UInt64]$Value, [UInt64]$Alignment) {
    if ($Alignment -eq 0) { throw "Alignment cannot be zero." }
    return [UInt64]([Math]::Floor(($Value + $Alignment - 1) / [double]$Alignment) * $Alignment)
}

function Write-UInt16([byte[]]$Buffer, [int]$Offset, [UInt16]$Value) {
    [Array]::Copy([BitConverter]::GetBytes($Value), 0, $Buffer, $Offset, 2)
}

function Write-UInt32([byte[]]$Buffer, [int]$Offset, [UInt32]$Value) {
    [Array]::Copy([BitConverter]::GetBytes($Value), 0, $Buffer, $Offset, 4)
}

$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$AppDir = Join-Path $Root "app"
$LauncherPath = Join-Path $Root "launcher-base.exe"
$OutputDir = Join-Path $Root "output"
$OutputPath = Join-Path $OutputDir ("mk_photo_mask_v{0}.exe" -f $Version)
$WorkDir = Join-Path ([System.IO.Path]::GetTempPath()) ("PhotoPrivacyBuild-" + [Guid]::NewGuid().ToString("N"))
$PayloadDir = Join-Path $WorkDir "payload"
$PayloadZip = Join-Path $WorkDir "payload.zip"
$SigningConfigured = (($SignPfxPath -and (Test-Path $SignPfxPath)) -or [bool]$SignThumbprint)

if ($RequireSigning -and $SkipSigning) { throw "-RequireSigning cannot be combined with -SkipSigning." }
if ($RequireSigning -and -not $SigningConfigured) { throw "A signed release was required, but no PFX path or certificate thumbprint was provided." }

try {
    Write-Host "[1/7] Checking source files..." -ForegroundColor Cyan
    $Required = @(
        (Join-Path $AppDir "index.html"),
        (Join-Path $AppDir "server.ps1"),
        (Join-Path $AppDir "icon.ico"),
        (Join-Path $AppDir "libs\face-api.js"),
        (Join-Path $AppDir "models\ssd_mobilenetv1_model.bin"),
        (Join-Path $AppDir "models\ssd_mobilenetv1_model-weights_manifest.json"),
        (Join-Path $AppDir "mediapipe\face_detection.js"),
        (Join-Path $AppDir "mediapipe\face_detection_full.binarypb"),
        (Join-Path $AppDir "mediapipe\face_detection_short.binarypb"),
        (Join-Path $AppDir "mediapipe\face_detection_solution_simd_wasm_bin.js"),
        (Join-Path $AppDir "mediapipe\face_detection_solution_simd_wasm_bin.wasm"),
        (Join-Path $AppDir "mediapipe\face_detection_solution_simd_wasm_bin.data"),
        (Join-Path $AppDir "mediapipe\face_detection_solution_wasm_bin.js"),
        (Join-Path $AppDir "mediapipe\face_detection_solution_wasm_bin.wasm"),
        $LauncherPath
    )
    $Missing = @($Required | Where-Object { -not [System.IO.File]::Exists($_) })
    if ($Missing.Count -gt 0) {
        throw "Missing required file(s):`n  " + ($Missing -join "`n  ")
    }

    [System.IO.Directory]::CreateDirectory($WorkDir) | Out-Null
    [System.IO.Directory]::CreateDirectory($PayloadDir) | Out-Null
    [System.IO.Directory]::CreateDirectory($OutputDir) | Out-Null

    # Keep output deterministic and avoid stale/garbled EXE names from older builds.
    Get-ChildItem -Path $OutputDir -Filter "*.exe" -File -ErrorAction SilentlyContinue | Remove-Item -Force

    Write-Host "[2/7] Preparing app payload v$Version..." -ForegroundColor Cyan
    Copy-Item -Path (Join-Path $AppDir "*") -Destination $PayloadDir -Recurse -Force

    foreach ($Name in @("index.html", "server.ps1")) {
        $Path = Join-Path $PayloadDir $Name
        $Text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
        $Text = [System.Text.RegularExpressions.Regex]::Replace($Text, 'v\d+(?:\.\d+)+', "v$Version")
        [System.IO.File]::WriteAllText($Path, $Text, (New-Object System.Text.UTF8Encoding($true)))
    }

    Write-Host "[3/7] Compressing offline assets..." -ForegroundColor Cyan
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory(
        $PayloadDir,
        $PayloadZip,
        [System.IO.Compression.CompressionLevel]::Optimal,
        $false
    )

    $Payload = [System.IO.File]::ReadAllBytes($PayloadZip)
    $Launcher = [System.IO.File]::ReadAllBytes($LauncherPath)
    $PayloadHash = ([BitConverter]::ToString(([System.Security.Cryptography.SHA256]::Create()).ComputeHash($Payload))).Replace("-", "").ToLowerInvariant()

    Write-Host "[4/7] Adding the embedded PE payload section..." -ForegroundColor Cyan
    $PeOffset = [BitConverter]::ToInt32($Launcher, 0x3C)
    if ([System.Text.Encoding]::ASCII.GetString($Launcher, $PeOffset, 4) -ne "PE`0`0") {
        throw "launcher-base.exe is not a valid PE file."
    }

    $SectionCount = [BitConverter]::ToUInt16($Launcher, $PeOffset + 6)
    $OptionalSize = [BitConverter]::ToUInt16($Launcher, $PeOffset + 20)
    $OptionalOffset = $PeOffset + 24
    if ([BitConverter]::ToUInt16($Launcher, $OptionalOffset) -ne 0x20B) {
        throw "launcher-base.exe is not a 64-bit PE32+ executable."
    }

    $FileAlignment = [BitConverter]::ToUInt32($Launcher, $OptionalOffset + 36)
    $SectionAlignment = [BitConverter]::ToUInt32($Launcher, $OptionalOffset + 32)
    $SectionTable = $OptionalOffset + $OptionalSize
    $NewSectionHeader = $SectionTable + ($SectionCount * 40)
    $FirstRawOffset = [Int32]::MaxValue
    [UInt64]$EndRva = 0

    for ($Index = 0; $Index -lt $SectionCount; $Index++) {
        $Header = $SectionTable + ($Index * 40)
        $VirtualSize = [BitConverter]::ToUInt32($Launcher, $Header + 8)
        $VirtualAddress = [BitConverter]::ToUInt32($Launcher, $Header + 12)
        $RawSize = [BitConverter]::ToUInt32($Launcher, $Header + 16)
        $RawOffset = [BitConverter]::ToUInt32($Launcher, $Header + 20)
        if ($RawOffset -gt 0 -and $RawOffset -lt $FirstRawOffset) { $FirstRawOffset = $RawOffset }
        [UInt64]$SectionSpan = if ($VirtualSize -gt $RawSize) { $VirtualSize } else { $RawSize }
        $SectionEnd = [UInt64]$VirtualAddress + $SectionSpan
        if ($SectionEnd -gt $EndRva) { $EndRva = $SectionEnd }
    }

    if (($NewSectionHeader + 40) -gt $FirstRawOffset) {
        throw "launcher-base.exe does not have room for another PE section header."
    }

    [UInt32]$PayloadRva = Align-Value $EndRva $SectionAlignment
    [UInt32]$PayloadRawOffset = Align-Value $Launcher.Length $FileAlignment
    [UInt32]$PayloadRawSize = Align-Value $Payload.Length $FileAlignment
    [UInt32]$NewImageSize = Align-Value ([UInt64]$PayloadRva + $Payload.Length) $SectionAlignment
    $FinalLength = [int]([UInt64]$PayloadRawOffset + $PayloadRawSize)
    $Final = New-Object byte[] $FinalLength

    [Array]::Copy($Launcher, 0, $Final, 0, $Launcher.Length)
    [Array]::Copy($Payload, 0, $Final, $PayloadRawOffset, $Payload.Length)

    $SectionName = [System.Text.Encoding]::ASCII.GetBytes(".payload")
    [Array]::Copy($SectionName, 0, $Final, $NewSectionHeader, $SectionName.Length)
    Write-UInt32 $Final ($NewSectionHeader + 8) ([UInt32]$Payload.Length)
    Write-UInt32 $Final ($NewSectionHeader + 12) $PayloadRva
    Write-UInt32 $Final ($NewSectionHeader + 16) $PayloadRawSize
    Write-UInt32 $Final ($NewSectionHeader + 20) $PayloadRawOffset
    Write-UInt32 $Final ($NewSectionHeader + 36) 0x40000040

    Write-UInt16 $Final ($PeOffset + 6) ([UInt16]($SectionCount + 1))
    $OldInitializedSize = [BitConverter]::ToUInt32($Launcher, $OptionalOffset + 8)
    Write-UInt32 $Final ($OptionalOffset + 8) ([UInt32]($OldInitializedSize + $PayloadRawSize))
    Write-UInt32 $Final ($OptionalOffset + 56) $NewImageSize
    Write-UInt32 $Final ($OptionalOffset + 64) 0

    [System.IO.File]::WriteAllBytes($OutputPath, $Final)

    Write-Host "[5/7] Verifying embedded content..." -ForegroundColor Cyan
    $Check = [System.IO.File]::ReadAllBytes($OutputPath)
    $CheckPayload = New-Object byte[] $Payload.Length
    [Array]::Copy($Check, $PayloadRawOffset, $CheckPayload, 0, $Payload.Length)
    $CheckHash = ([BitConverter]::ToString(([System.Security.Cryptography.SHA256]::Create()).ComputeHash($CheckPayload))).Replace("-", "").ToLowerInvariant()
    if ($CheckHash -ne $PayloadHash) { throw "Embedded payload verification failed." }

    Write-Host "[6/7] Optional code signing..." -ForegroundColor Cyan
    if (-not $SkipSigning -and $SigningConfigured) {
        $SignTool = (Get-Command signtool.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source)
        if (-not $SignTool) {
            $SdkRoots = @(
                "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
                "$env:ProgramFiles\Windows Kits\10\bin"
            ) | Where-Object { $_ -and (Test-Path $_) }
            foreach ($RootPath in $SdkRoots) {
                $Candidate = Get-ChildItem -Path $RootPath -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
                    Where-Object { $_.FullName -match '\\x64\\signtool\.exe$' } |
                    Sort-Object FullName -Descending | Select-Object -First 1
                if ($Candidate) { $SignTool = $Candidate.FullName; break }
            }
        }
        if (-not $SignTool) { throw "Signing was requested, but signtool.exe was not found. Install the Windows SDK or use -SkipSigning." }
        $Args = @("sign", "/fd", "SHA256", "/td", "SHA256", "/tr", $TimestampUrl)
        if ($SignPfxPath) {
            $Args += @("/f", (Resolve-Path $SignPfxPath).Path)
            if ($SignPfxPassword) { $Args += @("/p", $SignPfxPassword) }
        } elseif ($SignThumbprint) {
            $Args += @("/sha1", $SignThumbprint)
        }
        $Args += $OutputPath
        & $SignTool @Args
        if ($LASTEXITCODE -ne 0) { throw "Code signing failed with exit code $LASTEXITCODE." }
        & $SignTool verify /pa /v $OutputPath
        if ($LASTEXITCODE -ne 0) { throw "Signature verification failed with exit code $LASTEXITCODE." }
        Write-Host "Signed and verified: $OutputPath" -ForegroundColor Green
    } else {
        if ($RequireSigning) { throw "Release signing is required, but signing was skipped." }
        Write-Host "Signing skipped. Provide -SignPfxPath or -SignThumbprint when a trusted certificate is available." -ForegroundColor DarkGray
    }

    if ($RequireSigning) {
        $Signature = Get-AuthenticodeSignature -FilePath $OutputPath
        if ($Signature.Status -ne 'Valid' -or -not $Signature.SignerCertificate) {
            throw "Release guard failed: Authenticode signature is not valid."
        }
        Write-Host ("Release guard: valid signer = " + $Signature.SignerCertificate.Subject) -ForegroundColor Green
    }

    Write-Host "[7/7] Build completed." -ForegroundColor Green
    Write-Host "Output: $OutputPath" -ForegroundColor Green
    $ExeHash = (Get-FileHash -Algorithm SHA256 -Path $OutputPath).Hash.ToLowerInvariant()
    Write-Host "Version: $Version"
    Write-Host "Payload SHA-256: $PayloadHash"
    Write-Host "EXE SHA-256: $ExeHash"
    exit 0
}
catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ([System.IO.Directory]::Exists($WorkDir)) {
        try { [System.IO.Directory]::Delete($WorkDir, $true) } catch { }
    }
}
