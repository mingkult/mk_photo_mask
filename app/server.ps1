$ErrorActionPreference = "Stop"
$Host.UI.RawUI.WindowTitle = "照片隱私遮蔽工具｜AI 完全離線單檔版 v4.3"

$Root = [System.IO.Path]::GetFullPath((Split-Path -Parent $MyInvocation.MyCommand.Path))
$RootPrefix = $Root.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$IconPath = Join-Path $Root "icon.ico"

# 將同一個 icon.ico 套用到傳統 Windows PowerShell 主控台視窗。
if ([System.IO.File]::Exists($IconPath)) {
    try {
        Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class PortableWindowIcon {
    [DllImport("kernel32.dll")] public static extern IntPtr GetConsoleWindow();
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern IntPtr LoadImage(IntPtr hInst, string name, uint type, int cx, int cy, uint load);
    [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam);
}
"@
        $Window = [PortableWindowIcon]::GetConsoleWindow()
        $LargeIcon = [PortableWindowIcon]::LoadImage([IntPtr]::Zero, $IconPath, 1, 32, 32, 0x10)
        $SmallIcon = [PortableWindowIcon]::LoadImage([IntPtr]::Zero, $IconPath, 1, 16, 16, 0x10)
        if ($Window -ne [IntPtr]::Zero) {
            if ($LargeIcon -ne [IntPtr]::Zero) { [void][PortableWindowIcon]::SendMessage($Window, 0x80, [IntPtr]1, $LargeIcon) }
            if ($SmallIcon -ne [IntPtr]::Zero) { [void][PortableWindowIcon]::SendMessage($Window, 0x80, [IntPtr]0, $SmallIcon) }
        }
    }
    catch { }
}

$RequiredFiles = @(
    "index.html",
    "icon.ico",
    "libs\face-api.js",
    "models\ssd_mobilenetv1_model-weights_manifest.json",
    "models\ssd_mobilenetv1_model.bin",
    "mediapipe\face_detection.js",
    "mediapipe\face_detection_full.binarypb",
    "mediapipe\face_detection_short.binarypb",
    "mediapipe\face_detection_full_range.tflite",
    "mediapipe\face_detection_full_range_sparse.tflite",
    "mediapipe\face_detection_short_range.tflite",
    "mediapipe\face_detection_solution_simd_wasm_bin.js",
    "mediapipe\face_detection_solution_simd_wasm_bin.wasm",
    "mediapipe\face_detection_solution_simd_wasm_bin.data",
    "mediapipe\face_detection_solution_wasm_bin.js",
    "mediapipe\face_detection_solution_wasm_bin.wasm"
)
$MissingFiles = @($RequiredFiles | Where-Object { -not [System.IO.File]::Exists((Join-Path $Root $_)) })
if ($MissingFiles.Count -gt 0) {
    Write-Host "無法啟動：可攜版資料夾缺少必要檔案：" -ForegroundColor Red
    $MissingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host "`n請重新解壓縮完整可攜版後再啟動。" -ForegroundColor White
    Read-Host "按 Enter 結束"
    exit 1
}

$Address = [System.Net.IPAddress]::Loopback
$Listener = $null
$Port = 8765

foreach ($CandidatePort in 8765..8795) {
    try {
        $Candidate = [System.Net.Sockets.TcpListener]::new($Address, $CandidatePort)
        $Candidate.Start()
        $Listener = $Candidate
        $Port = $CandidatePort
        break
    }
    catch {
        if ($Candidate) { try { $Candidate.Stop() } catch {} }
    }
}

if (-not $Listener) {
    Write-Host "無法啟動本機服務：8765～8795 連接埠皆被占用。" -ForegroundColor Red
    Read-Host "按 Enter 結束"
    exit 1
}

