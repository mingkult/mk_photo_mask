param([switch]$Quiet)

$ErrorActionPreference = "Stop"
$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$LauncherPath = Join-Path $Root "照片隱私遮蔽工具.exe"
$IconPath = Join-Path $Root "icon.ico"

if ([System.IO.File]::Exists($LauncherPath)) {
    if (-not $Quiet) { Write-Host "啟動器已存在：$LauncherPath" -ForegroundColor Green }
    exit 0
}

$Source = @'
using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

internal static class PortableLauncher
{
    [STAThread]
    private static void Main()
    {
        string root = AppDomain.CurrentDomain.BaseDirectory;
        string server = Path.Combine(root, "server.ps1");
        if (!File.Exists(server))
        {
            MessageBox.Show("找不到 server.ps1，請保留完整的可攜版資料夾。", "照片隱私遮蔽工具", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        ProcessStartInfo info = new ProcessStartInfo();
        info.FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell\\v1.0\\powershell.exe");
        info.Arguments = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File \"" + server + "\"";
        info.WorkingDirectory = root;
        info.UseShellExecute = true;
        try { Process.Start(info); }
        catch (Exception ex)
        {
            MessageBox.Show("無法啟動程式：" + ex.Message, "照片隱私遮蔽工具", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
'@

try {
    Add-Type -TypeDefinition $Source `
        -Language CSharp `
        -ReferencedAssemblies @("System.dll", "System.Windows.Forms.dll") `
        -OutputAssembly $LauncherPath `
        -OutputType WindowsApplication `
        -CompilerOptions ('/win32icon:"' + $IconPath + '" /optimize+')
    if (-not $Quiet) { Write-Host "已建立：$LauncherPath" -ForegroundColor Green }
}
catch {
    if (-not $Quiet) { Write-Host "建立啟動器失敗：$($_.Exception.Message)" -ForegroundColor Red }
    exit 1
}
