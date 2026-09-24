Photo Privacy Tool | Windows single-file build V4.3
===================================================

This build path creates a Windows x64 portable EXE with an ASCII filename for maximum CMD/PowerShell compatibility.

Build steps
-----------
1. Edit files under app/.
2. Double-click build-windows-singlefile.cmd, or run the PowerShell command below.
3. The build script removes stale *.exe files from output/ first.
4. Default output:

   output\mk_photo_mask_v4.3.exe

Requirements
------------
- Windows 10 or Windows 11 x64
- Windows PowerShell 5.1 or newer
- launcher-base.exe
- app/icon.ico
- No Python, Node.js, WSL, Ubuntu, or GNU toolchain is required for the normal Windows-native build.

Unsigned local/test build
-------------------------
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File ".\build-windows-singlefile.ps1" -Version "4.3" -SkipSigning

Signed release build
--------------------
First check the signing environment:

  .\check-signing-readiness.ps1 -PfxPath ".\codesign.pfx" -PfxPassword "your-password"

Then build with signing required:

  .\build-windows-singlefile.ps1 -Version "4.3" -SignPfxPath ".\codesign.pfx" -SignPfxPassword "your-password" -RequireSigning

Use release-guard.ps1 before official distribution:

  .\release-guard.ps1 -ExePath ".\output\mk_photo_mask_v4.3.exe" -RequireValidSignature

GitHub Actions
--------------
- Workflow: .github/workflows/build-windows.yml
- Manual workflow runs may create an unsigned test artifact when explicitly allowed.
- v* tag builds require signing secrets. If the signing certificate is missing, the official tag build fails instead of silently publishing an unsigned EXE.
- See SIGNING_GUIDE.md for details.

Optional dlib Lite advanced AI helper
-------------------------------------
The normal app uses the existing offline MediaPipe / FaceAPI pipeline.
For the optional dlib Lite second pass:
1. Open advanced-ai-helper\ and run prepare-bundled-runtime.cmd.
2. Run advanced-ai-helper\build-helper.cmd if you want helper EXE packaging.
3. The helper binds only to 127.0.0.1:8777.
4. Run the normal build again.

V4.3 highlights
---------------
- Dynamic Canvas retention: keep only the active photo and nearby +/-1~2 photos fully decoded.
- Main photo Canvas can also be parked when it is far from the active photo.
- Parked photos aggressively trim older Undo/Redo patches to reduce RAM.
- Group-photo AI uses dual-scale overlapping tiles plus a limited FaceAPI second-model pass.
- .mkpm schema v4 can automatically compare PNG and high-quality WebP per modified photo and keep the smaller snapshot.
- Formal release workflow includes signing readiness checks, -RequireSigning, and release-guard verification.

V4.3 signed GitHub Release:
- See SIGNING_GUIDE.md and CODE_SIGNING_CHECKLIST.md.
- Official v4.3 tags require valid signing secrets.
- Workflow creates GitHub Release and re-verifies published assets.
