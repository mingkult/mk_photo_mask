param([switch]$Quiet)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$ShortcutPath = Join-Path $Root "照片隱私遮蔽工具.lnk"
$LauncherPath = Join-Path $Root "照片隱私遮蔽工具.exe"
$IconPath = Join-Path $Root "icon.ico"

try {
    if (-not [System.IO.File]::Exists($LauncherPath)) { throw "找不到照片隱私遮蔽工具.exe" }
    if (-not [System.IO.File]::Exists($IconPath)) { throw "找不到 icon.ico" }
    $Shell = New-Object -ComObject WScript.Shell
    $Shortcut = $Shell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $LauncherPath
    $Shortcut.Arguments = ""
    $Shortcut.WorkingDirectory = $Root
    $Shortcut.IconLocation = $IconPath + ",0"
    $Shortcut.Description = "照片隱私遮蔽工具｜AI 完全離線 Windows 可攜版"
    $Shortcut.Save()
    if (-not $Quiet) { Write-Host "[成功] 已建立：$ShortcutPath" -ForegroundColor Green }
}
catch {
    Write-Host "[錯誤] 建立捷徑失敗：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
