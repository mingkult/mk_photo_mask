param(
  [string]$Repository = "mingkult/mk_photo_mask",
  [ValidateSet("private", "public")]
  [string]$Visibility = "private",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
Set-Location $PSScriptRoot

$ToolsRoot = Join-Path $PSScriptRoot "tools"
$PortableGitRoot = Join-Path $ToolsRoot "MinGit"
$PortableGhRoot = Join-Path $ToolsRoot "GitHubCLI"
New-Item -ItemType Directory -Force -Path $ToolsRoot | Out-Null

function Invoke-GitHubApi([string]$Url) {
  $headers = @{
    "User-Agent" = "mk-photo-mask-publisher"
    "Accept" = "application/vnd.github+json"
  }
  return Invoke-RestMethod -Uri $Url -Headers $headers -UseBasicParsing
}

function Find-GitExecutable {
  $existing = Get-Command git.exe -ErrorAction SilentlyContinue
  if ($existing) { return $existing.Source }

  $portable = Join-Path $PortableGitRoot "cmd\git.exe"
  if (Test-Path $portable) { return $portable }
  return $null
}

function Download-WithProgress {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][string]$Destination,
    [string]$DisplayName = "file"
  )

  if (Test-Path $Destination) { Remove-Item $Destination -Force -ErrorAction SilentlyContinue }
  Write-Host "Downloading $DisplayName..."
  Write-Host "Source: $Url"

  # curl.exe ships with current Windows 10/11 and gives reliable visible progress.
  # Prefer it over BITS to avoid BITS job-handle differences between PowerShell builds.
  $curl = Get-Command curl.exe -ErrorAction SilentlyContinue
  if ($curl) {
    & $curl.Source -L --fail --retry 3 --retry-delay 2 --connect-timeout 20 --progress-bar -o $Destination $Url
    if ($LASTEXITCODE -eq 0 -and (Test-Path $Destination)) { return }
    Write-Warning "curl download did not complete successfully; trying BITS/PowerShell fallback."
    Remove-Item $Destination -Force -ErrorAction SilentlyContinue
  }

  # BITS fallback. Use the synchronous form because it is more consistent across
  # Windows PowerShell versions and does not require tracking a possibly-null JobId.
  $bits = Get-Command Start-BitsTransfer -ErrorAction SilentlyContinue
  if ($bits) {
    try {
      Start-BitsTransfer -Source $Url -Destination $Destination -DisplayName "mk_photo_mask download" -ErrorAction Stop
      if (Test-Path $Destination) {
        Write-Host "Download complete (BITS)."
        return
      }
    } catch {
      Write-Warning "BITS download was not available/successful: $($_.Exception.Message)"
      Remove-Item $Destination -Force -ErrorAction SilentlyContinue
    }
  }

  $oldProgress = $ProgressPreference
  try {
    $ProgressPreference = 'Continue'
    Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing -TimeoutSec 1200
  } finally {
    $ProgressPreference = $oldProgress
  }

  if (-not (Test-Path $Destination)) { throw "Download failed: $DisplayName" }
}

function Install-PortableGit {
  Write-Host "Git was not found. Preparing official MinGit (portable, no admin rights required)..."
  Write-Host "Using MinGit instead of full PortableGit to reduce the download size."

  $release = Invoke-GitHubApi "https://api.github.com/repos/git-for-windows/git/releases/latest"
  $asset = $release.assets | Where-Object {
    $_.name -match '^MinGit-.*-64-bit\.zip$'
  } | Select-Object -First 1
  if (-not $asset) { throw "Could not find the official 64-bit MinGit package." }

  $archive = Join-Path $env:TEMP $asset.name
  Write-Host "Package: $($asset.name)"
  if ($asset.size) {
    Write-Host ("Size: {0} MB" -f [math]::Round(([double]$asset.size / 1MB), 1))
  }
  Download-WithProgress -Url $asset.browser_download_url -Destination $archive -DisplayName $asset.name

  if (-not (Test-Path $archive)) { throw "Git package download did not produce a file." }
  if ((Get-Item $archive).Length -lt 5MB) { throw "Downloaded Git package is unexpectedly small; please retry." }

  if (Test-Path $PortableGitRoot) { Remove-Item $PortableGitRoot -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $PortableGitRoot | Out-Null

  Write-Host "Extracting MinGit..."
  Expand-Archive -Path $archive -DestinationPath $PortableGitRoot -Force
  Remove-Item $archive -Force -ErrorAction SilentlyContinue

  $gitExe = Join-Path $PortableGitRoot "cmd\git.exe"
  if (-not (Test-Path $gitExe)) {
    $found = Get-ChildItem -Path $PortableGitRoot -Filter git.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $gitExe = $found.FullName }
  }
  if (-not (Test-Path $gitExe)) { throw "MinGit was extracted, but git.exe was not found." }
  return $gitExe
}

function Find-GhExecutable {
  $existing = Get-Command gh.exe -ErrorAction SilentlyContinue
  if ($existing) { return $existing.Source }

  if (Test-Path $PortableGhRoot) {
    $portable = Get-ChildItem -Path $PortableGhRoot -Filter gh.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($portable) { return $portable.FullName }
  }
  return $null
}