function Get-MimeType([string]$Path) {
    switch ([System.IO.Path]::GetExtension($Path).ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".htm"  { return "text/html; charset=utf-8" }
        ".js"   { return "application/javascript; charset=utf-8" }
        ".mjs"  { return "application/javascript; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".wasm" { return "application/wasm" }
        ".bin"  { return "application/octet-stream" }
        ".data" { return "application/octet-stream" }
        ".tflite" { return "application/octet-stream" }
        ".binarypb" { return "application/octet-stream" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".webp" { return "image/webp" }
        ".svg"  { return "image/svg+xml" }
        ".ico"  { return "image/x-icon" }
        default  { return "application/octet-stream" }
    }
}

function Send-Response {
    param(
        [System.Net.Sockets.NetworkStream]$Stream,
        [int]$StatusCode,
        [string]$StatusText,
        [byte[]]$Body,
        [string]$ContentType = "text/plain; charset=utf-8",
        [bool]$HeadOnly = $false
    )
    if ($null -eq $Body) { $Body = [byte[]]::new(0) }
    $Header = "HTTP/1.1 $StatusCode $StatusText`r`n" +
              "Content-Type: $ContentType`r`n" +
              "Content-Length: $($Body.Length)`r`n" +
              "Cache-Control: no-store`r`n" +
              "X-Content-Type-Options: nosniff`r`n" +
              "Access-Control-Allow-Origin: *`r`n" +
              "Connection: close`r`n`r`n"
    $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
    $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
    if (-not $HeadOnly -and $Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
    $Stream.Flush()
}

$Url = "http://127.0.0.1:$Port/"
$AdvancedHelperProcess = $null
$AdvancedHelperUrl = "http://127.0.0.1:8777/health"
$AdvancedHelperExe = Join-Path $Root "advanced_ai_helper.exe"
$AdvancedRuntimeDir = Join-Path $Root "advanced_ai_runtime"
$AdvancedRuntimePy = Join-Path $AdvancedRuntimeDir "python.exe"
$AdvancedRuntimeScript = Join-Path $AdvancedRuntimeDir "advanced_ai_helper.py"

function Test-AdvancedHelper {
    try {
        $Response = Invoke-RestMethod -Uri $AdvancedHelperUrl -Method Get -TimeoutSec 2
        return ($Response.ok -eq $true)
    }
    catch { return $false }
}

function Start-AdvancedHelperFromExe {
    if (-not [System.IO.File]::Exists($AdvancedHelperExe)) { return $false }
    try {
        $script:AdvancedHelperProcess = Start-Process -FilePath $AdvancedHelperExe -ArgumentList @("--host", "127.0.0.1", "--port", "8777") -WindowStyle Hidden -PassThru
        for ($Try = 0; $Try -lt 20; $Try++) {
            Start-Sleep -Milliseconds 250
            if (Test-AdvancedHelper) { return $true }
        }
    }
    catch {
        Write-Host "進階 AI helper EXE 啟動失敗：$($_.Exception.Message)" -ForegroundColor DarkYellow
    }
    return $false
}

function Start-AdvancedHelperFromRuntime {
    if (-not [System.IO.File]::Exists($AdvancedRuntimePy)) { return $false }
    if (-not [System.IO.File]::Exists($AdvancedRuntimeScript)) { return $false }
    try {
        $script:AdvancedHelperProcess = Start-Process -FilePath $AdvancedRuntimePy -ArgumentList @("advanced_ai_helper.py", "--host", "127.0.0.1", "--port", "8777") -WorkingDirectory $AdvancedRuntimeDir -WindowStyle Hidden -PassThru
        for ($Try = 0; $Try -lt 24; $Try++) {
            Start-Sleep -Milliseconds 250
            if (Test-AdvancedHelper) { return $true }
        }
    }
    catch {
        Write-Host "內建 dlib Lite runtime 啟動失敗：$($_.Exception.Message)" -ForegroundColor DarkYellow
    }
    return $false
}

# V4.3 optional dlib Lite helper. Prefer bundled runtime, then helper EXE.
if (-not (Test-AdvancedHelper)) {
    $Started = $false
    if ([System.IO.Directory]::Exists($AdvancedRuntimeDir)) { $Started = Start-AdvancedHelperFromRuntime }
    if (-not $Started) { $Started = Start-AdvancedHelperFromExe }
}

Clear-Host
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " 照片隱私遮蔽工具｜AI 完全離線單檔版 v4.3" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "本機服務已啟動：$Url" -ForegroundColor Green
Write-Host "v4.3 優先使用 MediaPipe Tasks Vision 1.0.1（若已安裝），並保留 Legacy MediaPipe 與 FaceAPI 備援。"
Write-Host "請保留此黑色視窗；關閉後服務立即停止。" -ForegroundColor Yellow
Write-Host ""

try { Start-Process $Url } catch { Write-Host "請手動在瀏覽器輸入：$Url" -ForegroundColor Yellow }

try {
    while ($true) {
        $Client = $Listener.AcceptTcpClient()
        $Reader = $null; $Stream = $null
        try {
            $Client.ReceiveTimeout = 15000; $Client.SendTimeout = 60000
            $Stream = $Client.GetStream()
            $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
            $RequestLine = $Reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($RequestLine)) { continue }
            while ($true) { $Line = $Reader.ReadLine(); if ($null -eq $Line -or $Line.Length -eq 0) { break } }

            $Parts = $RequestLine.Split(' ')
            if ($Parts.Length -lt 2) { Send-Response $Stream 400 "Bad Request" ([System.Text.Encoding]::UTF8.GetBytes("Bad Request")); continue }
            $Method = $Parts[0].ToUpperInvariant()
            if ($Method -ne "GET" -and $Method -ne "HEAD") { Send-Response $Stream 405 "Method Not Allowed" ([System.Text.Encoding]::UTF8.GetBytes("Method Not Allowed")); continue }

            $RawTarget = $Parts[1].Split('?')[0]
            if ($RawTarget -eq "/health") {
                Send-Response $Stream 200 "OK" ([System.Text.Encoding]::UTF8.GetBytes("OK")) "text/plain; charset=utf-8" ($Method -eq "HEAD")
                continue
            }

            $Relative = [System.Uri]::UnescapeDataString($RawTarget).TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($Relative)) { $Relative = "index.html" }
            if ($Relative -ieq "favicon.ico") { $Relative = "icon.ico" }
            $Relative = $Relative.Replace([char]'/', [System.IO.Path]::DirectorySeparatorChar)
            $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $Relative))

            if (-not $FullPath.StartsWith($RootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Response $Stream 403 "Forbidden" ([System.Text.Encoding]::UTF8.GetBytes("Forbidden")); continue
            }
            if (-not [System.IO.File]::Exists($FullPath)) {
                Send-Response $Stream 404 "Not Found" ([System.Text.Encoding]::UTF8.GetBytes("Not Found")); continue
            }

            $Bytes = [System.IO.File]::ReadAllBytes($FullPath)
            Send-Response $Stream 200 "OK" $Bytes (Get-MimeType $FullPath) ($Method -eq "HEAD")
        }
        # 瀏覽器可能建立預先連線後不送出請求，或在載入完成前主動中斷。
        # 這些是本機 HTTP 服務的正常情況，不應顯示為錯誤或停止服務。
        catch [System.IO.IOException] { }
        catch [System.Net.Sockets.SocketException] { }
        catch [System.ObjectDisposedException] { }
        catch { Write-Host "請求錯誤：$($_.Exception.Message)" -ForegroundColor DarkYellow }
        finally {
            if ($Reader) { try { $Reader.Dispose() } catch { } }
            if ($Stream) { try { $Stream.Dispose() } catch { } }
            if ($Client) { try { $Client.Close() } catch { } }
        }
    }
}
finally {
    if ($Listener) { $Listener.Stop() }
    if ($AdvancedHelperProcess -and -not $AdvancedHelperProcess.HasExited) {
        try { $AdvancedHelperProcess.Kill() } catch { }
    }
}
