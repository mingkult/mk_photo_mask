param(
    [string]$PythonEmbedZip = "",
    [string]$RuntimeDir = "",
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host ("[V4.2] " + $Message) -ForegroundColor Cyan
}

$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$ProjectRoot = Split-Path $Root -Parent
if ([string]::IsNullOrWhiteSpace($RuntimeDir)) {
    $RuntimeDir = Join-Path $ProjectRoot "app\advanced_ai_runtime"
}
$SiteDir = Join-Path $RuntimeDir "Lib\site-packages"
$HelperSource = Join-Path $Root "advanced_ai_helper.py"
$Requirements = Join-Path $Root "requirements.txt"
$PythonUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"

Write-Step "Preparing built-in dlib Lite runtime..."
Write-Host "Runtime directory: $RuntimeDir"

if ($Clean -and [System.IO.Directory]::Exists($RuntimeDir)) {
    Remove-Item -LiteralPath $RuntimeDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $RuntimeDir | Out-Null
New-Item -ItemType Directory -Force -Path $SiteDir | Out-Null

if ([string]::IsNullOrWhiteSpace($PythonEmbedZip)) {
    $PythonEmbedZip = Join-Path $Root "python-3.11.9-embed-amd64.zip"
}

if (-not [System.IO.File]::Exists($PythonEmbedZip)) {
    Write-Step "Python 3.11.9 embeddable package not found; downloading from python.org..."
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $PythonUrl -OutFile $PythonEmbedZip -UseBasicParsing
    }
    catch {
        Write-Host "Unable to download Python embeddable package." -ForegroundColor Red
        Write-Host "Please download this file manually:" -ForegroundColor Yellow
        Write-Host $PythonUrl -ForegroundColor Yellow
        Write-Host "Then place it here: $PythonEmbedZip" -ForegroundColor Yellow
        throw
    }
}

Write-Step "Extracting Python embeddable runtime..."
Expand-Archive -LiteralPath $PythonEmbedZip -DestinationPath $RuntimeDir -Force

$PthFile = Get-ChildItem -Path $RuntimeDir -Filter "python*._pth" | Select-Object -First 1
if ($PthFile) {
    $Lines = @(Get-Content -LiteralPath $PthFile.FullName)
    $Lines = @($Lines | Where-Object { $_ -notmatch '^#?import site\s*$' -and $_ -ne 'Lib\site-packages' })
    $Lines += 'Lib\site-packages'
    $Lines += 'import site'
    [System.IO.File]::WriteAllLines($PthFile.FullName, $Lines, (New-Object System.Text.UTF8Encoding($false)))
}

$RuntimePython = Join-Path $RuntimeDir "python.exe"
if (-not [System.IO.File]::Exists($RuntimePython)) {
    throw "python.exe was not found after extracting the embeddable runtime."
}

if (-not [System.IO.File]::Exists($Requirements)) {
    throw "requirements.txt not found: $Requirements"
}

# The embeddable Python distribution does not include ensurepip.
# Use the developer machine's Python 3.11/pip to install binary packages directly
# into the embedded runtime's site-packages directory.
$InstallerPython = $null
$PyLauncher = Get-Command py.exe -ErrorAction SilentlyContinue
if ($PyLauncher) {
    try {
        & py.exe -3.11 -c "import sys; print(sys.executable)" *> $null
        if ($LASTEXITCODE -eq 0) { $InstallerPython = @("py.exe", "-3.11") }
    } catch { }
}
if (-not $InstallerPython) {
    $PythonCmd = Get-Command python.exe -ErrorAction SilentlyContinue
    if ($PythonCmd) {
        try {
            & $PythonCmd.Source -c "import sys; assert sys.version_info[:2] == (3,11)" *> $null
            if ($LASTEXITCODE -eq 0) { $InstallerPython = @($PythonCmd.Source) }
        } catch { }
    }
}
if (-not $InstallerPython) {
    throw "Python 3.11 was not found on this build computer. Install Python 3.11 only on the build computer, then run this script again. End users will not need Python."
}

$WheelDir = Join-Path $Root "wheels"
New-Item -ItemType Directory -Force -Path $WheelDir | Out-Null
$OfflineWheels = @(Get-ChildItem -Path $WheelDir -Filter "*.whl" -File -ErrorAction SilentlyContinue)

Write-Step "Installing dlib Lite dependencies into the portable runtime..."
$InstallArgs = @()
if ($InstallerPython.Count -gt 1) { $InstallArgs += $InstallerPython[1..($InstallerPython.Count - 1)] }
$InstallArgs += @("-m", "pip", "install", "--upgrade", "--target", $SiteDir, "--only-binary=:all:")
if ($OfflineWheels.Count -gt 0) {
    $InstallArgs += @("--no-index", "--find-links", $WheelDir)
}
$InstallArgs += @("-r", $Requirements)

& $InstallerPython[0] @InstallArgs
if ($LASTEXITCODE -ne 0) {
    throw "pip failed to install dlib Lite dependencies. Exit code: $LASTEXITCODE"
}

Copy-Item -LiteralPath $HelperSource -Destination (Join-Path $RuntimeDir "advanced_ai_helper.py") -Force
$Readme = Join-Path $Root "README_ADVANCED_AI.txt"
if ([System.IO.File]::Exists($Readme)) {
    Copy-Item -LiteralPath $Readme -Destination (Join-Path $RuntimeDir "README_ADVANCED_AI.txt") -Force
}

Write-Step "Verifying the built-in runtime..."
& $RuntimePython -c "import dlib, numpy, PIL; print('dlib=' + getattr(dlib,'__version__','unknown')); print('numpy=' + numpy.__version__); print('Pillow=' + PIL.__version__)"
if ($LASTEXITCODE -ne 0) {
    throw "Built-in runtime verification failed."
}

Write-Host "" 
Write-Host "SUCCESS: built-in dlib Lite runtime is ready." -ForegroundColor Green
Write-Host "Next: run build-windows-singlefile.cmd to package it into mk_photo_mask_v4.2.exe." -ForegroundColor Green