function Install-PortableGh {
  Write-Host "GitHub CLI was not found. Preparing official portable GitHub CLI (no admin rights required)..."
  $release = Invoke-GitHubApi "https://api.github.com/repos/cli/cli/releases/latest"
  $asset = $release.assets | Where-Object {
    $_.name -match '^gh_.*_windows_amd64\.zip$'
  } | Select-Object -First 1
  if (-not $asset) { throw "Could not find the official 64-bit Windows GitHub CLI package." }

  $archive = Join-Path $env:TEMP $asset.name
  if ($asset.size) { Write-Host ("Package: {0} ({1} MB)" -f $asset.name, [math]::Round(([double]$asset.size / 1MB), 1)) }
  Download-WithProgress -Url $asset.browser_download_url -Destination $archive -DisplayName $asset.name

  if (Test-Path $PortableGhRoot) { Remove-Item $PortableGhRoot -Recurse -Force }
  New-Item -ItemType Directory -Force -Path $PortableGhRoot | Out-Null
  Expand-Archive -Path $archive -DestinationPath $PortableGhRoot -Force
  Remove-Item $archive -Force -ErrorAction SilentlyContinue

  $portable = Get-ChildItem -Path $PortableGhRoot -Filter gh.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $portable) { throw "GitHub CLI was extracted, but gh.exe was not found." }
  return $portable.FullName
}

function Ensure-PublishingTools {
  $gitExe = Find-GitExecutable
  if (-not $gitExe) { $gitExe = Install-PortableGit }

  $ghExe = Find-GhExecutable
  if (-not $ghExe) { $ghExe = Install-PortableGh }

  # gh.exe discovers Git through PATH. Portable MinGit can be invoked directly
  # by PowerShell, but gh auth login/setup-git will fail unless git.exe is also
  # visible in the current process PATH. Add both portable tool directories
  # for this process only; this does not modify the user's Windows PATH.
  $gitBinDir = Split-Path -Parent $gitExe
  $ghBinDir = Split-Path -Parent $ghExe
  $pathParts = @($gitBinDir, $ghBinDir) + ($env:PATH -split ';' | Where-Object { $_ })
  $env:PATH = (($pathParts | Select-Object -Unique) -join ';')

  Set-Alias -Name git -Value $gitExe -Scope Script
  Set-Alias -Name gh -Value $ghExe -Scope Script

  Write-Host "Git: $gitExe"
  & git --version | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "Git verification failed." }

  Write-Host "GitHub CLI: $ghExe"
  & gh --version | Select-Object -First 1 | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "GitHub CLI verification failed." }
}

Write-Host "============================================================"
Write-Host " mk_photo_mask V4.4 - GitHub Publisher"
Write-Host " Repository: $Repository"
Write-Host "============================================================"
Write-Host ""

Write-Host "[1/8] Preparing Git and GitHub CLI..."
Ensure-PublishingTools

Write-Host "[2/8] Checking GitHub login..."
$gitFromPath = Get-Command git.exe -ErrorAction SilentlyContinue
if (-not $gitFromPath) { throw "Portable Git is ready but is not visible in PATH for GitHub CLI." }
Write-Host "Git visible to GitHub CLI: $($gitFromPath.Source)"
& gh auth status | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub CLI is not logged in. Starting browser/device login..."
  & gh auth login --hostname github.com --git-protocol https --web
  if ($LASTEXITCODE -ne 0) { throw "GitHub login failed." }
}

# Configure git HTTPS authentication through GitHub CLI. Because MinGit was added
# to this process PATH above, gh can now find git.exe without a system install.
& gh auth setup-git
if ($LASTEXITCODE -ne 0) { Write-Warning "gh auth setup-git did not complete; git push may ask for authentication." }

Write-Host "[3/8] Checking repository..."
# A missing repository is an expected state on first publish. Windows PowerShell 5.1
# can promote native stderr to a terminating NativeCommandError when
# $ErrorActionPreference is Stop, so temporarily suppress native output and inspect
# only the process exit code.
$oldErrorActionPreference = $ErrorActionPreference
try {
  $ErrorActionPreference = "Continue"
  & gh repo view $Repository --json nameWithOwner *> $null
  $repoViewExitCode = $LASTEXITCODE
} finally {
  $ErrorActionPreference = $oldErrorActionPreference
}
$repoExists = ($repoViewExitCode -eq 0)
if ($repoExists) {
  Write-Host "Repository already exists: https://github.com/$Repository"
} else {
  Write-Host "Repository does not exist yet. It will be created in step 6."
}

if (-not (Test-Path ".git")) {
  Write-Host "[4/8] Initializing local Git repository..."
  & git init -b $Branch
  if ($LASTEXITCODE -ne 0) { throw "git init failed." }
} else {
  Write-Host "[4/8] Existing local Git repository detected."
}

$gitName = (& git config --get user.name 2>$null)
$gitEmail = (& git config --get user.email 2>$null)
if (-not $gitName) { & git config user.name "mingkult" }
if (-not $gitEmail) { & git config user.email "62247322+mingkult@users.noreply.github.com" }

