param(
    [string]$PfxPath = "",
    [string]$PfxPassword = "",
    [string]$Thumbprint = "",
    [switch]$RequireCodeSigningEku
)
$ErrorActionPreference = "Stop"

function Find-SignTool {
    $tool = (Get-Command signtool.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source)
    if ($tool) { return $tool }
    $roots = @("${env:ProgramFiles(x86)}\Windows Kits\10\bin", "$env:ProgramFiles\Windows Kits\10\bin") | Where-Object { $_ -and (Test-Path $_) }
    foreach ($root in $roots) {
        $candidate = Get-ChildItem -Path $root -Filter signtool.exe -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match '\\x64\\signtool\.exe$' } |
            Sort-Object FullName -Descending | Select-Object -First 1
        if ($candidate) { return $candidate.FullName }
    }
    return $null
}

function Test-CodeSigningEku($Cert) {
    $oids = @()
    foreach ($ext in $Cert.Extensions) {
        if ($ext -is [System.Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension]) {
            foreach ($oid in $ext.EnhancedKeyUsages) { $oids += $oid.Value }
        }
    }
    return $oids -contains '1.3.6.1.5.5.7.3.3'
}

function Validate-Certificate($Cert) {
    $now = Get-Date
    if (-not $Cert.HasPrivateKey) { throw "The certificate does not contain an accessible private key." }
    if ($Cert.NotBefore -gt $now -or $Cert.NotAfter -le $now) { throw "The signing certificate is not currently valid." }
    if ($RequireCodeSigningEku -and -not (Test-CodeSigningEku $Cert)) {
        throw "The certificate does not include the Code Signing EKU (1.3.6.1.5.5.7.3.3)."
    }
    Write-Host "Certificate: $($Cert.Subject)" -ForegroundColor Green
    Write-Host "Thumbprint: $($Cert.Thumbprint)" -ForegroundColor Green
    Write-Host "Valid from: $($Cert.NotBefore.ToString('yyyy-MM-dd HH:mm:ss'))"
    Write-Host "Expires: $($Cert.NotAfter.ToString('yyyy-MM-dd HH:mm:ss'))"
    if (Test-CodeSigningEku $Cert) { Write-Host "Code Signing EKU: OK" -ForegroundColor Green }
    elseif ($RequireCodeSigningEku) { throw "Code Signing EKU missing." }
    else { Write-Host "Code Signing EKU: not detected" -ForegroundColor Yellow }
}

$signtool = Find-SignTool
if (-not $signtool) { throw "signtool.exe was not found. Install the Windows SDK signing tools." }
Write-Host "SignTool: $signtool" -ForegroundColor Green

if ($PfxPath) {
    if (-not (Test-Path $PfxPath)) { throw "PFX not found: $PfxPath" }
    $flags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($PfxPath, $PfxPassword, $flags)
    Validate-Certificate $cert
    Write-Host "Signing readiness: OK" -ForegroundColor Green
    exit 0
}

if ($Thumbprint) {
    $normalized = ($Thumbprint -replace '\s','').ToUpperInvariant()
    $cert = Get-ChildItem Cert:\CurrentUser\My, Cert:\LocalMachine\My -ErrorAction SilentlyContinue |
        Where-Object { ($_.Thumbprint -replace '\s','').ToUpperInvariant() -eq $normalized } |
        Select-Object -First 1
    if (-not $cert) { throw "Certificate thumbprint was not found in CurrentUser/My or LocalMachine/My." }
    Validate-Certificate $cert
    Write-Host "Signing readiness: OK" -ForegroundColor Green
    exit 0
}

throw "Provide -PfxPath or -Thumbprint to check signing readiness."
