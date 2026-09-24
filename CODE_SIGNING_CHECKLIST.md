# mk_photo_mask V4.3 正式 Code Signing 檢查清單

## 必要條件

1. 一張受 Windows 信任的 Code Signing 憑證，且包含 Code Signing EKU `1.3.6.1.5.5.7.3.3`。
2. 若憑證可匯出為 PFX：需要 PFX 檔與密碼。
3. GitHub repository 必須已放入 V4.3 原始碼與 `.github/workflows/build-windows.yml`。
4. GitHub Actions 需要 `contents: write` 權限，V4.3 workflow 已設定。

## 在 Windows 本機先驗證憑證

```powershell
.\check-signing-readiness.ps1 -PfxPath '.\codesign.pfx' -PfxPassword '密碼' -RequireCodeSigningEku
```

## 一鍵寫入 GitHub Secrets

先安裝 GitHub CLI 並完成：

```powershell
gh auth login
```

然後：

```powershell
.\prepare-github-signing-secrets.ps1 -PfxPath '.\codesign.pfx' -PfxPassword '密碼' -Repository 'owner/repo'
```

會建立：

- `MK_SIGN_PFX_BASE64`
- `MK_SIGN_PFX_PASSWORD`

腳本不會把秘密內容印在畫面上。

## 正式發布

```powershell
git tag v4.3
git push origin v4.3
```

Tag workflow 會：

1. 驗證 Tag 必須等於 V4.3。
2. 載入 PFX 並檢查私鑰、有效期限與 Code Signing EKU。
3. Windows runner 建置 `mk_photo_mask_v4.3.exe`。
4. SignTool 使用 SHA-256 + RFC3161 timestamp 簽章。
5. 驗證 Authenticode 簽章。
6. 產生 `.sha256`。
7. 建立 GitHub Release。
8. 上傳簽章 EXE 與 checksum。
9. 從 GitHub Release 重新下載兩個檔案並再次核對 SHA-256 與簽章。

任何一步失敗都會中止正式 Release 流程。
