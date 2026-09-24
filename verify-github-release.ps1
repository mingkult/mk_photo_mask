param(
    [string]$Directory = '.\release-verify',
    [string]$ExeName = 'mk_photo_mask_v4.3.exe',
    [switch]$RequireValidSignature,
    [switch]$RequireTimestamp
)
$ErrorActionPreference = 'Stop'
$exe = Join-Path $Directory $ExeName
$shaFile = "$exe.sha256"
if (-not (Test-Path $exe)) { throw "Release EXE not found: $exe" }
if (-not (Test-Path $shaFile)) { throw "Checksum file not found: $shaFile" }

$line = (Get-Content $shaFile -Raw).Trim()
$expected = ($line -split '\s+')[0].ToLowerInvariant()
$actual = (Get-FileHash -Algorithm SHA256 $exe).Hash.ToLowerInvariant()
if ($expected -ne $actual) { throw "SHA-256 mismatch. Expected $expected, actual $actual" }
Write-Host "SHA-256: verified" -ForegroundColor Green

$params = @{ ExePath = $exe }
if ($RequireValidSignature) { $params.RequireValidSignature = $true }
if ($RequireTimestamp) { $params.RequireTimestamp = $true }
.\release-guard.ps1 @params
Write-Host 'Published GitHub Release verification: PASS' -ForegroundColor Green
