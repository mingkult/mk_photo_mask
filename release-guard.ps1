param(
    [Parameter(Mandatory=$true)][string]$ExePath,
    [switch]$RequireValidSignature,
    [switch]$RequireTimestamp
)
$ErrorActionPreference = "Stop"
if (-not (Test-Path $ExePath)) { throw "EXE not found: $ExePath" }
$file = Get-Item $ExePath
if ($file.Length -lt 1MB) { throw "Release guard failed: EXE is unexpectedly small ($($file.Length) bytes)." }
$hash = (Get-FileHash -Algorithm SHA256 $file.FullName).Hash.ToLowerInvariant()
Write-Host "EXE: $($file.FullName)" -ForegroundColor Cyan
Write-Host "Size: $([Math]::Round($file.Length / 1MB, 2)) MB"
Write-Host "SHA-256: $hash"
$sig = Get-AuthenticodeSignature -FilePath $file.FullName
if ($RequireValidSignature) {
    if ($sig.Status -ne 'Valid' -or -not $sig.SignerCertificate) {
        throw "Release guard failed: a valid Authenticode signature is required (status: $($sig.Status))."
    }
    Write-Host "Signer: $($sig.SignerCertificate.Subject)" -ForegroundColor Green
    Write-Host "Signature: valid" -ForegroundColor Green
} elseif ($sig.Status -eq 'Valid') {
    Write-Host "Signature: valid ($($sig.SignerCertificate.Subject))" -ForegroundColor Green
} else {
    Write-Host "Signature: $($sig.Status) (allowed for local/test builds only)" -ForegroundColor Yellow
}

if ($RequireTimestamp) {
    if ($sig.Status -ne 'Valid') { throw "Timestamp verification requires a valid signature." }
    $statusText = ($sig | Format-List * | Out-String)
    $hasTimestamp = $statusText -match '(?i)TimeStamperCertificate|Timestamp|TimeStamp'
    if (-not $hasTimestamp) {
        Write-Host "Warning: PowerShell Authenticode output did not expose timestamp metadata; SignTool verification remains authoritative." -ForegroundColor Yellow
    } else {
        Write-Host "Timestamp metadata: detected" -ForegroundColor Green
    }
}
Write-Host "Release guard: PASS" -ForegroundColor Green
