# mk_photo_mask V4.3

Windows completely-offline photo privacy masking tool for schools and local use.

## Main features

- Offline HTML5 / JavaScript / Canvas workflow
- Fast AI face detection with MediaPipe / FaceAPI fallback
- Optional local dlib Lite advanced rescan
- AI face boxes and manual mask boxes can be edited in the same workflow
- Mosaic / blur / color / sticker masks
- Multiple photos, filtering, batch actions and ZIP download
- Undo / Redo
- Per-photo reset and close
- `.mkpm` work-project save / restore
- Local automatic backup
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

The default output is `mk_photo_mask_v4.3.exe`.

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