Write-Host "[5/8] Staging V4.4 source..."
& git add -A
if ($LASTEXITCODE -ne 0) { throw "git add failed." }

& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  & git commit -m "Publish mk_photo_mask V4.4"
  if ($LASTEXITCODE -ne 0) { throw "git commit failed." }
} else {
  Write-Host "No new files to commit."
}

if (-not $repoExists) {
  Write-Host "[6/8] Creating GitHub repository $Repository ($Visibility)..."
  $visibilityFlag = if ($Visibility -eq "public") { "--public" } else { "--private" }
  & gh repo create $Repository $visibilityFlag --source . --remote origin
  if ($LASTEXITCODE -ne 0) { throw "gh repo create failed." }
} else {
  Write-Host "[6/8] Repository already exists. Ensuring origin remote..."
  $repoUrl = "https://github.com/$Repository.git"

  # PowerShell 5.1 can promote native stderr to a terminating error when
  # $ErrorActionPreference is Stop. Do not probe a missing remote with
  # `git remote get-url origin`; first check whether the remote exists.
  $remoteNames = @(& git remote)
  if ($LASTEXITCODE -ne 0) { throw "git remote failed." }

  if ($remoteNames -notcontains "origin") {
    Write-Host "No local origin remote yet. Adding: $repoUrl"
    & git remote add origin $repoUrl
    if ($LASTEXITCODE -ne 0) { throw "git remote add origin failed." }
  } else {
    $origin = (& git remote get-url origin)
    if ($LASTEXITCODE -ne 0) { throw "git remote get-url origin failed." }
    $origin = [string]$origin
    if ($origin.Trim() -ne $repoUrl) {
      Write-Host "Updating origin remote to: $repoUrl"
      & git remote set-url origin $repoUrl
      if ($LASTEXITCODE -ne 0) { throw "git remote set-url origin failed." }
    } else {
      Write-Host "Origin remote is already correct."
    }
  }
}

Write-Host "[7/8] Synchronizing remote history and pushing source to GitHub..."
& git branch -M $Branch
if ($LASTEXITCODE -ne 0) { throw "git branch rename failed." }

# The remote repository may already contain an earlier published version (for
# example V4.3) while this local folder was initialized as a brand-new Git
# repository. In that case a normal push is rejected as non-fast-forward.
# Preserve the remote history and place the current V4.4 snapshot on top of it
# instead of force-pushing and erasing the existing GitHub history.
$oldErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& git fetch origin $Branch
$fetchExitCode = $LASTEXITCODE
$ErrorActionPreference = $oldErrorActionPreference
if ($fetchExitCode -ne 0) { throw "git fetch failed." }

$remoteRef = "refs/remotes/origin/$Branch"
$oldErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
& git show-ref --verify --quiet $remoteRef
$remoteBranchExists = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = $oldErrorActionPreference

if ($remoteBranchExists) {
  $oldErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & git merge-base --is-ancestor "origin/$Branch" HEAD
  $remoteIsAncestor = ($LASTEXITCODE -eq 0)
  $ErrorActionPreference = $oldErrorActionPreference

  if (-not $remoteIsAncestor) {
    Write-Host "Remote $Branch already has history that is not in this local repository."
    Write-Host "Preserving the remote history and rebuilding the V4.4 snapshot on top of it..."

    $backupBranch = "local-v4.4-before-sync-" + (Get-Date -Format "yyyyMMdd-HHmmss")
    & git branch $backupBranch HEAD
    if ($LASTEXITCODE -ne 0) { throw "Could not create local safety branch before synchronization." }
    Write-Host "Local safety branch created: $backupBranch"

    # Move HEAD to the remote commit but keep the current V4.4 index and
    # working tree. The next commit therefore becomes a normal child of the
    # existing GitHub history while retaining the exact V4.4 files.
    & git reset --soft "origin/$Branch"
    if ($LASTEXITCODE -ne 0) { throw "git reset --soft to origin/$Branch failed." }

    & git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
      & git commit -m "Publish mk_photo_mask V4.4"
      if ($LASTEXITCODE -ne 0) { throw "git commit after remote synchronization failed." }
    } else {
      Write-Host "Remote repository already has the same file snapshot; no new commit is required."
    }
  } else {
    Write-Host "Remote history is already an ancestor of the local V4.4 commit."
  }
}

& git push -u origin $Branch
if ($LASTEXITCODE -ne 0) { throw "git push failed after safe remote synchronization." }

Write-Host "[8/8] Done."
Write-Host "Repository: https://github.com/$Repository"
Write-Host ""
Write-Host "Portable tools (MinGit / GitHub CLI) are stored under .\tools and are ignored by Git."
Write-Host ""
Write-Host "Next step for signed releases:"
Write-Host "  1. Obtain a trusted Code Signing certificate."
Write-Host "  2. Run prepare-github-signing-secrets.ps1 locally."
Write-Host "  3. Push tag v4.4 to trigger the signed Windows Release workflow."
