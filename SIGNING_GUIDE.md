# mk_photo_mask V4.6 Windows 正式發布與簽章

V4.6 將「建置、簽章、驗證、GitHub Release、發布後再次驗證」串成同一條正式發布流程。

## 1. 正式憑證必要條件

- 憑證需可用於 Windows Authenticode Code Signing。
- 憑證需含 Code Signing EKU：`1.3.6.1.5.5.7.3.3`。
- 憑證需在有效期限內且能存取私鑰。
- 若採 PFX 流程，需有 `.pfx` 與密碼。

先檢查：

```powershell
.\check-signing-readiness.ps1 -PfxPath '.\codesign.pfx' -PfxPassword '你的密碼' -RequireCodeSigningEku
```

## 2. 寫入 GitHub Secrets

```powershell
.\prepare-github-signing-secrets.ps1 -PfxPath '.\codesign.pfx' -PfxPassword '你的密碼' -Repository 'owner/repo'
```

會設定：

- `MK_SIGN_PFX_BASE64`
- `MK_SIGN_PFX_PASSWORD`

## 3. 本機正式簽章建置

```powershell
.\build-windows-singlefile.ps1 -Version '4.3' -SignPfxPath '.\codesign.pfx' -SignPfxPassword '你的密碼' -RequireSigning
```

然後：

```powershell
.\release-guard.ps1 -ExePath '.\output\mk_photo_mask_v4.6.exe' -RequireValidSignature -RequireTimestamp
```

## 4. GitHub 正式 Release

推送正式 Tag：

```powershell
git tag v4.6
git push origin v4.6
```

`.github/workflows/build-windows.yml` 會自動：

1. 驗證 Tag 版本。
2. 還原 PFX。
3. 檢查 SignTool、私鑰、憑證有效期、Code Signing EKU。
4. 建置 EXE。
5. SHA-256 + RFC3161 timestamp 簽章。
6. Authenticode 驗證。
7. 建立 checksum。
8. 建立 GitHub Release。
9. 上傳 EXE 與 checksum。
10. 從正式 Release 重新下載，再次驗證 checksum 與簽章。

正式 Tag 若缺少憑證／Secrets，workflow 直接失敗，不會發布未簽章 EXE。

## 5. SmartScreen

受信任 Code Signing 憑證可以移除 Windows 的「未知發行者」身分問題，但 SmartScreen 信譽仍會受到憑證類型、發行者信譽與實際下載／使用歷史影響。程式碼本身不能保證立即完全消除 SmartScreen 警告。
