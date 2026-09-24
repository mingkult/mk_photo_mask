param(
    [Parameter(Mandatory=$true)][string]$PfxPath,
    [Parameter(Mandatory=$true)][string]$PfxPassword,
    [Parameter(Mandatory=$true)][string]$Repository
)
$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh.exe -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh.exe) was not found. Install GitHub CLI and run: gh auth login'
}
if (-not (Test-Path $PfxPath)) { throw "PFX not found: $PfxPath" }

.\check-signing-readiness.ps1 -PfxPath $PfxPath -PfxPassword $PfxPassword -RequireCodeSigningEku

$repoInfo = gh repo view $Repository --json nameWithOwner 2>$null
if ($LASTEXITCODE -ne 0) { throw "Cannot access GitHub repository: $Repository" }

$bytes = [IO.File]::ReadAllBytes((Resolve-Path $PfxPath).Path)
$base64 = [Convert]::ToBase64String($bytes)
try {
    $base64 | gh secret set MK_SIGN_PFX_BASE64 --repo $Repository
    if ($LASTEXITCODE -ne 0) { throw 'Failed to set MK_SIGN_PFX_BASE64.' }
    $PfxPassword | gh secret set MK_SIGN_PFX_PASSWORD --repo $Repository
    if ($LASTEXITCODE -ne 0) { throw 'Failed to set MK_SIGN_PFX_PASSWORD.' }
    Write-Host "GitHub signing secrets are configured for $Repository." -ForegroundColor Green
    Write-Host 'Secret values were not printed.' -ForegroundColor DarkGray
}
finally {
    $base64 = $null
    $bytes = $null
    [GC]::Collect()
}
