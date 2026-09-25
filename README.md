# mk_photo_mask V4.6

Windows completely-offline photo privacy masking tool for schools and local use.


> V4.6：依需求調整選圖文字與選取區名稱；團體照加強辨識預設關閉；AI 程式庫、模型與 dlib helper 改為首次使用時才載入/檢查，以縮短啟動時間。V4.4 起工作專案與備份功能仍維持移除。

## Main features

- Offline HTML5 / JavaScript / Canvas workflow
- Fast AI face detection with MediaPipe / FaceAPI fallback
- Optional local dlib Lite advanced rescan
- AI face boxes and manual mask boxes can be edited in the same workflow
- Mosaic / blur / color / sticker masks
- Multiple photos, filtering, batch actions and ZIP download
- Undo / Redo
- Per-photo reset and close
- Canvas memory optimization for large photo sets
- Windows single-EXE build workflow
- GitHub Actions build + Code Signing + GitHub Release verification workflow

## Quick local start

Run `start.bat` on Windows.

## Build Windows single EXE

Run:

```powershell
.\build-windows-singlefile.ps1
```

The default output is `mk_photo_mask_v4.6.exe`.

## Code signing

Read:

- `CODE_SIGNING_CHECKLIST.md`
- `SIGNING_GUIDE.md`

Do **not** commit certificate private keys or PFX files to this repository.

## Publish this source tree to GitHub

If this folder was downloaded as a ZIP, run:

```cmd
publish-to-github.cmd
```

The helper targets `mingkult/mk_photo_mask` by default and creates the repository as **private** unless you explicitly choose public.
