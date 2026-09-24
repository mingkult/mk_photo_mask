mk_photo_mask V3.5｜內建 dlib 精簡版（Lite HOG）說明
=====================================================

這個版本的進階 AI 不再依賴 face_recognition 大型模型包，
改為使用 dlib 的 HOG frontal face detector，只負責「補抓主要 AI 可能漏掉的人臉」。

特點：
- 只做 Face Detection，不做人臉身分辨識
- 體積較小、啟動較快
- 適合目前照片隱私遮蔽工具用途
- 只監聽 127.0.0.1:8777，不會對外開放
- 圖片只在本機記憶體處理，不會上傳網路

有兩種使用方式：
1) advanced_ai_helper.exe
   - 先在 Windows 建立 helper EXE，再放到程式根目錄或 app/ 中
   - server.ps1 啟動時會自動偵測並背景啟動

2) advanced_ai_runtime（建議做成內建版）
   - 先執行 prepare-bundled-runtime.cmd
   - 會建立 advanced_ai_runtime\python.exe 與所需套件
   - 再重新執行 build-windows-singlefile.cmd
   - 打包後的一般使用者不需要安裝 Python / pip

補充：
- 若 dlib Lite 沒有啟動，主程式的 MediaPipe / FaceAPI 仍可正常使用
- 前端按下「進階 AI 再掃描」時，只會新增與既有框重疊度不足的新框
