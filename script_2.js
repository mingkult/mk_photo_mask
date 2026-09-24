
    /* =========================================================
       1. 取得畫面元件與建立程式狀態
       ========================================================= */
    const imageInput = document.getElementById("imageInput");
    const stickerInput = document.getElementById("stickerInput");
    const photoSummary = document.getElementById("photoSummary");
    const addPhotosBtn = document.getElementById("addPhotosBtn");
    const clearPhotosBtn = document.getElementById("clearPhotosBtn");
    const multiPhotoStatus = document.getElementById("multiPhotoStatus");
    const aiProgressBar = document.getElementById("aiProgressBar");
    const batchProgressText = document.getElementById("batchProgressText");
    const cancelOperationBtn = document.getElementById("cancelOperationBtn");
    const photoNavigator = document.getElementById("photoNavigator");
    const photoNavigatorCounter = document.getElementById("photoNavigatorCounter");
    const photoNavStrip = document.getElementById("photoNavStrip");
    const prevPhotoBtn = document.getElementById("prevPhotoBtn");
    const nextPhotoBtn = document.getElementById("nextPhotoBtn");
    const photoFilterBar = document.getElementById("photoFilterBar");
    const batchSelectedCount = document.getElementById("batchSelectedCount");
    const batchSelectVisibleBtn = document.getElementById("batchSelectVisibleBtn");
    const batchClearSelectionBtn = document.getElementById("batchClearSelectionBtn");
    const batchResetBtn = document.getElementById("batchResetBtn");
    const batchDownloadBtn = document.getElementById("batchDownloadBtn");
    const batchCloseBtn = document.getElementById("batchCloseBtn");
    const saveProjectBtn = document.getElementById("saveProjectBtn");
    const loadProjectBtn = document.getElementById("loadProjectBtn");
    const restoreAutoBackupBtn = document.getElementById("restoreAutoBackupBtn");
    const clearAutoBackupBtn = document.getElementById("clearAutoBackupBtn");
    const backupNowBtn = document.getElementById("backupNowBtn");
    const autoBackupEnabled = document.getElementById("autoBackupEnabled");
    const autoBackupStatus = document.getElementById("autoBackupStatus");
    const canvasMemoryStatus = document.getElementById("canvasMemoryStatus");
    const projectSnapshotFormat = document.getElementById("projectSnapshotFormat");
    const groupAiEnhanceEnabled = document.getElementById("groupAiEnhanceEnabled");
    const backupStorageInfo = document.getElementById("backupStorageInfo");
    const projectFileInput = document.getElementById("projectFileInput");
    const mainResetPhotoBtn = document.getElementById("mainResetPhotoBtn");
    const mainClosePhotoBtn = document.getElementById("mainClosePhotoBtn");
    const downloadAllZipBtn = document.getElementById("downloadAllZipBtn");
    const selectAllFacesBtn = document.getElementById("selectAllFacesBtn");
    const clearAllFacesBtn = document.getElementById("clearAllFacesBtn");
    const firstFaceControls = document.getElementById("firstFaceControls");
    const multiPreviewList = document.getElementById("multiPreviewList");
    const uploadZone = document.getElementById("uploadZone");
    const canvasWrap = document.getElementById("canvasWrap");
    const emptyState = document.getElementById("emptyState");
    const mainCanvas = document.getElementById("mainCanvas");
    const mainParkedPreview = document.getElementById("mainParkedPreview");
    const overlayCanvas = document.getElementById("overlayCanvas");
    const mainCtx = mainCanvas.getContext("2d", { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext("2d");
    const workspace = document.getElementById("workspace");
    const uploadTargets = [uploadZone, workspace].filter(Boolean);

    const statusText = document.getElementById("statusText");
    const imageMeta = document.getElementById("imageMeta");
    const selectionInfo = document.getElementById("selectionInfo");
    const stickerStatus = document.getElementById("stickerStatus");
    const toast = document.getElementById("toast");

    const applyBtn = document.getElementById("applyBtn");
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    const clearSelectionBtn = document.getElementById("clearSelectionBtn");
    const resetBtn = document.getElementById("resetBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const faceDetectBtn = document.getElementById("faceDetectBtn");
    const advancedRescanBtn = document.getElementById("advancedRescanBtn");
    const advancedAiState = document.getElementById("advancedAiState");
    const facePadding = document.getElementById("facePadding");
    const facePaddingValue = document.getElementById("facePaddingValue");
    const aiStatus = document.getElementById("aiStatus");
    const aiStatusTitle = document.getElementById("aiStatusTitle");
    const aiStatusDetail = document.getElementById("aiStatusDetail");

    const mosaicSize = document.getElementById("mosaicSize");
    const mosaicValue = document.getElementById("mosaicValue");
    const blurSize = document.getElementById("blurSize");
    const blurValue = document.getElementById("blurValue");
    const coverColor = document.getElementById("coverColor");
    const emojiSelect = document.getElementById("emojiSelect");
    const shapeGrid = document.getElementById("shapeGrid");

    const state = {
      imageLoaded: false,
      tool: "mosaic",
      shape: "rect",
      selection: null,
      pointerStart: null,
      isSelecting: false,

      // 選取範圍編輯狀態：new 建立、move 移動、resize 縮放。
      interaction: null,
      activeHandle: null,
      dragOrigin: null,
      startSelection: null,
      interactionSelectionIndex: -1,
      duplicateInteraction: false,

      originalImageData: null,
      history: [],
      redoHistory: [],
      customSticker: null,
      sourceName: "photo",
      resized: false,

      // AI 模型皆位於本機；MediaPipe 為主引擎，FaceAPI 為備援。
      faceDetecting: false,
      mediaPipeDetector: null,
      mediaPipeInitPromise: null,
      mediaPipeRetryCount: 0,
      mediaPipeTasksModule: null,
      mediaPipeTasksFileset: null,
      mediaPipeTasksFull: null,
      mediaPipeTasksShort: null,
      mediaPipeTasksReady: false,
      mediaPipeTasksChecked: false,
      mediaPipeTasksError: "",
      faceApiModel: null,
      faceApiInitPromise: null,
      faceApiBackend: "",
      aiAssetsChecked: false,
      aiAssetsReady: false,
      aiAssetErrors: [],
      lastAiEngine: "",
      mainAiEnvironmentReady: null,
      mainAiEnvironmentMessage: "離線 AI：自動檢查中…",
      advancedAiStatusKind: "unknown",
      advancedAiStatusMessage: "dlib Lite：自動檢查中…",
      advancedHelperReady: false,
      advancedHelperVersion: "",
      advancedHelperError: "",
      photoItems: [],
      faceReviewMode: false,
      multiProcessing: false,
      applyInProgress: false,
      activePhotoItem: null,
      photoFilter: "all",
      autoBackupInProgress: false,
      autoBackupLastSavedAt: 0,
      autoBackupLastFingerprint: "",
      autoBackupAvailable: false,
      autoBackupError: "",
      autoBackupSizeBytes: 0,
      groupAiEnhance: true,
      projectSnapshotFormat: "auto",
      canvasMemoryBusy: false,
      canvasMemoryParkedCount: 0,
      canvasHistoryTrimmedCount: 0,
      cancelRequested: false,
      cancellableOperationLabel: "",
      lastUserActivityAt: Date.now(),
      customStickerRevision: 0,

      // AI 框本體採「點擊切換、拖曳建立手動框」：
      // pointerdown 先暫存，只有 pointerup 且未明顯移動才視為 AI 點擊。
      pendingAiFaceIndex: -1,
      pendingAiStart: null,
      pendingAiPointerId: null
    };

    const MAX_IMAGE_SIDE = 5000;
    const MAX_HISTORY = 12;
    const MAX_HISTORY_BYTES_PER_PHOTO = 64 * 1024 * 1024; // 單張 Undo + Redo 上限約 64 MB，避免大型照片長時間操作耗盡記憶體。
    const AI_MAX_SIDE = 1280;
    const MULTI_MAX_FILES = 100;
    const ADVANCED_AI_HELPER_URL = "http://127.0.0.1:8777";
    const ADVANCED_AI_TIMEOUT_MS = 90000;
    const SETTINGS_STORAGE_KEY = "mk_photo_mask_settings";
    const LEGACY_SETTINGS_STORAGE_KEYS = ["mk_photo_mask_v31_settings"];
    const PROJECT_FORMAT = "mk_photo_mask_project";
    const PROJECT_SCHEMA_VERSION = 4;
    const PROJECT_SUPPORTED_SCHEMA_VERSIONS = new Set([1, 2, 3, 4]);
    const AUTO_BACKUP_DB_NAME = "mk_photo_mask_recovery";
    const AUTO_BACKUP_DB_VERSION = 1;
    const AUTO_BACKUP_STORE = "backups";
    const AUTO_BACKUP_KEY = "latest";
    const AUTO_BACKUP_ENABLED_KEY = "mk_photo_mask_auto_backup_enabled";
    const AUTO_BACKUP_CHECK_MS = 15000;
    const AUTO_BACKUP_MIN_INTERVAL_MS = 120000;
    const AUTO_BACKUP_IDLE_MS = 12000;
    const CANVAS_MEMORY_MIN_PHOTOS = 6;
    const CANVAS_MEMORY_KEEP_RADIUS_SMALL_SET = 2;
    const CANVAS_MEMORY_KEEP_RADIUS_LARGE_SET = 1;
    const CANVAS_MEMORY_IDLE_MS = 1500;
    const PARKED_HISTORY_MAX_BYTES = 12 * 1024 * 1024;
    const PARKED_HISTORY_MAX_GROUPS = 2;
    const BACKUP_STORAGE_WARN_RATIO = 0.75;
    const BACKUP_STORAGE_DANGER_RATIO = 0.90;
    const GROUP_AI_MIN_SIDE = 1600;
    const GROUP_AI_LARGE_TILE_MAX = 1700;
    const GROUP_AI_SMALL_TILE_MAX = 1050;
    const GROUP_AI_LARGE_TILE_OVERLAP = 0.28;
    const GROUP_AI_SMALL_TILE_OVERLAP = 0.36;
    const GROUP_AI_MAX_TILES = 28;
    const GROUP_AI_FACEAPI_MIN_CONFIDENCE = 0.22;
    let toastTimer = null;
    let settingsSaveTimer = null;
    let imageInputMode = "replace";

    function getUserSettingsSnapshot() {
      return {
        shape: state.shape,
        tool: state.tool,
        mosaicSize: Number(mosaicSize.value),
        blurSize: Number(blurSize.value),
        coverColor: coverColor.value,
        emoji: emojiSelect.value,
        facePadding: Number(facePadding.value),
        groupAiEnhance: groupAiEnhanceEnabled ? !!groupAiEnhanceEnabled.checked : true,
        projectSnapshotFormat: ["auto", "png", "webp"].includes(projectSnapshotFormat?.value) ? projectSnapshotFormat.value : "auto"
      };
    }

    function saveUserSettings() {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(getUserSettingsSnapshot()));
      } catch (_) { }
    }

    function scheduleSettingsSave() {
      clearTimeout(settingsSaveTimer);
      settingsSaveTimer = setTimeout(saveUserSettings, 180);
    }

    function applyUserSettingsSnapshot(saved) {
      if (!saved || typeof saved !== "object") return;
      if (["rect", "circle"].includes(saved.shape)) state.shape = saved.shape;
      if (["mosaic", "blur", "cover", "sticker"].includes(saved.tool)) state.tool = saved.tool;

      const setRange = (element, output, value, suffix = "") => {
        const min = Number(element.min || 0), max = Number(element.max || 100);
        const n = Number(value);
        if (!Number.isFinite(n)) return;
        const safe = Math.min(max, Math.max(min, n));
        element.value = String(safe);
        output.value = `${safe}${suffix}`;
      };

      setRange(mosaicSize, mosaicValue, saved.mosaicSize);
      setRange(blurSize, blurValue, saved.blurSize);
      setRange(facePadding, facePaddingValue, saved.facePadding, "%");
      if (typeof saved.coverColor === "string" && /^#[0-9a-f]{6}$/i.test(saved.coverColor)) coverColor.value = saved.coverColor;
      if (typeof saved.emoji === "string" && [...emojiSelect.options].some((opt) => opt.value === saved.emoji)) emojiSelect.value = saved.emoji;
      if (groupAiEnhanceEnabled) groupAiEnhanceEnabled.checked = saved.groupAiEnhance !== false;
      state.groupAiEnhance = groupAiEnhanceEnabled ? !!groupAiEnhanceEnabled.checked : true;
      if (projectSnapshotFormat) projectSnapshotFormat.value = ["auto", "png", "webp"].includes(saved.projectSnapshotFormat) ? saved.projectSnapshotFormat : "auto";
      state.projectSnapshotFormat = ["auto", "png", "webp"].includes(projectSnapshotFormat?.value) ? projectSnapshotFormat.value : "auto";

      document.querySelectorAll(".shape-btn").forEach((button) => button.classList.toggle("active", button.dataset.shape === state.shape));
      document.querySelectorAll(".tool-card").forEach((card) => card.classList.toggle("active", card.dataset.tool === state.tool));
      document.querySelectorAll(".setting-group").forEach((group) => group.classList.toggle("active", group.dataset.setting === state.tool));
    }

    function restoreUserSettings() {
      let saved = null;
      try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY) || LEGACY_SETTINGS_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || "null";
        saved = JSON.parse(raw);
      } catch (_) { saved = null; }
      applyUserSettingsSnapshot(saved);
    }

    restoreUserSettings();
    groupAiEnhanceEnabled?.addEventListener("change", () => { state.groupAiEnhance = !!groupAiEnhanceEnabled.checked; saveUserSettings(); });
    projectSnapshotFormat?.addEventListener("change", () => { state.projectSnapshotFormat = ["auto", "png", "webp"].includes(projectSnapshotFormat.value) ? projectSnapshotFormat.value : "auto"; saveUserSettings(); });

    /* V4.2 Hotfix: restored shared image/mask utilities accidentally removed during unified-apply refactor. */
    function safeBaseName(name) { return (name || "photo").replace(/\.[^.]+$/, "").replace(/[^\w\u4e00-\u9fff-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "photo"; }
    function canvasToBlob(canvas) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("建立 PNG 失敗")), "image/png")); }
    function canvasToEncodedBlob(canvas, type = "image/png", quality = 0.96) {
      return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("建立影像快照失敗")), type, quality));
    }
    async function canvasToProjectSnapshot(canvas) {
      const mode = ["auto", "png", "webp"].includes(state.projectSnapshotFormat) ? state.projectSnapshotFormat : "auto";
      if (mode === "png") {
        const blob = await canvasToBlob(canvas);
        return { blob, extension: "png", mime: "image/png", encoding: "png", compared: false };
      }
      if (mode === "webp") {
        try {
          const blob = await canvasToEncodedBlob(canvas, "image/webp", 0.96);
          if (blob?.size) return { blob, extension: "webp", mime: "image/webp", encoding: "webp", compared: false };
        } catch (error) { console.warn("WebP 工作快照失敗，改用 PNG。", error); }
        const blob = await canvasToBlob(canvas);
        return { blob, extension: "png", mime: "image/png", encoding: "png-fallback", compared: false };
      }
      const pngBlob = await canvasToBlob(canvas);
      try {
        const webpBlob = await canvasToEncodedBlob(canvas, "image/webp", 0.96);
        if (webpBlob?.size && webpBlob.size < pngBlob.size) {
          return { blob: webpBlob, extension: "webp", mime: "image/webp", encoding: "auto-webp", compared: true, pngBytes: pngBlob.size, webpBytes: webpBlob.size };
        }
        return { blob: pngBlob, extension: "png", mime: "image/png", encoding: "auto-png", compared: true, pngBytes: pngBlob.size, webpBytes: webpBlob?.size || 0 };
      } catch (error) {
        console.warn("自動比較 WebP 失敗，保留 PNG。", error);
        return { blob: pngBlob, extension: "png", mime: "image/png", encoding: "auto-png-fallback", compared: true, pngBytes: pngBlob.size, webpBytes: 0 };
      }
    }
    async function canvasToMemoryPreviewBlob(canvas, maxSide = 1200) {
      const side = Math.max(canvas.width, canvas.height);
      const scale = side > maxSide ? maxSide / side : 1;
      const preview = document.createElement("canvas");
      preview.width = Math.max(1, Math.round(canvas.width * scale));
      preview.height = Math.max(1, Math.round(canvas.height * scale));
      const ctx = preview.getContext("2d", { alpha:false });
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      ctx.drawImage(canvas, 0, 0, preview.width, preview.height);
      try { return await canvasToEncodedBlob(preview, "image/webp", 0.84); }
      catch (_) { return await canvasToEncodedBlob(preview, "image/jpeg", 0.86); }
    }
    function fileToCanvas(file) { return new Promise((resolve, reject) => { const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{let w=img.naturalWidth,h=img.naturalHeight;if(Math.max(w,h)>MAX_IMAGE_SIDE){const r=MAX_IMAGE_SIDE/Math.max(w,h);w=Math.round(w*r);h=Math.round(h*r);}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);resolve(c);}catch(e){URL.revokeObjectURL(url);reject(e);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("圖片無法讀取"));};img.src=url;}); }
    async function restoreItemOriginalPixels(item) {
      if (!item?.file) throw new Error("找不到原始照片資料");
      if (item.canvasParked) { item.canvasParked = false; clearParkedPreview(item); item.parkedBlob = null; item.canvas.style.display = "block"; item.overlay.style.display = "block"; }
      const source = await fileToCanvas(item.file);
      if (item.canvas.width !== source.width || item.canvas.height !== source.height) {
        item.canvas.width = source.width; item.canvas.height = source.height;
        item.overlay.width = source.width; item.overlay.height = source.height;
      }
      item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
      item.ctx.drawImage(source, 0, 0, item.canvas.width, item.canvas.height);
      item.pixelWidth = item.canvas.width; item.pixelHeight = item.canvas.height;
      item.overlayCtx.clearRect(0, 0, item.overlay.width, item.overlay.height);
    }

    function imageBlobToImage(blob) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("貼圖資料無法讀取")); };
        image.src = url;
      });
    }
    function clampFaceBoxForCanvas(face, canvas) { const {x,y,width,height}=face,p=Number(facePadding.value)/100,shape=state.shape||"rect";if(shape==="rect"){const ex=width*p,ey=height*p,l=clamp(x-ex,0,canvas.width),t=clamp(y-ey,0,canvas.height),r=clamp(x+width+ex,0,canvas.width),b=clamp(y+height+ey,0,canvas.height);return{x:Math.floor(l),y:Math.floor(t),width:Math.max(1,Math.ceil(r-l)),height:Math.max(1,Math.ceil(b-t)),shape:"rect"};}const d=Math.max(width,height)*(1+p*2),cx=x+width/2,cy=y+height/2,rad=Math.max(1,Math.min(d/2,cx,canvas.width-cx,cy,canvas.height-cy));return{x:Math.floor(cx-rad),y:Math.floor(cy-rad),width:Math.max(2,Math.round(rad*2)),height:Math.max(2,Math.round(rad*2)),shape:"circle"}; }
    function refreshAiReviewSelections(){if(!state.faceReviewMode)return;state.photoItems.forEach(item=>{if(!(item.faces||[]).length)return;if(!item.aiSelectionsCustomized){const dims=item.canvasParked?{width:item.pixelWidth,height:item.pixelHeight}:item.canvas;item.selections=item.faces.map(face=>clampFaceBoxForCanvas(face,dims));}drawFaceReview(item);});}
    function applyMosaicToCanvas(canvas, sel) { const ctx=canvas.getContext("2d"),bs=Number(mosaicSize.value),tiny=document.createElement("canvas");tiny.width=Math.max(1,Math.ceil(sel.width/bs));tiny.height=Math.max(1,Math.ceil(sel.height/bs));const tc=tiny.getContext("2d");tc.drawImage(canvas,sel.x,sel.y,sel.width,sel.height,0,0,tiny.width,tiny.height);ctx.save();clipToSelection(ctx,sel);ctx.imageSmoothingEnabled=false;ctx.drawImage(tiny,0,0,tiny.width,tiny.height,sel.x,sel.y,sel.width,sel.height);ctx.restore(); }
    function applyBlurToCanvas(canvas, sel) { const ctx=canvas.getContext("2d"),radius=Number(blurSize.value),pad=Math.ceil(radius*3),sx=Math.max(0,sel.x-pad),sy=Math.max(0,sel.y-pad),sr=Math.min(canvas.width,sel.x+sel.width+pad),sb=Math.min(canvas.height,sel.y+sel.height+pad),tmp=document.createElement("canvas");tmp.width=sr-sx;tmp.height=sb-sy;tmp.getContext("2d").drawImage(canvas,sx,sy,tmp.width,tmp.height,0,0,tmp.width,tmp.height);ctx.save();clipToSelection(ctx,sel);ctx.filter=`blur(${radius}px)`;ctx.drawImage(tmp,sx,sy);ctx.filter="none";ctx.restore(); }


    /* =========================================================
       2. 共用介面函式
       ========================================================= */

    // 顯示短暫提示，避免大量使用 alert 打斷操作。
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
    }

    function getHistoryForItem(item) {
      if (!item) return [];
      return item.isMain ? state.history : (item.history || []);
    }

    function getRedoHistoryForItem(item) {
      if (!item) return [];
      return item.isMain ? state.redoHistory : (item.redoHistory || []);
    }

    function getPatchGroupBytes(group) {
      return (group || []).reduce((sum, patch) => sum + (patch?.imageData?.data?.byteLength || 0), 0);
    }

    function getHistoryStackBytes(stack) {
      return (stack || []).reduce((sum, group) => sum + getPatchGroupBytes(group), 0);
    }

    function enforceHistoryMemoryBudget(item) {
      if (!item) return;
      const undo = getHistoryForItem(item);
      const redo = getRedoHistoryForItem(item);
      let total = getHistoryStackBytes(undo) + getHistoryStackBytes(redo);
      let droppedUndo = false;
      while (total > MAX_HISTORY_BYTES_PER_PHOTO && (undo.length + redo.length) > 1) {
        if (undo.length > 1) { undo.shift(); droppedUndo = true; }
        else if (redo.length > 1) redo.shift();
        else break;
        total = getHistoryStackBytes(undo) + getHistoryStackBytes(redo);
      }
      if (droppedUndo) item.hasUntrackedEdits = true;
    }

    function getDynamicCanvasKeepRadius() {
      return state.photoItems.length <= 12 ? CANVAS_MEMORY_KEEP_RADIUS_SMALL_SET : CANVAS_MEMORY_KEEP_RADIUS_LARGE_SET;
    }

    function compactHistoryForParkedItem(item) {
      if (!item) return 0;
      const undo = getHistoryForItem(item);
      const redo = getRedoHistoryForItem(item);
      const before = getHistoryStackBytes(undo) + getHistoryStackBytes(redo);
      let droppedUndo = false;
      while (undo.length > PARKED_HISTORY_MAX_GROUPS) { undo.shift(); droppedUndo = true; }
      while (redo.length > PARKED_HISTORY_MAX_GROUPS) redo.shift();
      let total = getHistoryStackBytes(undo) + getHistoryStackBytes(redo);
      while (total > PARKED_HISTORY_MAX_BYTES && (undo.length + redo.length) > 1) {
        if (redo.length) redo.shift();
        else if (undo.length > 1) { undo.shift(); droppedUndo = true; }
        else break;
        total = getHistoryStackBytes(undo) + getHistoryStackBytes(redo);
      }
      if (droppedUndo) item.hasUntrackedEdits = true;
      const freed = Math.max(0, before - total);
      if (freed > 0) state.canvasHistoryTrimmedCount += 1;
      return freed;
    }

    function getPhotoWorkStatus(item) {
      if (!item) return { key: "original", label: "原" };
      const manualPending = ensureManualSelections(item).length > 0;
      const aiPending = (item.selectedFaces?.size || 0) > 0;
      if (manualPending || aiPending) return { key: "pending", label: "待" };
      if (item.applied || getHistoryForItem(item).length > 0) return { key: "modified", label: "改" };
      if (item.detected || (item.selections || []).length > 0) return { key: "detected", label: "AI" };
      return { key: "original", label: "原" };
    }

    function isPhotoUnsaved(item) {
      if (!item) return false;
      const status = getPhotoWorkStatus(item);
      return status.key === "pending" || (status.key === "modified" && !item.downloaded);
    }

    function updatePhotoNavStatus(item) {
      const badge = item?.navStatusBadge;
      if (!badge) return;
      const status = getPhotoWorkStatus(item);
      badge.dataset.status = status.key;
      badge.textContent = status.label;
      const descriptions = { original: "原始照片", detected: "AI 已辨識", pending: "有待套用遮罩", modified: "已有修改" };
      badge.title = descriptions[status.key] || "照片狀態";
      item.navButton?.setAttribute("data-work-status", status.key);
      if (item.navDownloadedBadge) {
        const showDownloaded = !!item.downloaded && !isPhotoUnsaved(item);
        item.navDownloadedBadge.hidden = !showDownloaded;
        item.navDownloadedBadge.title = showDownloaded ? "目前版本已下載" : "";
      }
    }

    function getFilteredPhotoItems() {
      if (state.photoFilter === "all") return state.photoItems.slice();
      if (state.photoFilter === "unsaved") return state.photoItems.filter(isPhotoUnsaved);
      return state.photoItems.filter((item) => getPhotoWorkStatus(item).key === state.photoFilter);
    }

    function updatePhotoFilterUi() {
      if (!photoFilterBar) return;
      const counts = { all: state.photoItems.length, original: 0, detected: 0, pending: 0, modified: 0, unsaved: 0 };
      state.photoItems.forEach((item) => {
        counts[getPhotoWorkStatus(item).key] += 1;
        if (isPhotoUnsaved(item)) counts.unsaved += 1;
      });
      photoFilterBar.querySelectorAll(".photo-filter-btn").forEach((button) => {
        const key = button.dataset.filter || "all";
        button.classList.toggle("active", key === state.photoFilter);
        button.setAttribute("aria-pressed", key === state.photoFilter ? "true" : "false");
        button.textContent = `${button.dataset.label || key} ${counts[key] || 0}`;
      });
      state.photoItems.forEach((item) => {
        if (item.navWrapper) item.navWrapper.hidden = state.photoFilter !== "all" && (state.photoFilter === "unsaved" ? !isPhotoUnsaved(item) : getPhotoWorkStatus(item).key !== state.photoFilter);
      });
    }

    function getBatchSelectedItems() { return state.photoItems.filter((item) => item.batchSelected); }

    function syncBatchSelectionUi() {
      const selected = getBatchSelectedItems();
      const busy = state.multiProcessing || state.faceDetecting || state.applyInProgress;
      if (batchSelectedCount) batchSelectedCount.textContent = `已選 ${selected.length} 張`;
      if (batchClearSelectionBtn) batchClearSelectionBtn.disabled = busy || selected.length === 0;
      if (batchResetBtn) batchResetBtn.disabled = busy || selected.length === 0;
      if (batchDownloadBtn) batchDownloadBtn.disabled = busy || selected.length === 0;
      if (batchCloseBtn) batchCloseBtn.disabled = busy || selected.length === 0;
      if (batchSelectVisibleBtn) batchSelectVisibleBtn.disabled = busy || getFilteredPhotoItems().length === 0;
      state.photoItems.forEach((item) => {
        if (item.navSelect) item.navSelect.checked = !!item.batchSelected;
        item.navWrapper?.classList.toggle("batch-selected", !!item.batchSelected);
      });
    }

    function setBatchSelected(item, selected) {
      if (!item) return;
      item.batchSelected = !!selected;
      syncBatchSelectionUi();
    }

    function updateCancelOperationUi() {
      if (!cancelOperationBtn) return;
      const active = !!state.cancellableOperationLabel;
      cancelOperationBtn.hidden = !active;
      cancelOperationBtn.disabled = !active || state.cancelRequested;
      cancelOperationBtn.textContent = state.cancelRequested
        ? `⏳ 正在停止${state.cancellableOperationLabel ? `「${state.cancellableOperationLabel}」` : "目前作業"}…`
        : `⏹ 停止${state.cancellableOperationLabel ? `「${state.cancellableOperationLabel}」` : "目前作業"}`;
    }

    function beginCancellableOperation(label) {
      state.cancelRequested = false;
      state.cancellableOperationLabel = label || "目前作業";
      updateCancelOperationUi();
    }

    function finishCancellableOperation() {
      state.cancelRequested = false;
      state.cancellableOperationLabel = "";
      updateCancelOperationUi();
    }

    function makeOperationCancelledError() {
      const error = new Error("使用者已停止目前作業");
      error.name = "OperationCancelled";
      return error;
    }

    function throwIfOperationCancelled() {
      if (state.cancelRequested) throw makeOperationCancelledError();
    }

    function isOperationCancelledError(error) {
      return error?.name === "OperationCancelled";
    }

    cancelOperationBtn?.addEventListener("click", () => {
      if (!state.cancellableOperationLabel || state.cancelRequested) return;
      state.cancelRequested = true;
      multiPhotoStatus.textContent = `正在停止「${state.cancellableOperationLabel}」；目前這張完成後即停止…`;
      updateCancelOperationUi();
    });

    // 根據是否載入照片、是否框選與是否可復原，更新按鈕狀態。
    function updateButtons() {
      const activeItem = getActivePhotoItem();
      const manualCount = getManualSelectionCount(activeItem);
      const hasSelections = manualCount > 0;
      const hasPhotos = state.photoItems.length > 0;
      const hasDetectedFaces = state.photoItems.some((item) => (item.faces || []).length > 0);
      const selectedAiCount = state.photoItems.reduce((count, item) => count + (item.selectedFaces?.size || 0), 0);
      const hasSelectedFaces = selectedAiCount > 0;

      applyBtn.disabled = !state.imageLoaded || state.multiProcessing || state.applyInProgress || (!hasSelections && !hasSelectedFaces);
      if (state.applyInProgress) {
        applyBtn.textContent = "⏳ 正在套用遮罩…";
      } else if (manualCount || selectedAiCount) {
        const parts = [];
        if (manualCount) parts.push(`手動 ${manualCount}`);
        if (selectedAiCount) parts.push(`AI ${selectedAiCount}`);
        applyBtn.textContent = `✅ 套用遮罩（${parts.join("｜")}）`;
      } else {
        applyBtn.textContent = "✅ 套用目前選取遮罩";
      }
      applyBtn.title = manualCount || selectedAiCount
        ? `將套用：手動框 ${manualCount} 個、AI 人臉 ${selectedAiCount} 張`
        : "先建立手動框或勾選 AI 人臉後即可套用";

      clearSelectionBtn.disabled = !hasSelections;
      const activeHistory = getHistoryForItem(activeItem);
      const activeRedoHistory = getRedoHistoryForItem(activeItem);
      undoBtn.disabled = activeHistory.length === 0;
      redoBtn.disabled = activeRedoHistory.length === 0;
      undoBtn.textContent = activeHistory.length ? `↩️ 復原（${activeHistory.length}）` : "↩️ 復原";
      redoBtn.textContent = activeRedoHistory.length ? `↪️ 重做（${activeRedoHistory.length}）` : "↪️ 重做";
      resetBtn.disabled = !state.imageLoaded;
      downloadBtn.disabled = !state.imageLoaded;
      faceDetectBtn.disabled = !hasPhotos || state.faceDetecting || state.multiProcessing;
      advancedRescanBtn.disabled = !hasPhotos || state.faceDetecting || state.multiProcessing;
      selectAllFacesBtn.disabled = state.multiProcessing || !hasDetectedFaces;
      clearAllFacesBtn.disabled = state.multiProcessing || !hasDetectedFaces;
      clearPhotosBtn.disabled = state.multiProcessing || !hasPhotos;
      if (addPhotosBtn) addPhotosBtn.disabled = state.multiProcessing || state.faceDetecting || state.photoItems.length >= MULTI_MAX_FILES;
      downloadAllZipBtn.disabled = state.multiProcessing || !hasPhotos;
      if (saveProjectBtn) saveProjectBtn.disabled = state.multiProcessing || state.faceDetecting || state.autoBackupInProgress || !hasPhotos;
      if (loadProjectBtn) loadProjectBtn.disabled = state.multiProcessing || state.faceDetecting || state.autoBackupInProgress;
      if (restoreAutoBackupBtn) restoreAutoBackupBtn.disabled = state.multiProcessing || state.faceDetecting || state.autoBackupInProgress || !state.autoBackupAvailable;
      if (clearAutoBackupBtn) clearAutoBackupBtn.disabled = state.multiProcessing || state.faceDetecting || state.autoBackupInProgress || !state.autoBackupAvailable;
      if (backupNowBtn) backupNowBtn.disabled = state.multiProcessing || state.faceDetecting || state.autoBackupInProgress || !hasPhotos;
      updateCancelOperationUi();
      if (mainResetPhotoBtn) mainResetPhotoBtn.disabled = state.multiProcessing || state.faceDetecting || !hasPhotos;
      if (mainClosePhotoBtn) mainClosePhotoBtn.disabled = state.multiProcessing || state.faceDetecting || !hasPhotos;
      state.photoItems.forEach((item) => {
        if (item.resetPhotoBtn) item.resetPhotoBtn.disabled = state.multiProcessing || state.faceDetecting;
        if (item.closePhotoBtn) item.closePhotoBtn.disabled = state.multiProcessing || state.faceDetecting;
        updatePhotoNavStatus(item);
      });
      updatePhotoFilterUi();
      syncBatchSelectionUi();
    }

    // 尚未載入照片時，讓整個工作區具備按一下上傳與鍵盤操作能力。
    function updateWorkspaceUploadState() {
      const isUploadReady = !state.imageLoaded;
      workspace.classList.toggle("upload-ready", isUploadReady);

      if (isUploadReady) {
        workspace.setAttribute("role", "button");
        workspace.setAttribute("tabindex", "0");
        workspace.setAttribute("aria-label", "按一下或拖曳照片到這裡，上傳要處理的檔案");
      } else {
        workspace.removeAttribute("role");
        workspace.removeAttribute("tabindex");
        workspace.setAttribute("aria-label", "照片編輯工作區；也可拖曳新照片到此處更換");
      }
    }

    // 顯示目前手動框數量與選中框的實際像素尺寸。
    function updateSelectionInfo() {
      updateSelectionInfoForItem(getActivePhotoItem());
    }

    // 將任意方向的拖曳起終點整理成左上角與正寬高。
    function normalizeRect(start, end) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      return { x, y, width, height, shape: "rect" };
    }

    // 圓形以按下位置作為圓心，向外拖曳決定半徑，並限制在圖片範圍內。
    function createSelection(start, end) {
      if (state.shape === "rect") {
        return normalizeRect(start, end);
      }

      const requestedRadius = Math.hypot(end.x - start.x, end.y - start.y);
      const maxRadius = Math.max(
        0,
        Math.min(
          start.x,
          overlayCanvas.width - start.x,
          start.y,
          overlayCanvas.height - start.y
        )
      );
      const radius = Math.min(requestedRadius, maxRadius);

      return {
        x: start.x - radius,
        y: start.y - radius,
        width: radius * 2,
        height: radius * 2,
        shape: "circle"
      };
    }

    // 將瀏覽器顯示座標換算回 Canvas 的真實像素座標。
    function getCanvasPoint(event) {
      const rect = overlayCanvas.getBoundingClientRect();
      const scaleX = overlayCanvas.width / rect.width;
      const scaleY = overlayCanvas.height / rect.height;

      return {
        x: Math.max(0, Math.min(overlayCanvas.width, (event.clientX - rect.left) * scaleX)),
        y: Math.max(0, Math.min(overlayCanvas.height, (event.clientY - rect.top) * scaleY))
      };
    }

    // 控制點在不同縮放比例下仍維持容易看見與操作的螢幕尺寸。
    function getVisualMetrics() {
      const rect = overlayCanvas.getBoundingClientRect();
      const scaleX = rect.width ? overlayCanvas.width / rect.width : 1;
      const scaleY = rect.height ? overlayCanvas.height / rect.height : 1;
      const scale = Math.max(0.25, (scaleX + scaleY) / 2);

      return {
        scale,
        lineWidth: Math.max(1.5, 2 * scale),
        handleRadius: Math.max(5, 7 * scale),
        hitRadius: Math.max(9, 12 * scale),
        minimumSize: Math.max(8, 22 * scale)
      };
    }

    function cloneSelection(selection) {
      return selection ? { ...selection } : null;
    }

    function cloneSelections(selections) {
      return (selections || []).map((selection) => cloneSelection(selection));
    }

    function ensureManualSelections(item) {
      if (!item) return [];
      if (!Array.isArray(item.manualSelections)) item.manualSelections = [];
      // 相容舊版單一 manualSelection 狀態。
      if (!item.manualSelections.length && item.manualSelection) {
        item.manualSelections.push(cloneSelection(item.manualSelection));
        item.activeManualIndex = 0;
      }
      item.manualSelection = null;
      if (!Number.isInteger(item.activeManualIndex)) item.activeManualIndex = -1;
      if (item.activeManualIndex >= item.manualSelections.length) item.activeManualIndex = item.manualSelections.length - 1;
      return item.manualSelections;
    }

    function getActivePhotoItem() {
      return state.activePhotoItem || state.photoItems[0] || null;
    }

    function getManualSelectionCount(item = getActivePhotoItem()) {
      return ensureManualSelections(item).length;
    }

    function setActiveManualSelection(item, index) {
      if (!item) { state.selection = null; return; }
      const selections = ensureManualSelections(item);
      const safeIndex = Number.isInteger(index) && index >= 0 && index < selections.length ? index : -1;
      item.activeManualIndex = safeIndex;
      state.selection = safeIndex >= 0 ? cloneSelection(selections[safeIndex]) : null;
    }

    function syncActiveManualSelection(item = getActivePhotoItem()) {
      if (!item) return;
      const selections = ensureManualSelections(item);
      const index = item.activeManualIndex;
      if (index >= 0 && index < selections.length && state.selection) {
        selections[index] = cloneSelection(state.selection);
      }
    }

    function findManualSelectionIndexAtPoint(item, point) {
      const selections = ensureManualSelections(item);
      for (let index = selections.length - 1; index >= 0; index -= 1) {
        if (isPointInsideSelection(point, selections[index])) return index;
      }
      return -1;
    }

    function clearManualSelections(item = getActivePhotoItem(), showMessage = false) {
      if (item) {
        item.manualSelections = [];
        item.manualSelection = null;
        item.activeManualIndex = -1;
        if (state.faceReviewMode) drawFaceReview(item);
        else item.overlayCtx.clearRect(0, 0, item.overlay.width, item.overlay.height);
      }
      state.selection = null;
      clearInteraction();
      selectionInfo.textContent = "尚未框選範圍";
      updateButtons();
      if (showMessage) showToast("已清除這張照片的全部手動框選");
    }

    function deleteActiveManualSelection(item = getActivePhotoItem(), showMessage = true) {
      if (!item) return false;
      const selections = ensureManualSelections(item);
      const index = item.activeManualIndex;
      if (index < 0 || index >= selections.length) return false;
      selections.splice(index, 1);
      const nextIndex = selections.length ? Math.min(index, selections.length - 1) : -1;
      setActiveManualSelection(item, nextIndex);
      drawManualSelectionsForItem(item);
      updateSelectionInfoForItem(item);
      updateButtons();
      if (showMessage) showToast(`已刪除選取框，剩餘 ${selections.length} 個`);
      return true;
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function getVisualMetricsForCanvas(canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width ? canvas.width / rect.width : 1;
      const scaleY = rect.height ? canvas.height / rect.height : 1;
      const scale = Math.max(0.25, (scaleX + scaleY) / 2);
      return {
        scale,
        lineWidth: Math.max(1.5, 2 * scale),
        handleRadius: Math.max(5, 7 * scale),
        hitRadius: Math.max(9, 12 * scale),
        minimumSize: Math.max(8, 22 * scale),
        badgeSize: Math.max(18, 22 * scale)
      };
    }

    // 回傳選取範圍的控制點；矩形有八點，圓形有上下左右四點。
    function getSelectionHandles(selection = state.selection) {
      if (!selection) return [];

      const { x, y, width, height, shape } = selection;
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      if (shape === "circle") {
        return [
          { name: "n", x: centerX, y },
          { name: "e", x: x + width, y: centerY },
          { name: "s", x: centerX, y: y + height },
          { name: "w", x, y: centerY }
        ];
      }

      return [
        { name: "nw", x, y },
        { name: "n", x: centerX, y },
        { name: "ne", x: x + width, y },
        { name: "e", x: x + width, y: centerY },
        { name: "se", x: x + width, y: y + height },
        { name: "s", x: centerX, y: y + height },
        { name: "sw", x, y: y + height },
        { name: "w", x, y: centerY }
      ];
    }

    // 優先偵測控制點，避免在控制點上按下時被誤判成移動。
    function hitTestHandle(point) {
      if (!state.selection) return null;

      const { hitRadius } = getVisualMetrics();

      return getSelectionHandles().find((handle) => {
        return Math.hypot(point.x - handle.x, point.y - handle.y) <= hitRadius;
      })?.name || null;
    }

    // 判斷游標是否在選取範圍內；圓形使用橢圓方程式判斷。
    function isPointInsideSelection(point, selection = state.selection) {
      if (!selection) return false;

      const { x, y, width, height, shape } = selection;

      if (shape === "circle") {
        const radiusX = width / 2;
        const radiusY = height / 2;
        if (radiusX <= 0 || radiusY <= 0) return false;

        const normalizedX = (point.x - (x + radiusX)) / radiusX;
        const normalizedY = (point.y - (y + radiusY)) / radiusY;
        return normalizedX ** 2 + normalizedY ** 2 <= 1;
      }

      return (
        point.x >= x &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + height
      );
    }

    function getHandleCursor(handle) {
      const cursorMap = {
        n: "ns-resize",
        s: "ns-resize",
        e: "ew-resize",
        w: "ew-resize",
        nw: "nwse-resize",
        se: "nwse-resize",
        ne: "nesw-resize",
        sw: "nesw-resize"
      };

      return cursorMap[handle] || "crosshair";
    }

    function updateCanvasCursor(point = null) {
      if (!state.imageLoaded) {
        overlayCanvas.style.cursor = "default";
        return;
      }

      if (state.interaction === "move") {
        overlayCanvas.style.cursor = "grabbing";
        return;
      }

      if (state.interaction === "resize") {
        overlayCanvas.style.cursor = getHandleCursor(state.activeHandle);
        return;
      }

      if (state.interaction === "new") {
        overlayCanvas.style.cursor = "crosshair";
        return;
      }

      if (!point) {
        overlayCanvas.style.cursor = "crosshair";
        return;
      }

      const handle = hitTestHandle(point);
      const activeItem = getActivePhotoItem();
      if (handle) {
        overlayCanvas.style.cursor = getHandleCursor(handle);
      } else if (findManualSelectionIndexAtPoint(activeItem, point) >= 0) {
        overlayCanvas.style.cursor = "grab";
      } else if (state.faceReviewMode && activeItem) {
        const aiHandle = hitAiResizeHandle(activeItem, overlayCanvas, point);
        if (aiHandle) overlayCanvas.style.cursor = getHandleCursor(aiHandle);
        else if (findFaceIndexAtPoint(activeItem, point) >= 0) overlayCanvas.style.cursor = "pointer";
        else overlayCanvas.style.cursor = "crosshair";
      } else {
        overlayCanvas.style.cursor = "crosshair";
      }
    }

    // 畫出同一張照片上的全部手動框；目前選中的框會顯示控制點。
    function drawManualSelectionsForItem(item, preserveCanvas = false, fromAiLayer = false) {
      if (!item || item.canvasParked) return;
      // AI 人臉框與手動框可同時存在。一般手動重繪若正在 AI 確認模式，
      // 交由 drawFaceReview 統一繪製兩種圖層，避免彼此把 overlay 清掉。
      if (state.faceReviewMode && !fromAiLayer) {
        drawFaceReview(item);
        return;
      }
      const ctx = item.overlayCtx;
      const canvas = item.overlay;
      const selections = ensureManualSelections(item);
      const { lineWidth, handleRadius, badgeSize } = getVisualMetricsForCanvas(canvas);
      if (!preserveCanvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

      selections.forEach((selection, index) => {
        if (!selection) return;
        const active = item === getActivePhotoItem() && index === item.activeManualIndex;
        const { x, y, width, height, shape } = selection;
        const centerX = x + width / 2;
        const centerY = y + height / 2;

        ctx.save();
        ctx.fillStyle = active ? "rgba(37, 99, 235, 0.14)" : "rgba(59, 130, 246, 0.07)";
        ctx.lineWidth = active ? lineWidth * 1.15 : lineWidth;
        ctx.strokeStyle = active ? "#2563eb" : "#60a5fa";
        ctx.setLineDash(active ? [lineWidth * 5, lineWidth * 3] : [lineWidth * 4, lineWidth * 3]);

        if (shape === "circle") {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, Math.max(0, width / 2 - lineWidth / 2), Math.max(0, height / 2 - lineWidth / 2), 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.fillRect(x, y, width, height);
          ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, Math.max(0, width - lineWidth), Math.max(0, height - lineWidth));
        }

        // 每個框左上角顯示流水號，方便辨識多框。
        const bx = clamp(x + badgeSize * 0.15, badgeSize * 0.55, Math.max(badgeSize * 0.55, canvas.width - badgeSize * 0.55));
        const by = clamp(y + badgeSize * 0.15, badgeSize * 0.55, Math.max(badgeSize * 0.55, canvas.height - badgeSize * 0.55));
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(bx, by, badgeSize * 0.48, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#2563eb" : "rgba(96,165,250,.92)";
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${Math.max(10, badgeSize * .55)}px "Segoe UI", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(index + 1), bx, by + badgeSize * .02);

        if (active) {
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = lineWidth;
          getSelectionHandles(selection).forEach((handle) => {
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, handleRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
          const centerRadius = handleRadius * 0.82;
          ctx.beginPath();
          ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(37, 99, 235, 0.92)";
          ctx.fill();
        }
        ctx.restore();
      });
    }

    function drawSelection() {
      const item = state.photoItems[0] || getActivePhotoItem();
      if (item) drawManualSelectionsForItem(item);
      else overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    function clearInteraction() {
      state.pointerStart = null;
      state.isSelecting = false;
      state.interaction = null;
      state.activeHandle = null;
      state.dragOrigin = null;
      state.startSelection = null;
      state.interactionSelectionIndex = -1;
      state.duplicateInteraction = false;
    }

    function clearSelection(showMessage = false) {
      clearManualSelections(getActivePhotoItem(), showMessage);
      updateCanvasCursor();
    }

    /* =========================================================
       3. 照片載入與拖曳上傳
       ========================================================= */

    function setBatchProgress(current = 0, total = 0, label = "") {
      if (!batchProgressText) return;
      if (!total) {
        batchProgressText.hidden = true;
        batchProgressText.textContent = "";
        aiProgressBar.style.width = "0%";
        return;
      }
      const safeCurrent = Math.max(0, Math.min(Number(current) || 0, total));
      const percent = Math.round(safeCurrent / total * 100);
      aiProgressBar.style.width = `${percent}%`;
      batchProgressText.hidden = false;
      batchProgressText.textContent = `${label ? `${label}｜` : ""}${safeCurrent} / ${total}（${percent}%）`;
    }

    function refreshPhotoThumbnail(item) {
      if (!item?.navCanvas || !item.canvas || item.canvasParked) return;
      const thumb = item.navCanvas;
      const ctx = thumb.getContext("2d");
      const tw = thumb.width, th = thumb.height;
      ctx.clearRect(0, 0, tw, th);
      const sw = item.canvas.width, sh = item.canvas.height;
      if (!sw || !sh) return;
      const scale = Math.max(tw / sw, th / sh);
      const dw = sw * scale, dh = sh * scale;
      ctx.drawImage(item.canvas, (tw - dw) / 2, (th - dh) / 2, dw, dh);
    }

    function syncPhotoNavigatorActive() {
      if (!photoNavigator) return;
      const current = getActivePhotoItem();
      const filteredItems = getFilteredPhotoItems();
      const filteredIndex = filteredItems.indexOf(current);
      if (!state.photoItems.length) photoNavigatorCounter.textContent = "0 / 0";
      else if (state.photoFilter === "all") {
        const index = Math.max(0, state.photoItems.indexOf(current));
        photoNavigatorCounter.textContent = `${index + 1} / ${state.photoItems.length}`;
      } else photoNavigatorCounter.textContent = `${filteredIndex >= 0 ? filteredIndex + 1 : 0} / ${filteredItems.length}（全部 ${state.photoItems.length}）`;
      state.photoItems.forEach((item) => {
        item.navButton?.classList.toggle("active", item === current);
        if (item.navButton) item.navButton.setAttribute("aria-current", item === current ? "true" : "false");
      });
      prevPhotoBtn.disabled = filteredIndex <= 0;
      nextPhotoBtn.disabled = filteredIndex < 0 || filteredIndex >= filteredItems.length - 1;
      if (filteredIndex >= 0) current?.navWrapper?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      updatePhotoFilterUi();
      syncBatchSelectionUi();
    }

    async function scrollToPhotoItem(item) {
      if (!item) return;
      await activatePhotoItem(item);
      const target = item.isMain ? workspace : item.entry;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      syncPhotoNavigatorActive();
    }

    function renderPhotoNavigator() {
      if (!photoNavigator || !photoNavStrip) return;
      photoNavStrip.innerHTML = "";
      photoNavigator.hidden = state.photoItems.length === 0;
      state.photoItems.forEach((item, index) => {
        const wrapper = document.createElement("div"); wrapper.className = "photo-nav-item";
        const button = document.createElement("button"); button.type = "button"; button.className = "photo-nav-thumb";
        button.title = `第 ${index + 1} 張｜${item.file?.name || "照片"}`; button.setAttribute("aria-label", button.title);
        const thumb = document.createElement("canvas"); thumb.width = 120; thumb.height = 88;
        const label = document.createElement("span"); label.textContent = `第 ${index + 1} 張`;
        const statusBadge = document.createElement("span"); statusBadge.className = "photo-nav-status";
        const downloadedBadge = document.createElement("span"); downloadedBadge.className = "photo-nav-downloaded"; downloadedBadge.textContent = "✓"; downloadedBadge.hidden = true;
        button.append(thumb, label, statusBadge); button.addEventListener("click", () => scrollToPhotoItem(item));
        const selector = document.createElement("input"); selector.type = "checkbox"; selector.className = "photo-nav-select"; selector.checked = !!item.batchSelected;
        selector.title = `批次選取第 ${index + 1} 張`; selector.setAttribute("aria-label", selector.title);
        selector.addEventListener("change", () => setBatchSelected(item, selector.checked));
        wrapper.append(button, selector, downloadedBadge); photoNavStrip.append(wrapper);
        item.navWrapper = wrapper; item.navButton = button; item.navCanvas = thumb; item.navStatusBadge = statusBadge; item.navDownloadedBadge = downloadedBadge; item.navSelect = selector;
        refreshPhotoThumbnail(item); updatePhotoNavStatus(item);
      });
      updatePhotoFilterUi(); syncPhotoNavigatorActive(); updateCanvasMemoryStatus();
    }

    function navigateRelativePhoto(delta) {
      const filteredItems = getFilteredPhotoItems(); if (!filteredItems.length) return;
      const current = getActivePhotoItem(); let index = filteredItems.indexOf(current);
      if (index < 0) index = delta > 0 ? -1 : filteredItems.length;
      const next = Math.max(0, Math.min(filteredItems.length - 1, index + delta));
      if (filteredItems[next]) scrollToPhotoItem(filteredItems[next]);
    }

    mainParkedPreview?.addEventListener("click", () => { const item = state.photoItems[0]; if (item) activatePhotoItem(item); });
    mainParkedPreview?.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && state.photoItems[0]) { event.preventDefault(); activatePhotoItem(state.photoItems[0]); } });

    prevPhotoBtn?.addEventListener("click", () => navigateRelativePhoto(-1));
    nextPhotoBtn?.addEventListener("click", () => navigateRelativePhoto(1));
    photoFilterBar?.addEventListener("click", (event) => {
      const button = event.target.closest(".photo-filter-btn"); if (!button) return;
      state.photoFilter = button.dataset.filter || "all"; updatePhotoFilterUi();
      const filteredItems = getFilteredPhotoItems();
      if (filteredItems.length && !filteredItems.includes(getActivePhotoItem())) scrollToPhotoItem(filteredItems[0]); else syncPhotoNavigatorActive();
      if (!filteredItems.length) showToast("目前沒有符合此狀態的照片");
    });
    batchSelectVisibleBtn?.addEventListener("click", () => { const items = getFilteredPhotoItems(); items.forEach((item) => item.batchSelected = true); syncBatchSelectionUi(); showToast(`已選取 ${items.length} 張目前顯示的照片`); });
    batchClearSelectionBtn?.addEventListener("click", () => { state.photoItems.forEach((item) => item.batchSelected = false); syncBatchSelectionUi(); });

    function clearAdditionalPreviews() {
      state.photoItems.forEach((item) => { clearParkedPreview(item); item.parkedBlob = null; });
      multiPreviewList.innerHTML = "";
      if (photoNavStrip) photoNavStrip.innerHTML = "";
      if (photoNavigator) photoNavigator.hidden = true;
      setBatchProgress(0, 0);
      firstFaceControls.hidden = true;
      firstFaceControls.innerHTML = "";
      state.photoItems = [];
      state.faceReviewMode = false;
      state.photoFilter = "all";
      aiProgressBar.style.width = "0%";
      syncBatchSelectionUi();
    }

    function createPhotoItem(file, canvas, overlay, isMain = false) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const overlayCtxLocal = overlay.getContext("2d");
      return {
        file, canvas, overlay, ctx, overlayCtx: overlayCtxLocal, isMain,
        sourceName: safeBaseName(file.name), faces: [], selections: [], selectedFaces: new Set(),
        activeAiFaceIndex: -1, aiSelectionsCustomized: false, aiPointer: null,
        detected: false, applied: false, engine: "", outputBlob: null,
        manualSelection: null, manualSelections: [], activeManualIndex: -1, history: [], redoHistory: [],
        originalImageData: null, originalStatusText: "", originalMetaText: "",
        controls: isMain ? firstFaceControls : null, statusEl: isMain ? statusText : null,
        metaEl: isMain ? imageMeta : null, downloadBtn: isMain ? downloadBtn : null,
        resetPhotoBtn: isMain ? mainResetPhotoBtn : null, closePhotoBtn: isMain ? mainClosePhotoBtn : null,
        indexBadge: null, navButton: null, navWrapper: null, navCanvas: null, navStatusBadge: null, navDownloadedBadge: null, navSelect: null,
        batchSelected: false, downloaded: false, hasUntrackedEdits: false,
        pixelWidth: canvas.width, pixelHeight: canvas.height, canvasParked: false, parkedBlob: null, parkedPreviewUrl: "", parkedPreviewImg: null, memoryBusy: false, memoryPromise: null, lastActivatedAt: Date.now()
      };
    }

    async function loadMainPhoto(file) {
      const source = await fileToCanvas(file);
      mainCanvas.width = source.width; mainCanvas.height = source.height;
      overlayCanvas.width = source.width; overlayCanvas.height = source.height;
      mainCtx.clearRect(0, 0, source.width, source.height);
      mainCtx.drawImage(source, 0, 0);
      overlayCtx.clearRect(0, 0, source.width, source.height);
      state.imageLoaded = true;
      state.originalImageData = null;
      state.history = [];
      state.redoHistory = [];
      state.sourceName = safeBaseName(file.name);
      state.resized = false;
      state.customSticker = null;
      state.faceDetecting = false;
      clearSelection();
      emptyState.hidden = true;
      canvasWrap.hidden = false;
      statusText.textContent = `第 1 張｜${file.name}`;
      imageMeta.textContent = `${source.width} × ${source.height} px｜本機處理`;
      stickerStatus.textContent = "目前使用 Emoji 貼圖。";
      updateWorkspaceUploadState();
      const item = createPhotoItem(file, mainCanvas, overlayCanvas, true);
      // V4.2：原始像素不再常駐為完整 ImageData；需要重設時由原始 File 重新解碼，降低多圖 RAM 使用。
      item.originalImageData = null;
      item.parkedPreviewImg = mainParkedPreview;
      if (mainParkedPreview) mainParkedPreview.alt = file.name;
      item.originalStatusText = `第 1 張｜${file.name}`;
      item.originalMetaText = `${source.width} × ${source.height} px｜本機處理`;
      state.activePhotoItem = item;
      return item;
    }

    function createAdditionalPreview(file, sourceCanvas, index) {
      const entry = document.createElement("section");
      entry.className = "photo-preview-entry";
      const top = document.createElement("div"); top.className = "editor-topbar";
      const sw = document.createElement("div"); sw.className = "status-wrap";
      const title = document.createElement("span"); title.style.display = "block"; title.style.fontWeight = "950"; title.textContent = `第 ${index + 1} 張｜${file.name}`;
      const meta = document.createElement("span"); meta.style.display = "block"; meta.style.marginTop = "3px"; meta.style.color = "var(--muted)"; meta.style.fontSize = "12px"; meta.textContent = `${sourceCanvas.width} × ${sourceCanvas.height} px｜本機處理`;
      sw.append(title, meta);
      const actions = document.createElement("div"); actions.className = "preview-actions";
      const badge = document.createElement("span"); badge.className = "preview-index"; badge.textContent = `${index + 1}`;
      const dl = document.createElement("button"); dl.type = "button"; dl.className = "preview-download"; dl.textContent = "⬇️ 下載";
      const resetPhoto = document.createElement("button"); resetPhoto.type = "button"; resetPhoto.className = "photo-item-action photo-reset-btn"; resetPhoto.textContent = "↺ 取消修改"; resetPhoto.title = "取消這張照片的所有修改並恢復原圖";
      const closePhoto = document.createElement("button"); closePhoto.type = "button"; closePhoto.className = "photo-item-action photo-close-btn"; closePhoto.textContent = "✕ 關閉"; closePhoto.title = "關閉並移除這張照片";
      actions.append(badge, dl, resetPhoto, closePhoto); top.append(sw, actions);
      const ws = document.createElement("div"); ws.className = "workspace additional-workspace";
      const wrap = document.createElement("div"); wrap.className = "canvas-wrap";
      const c = document.createElement("canvas"); c.width = sourceCanvas.width; c.height = sourceCanvas.height; c.getContext("2d", {willReadFrequently:true}).drawImage(sourceCanvas, 0, 0);
      const ov = document.createElement("canvas"); ov.className = "overlay-canvas"; ov.width = c.width; ov.height = c.height;
      const parkedPreview = document.createElement("img"); parkedPreview.className = "canvas-parked-preview"; parkedPreview.alt = file.name; parkedPreview.hidden = true;
      wrap.append(parkedPreview, c, ov); ws.append(wrap);
      const controls = document.createElement("div"); controls.className = "face-review-controls"; controls.hidden = true;
      entry.append(top, ws, controls); multiPreviewList.append(entry);
      const item = createPhotoItem(file, c, ov, false); item.controls = controls; item.statusEl = title; item.metaEl = meta; item.downloadBtn = dl; item.entry = entry; item.resetPhotoBtn = resetPhoto; item.closePhotoBtn = closePhoto; item.indexBadge = badge;
      item.originalImageData = null;
      item.originalStatusText = `第 ${index + 1} 張｜${file.name}`;
      item.originalMetaText = `${sourceCanvas.width} × ${sourceCanvas.height} px｜本機處理`;
      dl.addEventListener("click", async () => downloadPhotoItem(item));
      resetPhoto.addEventListener("click", async () => { await resetSinglePhoto(item); });
      closePhoto.addEventListener("click", async () => { await closeSinglePhoto(item); });
      installAdditionalManualEditor(item);
      return item;
    }


    function photoHasPixelEdits(item) {
      return !!item && (!!item.applied || !!item.hasUntrackedEdits || getHistoryForItem(item).length > 0 || getRedoHistoryForItem(item).length > 0);
    }

    function updateCanvasMemoryStatus() {
      if (!canvasMemoryStatus) return;
      const parked = state.photoItems.filter((item) => item.canvasParked).length;
      const radius = getDynamicCanvasKeepRadius();
      state.canvasMemoryParkedCount = parked;
      canvasMemoryStatus.hidden = state.photoItems.length < CANVAS_MEMORY_MIN_PHOTOS;
      if (!canvasMemoryStatus.hidden) {
        canvasMemoryStatus.dataset.kind = parked ? "active" : "idle";
        canvasMemoryStatus.textContent = parked
          ? `記憶體最佳化：已釋放 ${parked} 張 Canvas｜目前僅保留前後 ${radius} 張完整畫布${state.canvasHistoryTrimmedCount ? `｜已精簡 ${state.canvasHistoryTrimmedCount} 張 Undo` : ""}`
          : `記憶體最佳化：目前保留前後 ${radius} 張完整畫布`;
      }
    }

    function clearParkedPreview(item) {
      if (!item) return;
      if (item.parkedPreviewUrl) { try { URL.revokeObjectURL(item.parkedPreviewUrl); } catch (_) {} }
      item.parkedPreviewUrl = "";
      if (item.parkedPreviewImg) { item.parkedPreviewImg.removeAttribute("src"); item.parkedPreviewImg.hidden = true; }
    }

    async function ensurePhotoCanvasLoaded(item) {
      if (!item || !item.canvasParked) return item?.canvas || null;
      if (item.memoryPromise) { await item.memoryPromise; return item.canvas; }
      item.memoryPromise = (async () => {
        item.memoryBusy = true;
        const sourceBlob = item.parkedBlob || item.file;
        if (!sourceBlob) throw new Error("找不到照片像素資料");
        const source = await fileToCanvas(sourceBlob);
        const width = item.pixelWidth || source.width;
        const height = item.pixelHeight || source.height;
        item.canvas.width = width; item.canvas.height = height;
        item.overlay.width = width; item.overlay.height = height;
        item.ctx = item.canvas.getContext("2d", { willReadFrequently:true });
        item.overlayCtx = item.overlay.getContext("2d");
        item.ctx.clearRect(0, 0, width, height);
        item.ctx.drawImage(source, 0, 0, width, height);
        item.canvas.style.display = "block"; item.overlay.style.display = "block";
        if (item.parkedPreviewImg) { item.parkedPreviewImg.removeAttribute("tabindex"); item.parkedPreviewImg.removeAttribute("role"); }
        item.canvasParked = false;
        clearParkedPreview(item);
        item.parkedBlob = null;
        if (state.faceReviewMode) drawFaceReview(item); else drawManualSelectionsForItem(item);
        refreshPhotoThumbnail(item);
        updateCanvasMemoryStatus();
        return item.canvas;
      })().finally(() => { item.memoryBusy = false; item.memoryPromise = null; });
      await item.memoryPromise;
      return item.canvas;
    }

    async function parkPhotoCanvas(item) {
      if (!item || item === getActivePhotoItem() || item.canvasParked || item.memoryBusy) return false;
      if (state.multiProcessing || state.faceDetecting || state.applyInProgress || state.autoBackupInProgress) return false;
      item.memoryBusy = true;
      try {
        // 非作用中照片的 manualSelections 已在離開照片時同步；這裡不可再用全域 state.selection 覆寫。
        item.pixelWidth = item.canvas.width || item.pixelWidth;
        item.pixelHeight = item.canvas.height || item.pixelHeight;
        if (!item.pixelWidth || !item.pixelHeight) return false;
        if (photoHasPixelEdits(item)) item.parkedBlob = await canvasToBlob(item.canvas);
        else item.parkedBlob = null;
        compactHistoryForParkedItem(item);
        if (item.parkedPreviewImg) {
          const previewBlob = await canvasToMemoryPreviewBlob(item.canvas);
          clearParkedPreview(item);
          item.parkedPreviewUrl = URL.createObjectURL(previewBlob);
          item.parkedPreviewImg.src = item.parkedPreviewUrl;
          item.parkedPreviewImg.hidden = false;
          item.parkedPreviewImg.setAttribute("role", "button");
          item.parkedPreviewImg.setAttribute("tabindex", "0");
        }
        item.canvas.style.display = "none"; item.overlay.style.display = "none";
        item.canvas.width = 1; item.canvas.height = 1; item.overlay.width = 1; item.overlay.height = 1;
        item.canvasParked = true;
        updateCanvasMemoryStatus();
        return true;
      } finally { item.memoryBusy = false; }
    }

    let canvasMemoryTimer = null;
    function scheduleCanvasMemoryMaintenance(delay = CANVAS_MEMORY_IDLE_MS) {
      clearTimeout(canvasMemoryTimer);
      if (state.photoItems.length < CANVAS_MEMORY_MIN_PHOTOS) { updateCanvasMemoryStatus(); return; }
      canvasMemoryTimer = setTimeout(async () => {
        if (state.canvasMemoryBusy || state.multiProcessing || state.faceDetecting || state.applyInProgress || state.autoBackupInProgress) return;
        state.canvasMemoryBusy = true;
        try {
          const active = getActivePhotoItem();
          const activeIndex = Math.max(0, state.photoItems.indexOf(active));
          const keepRadius = getDynamicCanvasKeepRadius();
          // 先喚醒目前照片附近 1～2 張，讓上一張／下一張切換更即時。
          for (let i = Math.max(0, activeIndex - keepRadius); i <= Math.min(state.photoItems.length - 1, activeIndex + keepRadius); i++) {
            const near = state.photoItems[i];
            if (near?.canvasParked) {
              try { await ensurePhotoCanvasLoaded(near); } catch (error) { console.warn("附近照片畫布預載失敗", error); }
            }
          }
          for (let i = 0; i < state.photoItems.length; i++) {
            const item = state.photoItems[i];
            if (item === active || Math.abs(i - activeIndex) <= keepRadius) continue;
            await parkPhotoCanvas(item);
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        } finally { state.canvasMemoryBusy = false; updateCanvasMemoryStatus(); }
      }, delay);
    }


    function getPhotoDisplayIndex(item) {
      const index = state.photoItems.indexOf(item);
      return index >= 0 ? index + 1 : 1;
    }

    function clearPhotoTransientState(item) {
      if (!item) return;
      item.faces = [];
      item.selections = [];
      item.selectedFaces = new Set();
      item.activeAiFaceIndex = -1;
      item.aiSelectionsCustomized = false;
      item.aiPointer = null;
      item.detected = false;
      item.applied = false;
      item.engine = "";
      item.outputBlob = null;
      item.downloaded = false;
      item.hasUntrackedEdits = false;
      item.manualSelection = null;
      item.manualSelections = [];
      item.activeManualIndex = -1;
      item.history = [];
      item.redoHistory = [];
      item.overlayCtx?.clearRect(0, 0, item.overlay.width, item.overlay.height);
      if (item.controls) {
        item.controls.hidden = true;
        item.controls.innerHTML = "";
      }
      item.entry?.classList.remove("manual-active");
    }

    function updatePhotoItemLabels() {
      state.photoItems.forEach((item, index) => {
        const number = index + 1;
        const filename = item.file?.name || "照片";
        if (item.statusEl) {
          const current = item.statusEl.textContent || "";
          item.statusEl.textContent = /^第\s*\d+\s*張｜/.test(current)
            ? current.replace(/^第\s*\d+\s*張｜/, `第 ${number} 張｜`)
            : `第 ${number} 張｜${filename}`;
        }
        item.originalStatusText = `第 ${number} 張｜${filename}`;
        if (item.indexBadge) item.indexBadge.textContent = String(number);
      });
      photoSummary.textContent = state.photoItems.length ? `共 ${state.photoItems.length} 張照片` : "尚未加入照片";
    }

    function refreshFaceReviewModeAfterPhotoChange() {
      const hasAnyAiBoxes = state.photoItems.some((item) => (item.selections || []).length > 0);
      if (!hasAnyAiBoxes) state.faceReviewMode = false;
    }

    async function resetSinglePhoto(item, { confirmReset = true, silent = false, refreshUi = true } = {}) {
      if (!item || !state.photoItems.includes(item) || !item.file) return;
      const index = getPhotoDisplayIndex(item);
      if (confirmReset) {
        const ok = window.confirm(`確定要取消第 ${index} 張照片的所有修改嗎？\n\n這張照片會恢復成剛載入時的原始狀態；AI 辨識、遮罩、手動框選與復原紀錄都會清除。`);
        if (!ok) return;
      }
      await restoreItemOriginalPixels(item);
      clearPhotoTransientState(item);
      if (item.isMain) {
        state.history = [];
        state.redoHistory = [];
        state.selection = null;
        state.originalImageData = null;
        state.sourceName = safeBaseName(item.file?.name || "photo");
      }
      const sizeText = `${item.canvas.width} × ${item.canvas.height} px｜本機處理`;
      if (item.statusEl) item.statusEl.textContent = `第 ${index} 張｜${item.file?.name || "照片"}`;
      if (item.metaEl) item.metaEl.textContent = sizeText;
      item.originalStatusText = `第 ${index} 張｜${item.file?.name || "照片"}`;
      item.originalMetaText = sizeText;
      refreshFaceReviewModeAfterPhotoChange();
      if (refreshUi) {
        if (state.faceReviewMode) state.photoItems.forEach((photo) => drawFaceReview(photo));
        else state.photoItems.forEach((photo) => drawManualSelectionsForItem(photo));
      } else {
        if (state.faceReviewMode) drawFaceReview(item);
        else drawManualSelectionsForItem(item);
      }
      if (state.activePhotoItem === item) {
        state.selection = null;
        if (!item.isMain) item.entry?.classList.add("manual-active");
        updateSelectionInfoForItem(item);
      }
      refreshPhotoThumbnail(item);
      if (refreshUi) { renderPhotoNavigator(); updateButtons(); multiPhotoStatus.textContent = `第 ${index} 張照片已恢復原始狀態。`; }
      if (!silent) showToast(`第 ${index} 張照片已取消修改並恢復原圖`);
    }

    function copyPhotoStateToMain(sourceItem) {
      if (state.activePhotoItem === sourceItem) syncActiveManualSelection(sourceItem);
      mainCanvas.width = sourceItem.canvas.width;
      mainCanvas.height = sourceItem.canvas.height;
      overlayCanvas.width = sourceItem.overlay.width;
      overlayCanvas.height = sourceItem.overlay.height;
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      mainCtx.drawImage(sourceItem.canvas, 0, 0);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      const mainItem = createPhotoItem(sourceItem.file, mainCanvas, overlayCanvas, true);
      mainItem.sourceName = sourceItem.sourceName;
      mainItem.faces = (sourceItem.faces || []).map((face) => ({ ...face }));
      mainItem.selections = cloneSelections(sourceItem.selections || []);
      mainItem.selectedFaces = new Set(sourceItem.selectedFaces || []);
      mainItem.activeAiFaceIndex = sourceItem.activeAiFaceIndex ?? -1;
      mainItem.aiSelectionsCustomized = !!sourceItem.aiSelectionsCustomized;
      mainItem.detected = !!sourceItem.detected;
      mainItem.applied = !!sourceItem.applied;
      mainItem.engine = sourceItem.engine || "";
      mainItem.outputBlob = sourceItem.outputBlob || null;
      mainItem.manualSelections = cloneSelections(sourceItem.manualSelections || []);
      mainItem.activeManualIndex = sourceItem.activeManualIndex ?? -1;
      mainItem.history = Array.isArray(sourceItem.history) ? sourceItem.history.slice() : [];
      mainItem.redoHistory = Array.isArray(sourceItem.redoHistory) ? sourceItem.redoHistory.slice() : [];
      mainItem.batchSelected = !!sourceItem.batchSelected;
      mainItem.downloaded = !!sourceItem.downloaded;
      mainItem.hasUntrackedEdits = !!sourceItem.hasUntrackedEdits;
      mainItem.originalImageData = null;
      mainItem.controls = firstFaceControls;
      mainItem.statusEl = statusText;
      mainItem.metaEl = imageMeta;
      mainItem.downloadBtn = downloadBtn;
      mainItem.resetPhotoBtn = mainResetPhotoBtn;
      mainItem.closePhotoBtn = mainClosePhotoBtn;
      mainItem.parkedPreviewImg = mainParkedPreview;
      mainItem.pixelWidth = mainCanvas.width; mainItem.pixelHeight = mainCanvas.height;
      if (mainParkedPreview) mainParkedPreview.alt = sourceItem.file?.name || "目前照片預覽";
      state.imageLoaded = true;
      state.originalImageData = null;
      state.history = mainItem.history;
      state.redoHistory = mainItem.redoHistory;
      state.sourceName = mainItem.sourceName;
      emptyState.hidden = true;
      canvasWrap.hidden = false;
      statusText.textContent = sourceItem.statusEl?.textContent || sourceItem.file?.name || "照片";
      imageMeta.textContent = sourceItem.metaEl?.textContent || `${mainCanvas.width} × ${mainCanvas.height} px｜本機處理`;
      firstFaceControls.innerHTML = "";
      firstFaceControls.hidden = true;
      updateWorkspaceUploadState();
      return mainItem;
    }

    function resetToEmptyPhotoState() {
      multiPreviewList.innerHTML = "";
      if (photoNavStrip) photoNavStrip.innerHTML = "";
      if (photoNavigator) photoNavigator.hidden = true;
      state.photoItems = [];
      state.activePhotoItem = null;
      state.imageLoaded = false;
      state.faceReviewMode = false;
      state.photoFilter = "all";
      state.history = [];
      state.redoHistory = [];
      state.originalImageData = null;
      state.selection = null;
      clearInteraction();
      clearParkedPreview({ parkedPreviewImg: mainParkedPreview, parkedPreviewUrl: mainParkedPreview?.dataset?.objectUrl || "" });
      if (mainParkedPreview) { mainParkedPreview.hidden = true; mainParkedPreview.removeAttribute("src"); mainParkedPreview.removeAttribute("tabindex"); mainParkedPreview.removeAttribute("role"); }
      mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      emptyState.hidden = false;
      canvasWrap.hidden = true;
      firstFaceControls.hidden = true;
      firstFaceControls.innerHTML = "";
      statusText.textContent = "請先上傳一張照片";
      imageMeta.textContent = "尚未載入圖片";
      selectionInfo.textContent = "尚未框選範圍";
      photoSummary.textContent = "尚未加入照片";
      multiPhotoStatus.textContent = "";
      setBatchProgress(0, 0);
      aiProgressBar.style.width = "0%";
      updateWorkspaceUploadState();
      updateButtons();
    }

    async function closeSinglePhoto(item, { confirmClose = true, silent = false, refreshUi = true } = {}) {
      if (!item || !state.photoItems.includes(item)) return;
      clearParkedPreview(item); item.parkedBlob = null;
      const oldIndex = state.photoItems.indexOf(item);
      const displayIndex = oldIndex + 1;
      const filename = item.file?.name || "照片";
      const modifiedWarning = isPhotoUnsaved(item)
        ? "\n\n⚠️ 這張照片目前有尚未下載的修改或待套用遮罩。"
        : "";
      if (confirmClose) {
        const ok = window.confirm(`確定要關閉第 ${displayIndex} 張照片嗎？

${filename}${modifiedWarning}

這只會從目前工作區移除這張照片，不會刪除原始檔案。`);
        if (!ok) return;
      }
      const wasActive = state.activePhotoItem === item;
      if (wasActive) syncActiveManualSelection(item);
      if (state.photoItems.length === 1) {
        resetToEmptyPhotoState();
        showToast("照片已關閉");
        return;
      }
      if (!item.isMain) {
        item.entry?.remove();
        state.photoItems.splice(oldIndex, 1);
        if (wasActive) {
          const nextIndex = Math.max(0, Math.min(oldIndex, state.photoItems.length - 1));
          state.activePhotoItem = state.photoItems[nextIndex] || state.photoItems[0];
          activatePhotoItem(state.activePhotoItem);
        }
      } else {
        const remaining = state.photoItems.slice(1);
        const candidate = remaining.shift();
        if (candidate.canvasParked) await ensurePhotoCanvasLoaded(candidate);
        candidate.entry?.remove();
        const newMain = copyPhotoStateToMain(candidate);
        state.photoItems = [newMain, ...remaining];
        state.activePhotoItem = newMain;
        setActiveManualSelection(newMain, newMain.activeManualIndex);
      }
      refreshFaceReviewModeAfterPhotoChange();
      updatePhotoItemLabels();
      if (refreshUi) {
        renderPhotoNavigator();
        state.photoItems.forEach((photo) => state.faceReviewMode ? drawFaceReview(photo) : drawManualSelectionsForItem(photo));
        if (state.activePhotoItem) updateSelectionInfoForItem(state.activePhotoItem);
        updateButtons();
        multiPhotoStatus.textContent = `已關閉第 ${displayIndex} 張照片；目前剩下 ${state.photoItems.length} 張。`;
      }
      if (!silent) showToast(`已關閉「${filename}」`);
    }

    async function downloadBatchSelectedPhotos() {
      const selected = getBatchSelectedItems(); if (!selected.length || state.multiProcessing) return;
      if (selected.length === 1) { await downloadPhotoItem(selected[0]); showToast("已下載選取照片"); return; }
      state.multiProcessing = true; beginCancellableOperation("下載選取照片"); updateButtons();
      try {
        const entries = []; setBatchProgress(0, selected.length, "準備選取照片");
        for (let i = 0; i < selected.length; i++) {
          throwIfOperationCancelled();
          const item = selected[i]; await ensurePhotoCanvasLoaded(item); entries.push({ name: `${safeBaseName(item.file.name)}-privacy.png`, blob: await canvasToBlob(item.canvas) });
          setBatchProgress(i + 1, selected.length, "準備選取照片"); await new Promise((resolve) => setTimeout(resolve, 0));
        }
        const zip = await makeZip(entries), d = new Date(), pad = (n) => String(n).padStart(2, "0");
        downloadBlob(zip, `selected-privacy-photos-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.zip`);
        selected.forEach((item) => { item.downloaded = true; updatePhotoNavStatus(item); });
        updatePhotoFilterUi();
        multiPhotoStatus.textContent = `已下載選取的 ${selected.length} 張照片。`; showToast(`已下載 ${selected.length} 張選取照片`);
      } catch (error) {
        if (isOperationCancelledError(error)) { multiPhotoStatus.textContent = "已停止下載選取照片，尚未完成 ZIP。"; showToast("已停止目前作業"); }
        else { console.error("批次下載失敗", error); showToast(`批次下載失敗：${readableError(error)}`); }
      } finally { finishCancellableOperation(); state.multiProcessing = false; updateButtons(); }
    }

    async function resetBatchSelectedPhotos() {
      const selected = getBatchSelectedItems(); if (!selected.length || state.multiProcessing) return;
      if (!window.confirm(`確定要將選取的 ${selected.length} 張照片全部恢復原始狀態嗎？\n\n這些照片的 AI 辨識、遮罩、手動框選、Undo／Redo 都會清除。`)) return;
      state.multiProcessing = true; beginCancellableOperation("重設選取照片"); updateButtons();
      let completed = 0;
      let cancelled = false;
      try {
        setBatchProgress(0, selected.length, "重設照片");
        for (let i = 0; i < selected.length; i++) {
          throwIfOperationCancelled();
          await resetSinglePhoto(selected[i], { confirmReset: false, silent: true, refreshUi: false });
          completed += 1;
          setBatchProgress(i + 1, selected.length, "重設照片");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      } catch (error) {
        if (isOperationCancelledError(error)) { cancelled = true; multiPhotoStatus.textContent = `已停止重設照片；已完成 ${completed}/${selected.length} 張。`; showToast("已停止目前作業"); }
        else { console.error("批次重設失敗", error); showToast(`批次重設失敗：${readableError(error)}`); }
      } finally { finishCancellableOperation(); state.multiProcessing = false; }
      refreshFaceReviewModeAfterPhotoChange(); renderPhotoNavigator();
      state.photoItems.forEach((photo) => state.faceReviewMode ? drawFaceReview(photo) : drawManualSelectionsForItem(photo));
      if (state.activePhotoItem) updateSelectionInfoForItem(state.activePhotoItem);
      setBatchProgress(0, 0); updateButtons();
      if (!cancelled && completed === selected.length) {
        multiPhotoStatus.textContent = `已將選取的 ${selected.length} 張照片恢復原始狀態。`; showToast(`已重設 ${selected.length} 張照片`);
      }
    }

    async function closeBatchSelectedPhotos() {
      const selected = getBatchSelectedItems(); if (!selected.length) return;
      const hasWork = selected.some(isPhotoUnsaved);
      const warning = hasWork ? "\n\n⚠️ 選取內容包含已有修改或尚待套用的照片。" : "";
      if (!window.confirm(`確定要關閉選取的 ${selected.length} 張照片嗎？${warning}\n\n只會從工作區移除，不會刪除原始檔案。`)) return;
      const mainSelected = selected.find((item) => item.isMain);
      for (const item of selected.filter((photo) => !photo.isMain)) { if (state.photoItems.includes(item)) await closeSinglePhoto(item, { confirmClose: false, silent: true, refreshUi: false }); }
      if (mainSelected && state.photoItems.includes(mainSelected)) await closeSinglePhoto(mainSelected, { confirmClose: false, silent: true, refreshUi: false });
      if (state.photoItems.length) {
        refreshFaceReviewModeAfterPhotoChange(); updatePhotoItemLabels(); renderPhotoNavigator();
        state.photoItems.forEach((photo) => state.faceReviewMode ? drawFaceReview(photo) : drawManualSelectionsForItem(photo));
        if (state.activePhotoItem) updateSelectionInfoForItem(state.activePhotoItem); updateButtons();
        multiPhotoStatus.textContent = `已批次關閉 ${selected.length} 張照片；目前剩下 ${state.photoItems.length} 張。`;
      }
      showToast(`已關閉 ${selected.length} 張照片`);
    }

    batchResetBtn?.addEventListener("click", resetBatchSelectedPhotos);
    batchDownloadBtn?.addEventListener("click", downloadBatchSelectedPhotos);
    batchCloseBtn?.addEventListener("click", async () => { await closeBatchSelectedPhotos(); });

    mainResetPhotoBtn?.addEventListener("click", async () => { await resetSinglePhoto(state.photoItems[0]); });
    mainClosePhotoBtn?.addEventListener("click", async () => { await closeSinglePhoto(state.photoItems[0]); });


    async function activatePhotoItem(item) {
      if (!item) return;

      const previous = state.activePhotoItem && state.activePhotoItem !== item ? state.activePhotoItem : null;
      if (previous) { syncActiveManualSelection(previous); previous.entry?.classList.remove("manual-active"); }
      state.activePhotoItem = item;
      item.lastActivatedAt = Date.now();
      if (item.canvasParked) {
        if (item.statusEl) item.statusEl.textContent = `第 ${getPhotoDisplayIndex(item)} 張｜正在恢復畫布…`;
        await ensurePhotoCanvasLoaded(item);
      }
      if (previous) drawManualSelectionsForItem(previous);
      ensureManualSelections(item);
      if (item.activeManualIndex < 0 && item.manualSelections.length) item.activeManualIndex = item.manualSelections.length - 1;
      setActiveManualSelection(item, item.activeManualIndex);
      if (!item.isMain) item.entry?.classList.add("manual-active");
      if (state.faceReviewMode) drawFaceReview(item); else drawManualSelectionsForItem(item);
      updateSelectionInfoForItem(item); updateButtons(); syncPhotoNavigatorActive();
      scheduleCanvasMemoryMaintenance();
    }

    function drawSelectionForItem(item) {
      drawManualSelectionsForItem(item);
    }

    function createSelectionForCanvas(start,end,canvas,shape){
      if(shape==="rect") return {x:Math.min(start.x,end.x),y:Math.min(start.y,end.y),width:Math.abs(end.x-start.x),height:Math.abs(end.y-start.y),shape:"rect"};
      const maxR=Math.max(0,Math.min(start.x,canvas.width-start.x,start.y,canvas.height-start.y));
      const r=Math.min(Math.hypot(end.x-start.x,end.y-start.y),maxR);
      return {x:start.x-r,y:start.y-r,width:r*2,height:r*2,shape:"circle"};
    }

    function installAdditionalManualEditor(item){
      const ov = item.overlay;
      let interaction = null;
      let startSelection = null;
      let dragOrigin = null;
      let pointerStart = null;
      let activeHandle = null;
      let interactionIndex = -1;
      let duplicateInteraction = false;
      let pendingAiIndex = -1;
      let pendingAiStart = null;
      let pendingAiPointerId = null;

      const metrics = () => getVisualMetricsForCanvas(ov);
      const handles = (sel) => getSelectionHandles(sel);
      const hitHandle = (point) => {
        if (!state.selection || item.activeManualIndex < 0) return null;
        const { hitRadius } = metrics();
        return handles(state.selection).find(h => Math.hypot(point.x-h.x, point.y-h.y) <= hitRadius)?.name || null;
      };
      const updateCursor = (point=null) => {
        const aiPointer = ensureAiEditState(item);
        if (aiPointer?.interaction === "resize") { ov.style.cursor = getHandleCursor(aiPointer.activeHandle); return; }
        if (interaction === "move") { ov.style.cursor = duplicateInteraction ? "copy" : "grabbing"; return; }
        if (interaction === "resize") { ov.style.cursor = getHandleCursor(activeHandle); return; }
        if (interaction === "new") { ov.style.cursor = "crosshair"; return; }
        if (!point) { ov.style.cursor = "crosshair"; return; }
        const h = hitHandle(point);
        if (h) { ov.style.cursor = getHandleCursor(h); return; }
        const hitIndex = findManualSelectionIndexAtPoint(item, point);
        if (hitIndex >= 0) { ov.style.cursor = "grab"; return; }
        if (state.faceReviewMode) {
          const aiHandle = hitAiResizeHandle(item, ov, point);
          if (aiHandle) { ov.style.cursor = getHandleCursor(aiHandle); return; }
          if (findFaceIndexAtPoint(item, point) >= 0) { ov.style.cursor = "pointer"; return; }
        }
        ov.style.cursor = "crosshair";
      };
      const syncLocal = () => {
        if (interactionIndex >= 0 && state.selection) {
          item.manualSelections[interactionIndex] = cloneSelection(state.selection);
          item.activeManualIndex = interactionIndex;
        }
      };
      const move = (point) => {
        if (!startSelection || !dragOrigin) return;
        const dx=point.x-dragOrigin.x, dy=point.y-dragOrigin.y;
        state.selection = {
          ...startSelection,
          x: clamp(startSelection.x+dx, 0, Math.max(0, ov.width-startSelection.width)),
          y: clamp(startSelection.y+dy, 0, Math.max(0, ov.height-startSelection.height))
        };
      };
      const resizeRect = (point) => {
        if (!startSelection) return;
        const { minimumSize } = metrics();
        let left=startSelection.x, right=startSelection.x+startSelection.width;
        let top=startSelection.y, bottom=startSelection.y+startSelection.height;
        const h=activeHandle||"";
        if(h.includes("w")) left=clamp(point.x,0,right-minimumSize);
        if(h.includes("e")) right=clamp(point.x,left+minimumSize,ov.width);
        if(h.includes("n")) top=clamp(point.y,0,bottom-minimumSize);
        if(h.includes("s")) bottom=clamp(point.y,top+minimumSize,ov.height);
        state.selection={x:left,y:top,width:right-left,height:bottom-top,shape:"rect"};
      };
      const resizeCircleLocal = (point) => {
        if (!startSelection) return;
        const cx=startSelection.x+startSelection.width/2, cy=startSelection.y+startSelection.height/2;
        const { minimumSize }=metrics(), minR=minimumSize/2;
        const maxR=Math.max(minR,Math.min(cx,ov.width-cx,cy,ov.height-cy));
        const requested=(activeHandle==="n"||activeHandle==="s")?Math.abs(point.y-cy):Math.abs(point.x-cx);
        const r=clamp(requested,minR,maxR);
        state.selection={x:cx-r,y:cy-r,width:r*2,height:r*2,shape:"circle"};
      };
      const redraw = () => {
        syncLocal();
        drawManualSelectionsForItem(item);
        updateSelectionInfoForItem(item);
        updateButtons();
      };

      ov.addEventListener("pointerdown",event=>{
        const point=getCanvasPointFor(ov,event);
        activatePhotoItem(item);
        const selections=ensureManualSelections(item);
        const clickedIndex=findManualSelectionIndexAtPoint(item,point);
        const currentHandle=hitHandle(point);
        const aiHandle = state.faceReviewMode ? hitAiResizeHandle(item, ov, point) : null;
        const aiIndex = state.faceReviewMode ? findFaceIndexAtPoint(item, point) : -1;

        // 既有手動框優先。AI 控制點只負責縮放；AI 框本體單擊切換、拖曳建立手動框。
        if (state.faceReviewMode && !currentHandle && clickedIndex < 0 && aiHandle) {
          beginAiFacePointer(item,ov,event,point);
          return;
        }
        if (state.faceReviewMode && !currentHandle && clickedIndex < 0 && aiIndex >= 0) {
          event.preventDefault();
          try { ov.setPointerCapture(event.pointerId); } catch (_) {}
          pendingAiIndex = aiIndex;
          pendingAiStart = point;
          pendingAiPointerId = event.pointerId;
          item.activeAiFaceIndex = aiIndex;
          item.activeManualIndex = -1;
          state.selection = null;
          drawFaceReview(item);
          updateSelectionInfoForItem(item);
          ov.style.cursor = "pointer";
          return;
        }

        pendingAiIndex = -1; pendingAiStart = null; pendingAiPointerId = null;
        item.activeAiFaceIndex = -1;
        event.preventDefault();
        ov.setPointerCapture(event.pointerId);
        dragOrigin=point;
        duplicateInteraction=false;
        if((event.ctrlKey||event.metaKey) && clickedIndex>=0){
          const source=cloneSelection(selections[clickedIndex]);
          const offset=Math.max(8,Math.round(12*metrics().scale));
          source.x=clamp(source.x+offset,0,Math.max(0,ov.width-source.width));
          source.y=clamp(source.y+offset,0,Math.max(0,ov.height-source.height));
          selections.push(source);
          interactionIndex=selections.length-1;
          item.activeManualIndex=interactionIndex;
          state.selection=cloneSelection(source);
          startSelection=cloneSelection(source);
          interaction="move";
          duplicateInteraction=true;
        }else if(currentHandle){
          interactionIndex=item.activeManualIndex;
          startSelection=cloneSelection(state.selection);
          activeHandle=currentHandle;
          interaction="resize";
        }else if(clickedIndex>=0){
          setActiveManualSelection(item,clickedIndex);
          interactionIndex=clickedIndex;
          startSelection=cloneSelection(state.selection);
          interaction="move";
        }else{
          interaction="new";
          pointerStart=point;
          state.selection={x:point.x,y:point.y,width:0,height:0,shape:state.shape};
          selections.push(cloneSelection(state.selection));
          interactionIndex=selections.length-1;
          item.activeManualIndex=interactionIndex;
          startSelection=null;
        }
        updateCursor(point);
        redraw();
      });

      ov.addEventListener("pointermove",event=>{
        const point=getCanvasPointFor(ov,event);
        const aiPointer = ensureAiEditState(item);
        if (pendingAiIndex >= 0 && pendingAiStart) {
          const moved = Math.hypot(point.x-pendingAiStart.x, point.y-pendingAiStart.y);
          if (moved >= pendingAiDragThreshold(ov)) {
            event.preventDefault();
            const start = { ...pendingAiStart };
            pendingAiIndex = -1; pendingAiStart = null; pendingAiPointerId = null;
            item.activeAiFaceIndex = -1;
            const selections = ensureManualSelections(item);
            interaction = "new";
            pointerStart = start;
            dragOrigin = start;
            activeHandle = null;
            startSelection = null;
            duplicateInteraction = false;
            state.selection = createSelectionForCanvas(start, point, ov, state.shape);
            selections.push(cloneSelection(state.selection));
            interactionIndex = selections.length-1;
            item.activeManualIndex = interactionIndex;
            redraw();
            ov.style.cursor = "crosshair";
          } else {
            ov.style.cursor = "pointer";
          }
          return;
        }
        if(state.faceReviewMode && aiPointer?.interaction){moveAiFacePointer(item,ov,event,point);return;}
        if(!interaction){updateCursor(point);return;}
        event.preventDefault();
        if(interaction==="new") state.selection=createSelectionForCanvas(pointerStart,point,ov,state.shape);
        else if(interaction==="move") move(point);
        else if(interaction==="resize") startSelection?.shape==="circle"?resizeCircleLocal(point):resizeRect(point);
        redraw();
      });

      const finish=event=>{
        if (pendingAiIndex >= 0) {
          event.preventDefault();
          const index = pendingAiIndex;
          pendingAiIndex = -1; pendingAiStart = null; pendingAiPointerId = null;
          if (index < (item.selections || []).length) {
            item.activeAiFaceIndex = index;
            toggleFaceSelection(item,index);
          }
          updateCursor(getCanvasPointFor(ov,event));
          return;
        }
        const aiPointer = ensureAiEditState(item);
        if(state.faceReviewMode && aiPointer?.interaction){finishAiFacePointer(item,ov,event);return;}
        if(!interaction)return;
        event.preventDefault();
        const completed=interaction;
        const selections=ensureManualSelections(item);
        if(completed==="new"&&(!state.selection||state.selection.width<4||state.selection.height<4)){
          if(interactionIndex>=0) selections.splice(interactionIndex,1);
          const next=selections.length-1;
          setActiveManualSelection(item,next);
          showToast("框選範圍太小，請重新拖曳");
        }else{
          syncLocal();
          const actionText=duplicateInteraction?"已複製選取框":completed==="move"?"已移動選取範圍":completed==="resize"?"已調整選取大小":"已新增選取框";
          item.statusEl.textContent=`第 ${state.photoItems.indexOf(item)+1} 張｜${actionText}｜目前 ${selections.length} 個手動框`;
        }
        interaction=null;activeHandle=null;startSelection=null;dragOrigin=null;pointerStart=null;interactionIndex=-1;duplicateInteraction=false;
        drawManualSelectionsForItem(item);updateSelectionInfoForItem(item);updateButtons();
        updateCursor(getCanvasPointFor(ov,event));
      };

      ov.addEventListener("pointerup",finish);
      ov.addEventListener("pointercancel",event=>{
        if (pendingAiIndex >= 0) {
          pendingAiIndex = -1; pendingAiStart = null; pendingAiPointerId = null;
          item.activeAiFaceIndex = -1;
          drawFaceReview(item);
          updateCursor();
          return;
        }
        const aiPointer = ensureAiEditState(item);
        if(state.faceReviewMode && aiPointer?.interaction){cancelAiFacePointer(item,ov);return;}
        const selections=ensureManualSelections(item);
        if(interaction==="new" && interactionIndex>=0) selections.splice(interactionIndex,1);
        else if(duplicateInteraction && interactionIndex>=0) selections.splice(interactionIndex,1);
        else if(interactionIndex>=0 && startSelection) selections[interactionIndex]=cloneSelection(startSelection);
        const next=selections.length?Math.min(item.activeManualIndex,selections.length-1):-1;
        setActiveManualSelection(item,next);
        interaction=null;activeHandle=null;startSelection=null;dragOrigin=null;pointerStart=null;interactionIndex=-1;duplicateInteraction=false;
        drawManualSelectionsForItem(item);updateSelectionInfoForItem(item);updateButtons();updateCursor();
      });
      ov.addEventListener("pointerleave",()=>{if(!interaction)updateCursor();});
    }

    function updateSelectionInfoForItem(item){
      if(!item){selectionInfo.textContent="尚未框選範圍";return;}
      const selections=ensureManualSelections(item);
      const count=selections.length;
      const index=item.activeManualIndex;
      const s=index>=0?selections[index]:null;
      if(!count){selectionInfo.textContent="尚未框選範圍";return;}
      if(!s){selectionInfo.textContent=`第 ${state.photoItems.indexOf(item)+1} 張｜共 ${count} 個手動框`;return;}
      const shapeName=s.shape==="circle"?"圓形":"矩形";
      const sizeText=s.shape==="circle"?`直徑 ${Math.round(s.width)} px`:`${Math.round(s.width)} × ${Math.round(s.height)} px`;
      selectionInfo.textContent=`第 ${state.photoItems.indexOf(item)+1} 張｜共 ${count} 個手動框｜目前第 ${index+1} 個：${shapeName} ${sizeText}`;
    }

    function isSupportedImageFile(file) {
      if (!file) return false;
      if ((file.type || "").startsWith("image/")) return true;
      return /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name || "");
    }

    function getPhotoFileSignature(file) {
      return `${file?.name || ""}|${Number(file?.size || 0)}|${Number(file?.lastModified || 0)}`;
    }

    function prepareIncomingPhotoFiles(fileList, appendMode) {
      const existing = new Set(appendMode ? state.photoItems.map((item) => getPhotoFileSignature(item.file)) : []);
      const seen = new Set(existing);
      const unique = [];
      let duplicateCount = 0, invalidCount = 0;
      for (const file of [...fileList]) {
        if (!isSupportedImageFile(file)) { invalidCount += 1; continue; }
        const signature = getPhotoFileSignature(file);
        if (seen.has(signature)) { duplicateCount += 1; continue; }
        seen.add(signature); unique.push(file);
      }
      return { unique, duplicateCount, invalidCount };
    }

    async function handleImageFiles(fileList, { append = false } = {}) {
      const appendMode = !!append && state.photoItems.length > 0;
      const prepared = prepareIncomingPhotoFiles(fileList, appendMode);
      const capacity = Math.max(0, MULTI_MAX_FILES - (appendMode ? state.photoItems.length : 0));
      const files = prepared.unique.slice(0, capacity);
      const limitedCount = Math.max(0, prepared.unique.length - files.length);

      if (!files.length) {
        if (!capacity) showToast(`目前已達 ${MULTI_MAX_FILES} 張上限，請先關閉部分照片。`);
        else if (prepared.duplicateCount) showToast(`沒有新增照片：已略過 ${prepared.duplicateCount} 張重複圖片。`);
        else showToast("請選擇有效的圖片檔案");
        return;
      }
      if (state.multiProcessing || state.faceDetecting) return;
      state.multiProcessing = true; beginCancellableOperation(appendMode ? "加入照片" : "載入照片"); updateButtons();
      if (!appendMode) clearAdditionalPreviews();

      try {
        let failedCount = 0, loadedCount = 0, startIndex = 0;
        if (!appendMode) {
          const first = await loadMainPhoto(files[0]);
          state.photoItems.push(first); loadedCount = 1; startIndex = 1;
          setBatchProgress(1, files.length, "建立照片預覽");
        } else {
          setBatchProgress(0, files.length, "加入照片");
        }

        for (let i = startIndex; i < files.length; i++) {
          throwIfOperationCancelled();
          const label = appendMode ? "加入照片" : "建立照片預覽";
          multiPhotoStatus.textContent = `${label} ${i + 1}/${files.length}…`;
          setBatchProgress(i, files.length, label);
          try {
            const source = await fileToCanvas(files[i]);
            state.photoItems.push(createAdditionalPreview(files[i], source, state.photoItems.length));
            loadedCount += 1;
          } catch (fileError) {
            failedCount += 1;
            console.warn(`照片載入失敗：${files[i]?.name || "unknown"}`, fileError);
          }
          setBatchProgress(i + 1, files.length, label);
          await new Promise((r) => setTimeout(r, 0));
        }

        renderPhotoNavigator();
        scheduleCanvasMemoryMaintenance();
        updatePhotoItemLabels();
        photoSummary.textContent = `共 ${state.photoItems.length} 張照片`;
        const notes = [];
        if (prepared.duplicateCount) notes.push(`略過 ${prepared.duplicateCount} 張重複照片`);
        if (prepared.invalidCount) notes.push(`略過 ${prepared.invalidCount} 個非圖片檔`);
        if (limitedCount) notes.push(`因 ${MULTI_MAX_FILES} 張上限未加入 ${limitedCount} 張`);
        if (failedCount) notes.push(`${failedCount} 張無法讀取`);
        const noteText = notes.length ? `；${notes.join("；")}。` : "";

        if (appendMode) {
          multiPhotoStatus.textContent = `已新增 ${loadedCount} 張，目前共 ${state.photoItems.length} 張照片${noteText}`;
          showToast(`已新增 ${loadedCount} 張照片${prepared.duplicateCount ? `，略過 ${prepared.duplicateCount} 張重複` : ""}`);
        } else {
          multiPhotoStatus.textContent = state.photoItems.length === 1
            ? `已載入 1 張，可直接手動編輯或使用 AI 辨識${noteText}`
            : `已建立 ${state.photoItems.length} 個預覽；AI 可一次處理全部照片${noteText}`;
          setAiStatus("idle", "照片已載入，等待 AI 辨識", `目前共有 ${state.photoItems.length} 張照片；按下「快速AI辨識」後會先框出人臉供你確認，預設皆為不遮蔽。`);
          showToast(`已載入 ${state.photoItems.length} 張照片${prepared.duplicateCount ? `，略過 ${prepared.duplicateCount} 張重複` : ""}`);
        }
      } catch (error) {
        if (isOperationCancelledError(error)) {
          renderPhotoNavigator();
          updatePhotoItemLabels();
          if (state.photoItems.length && !state.activePhotoItem) state.activePhotoItem = state.photoItems[0];
          multiPhotoStatus.textContent = `已停止${appendMode ? "加入照片" : "載入照片"}；已完成的 ${state.photoItems.length} 張照片會保留。`;
          showToast("已停止目前作業");
        } else {
          console.error(error);
          if (!appendMode && !state.photoItems.length) resetToEmptyPhotoState();
          showToast(`照片載入失敗：${readableError(error)}`);
        }
      } finally {
        finishCancellableOperation();
        state.multiProcessing = false;
        setBatchProgress(0, 0);
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    }

    addPhotosBtn?.addEventListener("click", () => {
      if (state.multiProcessing || state.faceDetecting) return;
      imageInputMode = state.photoItems.length ? "append" : "replace";
      imageInput.click();
    });

    imageInput.addEventListener("change", async (event) => {
      const mode = imageInputMode; imageInputMode = "replace";
      const files = event.target.files; event.target.value = "";
      if (files?.length) await handleImageFiles(files, { append: mode === "append" });
    });
    workspace.addEventListener("click", () => { if (!state.imageLoaded) { imageInputMode = "replace"; imageInput.click(); } });
    workspace.addEventListener("keydown", (event) => { if (state.imageLoaded || !["Enter", " "].includes(event.key)) return; event.preventDefault(); imageInputMode = "replace"; imageInput.click(); });

    const dragDepth = new WeakMap();
    uploadTargets.forEach((target) => {
      dragDepth.set(target, 0);
      target.addEventListener("dragenter", (event) => { event.preventDefault(); dragDepth.set(target,(dragDepth.get(target)||0)+1); target.classList.add("dragover"); });
      target.addEventListener("dragover", (event) => { event.preventDefault(); if(event.dataTransfer) event.dataTransfer.dropEffect="copy"; target.classList.add("dragover"); });
      target.addEventListener("dragleave", (event) => { event.preventDefault(); const d=Math.max(0,(dragDepth.get(target)||1)-1); dragDepth.set(target,d); if(d===0) target.classList.remove("dragover"); });
      target.addEventListener("drop", (event) => {
        event.preventDefault(); dragDepth.set(target,0); target.classList.remove("dragover");
        handleImageFiles(event.dataTransfer?.files || [], { append: state.photoItems.length > 0 });
      });
    });

    clearPhotosBtn.addEventListener("click", () => {
      if (!state.photoItems.length || state.multiProcessing) return;
      const hasUnsaved = state.photoItems.some(isPhotoUnsaved);
      const message = hasUnsaved
        ? "確定要清除全部照片嗎？\n\n目前仍有尚未輸出的修改；清除後這些工作內容會消失，但不會刪除電腦中的原始照片。"
        : `確定要清除目前 ${state.photoItems.length} 張照片嗎？\n\n只會清空工作區，不會刪除電腦中的原始照片。`;
      if (!window.confirm(message)) return;
      resetToEmptyPhotoState();
      state.customSticker = null; stickerStatus.textContent = "目前使用 Emoji 貼圖。";
      showToast("已清空照片工作區");
    });
    updateWorkspaceUploadState();

    /* =========================================================
       4. 框選操作：建立、移動與縮放皆支援滑鼠及觸控
       ========================================================= */

    // 將選取範圍限制在圖片範圍內移動。
    function moveSelection(point) {
      const start = state.startSelection;
      if (!start || !state.dragOrigin) return;

      const deltaX = point.x - state.dragOrigin.x;
      const deltaY = point.y - state.dragOrigin.y;

      state.selection = {
        ...start,
        x: clamp(start.x + deltaX, 0, Math.max(0, overlayCanvas.width - start.width)),
        y: clamp(start.y + deltaY, 0, Math.max(0, overlayCanvas.height - start.height))
      };
    }

    // 矩形可由八個控制點調整；各邊不會越過相反邊或超出圖片。
    function resizeRectangle(point) {
      const start = state.startSelection;
      if (!start) return;

      const { minimumSize } = getVisualMetrics();
      let left = start.x;
      let right = start.x + start.width;
      let top = start.y;
      let bottom = start.y + start.height;
      const handle = state.activeHandle || "";

      if (handle.includes("w")) {
        left = clamp(point.x, 0, right - minimumSize);
      }

      if (handle.includes("e")) {
        right = clamp(point.x, left + minimumSize, overlayCanvas.width);
      }

      if (handle.includes("n")) {
        top = clamp(point.y, 0, bottom - minimumSize);
      }

      if (handle.includes("s")) {
        bottom = clamp(point.y, top + minimumSize, overlayCanvas.height);
      }

      state.selection = {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        shape: "rect"
      };
    }

    // 圓形縮放時固定圓心，拖曳任一控制點即可等比例改變直徑。
    function resizeCircle(point) {
      const start = state.startSelection;
      if (!start) return;

      const centerX = start.x + start.width / 2;
      const centerY = start.y + start.height / 2;
      const handle = state.activeHandle;
      const { minimumSize } = getVisualMetrics();
      const minimumRadius = minimumSize / 2;
      const maximumRadius = Math.max(
        minimumRadius,
        Math.min(
          centerX,
          overlayCanvas.width - centerX,
          centerY,
          overlayCanvas.height - centerY
        )
      );

      let requestedRadius;

      if (handle === "n" || handle === "s") {
        requestedRadius = Math.abs(point.y - centerY);
      } else {
        requestedRadius = Math.abs(point.x - centerX);
      }

      const radius = clamp(requestedRadius, minimumRadius, maximumRadius);

      state.selection = {
        x: centerX - radius,
        y: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        shape: "circle"
      };
    }

    function resizeSelection(point) {
      if (state.startSelection?.shape === "circle") {
        resizeCircle(point);
      } else {
        resizeRectangle(point);
      }
    }

    function clearPendingAiClick() {
      state.pendingAiFaceIndex = -1;
      state.pendingAiStart = null;
      state.pendingAiPointerId = null;
    }

    function pendingAiDragThreshold(canvas) {
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width ? canvas.width / rect.width : 1;
      const sy = rect.height ? canvas.height / rect.height : 1;
      return Math.max(4, 6 * ((sx + sy) / 2));
    }

    // 從 AI 框本體開始拖曳時，將原本的「AI 點擊候選」轉成新的手動框。
    function beginMainManualFromPendingAi(point) {
      const item = state.photoItems[0];
      if (!item || !state.pendingAiStart) return false;
      const start = { ...state.pendingAiStart };
      clearPendingAiClick();
      item.activeAiFaceIndex = -1;
      const selections = ensureManualSelections(item);
      state.isSelecting = true;
      state.dragOrigin = start;
      state.duplicateInteraction = false;
      state.interaction = "new";
      state.activeHandle = null;
      state.pointerStart = start;
      state.startSelection = null;
      state.selection = createSelection(start, point);
      selections.push(cloneSelection(state.selection));
      state.interactionSelectionIndex = selections.length - 1;
      item.activeManualIndex = state.interactionSelectionIndex;
      syncActiveManualSelection(item);
      drawSelection();
      updateSelectionInfo();
      updateButtons();
      overlayCanvas.style.cursor = "crosshair";
      return true;
    }

    overlayCanvas.addEventListener("pointerdown", (event) => {
      if (!state.imageLoaded) return;
      const item = state.photoItems[0];
      if (item) activatePhotoItem(item);
      const point = getCanvasPoint(event);
      const selections = ensureManualSelections(item);
      const clickedIndex = findManualSelectionIndexAtPoint(item, point);
      const handle = hitTestHandle(point);
      const aiHandle = state.faceReviewMode && item ? hitAiResizeHandle(item, overlayCanvas, point) : null;
      const aiIndex = state.faceReviewMode && item ? findFaceIndexAtPoint(item, point) : -1;

      // 手動框優先。AI 白色控制點仍直接負責縮放；AI 框本體則延後判斷：
      // 單擊 = 切換遮蔽狀態；拖曳 = 直接建立手動框。
      if (state.faceReviewMode && item && !handle && clickedIndex < 0 && aiHandle) {
        beginAiFacePointer(item, overlayCanvas, event, point);
        return;
      }
      if (state.faceReviewMode && item && !handle && clickedIndex < 0 && aiIndex >= 0) {
        event.preventDefault();
        try { overlayCanvas.setPointerCapture(event.pointerId); } catch (_) {}
        state.pendingAiFaceIndex = aiIndex;
        state.pendingAiStart = point;
        state.pendingAiPointerId = event.pointerId;
        item.activeAiFaceIndex = aiIndex;
        item.activeManualIndex = -1;
        state.selection = null;
        drawFaceReview(item);
        updateSelectionInfoForItem(item);
        overlayCanvas.style.cursor = "pointer";
        return;
      }

      clearPendingAiClick();
      if (item) item.activeAiFaceIndex = -1;
      event.preventDefault();
      overlayCanvas.setPointerCapture(event.pointerId);
      state.isSelecting = true;
      state.dragOrigin = point;
      state.duplicateInteraction = false;

      if ((event.ctrlKey || event.metaKey) && clickedIndex >= 0) {
        const duplicate = cloneSelection(selections[clickedIndex]);
        const offset = Math.max(8, Math.round(12 * getVisualMetrics().scale));
        duplicate.x = clamp(duplicate.x + offset, 0, Math.max(0, overlayCanvas.width - duplicate.width));
        duplicate.y = clamp(duplicate.y + offset, 0, Math.max(0, overlayCanvas.height - duplicate.height));
        selections.push(duplicate);
        state.interactionSelectionIndex = selections.length - 1;
        item.activeManualIndex = state.interactionSelectionIndex;
        state.selection = cloneSelection(duplicate);
        state.startSelection = cloneSelection(duplicate);
        state.interaction = "move";
        state.activeHandle = null;
        state.duplicateInteraction = true;
      } else if (handle) {
        state.interactionSelectionIndex = item.activeManualIndex;
        state.startSelection = cloneSelection(state.selection);
        state.interaction = "resize";
        state.activeHandle = handle;
      } else if (clickedIndex >= 0) {
        setActiveManualSelection(item, clickedIndex);
        state.interactionSelectionIndex = clickedIndex;
        state.startSelection = cloneSelection(state.selection);
        state.interaction = "move";
        state.activeHandle = null;
      } else {
        state.interaction = "new";
        state.activeHandle = null;
        state.pointerStart = point;
        state.startSelection = null;
        state.selection = { x: point.x, y: point.y, width: 0, height: 0, shape: state.shape };
        selections.push(cloneSelection(state.selection));
        state.interactionSelectionIndex = selections.length - 1;
        item.activeManualIndex = state.interactionSelectionIndex;
      }

      updateCanvasCursor(point);
      syncActiveManualSelection(item);
      drawSelection();
      updateSelectionInfo();
      updateButtons();
    });

    overlayCanvas.addEventListener("pointermove", (event) => {
      if (!state.imageLoaded) return;
      const item = state.photoItems[0];
      const point = getCanvasPoint(event);
      const aiPointer = item ? ensureAiEditState(item) : null;
      if (state.pendingAiFaceIndex >= 0 && state.pendingAiStart) {
        const moved = Math.hypot(point.x - state.pendingAiStart.x, point.y - state.pendingAiStart.y);
        if (moved >= pendingAiDragThreshold(overlayCanvas)) {
          event.preventDefault();
          beginMainManualFromPendingAi(point);
        } else {
          overlayCanvas.style.cursor = "pointer";
        }
        return;
      }
      if (state.faceReviewMode && aiPointer?.interaction) {
        moveAiFacePointer(item, overlayCanvas, event, point);
        return;
      }
      if (!state.interaction) { updateCanvasCursor(point); return; }
      event.preventDefault();
      if (state.interaction === "new") state.selection = createSelection(state.pointerStart, point);
      else if (state.interaction === "move") moveSelection(point);
      else if (state.interaction === "resize") resizeSelection(point);
      syncActiveManualSelection(item);
      drawSelection();
      updateSelectionInfo();
      updateButtons();
    });

    function finishSelectionEditing(event) {
      const activeItem = state.photoItems[0];
      if (state.pendingAiFaceIndex >= 0) {
        event.preventDefault();
        const index = state.pendingAiFaceIndex;
        clearPendingAiClick();
        if (activeItem && index < (activeItem.selections || []).length) {
          activeItem.activeAiFaceIndex = index;
          toggleFaceSelection(activeItem, index);
        }
        updateCanvasCursor(getCanvasPoint(event));
        return;
      }
      const aiPointer = activeItem ? ensureAiEditState(activeItem) : null;
      if (state.faceReviewMode && aiPointer?.interaction) {
        finishAiFacePointer(activeItem, overlayCanvas, event);
        return;
      }
      if (!state.interaction) return;
      event.preventDefault();
      const item = state.photoItems[0];
      const selections = ensureManualSelections(item);
      const completedInteraction = state.interaction;
      const selection = state.selection;

      if (completedInteraction === "new" && (!selection || selection.width < 4 || selection.height < 4)) {
        if (state.interactionSelectionIndex >= 0) selections.splice(state.interactionSelectionIndex, 1);
        setActiveManualSelection(item, selections.length - 1);
        clearInteraction();
        drawSelection();
        updateSelectionInfo();
        updateButtons();
        showToast("框選範圍太小，請重新拖曳");
        return;
      }

      syncActiveManualSelection(item);
      const duplicateDone = state.duplicateInteraction;
      clearInteraction();
      drawSelection();
      updateSelectionInfo();
      updateButtons();
      updateCanvasCursor(getCanvasPoint(event));

      if (duplicateDone) statusText.textContent = `已複製選取框｜目前 ${selections.length} 個手動框`;
      else if (completedInteraction === "move") statusText.textContent = `已移動選取範圍｜目前 ${selections.length} 個手動框`;
      else if (completedInteraction === "resize") statusText.textContent = `已調整選取大小｜目前 ${selections.length} 個手動框`;
      else statusText.textContent = `已新增選取框｜目前 ${selections.length} 個手動框，可繼續新增`;
    }

    overlayCanvas.addEventListener("pointerup", finishSelectionEditing);

    overlayCanvas.addEventListener("pointercancel", () => {
      const item = state.photoItems[0];
      if (state.pendingAiFaceIndex >= 0) {
        clearPendingAiClick();
        if (item) { item.activeAiFaceIndex = -1; drawFaceReview(item); }
        updateCanvasCursor();
        return;
      }
      const aiPointer = item ? ensureAiEditState(item) : null;
      if (state.faceReviewMode && aiPointer?.interaction) {
        cancelAiFacePointer(item, overlayCanvas);
        return;
      }
      const selections = ensureManualSelections(item);
      if (state.interaction === "new" && state.interactionSelectionIndex >= 0) selections.splice(state.interactionSelectionIndex, 1);
      else if (state.duplicateInteraction && state.interactionSelectionIndex >= 0) selections.splice(state.interactionSelectionIndex, 1);
      else if (state.interactionSelectionIndex >= 0 && state.startSelection) selections[state.interactionSelectionIndex] = cloneSelection(state.startSelection);
      setActiveManualSelection(item, selections.length ? Math.min(item.activeManualIndex, selections.length - 1) : -1);
      clearInteraction();
      drawSelection();
      updateSelectionInfo();
      updateButtons();
      updateCanvasCursor();
    });

    overlayCanvas.addEventListener("pointerleave", () => {
      if (!state.interaction) updateCanvasCursor();
    });

    /* =========================================================
       5. 工具選擇與參數同步
       ========================================================= */

    shapeGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-shape]");
      if (!button) return;

      state.shape = button.dataset.shape;

      document.querySelectorAll(".shape-btn").forEach((item) => {
        item.classList.toggle("active", item === button);
      });

      const shapeName = state.shape === "circle" ? "圓形" : "矩形";

      // 若已有選取範圍，直接在原位置轉換形狀，方便繼續編輯。
      if (state.selection) {
        if (state.shape === "circle") {
          const centerX = state.selection.x + state.selection.width / 2;
          const centerY = state.selection.y + state.selection.height / 2;
          const radius = Math.min(state.selection.width, state.selection.height) / 2;

          state.selection = {
            x: centerX - radius,
            y: centerY - radius,
            width: radius * 2,
            height: radius * 2,
            shape: "circle"
          };
        } else {
          state.selection = {
            ...state.selection,
            shape: "rect"
          };
        }

        const activeItem = getActivePhotoItem();
        syncActiveManualSelection(activeItem);
        if (activeItem) drawManualSelectionsForItem(activeItem);
        updateSelectionInfo();
        updateButtons();
        if (activeItem?.statusEl) activeItem.statusEl.textContent = `已將目前選取框轉換為${shapeName}，可繼續移動或縮放`;
      } else {
        statusText.textContent = state.imageLoaded
          ? `已切換為${shapeName}選取，請在照片上拖曳`
          : `已切換為${shapeName}選取，請先上傳照片`;
      }

      refreshAiReviewSelections();
      scheduleSettingsSave();
      showToast(`選取形狀已切換為${shapeName}`);
    });

    document.getElementById("toolGrid").addEventListener("click", (event) => {
      const card = event.target.closest("[data-tool]");
      if (!card) return;

      state.tool = card.dataset.tool;

      document.querySelectorAll(".tool-card").forEach((item) => {
        item.classList.toggle("active", item === card);
      });

      document.querySelectorAll(".setting-group").forEach((group) => {
        group.classList.toggle("active", group.dataset.setting === state.tool);
      });
      scheduleSettingsSave();
    });

    mosaicSize.addEventListener("input", () => {
      mosaicValue.value = mosaicSize.value;
      scheduleSettingsSave();
    });

    facePadding.addEventListener("input", () => {
      facePaddingValue.value = `${facePadding.value}%`;
      refreshAiReviewSelections();
      scheduleSettingsSave();
    });

    blurSize.addEventListener("input", () => {
      blurValue.value = blurSize.value;
      scheduleSettingsSave();
    });

    coverColor.addEventListener("input", scheduleSettingsSave);

    // 可上傳透明 PNG 或其他圖片作為自訂貼圖。
    stickerInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      event.target.value = "";

      if (!file || !file.type.startsWith("image/")) {
        showToast("請選擇有效的貼圖圖片");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          state.customSticker = image;
          state.customStickerRevision += 1;
          stickerStatus.textContent = `自訂貼圖已載入：${file.name}`;
          showToast("自訂貼圖載入成功");
        };
        image.onerror = () => showToast("自訂貼圖無法讀取");
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    emojiSelect.addEventListener("change", () => {
      state.customSticker = null;
      state.customStickerRevision += 1;
      stickerStatus.textContent = "目前使用 Emoji 貼圖。";
      scheduleSettingsSave();
    });

    /* =========================================================
       6. 影像效果：馬賽克、霧化、色塊與貼圖
       ========================================================= */

    function pushHistory(regions = null) {
      const list = Array.isArray(regions) ? regions : (regions ? [regions] : null);
      const patches = (list && list.length ? list : [{ x: 0, y: 0, width: mainCanvas.width, height: mainCanvas.height }])
        .map((region) => {
          const x = Math.max(0, Math.floor(region.x || 0));
          const y = Math.max(0, Math.floor(region.y || 0));
          const width = Math.min(mainCanvas.width - x, Math.max(1, Math.ceil(region.width || mainCanvas.width)));
          const height = Math.min(mainCanvas.height - y, Math.max(1, Math.ceil(region.height || mainCanvas.height)));
          return { x, y, imageData: mainCtx.getImageData(x, y, width, height) };
        });
      state.history.push(patches);
      state.redoHistory = [];
      if (state.history.length > MAX_HISTORY) {
        state.history.shift();
        const mainItem = state.photoItems[0] || state.activePhotoItem;
        if (mainItem) mainItem.hasUntrackedEdits = true;
      }
      enforceHistoryMemoryBudget(state.photoItems[0] || state.activePhotoItem);
    }

    function getSafeSelectionFor(item, selection) {
      if (!item || !selection) return null;
      const activeCanvas = item.canvas || mainCanvas;
      const canvasWidth = item.canvasParked ? (item.pixelWidth || activeCanvas.width) : activeCanvas.width;
      const canvasHeight = item.canvasParked ? (item.pixelHeight || activeCanvas.height) : activeCanvas.height;
      const x = Math.max(0, Math.floor(selection.x));
      const y = Math.max(0, Math.floor(selection.y));
      const width = Math.min(canvasWidth - x, Math.max(1, Math.ceil(selection.width)));
      const height = Math.min(canvasHeight - y, Math.max(1, Math.ceil(selection.height)));
      return { x, y, width, height, shape: selection.shape || state.shape };
    }

    function getSafeSelection() {
      return getSafeSelectionFor(getActivePhotoItem(), state.selection);
    }

    // 建立與目前選取形狀一致的路徑，供各種影像效果裁切使用。
    function addSelectionPath(context, { x, y, width, height, shape }) {
      context.beginPath();

      if (shape === "circle") {
        context.ellipse(
          x + width / 2,
          y + height / 2,
          width / 2,
          height / 2,
          0,
          0,
          Math.PI * 2
        );
      } else {
        context.rect(x, y, width, height);
      }
    }

    function clipToSelection(context, selection) {
      addSelectionPath(context, selection);
      context.clip();
    }

    function applyMosaic({ x, y, width, height, shape }) {
      const blockSize = Number(mosaicSize.value);
      const tinyCanvas = document.createElement("canvas");
      const tinyCtx = tinyCanvas.getContext("2d");

      tinyCanvas.width = Math.max(1, Math.ceil(width / blockSize));
      tinyCanvas.height = Math.max(1, Math.ceil(height / blockSize));

      // 先縮小再用關閉平滑的方式放大，形成清楚的像素格。
      tinyCtx.imageSmoothingEnabled = true;
      tinyCtx.drawImage(
        mainCanvas,
        x, y, width, height,
        0, 0, tinyCanvas.width, tinyCanvas.height
      );

      mainCtx.save();
      clipToSelection(mainCtx, { x, y, width, height, shape });
      mainCtx.imageSmoothingEnabled = false;
      mainCtx.drawImage(
        tinyCanvas,
        0, 0, tinyCanvas.width, tinyCanvas.height,
        x, y, width, height
      );
      mainCtx.restore();
    }

    /* =========================================================
       AI 人臉辨識 v4.2：Native FaceDetector + MediaPipe 雙模型，FaceAPI 備援，支援形狀與效果切換
       ========================================================= */

    const MEDIAPIPE_ASSET_PATH = "./mediapipe";
    const FACE_API_MODEL_PATH = "./models";
    let mediaPipePending = null;

    function setAiStatus(type, title, detail = "") {
      aiStatus.dataset.type = type;
      aiStatusTitle.textContent = title;
      aiStatusDetail.textContent = detail;
      aiStatus.hidden = false;
      aiStatus.removeAttribute("aria-hidden");
      aiStatus.style.display = "grid";
    }

    function readableError(error) {
      const message = String(error?.message || error || "未知錯誤")
        .replace(/https?:\/\/\S+/g, "外部網址")
        .replace(/\s+/g, " ")
        .trim();
      return message.length > 260 ? `${message.slice(0, 260)}…` : message;
    }

    function setFaceDetectLoading(isLoading, label = "辨識全部人臉") {
      state.faceDetecting = isLoading;
      faceDetectBtn.classList.toggle("loading", isLoading);
      faceDetectBtn.setAttribute("aria-busy", String(isLoading));
      faceDetectBtn.innerHTML = isLoading
        ? `<span class="ai-spinner" aria-hidden="true"></span><span class="ai-btn-label">${label}</span>`
        : `<span class="ai-btn-icon">🤖</span><span class="ai-btn-label">快速AI辨識</span>`;
      updateButtons();
    }

    function clampFaceBox({ x, y, width, height }) {
      const paddingRatio = Number(facePadding.value) / 100;
      const maskShape = state.shape || "rect";

      if (maskShape === "rect") {
        const extraX = width * paddingRatio;
        const extraY = height * paddingRatio;
        const left = clamp(x - extraX, 0, mainCanvas.width);
        const top = clamp(y - extraY, 0, mainCanvas.height);
        const right = clamp(x + width + extraX, 0, mainCanvas.width);
        const bottom = clamp(y + height + extraY, 0, mainCanvas.height);

        return {
          x: Math.floor(left),
          y: Math.floor(top),
          width: Math.max(1, Math.ceil(right - left)),
          height: Math.max(1, Math.ceil(bottom - top)),
          shape: "rect"
        };
      }

      const diameterBase = Math.max(width, height);
      const diameterWithPadding = diameterBase * (1 + paddingRatio * 2);
      const centerX = x + width / 2;
      const centerY = y + height / 2;

      const maxRadius = Math.max(
        1,
        Math.min(
          centerX,
          mainCanvas.width - centerX,
          centerY,
          mainCanvas.height - centerY
        )
      );

      const radius = Math.max(1, Math.min(diameterWithPadding / 2, maxRadius));
      const left = clamp(centerX - radius, 0, mainCanvas.width);
      const top = clamp(centerY - radius, 0, mainCanvas.height);
      const diameter = Math.max(2, Math.min(mainCanvas.width - left, mainCanvas.height - top, radius * 2));

      return {
        x: Math.floor(left),
        y: Math.floor(top),
        width: Math.max(1, Math.round(diameter)),
        height: Math.max(1, Math.round(diameter)),
        shape: "circle"
      };
    }

    function faceIoU(a, b) {
      const left = Math.max(a.x, b.x);
      const top = Math.max(a.y, b.y);
      const right = Math.min(a.x + a.width, b.x + b.width);
      const bottom = Math.min(a.y + a.height, b.y + b.height);
      const intersection = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (!intersection) return 0;
      const union = a.width * a.height + b.width * b.height - intersection;
      return union > 0 ? intersection / union : 0;
    }

    function mergeFaceBoxes(faces) {
      const valid = faces
        .filter((face) => Number.isFinite(face.x) && Number.isFinite(face.y) && face.width > 2 && face.height > 2)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      const merged = [];
      valid.forEach((face) => {
        if (!merged.some((saved) => faceIoU(face, saved) > 0.38)) merged.push(face);
      });
      return merged;
    }

    function makeAiPreview(sourceCanvas) {
      const maxSide = Math.max(sourceCanvas.width, sourceCanvas.height);
      if (maxSide <= AI_MAX_SIDE) return { canvas: sourceCanvas, scaleX: 1, scaleY: 1 };
      const ratio = AI_MAX_SIDE / maxSide;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sourceCanvas.width * ratio));
      canvas.height = Math.max(1, Math.round(sourceCanvas.height * ratio));
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
      return { canvas, scaleX: sourceCanvas.width / canvas.width, scaleY: sourceCanvas.height / canvas.height };
    }

    async function detectFacesWithNativeApi(image, scaleX = 1, scaleY = 1) {
      if (!("FaceDetector" in window)) return [];
      try {
        const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 100 });
        const faces = await detector.detect(image);
        return faces.map((face) => ({
          x: face.boundingBox.x * scaleX, y: face.boundingBox.y * scaleY,
          width: face.boundingBox.width * scaleX, height: face.boundingBox.height * scaleY,
          score: 1, engine: "瀏覽器內建"
        }));
      } catch (error) { console.warn("瀏覽器內建 FaceDetector 無法使用。", error); return []; }
    }

    const MEDIAPIPE_TASKS_VERSION = "1.0.1";
    const MEDIAPIPE_TASKS_ROOT = "./mediapipe-tasks";
    const MEDIAPIPE_TASKS_WASM_ROOT = `${MEDIAPIPE_TASKS_ROOT}/wasm`;
    const MEDIAPIPE_TASKS_FULL_MODEL = `${MEDIAPIPE_TASKS_ROOT}/models/blaze_face_full_range.tflite`;
    const MEDIAPIPE_TASKS_SHORT_MODEL = `${MEDIAPIPE_TASKS_ROOT}/models/blaze_face_short_range.tflite`;
    const MEDIAPIPE_TASKS_OPTIONAL_ASSETS = [
      `${MEDIAPIPE_TASKS_ROOT}/vision_bundle.mjs`,
      `${MEDIAPIPE_TASKS_WASM_ROOT}/vision_wasm_internal.js`,
      `${MEDIAPIPE_TASKS_WASM_ROOT}/vision_wasm_internal.wasm`,
      `${MEDIAPIPE_TASKS_WASM_ROOT}/vision_wasm_nosimd_internal.js`,
      `${MEDIAPIPE_TASKS_WASM_ROOT}/vision_wasm_nosimd_internal.wasm`,
      MEDIAPIPE_TASKS_FULL_MODEL,
      MEDIAPIPE_TASKS_SHORT_MODEL
    ];

    const AI_REQUIRED_ASSETS = [
      "./mediapipe/face_detection.js",
      "./mediapipe/face_detection_full.binarypb",
      "./mediapipe/face_detection_short.binarypb",
      "./mediapipe/face_detection_solution_simd_wasm_bin.js",
      "./mediapipe/face_detection_solution_simd_wasm_bin.wasm",
      "./mediapipe/face_detection_solution_simd_wasm_bin.data",
      "./mediapipe/face_detection_solution_wasm_bin.js",
      "./mediapipe/face_detection_solution_wasm_bin.wasm",
      "./models/ssd_mobilenetv1_model-weights_manifest.json",
      "./models/ssd_mobilenetv1_model.bin"
    ];

    function ensureLocalHttpOrigin() {
      const isLocalHost = ["127.0.0.1", "localhost", "::1"].includes(location.hostname);
      const isHttp = location.protocol === "http:" || location.protocol === "https:";
      if (!isHttp || !isLocalHost) {
        throw new Error("目前不是從本機 HTTP Server 啟動。請使用 start.bat 或 mk_photo_mask_v4.2.exe，網址應為 http://127.0.0.1:8765/ 類型，而不是直接雙擊 index.html。" );
      }
    }

    async function checkAssetFile(url) {
      try {
        const response = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { url, ok: true };
      } catch (headError) {
        try {
          const response = await fetch(url, { method: "GET", cache: "no-store" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          if (response.body && response.body.cancel) await response.body.cancel();
          return { url, ok: true };
        } catch (getError) {
          return { url, ok: false, error: readableError(getError || headError) };
        }
      }
    }

    async function probeMediaPipeTasksAssets() {
      const results = await Promise.all(MEDIAPIPE_TASKS_OPTIONAL_ASSETS.map(checkAssetFile));
      const failed = results.filter((item) => !item.ok);
      state.mediaPipeTasksChecked = true;
      state.mediaPipeTasksReady = failed.length === 0;
      state.mediaPipeTasksError = failed.map((item) => `${item.url.replace(/^\.\//, "")}：${item.error}`).join(" ｜ ");
      return state.mediaPipeTasksReady;
    }

    async function ensureMediaPipeTasks() {
      if (state.mediaPipeTasksFull && state.mediaPipeTasksShort) return true;
      const available = state.mediaPipeTasksChecked ? state.mediaPipeTasksReady : await probeMediaPipeTasksAssets();
      if (!available) throw new Error(state.mediaPipeTasksError || `MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION} 尚未安裝`);
      try {
        const module = await import(`${MEDIAPIPE_TASKS_ROOT}/vision_bundle.mjs`);
        const { FilesetResolver, FaceDetector } = module;
        if (!FilesetResolver || !FaceDetector) throw new Error("MediaPipe Tasks Vision 模組缺少必要匯出");
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_TASKS_WASM_ROOT);
        const makeDetector = async (modelAssetPath) => {
          try {
            return await FaceDetector.createFromOptions(fileset, {
              baseOptions: { modelAssetPath, delegate: "GPU" },
              runningMode: "IMAGE",
              minDetectionConfidence: 0.35,
              minSuppressionThreshold: 0.30
            });
          } catch (gpuError) {
            console.warn("MediaPipe Tasks GPU 初始化失敗，改用 CPU。", gpuError);
            return await FaceDetector.createFromOptions(fileset, {
              baseOptions: { modelAssetPath, delegate: "CPU" },
              runningMode: "IMAGE",
              minDetectionConfidence: 0.35,
              minSuppressionThreshold: 0.30
            });
          }
        };
        state.mediaPipeTasksModule = module;
        state.mediaPipeTasksFileset = fileset;
        state.mediaPipeTasksFull = await makeDetector(MEDIAPIPE_TASKS_FULL_MODEL);
        state.mediaPipeTasksShort = await makeDetector(MEDIAPIPE_TASKS_SHORT_MODEL);
        state.mediaPipeTasksReady = true;
        return true;
      } catch (error) {
        state.mediaPipeTasksFull = null;
        state.mediaPipeTasksShort = null;
        state.mediaPipeTasksReady = false;
        state.mediaPipeTasksError = readableError(error);
        throw error;
      }
    }

    function mapMediaPipeTasksResult(result, engineName, targetWidth, targetHeight, sourceWidth, sourceHeight) {
      return (result?.detections || []).map((detection) => {
        const box = detection.boundingBox || {};
        const sx = targetWidth / Math.max(1, sourceWidth);
        const sy = targetHeight / Math.max(1, sourceHeight);
        const score = Number(detection.categories?.[0]?.score ?? 1);
        return {
          x: Number(box.originX || 0) * sx,
          y: Number(box.originY || 0) * sy,
          width: Number(box.width || 0) * sx,
          height: Number(box.height || 0) * sy,
          score,
          engine: engineName
        };
      }).filter((f) => f.width > 0 && f.height > 0 && f.score >= 0.20);
    }

    async function detectFacesWithMediaPipeTasks(image, targetWidth, targetHeight) {
      await ensureMediaPipeTasks();
      const sourceWidth = image.width || image.videoWidth || targetWidth;
      const sourceHeight = image.height || image.videoHeight || targetHeight;
      let result = state.mediaPipeTasksFull.detect(image);
      let faces = mapMediaPipeTasksResult(result, `MediaPipe Tasks Full ${MEDIAPIPE_TASKS_VERSION}`, targetWidth, targetHeight, sourceWidth, sourceHeight);
      if (faces.length) return { faces: mergeFaceBoxes(faces), engine: `MediaPipe Tasks Full ${MEDIAPIPE_TASKS_VERSION}` };
      result = state.mediaPipeTasksShort.detect(image);
      faces = mapMediaPipeTasksResult(result, `MediaPipe Tasks Short ${MEDIAPIPE_TASKS_VERSION}`, targetWidth, targetHeight, sourceWidth, sourceHeight);
      return { faces: mergeFaceBoxes(faces), engine: `MediaPipe Tasks Short ${MEDIAPIPE_TASKS_VERSION}` };
    }

    async function preflightAiAssets({ showStatus = true } = {}) {
      try {
        ensureLocalHttpOrigin();
      } catch (error) {
        state.aiAssetsChecked = true;
        state.aiAssetsReady = false;
        state.aiAssetErrors = [readableError(error)];
        if (showStatus) setAiStatus("error", "AI 啟動環境不正確", state.aiAssetErrors[0]);
        return false;
      }

      if (showStatus) setAiStatus("loading", "正在檢查離線 AI 檔案", `正在確認 ${AI_REQUIRED_ASSETS.length} 個必要程式與模型檔。`);
      const results = await Promise.all(AI_REQUIRED_ASSETS.map(checkAssetFile));
      const failed = results.filter((item) => !item.ok);
      state.aiAssetsChecked = true;
      state.aiAssetsReady = failed.length === 0;
      state.aiAssetErrors = failed.map((item) => `${item.url.replace(/^\.\//, "")}：${item.error}`);

      if (failed.length) {
        const detail = state.aiAssetErrors.join(" ｜ ");
        if (showStatus) setAiStatus("error", `AI 必要檔案缺少或無法讀取（${failed.length}）`, detail);
        return false;
      }
      if (showStatus) setAiStatus("success", "離線 AI 檔案檢查完成", "MediaPipe、WASM 與 FaceAPI 模型檔都可從本機 HTTP Server 讀取。準備初始化 AI。" );
      return true;
    }

    async function resetMediaPipeDetector(reason = "") {
      if (mediaPipePending) {
        const pending = mediaPipePending;
        mediaPipePending = null;
        try { pending.reject(new Error(reason || "MediaPipe 已重新初始化")); } catch (_) {}
      }
      if (state.mediaPipeDetector) {
        try { if (typeof state.mediaPipeDetector.close === "function") await state.mediaPipeDetector.close(); } catch (_) {}
      }
      state.mediaPipeDetector = null;
      state.mediaPipeInitPromise = null;
    }

    async function ensureMediaPipeDetector(forceReset = false) {
      if (forceReset) await resetMediaPipeDetector("MediaPipe 重新初始化");
      if (state.mediaPipeDetector) return state.mediaPipeDetector;
      if (state.mediaPipeInitPromise) return state.mediaPipeInitPromise;
      state.mediaPipeInitPromise = (async () => {
        if (typeof window.FaceDetection !== "function") throw new Error("MediaPipe face_detection.js 未正確載入");
        const detector = new window.FaceDetection({ locateFile: (file) => `${MEDIAPIPE_ASSET_PATH}/${file}` });
        detector.onResults((results) => {
          if (!mediaPipePending) return;
          const pending = mediaPipePending;
          mediaPipePending = null;
          pending.resolve(results);
        });
        detector.setOptions({ selfieMode: false, model: "full", minDetectionConfidence: 0.35 });
        await detector.initialize();
        state.mediaPipeDetector = detector;
        return detector;
      })().catch((error) => {
        state.mediaPipeInitPromise = null;
        state.mediaPipeDetector = null;
        throw error;
      });
      return state.mediaPipeInitPromise;
    }

    async function runMediaPipeModel(model, image) {
      const detector = await ensureMediaPipeDetector();
      if (mediaPipePending) throw new Error("MediaPipe 正在處理上一張影像");
      detector.setOptions({ selfieMode: false, model, minDetectionConfidence: 0.35 });
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (mediaPipePending) mediaPipePending = null;
          reject(new Error(`MediaPipe ${model} 模型等待逾時`));
        }, 30000);
        mediaPipePending = {
          resolve: (results) => { clearTimeout(timer); resolve(results); },
          reject: (error) => { clearTimeout(timer); reject(error); }
        };
        detector.send({ image }).catch((error) => {
          if (mediaPipePending) mediaPipePending = null;
          clearTimeout(timer);
          reject(error);
        });
      });
    }

    function mapMediaPipeResults(results, model, targetWidth, targetHeight) {
      const engineName = model === "full" ? "MediaPipe Full" : "MediaPipe Short";
      return (results?.detections || []).map((detection) => {
        const box = detection.boundingBox || {};
        const width = Number(box.width || 0) * targetWidth;
        const height = Number(box.height || 0) * targetHeight;
        return {
          x: Number(box.xCenter || 0) * targetWidth - width / 2,
          y: Number(box.yCenter || 0) * targetHeight - height / 2,
          width,
          height,
          score: 1,
          engine: engineName
        };
      });
    }

    async function detectFacesWithMediaPipe(image, targetWidth, targetHeight) {
      const full = await runMediaPipeModel("full", image);
      let faces = mapMediaPipeResults(full, "full", targetWidth, targetHeight);
      if (faces.length) return { faces: mergeFaceBoxes(faces), engine: "MediaPipe Full" };

      const short = await runMediaPipeModel("short", image);
      faces = mapMediaPipeResults(short, "short", targetWidth, targetHeight);
      return { faces: mergeFaceBoxes(faces), engine: "MediaPipe Short" };
    }

    async function detectFacesWithMediaPipeRetry(image, targetWidth, targetHeight) {
      try {
        state.mediaPipeRetryCount = 0;
        return await detectFacesWithMediaPipe(image, targetWidth, targetHeight);
      } catch (firstError) {
        console.warn("MediaPipe 第一次執行失敗，重新初始化後再試一次。", firstError);
        state.mediaPipeRetryCount = 1;
        setAiStatus("loading", "MediaPipe 發生錯誤，正在自動重新初始化", readableError(firstError));
        await resetMediaPipeDetector("MediaPipe 第一次辨識失敗，準備重新初始化");
        try {
          await ensureMediaPipeDetector(true);
          return await detectFacesWithMediaPipe(image, targetWidth, targetHeight);
        } catch (retryError) {
          const combined = new Error(`第一次：${readableError(firstError)}｜重新初始化後：${readableError(retryError)}`);
          combined.firstError = firstError;
          combined.retryError = retryError;
          throw combined;
        }
      }
    }

    async function selectFaceApiBackend() {
      if (!window.faceapi || !window.faceapi.tf) throw new Error("FaceAPI 備援程式庫未正確載入");
      await window.faceapi.tf.ready();
      let webglError = "";
      try {
        const ok = await window.faceapi.tf.setBackend("webgl");
        await window.faceapi.tf.ready();
        if (ok && window.faceapi.tf.getBackend() === "webgl") {
          state.faceApiBackend = "webgl";
          return "webgl";
        }
        webglError = "瀏覽器未接受 WebGL 後端";
      } catch (error) {
        webglError = readableError(error);
      }

      console.warn("FaceAPI WebGL 無法使用，切換 CPU。", webglError);
      try {
        const ok = await window.faceapi.tf.setBackend("cpu");
        await window.faceapi.tf.ready();
        if (!ok || window.faceapi.tf.getBackend() !== "cpu") throw new Error("瀏覽器未接受 CPU 後端");
        state.faceApiBackend = "cpu";
        return "cpu";
      } catch (cpuError) {
        throw new Error(`FaceAPI WebGL：${webglError || "無法啟用"}｜FaceAPI CPU：${readableError(cpuError)}`);
      }
    }

    async function ensureFaceApiModel(forceBackendCheck = false) {
      if (state.faceApiModel && !forceBackendCheck) return state.faceApiModel;
      if (state.faceApiInitPromise && !forceBackendCheck) return state.faceApiInitPromise;
      if (forceBackendCheck) {
        state.faceApiInitPromise = null;
        state.faceApiModel = null;
        state.faceApiBackend = "";
      }
      state.faceApiInitPromise = (async () => {
        await selectFaceApiBackend();
        await window.faceapi.nets.ssdMobilenetv1.loadFromUri(FACE_API_MODEL_PATH);
        state.faceApiModel = window.faceapi.nets.ssdMobilenetv1;
        return state.faceApiModel;
      })().catch((error) => {
        state.faceApiInitPromise = null;
        state.faceApiModel = null;
        throw error;
      });
      return state.faceApiInitPromise;
    }

    async function detectFacesWithFaceApi(image, scaleX = 1, scaleY = 1, minConfidence = 0.28) {
      await ensureFaceApiModel();
      const backend = state.faceApiBackend || window.faceapi?.tf?.getBackend?.() || "cpu";
      const engine = backend === "webgl" ? "FaceAPI WebGL" : "FaceAPI CPU";
      const safeConfidence = Math.max(0.12, Math.min(0.95, Number(minConfidence) || 0.28));
      const options = new window.faceapi.SsdMobilenetv1Options({ minConfidence: safeConfidence });
      const detections = await window.faceapi.detectAllFaces(image, options);
      return {
        engine,
        faces: detections.map((d) => ({
          x: Number(d.box.x) * scaleX,
          y: Number(d.box.y) * scaleY,
          width: Number(d.box.width) * scaleX,
          height: Number(d.box.height) * scaleY,
          score: Number(d.score || 1),
          engine
        })).filter((f) => f.score >= safeConfidence)
      };
    }

    async function detectFacesOnGroupTile(tileCanvas, useSecondModel = false) {
      const collected = [];
      try {
        if (!state.mediaPipeTasksChecked) await probeMediaPipeTasksAssets();
        if (state.mediaPipeTasksReady) {
          const result = await detectFacesWithMediaPipeTasks(tileCanvas, tileCanvas.width, tileCanvas.height);
          collected.push(...(result.faces || []));
        }
      } catch (error) { console.warn("團體照分區 Tasks Vision 失敗。", error); }
      try {
        const result = await detectFacesWithMediaPipeRetry(tileCanvas, tileCanvas.width, tileCanvas.height);
        collected.push(...(result.faces || []));
      } catch (error) { console.warn("團體照分區 Legacy MediaPipe 失敗。", error); }
      try { collected.push(...await detectFacesWithNativeApi(tileCanvas, 1, 1)); } catch (_) {}

      // V4.2 第二模型補抓：只在精細小尺度 tile 使用 FaceAPI，避免大量照片在 CPU 模式下過慢。
      if (useSecondModel) {
        try {
          const faceApi = await detectFacesWithFaceApi(tileCanvas, 1, 1, GROUP_AI_FACEAPI_MIN_CONFIDENCE);
          collected.push(...(faceApi.faces || []).map((face) => ({ ...face, engine: `${face.engine || "FaceAPI"}＋第二模型` })));
        } catch (error) { console.warn("團體照分區 FaceAPI 第二模型補抓失敗。", error); }
      }
      return mergeFaceBoxes(collected);
    }

    function buildTilePositions(length, tileSide, overlap) {
      const step = Math.max(1, Math.round(tileSide * (1 - overlap)));
      const values = [];
      for (let pos = 0; pos < length; pos += step) {
        const safe = Math.min(pos, Math.max(0, length - tileSide));
        if (!values.includes(safe)) values.push(safe);
        if (safe + tileSide >= length) break;
      }
      return values;
    }

    function buildGroupAiTilesForScale(width, height, tileSide, overlap, scaleLabel) {
      const side = Math.max(480, Math.min(tileSide, width, height));
      const xs = buildTilePositions(width, side, overlap);
      const ys = buildTilePositions(height, side, overlap);
      const tiles = [];
      ys.forEach((y) => xs.forEach((x) => tiles.push({ x, y, width: Math.min(side, width - x), height: Math.min(side, height - y), scaleLabel })));
      return tiles;
    }

    function buildGroupAiTiles(width, height) {
      const minSide = Math.min(width, height);
      const largeSide = Math.min(GROUP_AI_LARGE_TILE_MAX, Math.max(980, Math.round(minSide * 0.62)));
      const smallSide = Math.min(GROUP_AI_SMALL_TILE_MAX, Math.max(620, Math.round(minSide * 0.38)));
      const largeTiles = buildGroupAiTilesForScale(width, height, largeSide, GROUP_AI_LARGE_TILE_OVERLAP, "大尺度");
      const smallTiles = buildGroupAiTilesForScale(width, height, smallSide, GROUP_AI_SMALL_TILE_OVERLAP, "小尺度");
      const all = [...largeTiles, ...smallTiles];
      const seen = new Set();
      return all.filter((tile) => {
        const key = `${tile.x}:${tile.y}:${tile.width}:${tile.height}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }).slice(0, GROUP_AI_MAX_TILES);
    }

    async function detectFacesWithGroupEnhancement(sourceCanvas) {
      if (!state.groupAiEnhance || Math.max(sourceCanvas.width, sourceCanvas.height) < GROUP_AI_MIN_SIDE) return [];
      const tiles = buildGroupAiTiles(sourceCanvas.width, sourceCanvas.height);
      const collected = [];
      let secondModelBudget = 8;
      for (let i = 0; i < tiles.length; i++) {
        if (state.cancellableOperationLabel) throwIfOperationCancelled();
        const tile = tiles[i];
        const c = document.createElement("canvas"); c.width = tile.width; c.height = tile.height;
        c.getContext("2d", { alpha:false }).drawImage(sourceCanvas, tile.x, tile.y, tile.width, tile.height, 0, 0, tile.width, tile.height);
        const useSecondModel = tile.scaleLabel === "小尺度" && secondModelBudget > 0;
        if (useSecondModel) secondModelBudget -= 1;
        const faces = await detectFacesOnGroupTile(c, useSecondModel);
        faces.forEach((face) => collected.push({ ...face, x: face.x + tile.x, y: face.y + tile.y, engine: `${face.engine || "離線 AI"}＋${tile.scaleLabel}分區` }));
        // 主動釋放暫存 tile canvas 的 backing store。
        c.width = 1; c.height = 1;
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return mergeFaceBoxes(collected);
    }

    async function detectFacesBase(sourceCanvas) {
      const preview = makeAiPreview(sourceCanvas);
      let tasksError = null;
      let mediaPipeError = null;

      // V4.2：若已安裝最新 MediaPipe Tasks Vision，優先使用官方新版 API。
      try {
        if (!state.mediaPipeTasksChecked) await probeMediaPipeTasksAssets();
        if (state.mediaPipeTasksReady) {
          const result = await detectFacesWithMediaPipeTasks(preview.canvas, sourceCanvas.width, sourceCanvas.height);
          if (result.faces.length) {
            state.lastAiEngine = result.engine;
            return { faces: result.faces, engine: result.engine };
          }
          // 新版 API 正常運作但沒找到臉時，仍繼續嘗試 legacy Full/Short 以提高召回率。
        }
      } catch (error) {
        tasksError = error;
        console.warn("MediaPipe Tasks Vision 執行失敗，切換內建 Legacy MediaPipe。", error);
      }

      try {
        const result = await detectFacesWithMediaPipeRetry(preview.canvas, sourceCanvas.width, sourceCanvas.height);
        if (result.faces.length) {
          state.lastAiEngine = result.engine;
          return { faces: result.faces, engine: result.engine };
        }
        const nativeFaces = await detectFacesWithNativeApi(preview.canvas, preview.scaleX, preview.scaleY);
        if (nativeFaces.length) {
          state.lastAiEngine = `${result.engine}＋瀏覽器內建`;
          return { faces: mergeFaceBoxes(nativeFaces), engine: state.lastAiEngine };
        }
        state.lastAiEngine = result.engine;
        return { faces: [], engine: result.engine };
      } catch (error) {
        mediaPipeError = error;
        console.warn("Legacy MediaPipe 重試仍失敗，正式切換 FaceAPI。", error);
        setAiStatus("loading", "MediaPipe 無法使用，正在切換 FaceAPI", readableError(error));
      }

      try {
        const fallback = await detectFacesWithFaceApi(preview.canvas, preview.scaleX, preview.scaleY);
        state.lastAiEngine = fallback.engine;
        return { faces: mergeFaceBoxes(fallback.faces), engine: fallback.engine };
      } catch (faceApiError) {
        const parts = [];
        if (tasksError) parts.push(`MediaPipe Tasks：${readableError(tasksError)}`);
        parts.push(`Legacy MediaPipe：${readableError(mediaPipeError)}`);
        parts.push(`FaceAPI：${readableError(faceApiError)}`);
        throw new Error(parts.join("｜"));
      }
    }

    async function detectFacesOptimized(sourceCanvas) {
      const base = await detectFacesBase(sourceCanvas);
      if (!state.groupAiEnhance || Math.max(sourceCanvas.width, sourceCanvas.height) < GROUP_AI_MIN_SIDE) return base;
      try {
        const extra = await detectFacesWithGroupEnhancement(sourceCanvas);
        if (!extra.length) return base;
        const merged = mergeFaceBoxes([...(base.faces || []), ...extra]);
        const added = Math.max(0, merged.length - (base.faces || []).length);
        if (!added) return base;
        const engine = `${base.engine || "離線 AI"}＋雙尺度分區＋FaceAPI補抓`;
        state.lastAiEngine = engine;
        return { faces: merged, engine };
      } catch (error) {
        if (isOperationCancelledError(error)) throw error;
        console.warn("團體照加強辨識失敗，保留主要辨識結果。", error);
        return base;
      }
    }

    async function checkOfflineAi() {
      if (state.faceDetecting) return;
      setFaceDetectLoading(true, "正在檢查離線 AI…");
      try {
        const assetsOk = await preflightAiAssets({ showStatus: true });
        if (!assetsOk) throw new Error(state.aiAssetErrors.join(" ｜ ") || "AI 必要檔案檢查失敗");

        const tasksReady = await probeMediaPipeTasksAssets();
        if (tasksReady) {
          setAiStatus("loading", `正在初始化 MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION}`, "優先使用新版 Face Detector API；新版失敗時仍保留 Legacy MediaPipe 與 FaceAPI 備援。" );
          try {
            await ensureMediaPipeTasks();
            state.lastAiEngine = `MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION} 已就緒`;
            setMainAiEnvironmentState(true, `離線 AI 已就緒｜MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION}`);
            setAiStatus("success", "新版離線 AI 已就緒", `MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION} Full / Short 已成功載入；Legacy MediaPipe 與 FaceAPI 仍保留為備援。` );
            showToast(`MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION} 檢查成功`);
            return;
          } catch (tasksInitError) {
            console.warn("MediaPipe Tasks Vision 初始化失敗，繼續檢查 Legacy MediaPipe。", tasksInitError);
          }
        }

        setAiStatus("loading", "正在初始化 Legacy MediaPipe", tasksReady ? "新版 MediaPipe Tasks 初始化失敗，正在檢查內建舊版備援。" : `尚未安裝 MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION} 更新，先使用內建 Legacy MediaPipe。` );
        try {
          await ensureMediaPipeDetector(true);
          state.lastAiEngine = "Legacy MediaPipe Full / Short 已就緒";
          setMainAiEnvironmentState(true, "離線 AI 已就緒｜Legacy MediaPipe Full / Short");
          setAiStatus("success", "離線 AI 可正常載入", tasksReady ? "Legacy MediaPipe Full / Short 已就緒。" : `Legacy MediaPipe 已就緒。若要啟用新版 MediaPipe Tasks Vision ${MEDIAPIPE_TASKS_VERSION}，請執行 update-ai-components.cmd。` );
          showToast("Legacy MediaPipe 離線 AI 檢查成功");
          return;
        } catch (primaryError) {
          console.warn("MediaPipe 自我檢查失敗，重新初始化一次。", primaryError);
          setAiStatus("loading", "MediaPipe 初始化失敗，正在重試", readableError(primaryError));
          try {
            await ensureMediaPipeDetector(true);
            state.lastAiEngine = "MediaPipe Full / Short 已就緒（重試成功）";
            setMainAiEnvironmentState(true, "離線 AI 已就緒｜MediaPipe Full / Short（重試成功）");
            setAiStatus("success", "MediaPipe 重新初始化成功", `第一次錯誤：${readableError(primaryError)}｜目前 MediaPipe Full / Short 已就緒。`);
            showToast("MediaPipe 重試成功");
            return;
          } catch (retryError) {
            setAiStatus("loading", "MediaPipe 重試失敗，正在檢查 FaceAPI", `第一次：${readableError(primaryError)}｜重試：${readableError(retryError)}`);
            try {
              await ensureFaceApiModel(true);
              const engine = state.faceApiBackend === "webgl" ? "FaceAPI WebGL" : "FaceAPI CPU";
              state.lastAiEngine = engine;
              setMainAiEnvironmentState(true, `離線 AI 已就緒｜${engine}`);
              setAiStatus("success", `${engine} 備援可正常載入`, `MediaPipe 無法初始化，但 ${engine} 已就緒。MediaPipe：${readableError(retryError)}`);
              showToast(`${engine} 備援檢查成功`);
            } catch (fallbackError) {
              throw new Error(`MediaPipe 第一次：${readableError(primaryError)}｜MediaPipe 重試：${readableError(retryError)}｜FaceAPI：${readableError(fallbackError)}`);
            }
          }
        }
      } catch (error) {
        console.error("離線 AI 自我檢查失敗", error);
        setMainAiEnvironmentState(false, `離線 AI 檢查失敗｜${readableError(error)}`);
        setAiStatus("error", "離線 AI 載入失敗", readableError(error));
        showToast("AI 自動檢查失敗，請查看紅色錯誤說明");
      } finally {
        setFaceDetectLoading(false);
      }
    }

    function getCanvasPointFor(canvas, event) {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * canvas.width / Math.max(1, rect.width), y: (event.clientY - rect.top) * canvas.height / Math.max(1, rect.height) };
    }

    function findFaceIndexAtPoint(item, point) {
      for (let i=(item.selections||[]).length-1;i>=0;i--) if (isPointInsideSelection(point,item.selections[i])) return i;
      return -1;
    }

    function ensureAiEditState(item) {
      if (!item) return null;
      if (!Number.isInteger(item.activeAiFaceIndex)) item.activeAiFaceIndex = -1;
      if (!item.aiPointer) item.aiPointer = { interaction:null, index:-1, startSelection:null, activeHandle:null, moved:false };
      if (typeof item.aiSelectionsCustomized !== "boolean") item.aiSelectionsCustomized = false;
      return item.aiPointer;
    }

    function setActiveAiFace(item, index) {
      if (!item) return;
      const max = (item.selections || []).length;
      item.activeAiFaceIndex = Number.isInteger(index) && index >= 0 && index < max ? index : -1;
      drawFaceReview(item);
    }

    // AI 人臉框只允許調整範圍大小，不允許移動、複製或刪除。
    // 矩形使用八個控制點；圓形使用上、右、下、左四個控制點。
    function getAiResizeHandles(selection) {
      if (!selection) return [];
      const { x, y, width, height, shape } = selection;
      const cx = x + width / 2;
      const cy = y + height / 2;
      if (shape === "circle") {
        return [
          { name:"n", x:cx, y }, { name:"e", x:x+width, y:cy },
          { name:"s", x:cx, y:y+height }, { name:"w", x, y:cy }
        ];
      }
      return [
        { name:"nw", x, y }, { name:"n", x:cx, y }, { name:"ne", x:x+width, y },
        { name:"e", x:x+width, y:cy }, { name:"se", x:x+width, y:y+height },
        { name:"s", x:cx, y:y+height }, { name:"sw", x, y:y+height }, { name:"w", x, y:cy }
      ];
    }

    function getAiVisualMetrics(canvas) {
      const rect = canvas.getBoundingClientRect();
      const sx = rect.width ? canvas.width / rect.width : 1;
      const sy = rect.height ? canvas.height / rect.height : 1;
      const scale = Math.max(.25, (sx + sy) / 2);
      return {
        scale,
        handleRadius: Math.max(6, 7 * scale),
        hitRadius: Math.max(12, 14 * scale),
        minimumSize: Math.max(20, 30 * scale)
      };
    }

    function hitAiResizeHandle(item, canvas, point) {
      const index = item?.activeAiFaceIndex ?? -1;
      const selection = index >= 0 ? item.selections?.[index] : null;
      if (!selection) return null;
      const { hitRadius } = getAiVisualMetrics(canvas);
      return getAiResizeHandles(selection).find((handle) => Math.hypot(point.x-handle.x, point.y-handle.y) <= hitRadius)?.name || null;
    }

    function resizeAiRectFromHandle(start, handle, point, canvas) {
      const minSize = getAiVisualMetrics(canvas).minimumSize;
      let left=start.x, top=start.y, right=start.x+start.width, bottom=start.y+start.height;
      if (handle.includes("w")) left = clamp(point.x, 0, right-minSize);
      if (handle.includes("e")) right = clamp(point.x, left+minSize, canvas.width);
      if (handle.includes("n")) top = clamp(point.y, 0, bottom-minSize);
      if (handle.includes("s")) bottom = clamp(point.y, top+minSize, canvas.height);
      return { x:left, y:top, width:right-left, height:bottom-top, shape:start.shape || "rect" };
    }

    function resizeAiCircleFromHandle(start, handle, point, canvas) {
      const minSize = getAiVisualMetrics(canvas).minimumSize;
      const cx = start.x + start.width/2;
      const cy = start.y + start.height/2;
      const minR = minSize/2;
      const maxR = Math.max(minR, Math.min(cx, canvas.width-cx, cy, canvas.height-cy));
      const requested = (handle === "n" || handle === "s") ? Math.abs(point.y-cy) : Math.abs(point.x-cx);
      const r = clamp(requested, minR, maxR);
      return { x:cx-r, y:cy-r, width:r*2, height:r*2, shape:"circle" };
    }

    function beginAiFacePointer(item, canvas, event, point) {
      if (!state.faceReviewMode || !item) return false;
      state.activePhotoItem = item;
      // 同時間顯示 AI 與手動框，但一次只讓一種框顯示編輯控制點。
      if (item.activeManualIndex >= 0 || state.selection) {
        item.activeManualIndex = -1;
        state.selection = null;
      }
      const pointer = ensureAiEditState(item);
      const handle = hitAiResizeHandle(item, canvas, point);

      // 只有控制點可以拖曳，而且用途僅限改變框大小。
      if (handle && item.activeAiFaceIndex >= 0) {
        event.preventDefault();
        try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
        pointer.interaction = "resize";
        pointer.index = item.activeAiFaceIndex;
        pointer.startSelection = cloneSelection(item.selections[pointer.index]);
        pointer.activeHandle = handle;
        pointer.moved = false;
        canvas.style.cursor = getHandleCursor(handle);
        return true;
      }

      const hitIndex = findFaceIndexAtPoint(item, point);
      if (hitIndex < 0) {
        item.activeAiFaceIndex = -1;
        drawFaceReview(item);
        canvas.style.cursor = "default";
        return true;
      }

      // 點擊框只負責切換遮蔽狀態並指定目前框，不啟動移動。
      event.preventDefault();
      try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
      item.activeAiFaceIndex = hitIndex;
      pointer.interaction = "click";
      pointer.index = hitIndex;
      pointer.startSelection = cloneSelection(item.selections[hitIndex]);
      pointer.activeHandle = null;
      pointer.moved = false;
      drawFaceReview(item);
      canvas.style.cursor = "pointer";
      return true;
    }

    function moveAiFacePointer(item, canvas, event, point) {
      if (!state.faceReviewMode || !item) return false;
      const pointer = ensureAiEditState(item);
      if (!pointer.interaction) {
        const handle = hitAiResizeHandle(item, canvas, point);
        if (handle) canvas.style.cursor = getHandleCursor(handle);
        else canvas.style.cursor = findFaceIndexAtPoint(item, point) >= 0 ? "pointer" : "default";
        return true;
      }
      if (pointer.interaction !== "resize") return true;

      event.preventDefault();
      const start = pointer.startSelection;
      if (!start || pointer.index < 0) return true;
      const next = start.shape === "circle"
        ? resizeAiCircleFromHandle(start, pointer.activeHandle, point, canvas)
        : resizeAiRectFromHandle(start, pointer.activeHandle, point, canvas);
      item.selections[pointer.index] = next;
      pointer.moved = true;
      item.aiSelectionsCustomized = true;
      drawFaceReview(item);
      canvas.style.cursor = getHandleCursor(pointer.activeHandle);
      return true;
    }

    function finishAiFacePointer(item, canvas, event) {
      if (!state.faceReviewMode || !item) return false;
      const pointer = ensureAiEditState(item);
      if (!pointer.interaction) return true;
      event.preventDefault();
      const interaction = pointer.interaction;
      const index = pointer.index;
      const resized = interaction === "resize" && pointer.moved;
      pointer.interaction = null;
      pointer.index = -1;
      pointer.startSelection = null;
      pointer.activeHandle = null;
      pointer.moved = false;

      if (interaction === "click" && index >= 0) {
        toggleFaceSelection(item, index);
      } else {
        drawFaceReview(item);
        updateButtons();
        if (resized) showToast("已調整 AI 人臉框大小");
      }
      const point = getCanvasPointFor(canvas, event);
      const handle = hitAiResizeHandle(item, canvas, point);
      canvas.style.cursor = handle ? getHandleCursor(handle) : (findFaceIndexAtPoint(item, point) >= 0 ? "pointer" : "default");
      return true;
    }

    function cancelAiFacePointer(item, canvas) {
      if (!state.faceReviewMode || !item) return false;
      const pointer = ensureAiEditState(item);
      if (!pointer.interaction) return true;
      if (pointer.interaction === "resize" && pointer.index >= 0 && pointer.startSelection) {
        item.selections[pointer.index] = cloneSelection(pointer.startSelection);
      }
      pointer.interaction = null;
      pointer.index = -1;
      pointer.startSelection = null;
      pointer.activeHandle = null;
      pointer.moved = false;
      drawFaceReview(item);
      canvas.style.cursor = "default";
      return true;
    }

    function drawFaceReview(item) {
      if (!item || item.canvasParked) { renderFaceControls(item); return; }
      const ctx=item.overlayCtx, canvas=item.overlay; ctx.clearRect(0,0,canvas.width,canvas.height);
      ensureAiEditState(item);
      (item.selections||[]).forEach((sel,i)=>{
        const selected=item.selectedFaces.has(i); const active=item.activeAiFaceIndex===i; const scale=Math.max(1,canvas.width/900); ctx.save();
        ctx.lineWidth=active?Math.max(5,6*scale):Math.max(3,4*scale);
        ctx.strokeStyle=selected?"#7c3aed":"#94a3b8";
        ctx.fillStyle=selected?"rgba(124,58,237,.16)":"rgba(148,163,184,.10)";
        ctx.setLineDash(active?[]:selected?[]:[10*scale,7*scale]);
        if(sel.shape==="circle"){ctx.beginPath();ctx.ellipse(sel.x+sel.width/2,sel.y+sel.height/2,sel.width/2,sel.height/2,0,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.fillRect(sel.x,sel.y,sel.width,sel.height);ctx.strokeRect(sel.x,sel.y,sel.width,sel.height);}
        const label=`人臉 ${i+1}：${selected?"將遮蔽":"不遮蔽"}${active?"｜可調整大小":""}`; ctx.font=`900 ${Math.max(15,18*scale)}px sans-serif`; const tw=ctx.measureText(label).width; const lh=Math.max(24,28*scale); const lx=Math.max(0,Math.min(canvas.width-tw-16*scale,sel.x)); const ly=Math.max(lh,sel.y); ctx.setLineDash([]); ctx.fillStyle=selected?"#7c3aed":"#64748b";ctx.fillRect(lx,ly-lh,tw+14*scale,lh);ctx.fillStyle="#fff";ctx.fillText(label,lx+7*scale,ly-7*scale);

        // 目前 AI 框顯示白色縮放控制點；控制點只能改變大小，不能移動框。
        if (active) {
          const metrics = getAiVisualMetrics(canvas);
          ctx.fillStyle = "#ffffff";
          ctx.strokeStyle = selected ? "#7c3aed" : "#64748b";
          ctx.lineWidth = Math.max(2, 2.5 * metrics.scale);
          getAiResizeHandles(sel).forEach((handle) => {
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, metrics.handleRadius, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
          });
        }
        ctx.restore();
      });
      // AI 人臉框繪製完後，再疊加手動框。兩者可同時顯示與操作。
      drawManualSelectionsForItem(item, true, true);
      renderFaceControls(item);
    }
    function renderFaceControls(item){ const box=item.controls; if(!box)return; box.innerHTML=""; if(!(item.selections||[]).length){box.hidden=true;return;} box.hidden=false; item.selections.forEach((_,i)=>{const b=document.createElement("button");b.type="button";b.className=`face-toggle${item.selectedFaces.has(i)?" selected":""}`;b.innerHTML=`<span class="dot"></span>人臉 ${i+1}：${item.selectedFaces.has(i)?"將遮蔽":"不遮蔽"}`;b.onclick=()=>{item.activeAiFaceIndex=i;toggleFaceSelection(item,i);};box.appendChild(b);}); }
    function toggleFaceSelection(item,index){
      if(item.selectedFaces.has(index))item.selectedFaces.delete(index);else item.selectedFaces.add(index);
      if(item===getActivePhotoItem()) { item.activeManualIndex=-1; state.selection=null; updateSelectionInfoForItem(item); }
      item.activeAiFaceIndex=index;drawFaceReview(item);updateButtons();
    }
    function toggleFaceAtPoint(item,point){const index=findFaceIndexAtPoint(item,point);if(index>=0)toggleFaceSelection(item,index);}
    function setAllFaces(selected){state.photoItems.forEach(item=>{item.selectedFaces=new Set(selected?(item.selections||[]).map((_,i)=>i):[]);drawFaceReview(item);});updateButtons();}
    selectAllFacesBtn.addEventListener("click",()=>setAllFaces(true)); clearAllFacesBtn.addEventListener("click",()=>setAllFaces(false));

    async function detectAndMosaicAllFaces() {
      if (!state.photoItems.length || state.faceDetecting || state.multiProcessing) return;
      state.faceDetecting=true; state.faceReviewMode=false; beginCancellableOperation("快速AI辨識"); setFaceDetectLoading(true,"AI 正在辨識全部照片…");
      setAiStatus("loading","AI 正在批次辨識",`準備掃描 ${state.photoItems.length} 張照片。既有手動框會保留。`); setBatchProgress(0, state.photoItems.length, "快速AI辨識");
      let totalFaces=0, ok=0;
      try{
        for(let i=0;i<state.photoItems.length;i++){
          throwIfOperationCancelled();
          const item=state.photoItems[i]; await ensurePhotoCanvasLoaded(item); drawManualSelectionsForItem(item); item.statusEl.textContent=`第 ${i+1} 張｜AI 辨識中…`;
          try{
            const det=await detectFacesOptimized(item.canvas);
            item.faces=det.faces; item.engine=det.engine; item.selections=det.faces.map(f=>clampFaceBoxForCanvas(f,item.canvas)); item.selectedFaces=new Set(); item.activeAiFaceIndex=-1; item.aiSelectionsCustomized=false; item.aiPointer=null; item.detected=true;
            totalFaces+=item.selections.length; ok++;
            item.statusEl.textContent=`第 ${i+1} 張｜${item.file.name}`;
            item.metaEl.textContent=`${item.canvas.width} × ${item.canvas.height} px｜AI 找到 ${item.selections.length} 張人臉｜${det.engine}`;
          }
          catch(e){
            item.faces=[];item.selections=[];item.selectedFaces=new Set();item.activeAiFaceIndex=-1;item.aiSelectionsCustomized=false;item.aiPointer=null;item.detected=false;item.engine="";
            const detail=readableError(e);
            item.statusEl.textContent=`第 ${i+1} 張｜AI 辨識失敗`;
            item.metaEl.textContent=`AI 辨識失敗｜${detail}`;
            setAiStatus("error", `第 ${i+1} 張照片 AI 辨識失敗`, detail);
            console.error(`第 ${i+1} 張照片 AI 辨識失敗`, e);
          }
          setBatchProgress(i + 1, state.photoItems.length, "快速AI辨識"); await new Promise(r=>setTimeout(r,0));
        }
        state.faceReviewMode=true; state.photoItems.forEach(drawFaceReview); overlayCanvas.style.cursor="default";
        const engines=[...new Set(state.photoItems.map(item=>item.engine).filter(Boolean))];
        setAiStatus(totalFaces?"success":"error",totalFaces?`全部辨識完成：共 ${totalFaces} 張人臉`:"沒有偵測到人臉",totalFaces?`已掃描 ${ok}/${state.photoItems.length} 張照片。實際引擎：${engines.join("、") || "未知"}。灰色框預設為「不遮蔽」；單擊可切換遮蔽狀態，選取後可拖曳白色控制點調整框的大小；同時也可直接新增手動框，不必先套用 AI 遮罩。`:`已掃描 ${state.photoItems.length} 張照片，未找到可辨識的人臉。實際引擎：${engines.join("、") || state.lastAiEngine || "未知"}。`);
        multiPhotoStatus.textContent=`AI 已掃描 ${state.photoItems.length} 張照片，共找到 ${totalFaces} 張人臉；預設皆不遮蔽；可同時操作 AI 人臉框與新增手動框。`;
        showToast(`AI 辨識完成：共 ${totalFaces} 張人臉`);
      }catch(error){if(isOperationCancelledError(error)){setAiStatus("idle","AI 辨識已停止",`已完成 ${ok}/${state.photoItems.length} 張照片；已完成的辨識結果會保留。`);multiPhotoStatus.textContent=`快速AI辨識已停止，已完成 ${ok}/${state.photoItems.length} 張。`;showToast("快速AI辨識已停止");}else{console.error(error);setAiStatus("error","AI 辨識失敗",readableError(error));}}
      finally{finishCancellableOperation();state.faceDetecting=false;setFaceDetectLoading(false);updateButtons();scheduleCanvasMemoryMaintenance();}
    }
    faceDetectBtn.addEventListener("click", detectAndMosaicAllFaces);

    function renderUnifiedAiEnvironmentState() {
      const mainText = state.mainAiEnvironmentMessage || "離線 AI：自動檢查中…";
      const helperText = state.advancedAiStatusMessage || "dlib Lite：自動檢查中…";
      let kind = state.advancedAiStatusKind || "unknown";
      if (state.mainAiEnvironmentReady === false) kind = "error";
      else if (kind === "unknown" && state.mainAiEnvironmentReady === true) kind = "ready";
      advancedAiState.dataset.state = kind;
      advancedAiState.textContent = `${mainText}｜${helperText}`;
    }

    function setMainAiEnvironmentState(ready, message) {
      state.mainAiEnvironmentReady = ready;
      state.mainAiEnvironmentMessage = message;
      renderUnifiedAiEnvironmentState();
    }

    function setAdvancedAiState(kind, message) {
      state.advancedAiStatusKind = kind;
      state.advancedAiStatusMessage = message;
      renderUnifiedAiEnvironmentState();
    }

    async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
      } finally {
        clearTimeout(timer);
      }
    }

    async function checkAdvancedAiHelper({ quiet = false } = {}) {
      try {
        const response = await fetchWithTimeout(`${ADVANCED_AI_HELPER_URL}/health`, { method: "GET" }, 2500);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const info = await response.json();
        if (!info || info.ok !== true) throw new Error(info?.error || "helper 回應格式不正確");
        state.advancedHelperReady = true;
        state.advancedHelperVersion = info.dlib_version || info.version || "unknown";
        state.advancedHelperError = "";
        setAdvancedAiState("ready", `dlib Lite 已就緒｜dlib ${state.advancedHelperVersion}｜${info.model || "HOG"}`);
        return true;
      } catch (error) {
        state.advancedHelperReady = false;
        state.advancedHelperError = readableError(error);
        setAdvancedAiState("missing", "dlib Lite 未啟動｜主要 MediaPipe / FaceAPI 不受影響");
        if (!quiet) {
          setAiStatus("error", "進階 AI dlib Lite 尚未啟動", `請先執行 advanced-ai-helper\\prepare-bundled-runtime.cmd，或將 advanced_ai_helper.exe 放入程式資料夾後重新啟動。錯誤：${state.advancedHelperError}`);
          showToast("進階 AI dlib Lite 尚未啟動");
        }
        return false;
      }
    }

    function faceBoxIou(a, b) {
      const left = Math.max(a.x, b.x), top = Math.max(a.y, b.y);
      const right = Math.min(a.x + a.width, b.x + b.width);
      const bottom = Math.min(a.y + a.height, b.y + b.height);
      const inter = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (!inter) return 0;
      const union = a.width * a.height + b.width * b.height - inter;
      return union > 0 ? inter / union : 0;
    }

    function mergeAdvancedFaceBoxes(item, boxes) {
      let added = 0;
      const existing = item.faces || [];
      for (const box of boxes) {
        const candidate = {
          x: clamp(Number(box.x) || 0, 0, item.canvas.width - 1),
          y: clamp(Number(box.y) || 0, 0, item.canvas.height - 1),
          width: Math.max(1, Number(box.width) || 1),
          height: Math.max(1, Number(box.height) || 1),
          score: Number(box.score) || 0,
          source: "dlib"
        };
        candidate.width = Math.min(candidate.width, item.canvas.width - candidate.x);
        candidate.height = Math.min(candidate.height, item.canvas.height - candidate.y);
        const overlaps = existing.some(face => faceBoxIou(face, candidate) >= 0.34);
        if (overlaps) continue;
        existing.push(candidate);
        item.selections.push(clampFaceBoxForCanvas(candidate, item.canvas));
        added++;
      }
      item.faces = existing;
      return added;
    }

    async function detectFacesWithAdvancedHelper(item) {
      const blob = await canvasToBlob(item.canvas);
      const response = await fetchWithTimeout(`${ADVANCED_AI_HELPER_URL}/detect?upsample=2&model=hog`, {
        method: "POST",
        headers: { "Content-Type": "image/png", "X-Image-Name": encodeURIComponent(item.file?.name || "photo.png") },
        body: blob
      }, ADVANCED_AI_TIMEOUT_MS);
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || `HTTP ${response.status}`);
      if (!payload || !Array.isArray(payload.faces)) throw new Error("進階 AI 回傳格式不正確");
      return payload;
    }

    async function advancedRescanAllFaces() {
      if (!state.photoItems.length || state.faceDetecting || state.multiProcessing) return;
      const ready = await checkAdvancedAiHelper();
      if (!ready) return;

      state.multiProcessing = true;
      beginCancellableOperation("進階AI辨識");
      advancedRescanBtn.classList.add("loading");
      advancedRescanBtn.setAttribute("aria-busy", "true");
      setAdvancedAiState("busy", "dlib Lite 進階 AI 正在重新掃描…");
      setAiStatus("loading", "進階AI辨識中", `正在以本機 dlib Lite（HOG）補掃 ${state.photoItems.length} 張照片；既有 MediaPipe 人臉框會保留。`);
      setBatchProgress(0, state.photoItems.length, "進階AI辨識");
      updateButtons();

      let totalAdded = 0;
      let processed = 0;
      try {
        for (let i = 0; i < state.photoItems.length; i++) {
          throwIfOperationCancelled();
          const item = state.photoItems[i];
          await ensurePhotoCanvasLoaded(item);
          item.statusEl.textContent = `第 ${i + 1} 張｜進階AI辨識中…`;
          try {
            const payload = await detectFacesWithAdvancedHelper(item);
            const added = mergeAdvancedFaceBoxes(item, payload.faces);
            totalAdded += added;
            processed++;
            item.detected = true;
            item.engine = item.engine ? `${item.engine}＋dlib Lite HOG` : "dlib Lite HOG";
            item.statusEl.textContent = `第 ${i + 1} 張｜${item.file.name}`;
            item.metaEl.textContent = `${item.canvas.width} × ${item.canvas.height} px｜目前 ${item.selections.length} 張人臉｜${item.engine}`;
            drawFaceReview(item);
          } catch (error) {
            console.error(`第 ${i + 1} 張進階AI辨識失敗`, error);
            item.statusEl.textContent = `第 ${i + 1} 張｜進階 AI 掃描失敗`;
            item.metaEl.textContent = `進階 AI 失敗｜${readableError(error)}`;
          }
          setBatchProgress(i + 1, state.photoItems.length, "進階AI辨識");
          await new Promise(resolve => setTimeout(resolve, 0));
        }
        state.faceReviewMode = true;
        state.photoItems.forEach(drawFaceReview);
        setAdvancedAiState("ready", `dlib Lite 已就緒｜本次新增 ${totalAdded} 張人臉框`);
        setAiStatus("success", "進階AI辨識完成", `已處理 ${processed}/${state.photoItems.length} 張照片，補找到 ${totalAdded} 張主要 AI 未收錄的人臉。新加入的人臉框預設為「不遮蔽」，請自行點選需要遮蔽的臉。`);
        multiPhotoStatus.textContent = `進階AI辨識完成，共補找到 ${totalAdded} 張人臉；新框預設不遮蔽。`;
        showToast(`進階 AI 新增 ${totalAdded} 張人臉框`);
      } catch (error) {
        if (isOperationCancelledError(error)) {
          setAdvancedAiState("ready", `dlib Lite 已就緒｜本次停止前新增 ${totalAdded} 張人臉框`);
          setAiStatus("idle", "進階AI辨識已停止", `已完成 ${processed}/${state.photoItems.length} 張照片；已新增的人臉框會保留。`);
          multiPhotoStatus.textContent = `進階AI辨識已停止，已完成 ${processed}/${state.photoItems.length} 張。`;
          showToast("進階AI辨識已停止");
        } else {
          console.error("進階AI辨識失敗", error);
          showToast(`進階AI辨識失敗：${readableError(error)}`);
        }
      } finally {
        finishCancellableOperation();
        state.multiProcessing = false;
        advancedRescanBtn.classList.remove("loading");
        advancedRescanBtn.setAttribute("aria-busy", "false");
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    }

    advancedRescanBtn.addEventListener("click", advancedRescanAllFaces);

    function applyBlur({ x, y, width, height, shape }) {
      const radius = Number(blurSize.value);
      const padding = Math.ceil(radius * 3);

      // 額外截取周圍像素，可減少霧化邊緣出現透明或硬邊的情況。
      const sourceX = Math.max(0, x - padding);
      const sourceY = Math.max(0, y - padding);
      const sourceRight = Math.min(mainCanvas.width, x + width + padding);
      const sourceBottom = Math.min(mainCanvas.height, y + height + padding);
      const sourceWidth = sourceRight - sourceX;
      const sourceHeight = sourceBottom - sourceY;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = sourceWidth;
      tempCanvas.height = sourceHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(
        mainCanvas,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, sourceWidth, sourceHeight
      );

      mainCtx.save();
      clipToSelection(mainCtx, { x, y, width, height, shape });
      mainCtx.filter = `blur(${radius}px)`;
      mainCtx.drawImage(tempCanvas, sourceX, sourceY);
      mainCtx.filter = "none";
      mainCtx.restore();
    }

    function applyCover({ x, y, width, height, shape }) {
      mainCtx.save();
      clipToSelection(mainCtx, { x, y, width, height, shape });
      mainCtx.fillStyle = coverColor.value;
      mainCtx.fillRect(x, y, width, height);
      mainCtx.restore();
    }

    function applySticker({ x, y, width, height, shape }) {
      const padding = Math.min(width, height) * 0.06;
      const innerX = x + padding;
      const innerY = y + padding;
      const innerWidth = Math.max(1, width - padding * 2);
      const innerHeight = Math.max(1, height - padding * 2);

      mainCtx.save();
      clipToSelection(mainCtx, { x, y, width, height, shape });

      if (state.customSticker) {
        // 自訂貼圖採 contain 方式置中，避免圖案被拉扁。
        const imageRatio = state.customSticker.naturalWidth / state.customSticker.naturalHeight;
        const areaRatio = innerWidth / innerHeight;
        let drawWidth;
        let drawHeight;

        if (imageRatio > areaRatio) {
          drawWidth = innerWidth;
          drawHeight = innerWidth / imageRatio;
        } else {
          drawHeight = innerHeight;
          drawWidth = innerHeight * imageRatio;
        }

        const drawX = innerX + (innerWidth - drawWidth) / 2;
        const drawY = innerY + (innerHeight - drawHeight) / 2;
        mainCtx.drawImage(state.customSticker, drawX, drawY, drawWidth, drawHeight);
      } else {
        // Emoji 依框選範圍自動放大並置中。
        const fontSize = Math.max(12, Math.min(innerWidth, innerHeight) * 0.78);
        mainCtx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        mainCtx.textAlign = "center";
        mainCtx.textBaseline = "middle";
        mainCtx.fillText(
          emojiSelect.value,
          x + width / 2,
          y + height / 2 + fontSize * 0.04
        );
      }

      mainCtx.restore();
    }

    function pushItemHistory(item, regions) {
      const list=Array.isArray(regions)?regions:[regions];
      const patches=list.filter(Boolean).map(region=>{const x=Math.max(0,Math.floor(region.x||0)),y=Math.max(0,Math.floor(region.y||0)),w=Math.min(item.canvas.width-x,Math.max(1,Math.ceil(region.width||item.canvas.width))),h=Math.min(item.canvas.height-y,Math.max(1,Math.ceil(region.height||item.canvas.height)));return{x,y,imageData:item.ctx.getImageData(x,y,w,h)};});
      item.history.push(patches);
      item.redoHistory = [];
      if(item.history.length>MAX_HISTORY){ item.history.shift(); item.hasUntrackedEdits = true; }
      enforceHistoryMemoryBudget(item);
    }
    function applyCoverToCanvas(canvas,sel){const ctx=canvas.getContext("2d");ctx.save();clipToSelection(ctx,sel);ctx.fillStyle=coverColor.value;ctx.fillRect(sel.x,sel.y,sel.width,sel.height);ctx.restore();}
    function applyStickerToCanvas(canvas,sel){const ctx=canvas.getContext("2d"),{x,y,width,height}=sel,padding=Math.min(width,height)*.06,ix=x+padding,iy=y+padding,iw=Math.max(1,width-padding*2),ih=Math.max(1,height-padding*2);ctx.save();clipToSelection(ctx,sel);if(state.customSticker){const ir=state.customSticker.naturalWidth/state.customSticker.naturalHeight,ar=iw/ih;let dw,dh;if(ir>ar){dw=iw;dh=iw/ir}else{dh=ih;dw=ih*ir}ctx.drawImage(state.customSticker,ix+(iw-dw)/2,iy+(ih-dh)/2,dw,dh);}else{const fs=Math.max(12,Math.min(iw,ih)*.78);ctx.font=`${fs}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(emojiSelect.value,x+width/2,y+height/2+fs*.04);}ctx.restore();}

    async function applyCurrentMasks() {
      if (state.multiProcessing) return;
      const activeItem = getActivePhotoItem();
      if (!activeItem) { showToast("請先上傳照片"); return; }

      // 先同步目前手動框，避免正在編輯中的尺寸尚未寫回陣列。
      syncActiveManualSelection(activeItem);
      const manualSelections = ensureManualSelections(activeItem)
        .map((selection) => getSafeSelectionFor(activeItem, selection))
        .filter(Boolean);
      const selectedAiCount = state.photoItems.reduce((count, item) => count + (item.selectedFaces?.size || 0), 0);

      if (!manualSelections.length && !selectedAiCount) {
        showToast("請先框選手動遮罩，或勾選要遮蔽的 AI 人臉");
        return;
      }

      state.multiProcessing = true;
      state.applyInProgress = true;
      beginCancellableOperation("套用遮罩");
      updateButtons();
      const effectMap = { mosaic: applyMosaicToCanvas, blur: applyBlurToCanvas, cover: applyCoverToCanvas, sticker: applyStickerToCanvas };
      const toolNameMap = { mosaic: "馬賽克", blur: "霧化", cover: "色塊遮蓋", sticker: "貼圖覆蓋" };
      const effectFn = effectMap[state.tool] || applyMosaicToCanvas;
      const toolName = toolNameMap[state.tool] || "馬賽克";
      let appliedManualCount = 0;
      let appliedAiCount = 0;

      try {
        const affectedItems = state.photoItems.filter((item) => {
          const hasManual = item === activeItem && manualSelections.length > 0;
          const hasAi = (item.selectedFaces?.size || 0) > 0;
          return hasManual || hasAi;
        });
        setBatchProgress(0, affectedItems.length || 1, "套用遮罩");
        let appliedItemCount = 0;
        for (const item of state.photoItems) {
          throwIfOperationCancelled();
          await ensurePhotoCanvasLoaded(item);
          const selectedIndexes = [...(item.selectedFaces || new Set())]
            .filter((index) => Number.isInteger(index) && index >= 0 && index < (item.selections || []).length)
            .sort((a, b) => a - b);
          const aiSelections = selectedIndexes.map((index) => item.selections[index]).filter(Boolean);
          const itemManualSelections = item === activeItem ? manualSelections : [];
          const allRegions = [...itemManualSelections, ...aiSelections];

          if (!allRegions.length) continue;

          // 同一張照片的 AI + 手動遮罩合併成一次 history，Undo 一次即可復原這次套用。
          if (item.isMain) pushHistory(allRegions); else pushItemHistory(item, allRegions);
          allRegions.forEach((selection) => effectFn(item.canvas, selection));
          item.applied = true;
          item.outputBlob = null;
          item.downloaded = false;

          if (itemManualSelections.length) {
            appliedManualCount += itemManualSelections.length;
            item.manualSelections = [];
            item.manualSelection = null;
            item.activeManualIndex = -1;
            if (item === activeItem) state.selection = null;
          }

          if (selectedIndexes.length) {
            appliedAiCount += selectedIndexes.length;
            const selectedSet = new Set(selectedIndexes);
            // 已套用的 AI 框移除；沒有勾選的 AI 框完整保留，方便稍後再選取並使用同一按鈕套用。
            item.faces = (item.faces || []).filter((_, index) => !selectedSet.has(index));
            item.selections = (item.selections || []).filter((_, index) => !selectedSet.has(index));
            item.selectedFaces = new Set();
            item.activeAiFaceIndex = -1;
          }

          const photoIndex = state.photoItems.indexOf(item) + 1;
          const parts = [];
          if (itemManualSelections.length) parts.push(`手動 ${itemManualSelections.length} 個`);
          if (selectedIndexes.length) parts.push(`AI ${selectedIndexes.length} 張人臉`);
          item.statusEl.textContent = `第 ${photoIndex} 張｜已套用 ${parts.join("＋")}（${toolName}）`;
          if (item.metaEl && selectedIndexes.length) {
            item.metaEl.textContent = item.metaEl.textContent.replace(/｜已套用 \d+ 張人臉（[^）]+）/g, "");
          }
          refreshPhotoThumbnail(item);
          appliedItemCount += 1;
          setBatchProgress(appliedItemCount, affectedItems.length || 1, "套用遮罩");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        // 只要還有尚未套用的 AI 框，就持續保留 AI review 視窗。
        const hasRemainingAiFaces = state.photoItems.some((item) => (item.selections || []).length > 0);
        state.faceReviewMode = hasRemainingAiFaces;
        state.photoItems.forEach((item) => {
          if (hasRemainingAiFaces) drawFaceReview(item);
          else drawManualSelectionsForItem(item);
        });

        selectionInfo.textContent = "尚未框選範圍";
        const summary = [];
        if (appliedManualCount) summary.push(`手動框 ${appliedManualCount} 個`);
        if (appliedAiCount) summary.push(`AI 人臉 ${appliedAiCount} 張`);
        const remainingCount = state.photoItems.reduce((count, item) => count + (item.selections?.length || 0), 0);
        multiPhotoStatus.textContent = `已套用 ${summary.join("＋")}（${toolName}）${remainingCount ? `；尚有 ${remainingCount} 個 AI 人臉框可繼續選取。` : "。"}`;
        aiStatus.hidden = true;
        aiStatus.setAttribute("aria-hidden", "true");
        aiStatus.style.display = "none";
        showToast(`已套用 ${summary.join("＋")}（${toolName}）`);
      } catch (error) {
        if (isOperationCancelledError(error)) {
          multiPhotoStatus.textContent = `套用遮罩已停止；已完成的 ${appliedManualCount + appliedAiCount} 個遮罩會保留。`;
          showToast("套用遮罩已停止");
        } else {
          console.error("套用遮罩失敗", error);
          showToast(`套用遮罩失敗：${readableError(error)}`);
        }
      } finally {
        finishCancellableOperation();
        state.applyInProgress = false;
        state.multiProcessing = false;
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    }

    applyBtn.addEventListener("click", applyCurrentMasks);
    async function downloadPhotoItem(item) {
      await ensurePhotoCanvasLoaded(item);
      const blob = await canvasToBlob(item.canvas);
      downloadBlob(blob, `${safeBaseName(item.file.name)}-privacy.png`);
      item.downloaded = true;
      updatePhotoNavStatus(item);
      updatePhotoFilterUi();
    }
    function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}
    const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
    function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;} function u16(n){return new Uint8Array([n&255,(n>>>8)&255]);} function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);}
    async function makeZip(entries){
      const enc=new TextEncoder(),localParts=[],centrals=[];let offset=0;
      for(const e of entries){
        const name=enc.encode(e.name);
        const sourceBlob=e.blob instanceof Blob?e.blob:new Blob([e.blob]);
        // CRC32 仍需讀取內容，但 ZIP 本體直接引用原 Blob，避免再把整份資料保留成 Uint8Array。
        const bytes=new Uint8Array(await sourceBlob.arrayBuffer());
        const crc=crc32(bytes),size=sourceBlob.size;
        const localHeader=new Blob([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(name.length),u16(0),name]);
        localParts.push(localHeader,sourceBlob);
        const central=new Blob([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0),u32(crc),u32(size),u32(size),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);
        centrals.push(central);offset+=localHeader.size+size;
        await new Promise((resolve)=>setTimeout(resolve,0));
      }
      const centralSize=centrals.reduce((a,b)=>a+b.size,0);
      const end=new Blob([u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(centralSize),u32(offset),u16(0)]);
      return new Blob([...localParts,...centrals,end],{type:"application/zip"});
    }
    function getProjectPhotoSnapshot(item, index) {
      const hasPixelEdits = !!item.applied || !!item.hasUntrackedEdits || getHistoryForItem(item).length > 0;
      return {
        index,
        fileName: item.file?.name || `photo-${index + 1}.png`,
        fileType: item.file?.type || "application/octet-stream",
        sourceName: item.sourceName || safeBaseName(item.file?.name || `photo-${index + 1}`),
        originalEntry: `original/${String(index + 1).padStart(4, "0")}.bin`,
        currentEntry: null,
        currentMime: null,
        currentMatchesOriginal: !hasPixelEdits,
        faces: (item.faces || []).map((face) => ({ ...face })),
        selections: cloneSelections(item.selections || []),
        selectedFaces: [...(item.selectedFaces || [])],
        activeAiFaceIndex: item.activeAiFaceIndex ?? -1,
        aiSelectionsCustomized: !!item.aiSelectionsCustomized,
        detected: !!item.detected,
        applied: !!item.applied,
        engine: item.engine || "",
        manualSelections: cloneSelections(item.manualSelections || []),
        activeManualIndex: item.activeManualIndex ?? -1,
        downloaded: !!item.downloaded,
        hasUntrackedEdits: !!item.hasUntrackedEdits,
        statusText: item.statusEl?.textContent || "",
        metaText: item.metaEl?.textContent || ""
      };
    }

    async function customStickerToBlob() {
      if (!state.customSticker?.naturalWidth || !state.customSticker?.naturalHeight) return null;
      const canvas = document.createElement("canvas");
      canvas.width = state.customSticker.naturalWidth;
      canvas.height = state.customSticker.naturalHeight;
      canvas.getContext("2d").drawImage(state.customSticker, 0, 0);
      return canvasToBlob(canvas);
    }

    async function buildWorkProjectPackage({ progressLabel = "", createdAt = new Date().toISOString() } = {}) {
      syncActiveManualSelection(getActivePhotoItem());
      const entries = [];
      const photos = [];
      if (progressLabel) setBatchProgress(0, state.photoItems.length, progressLabel);
      for (let i = 0; i < state.photoItems.length; i++) {
        if (state.cancellableOperationLabel) throwIfOperationCancelled();
        const item = state.photoItems[i];
        const snapshot = getProjectPhotoSnapshot(item, i);
        entries.push({ name: snapshot.originalEntry, blob: item.file });
        if (!snapshot.currentMatchesOriginal) {
          await ensurePhotoCanvasLoaded(item);
          const encoded = await canvasToProjectSnapshot(item.canvas);
          snapshot.currentEntry = `current/${String(i + 1).padStart(4, "0")}.${encoded.extension}`;
          snapshot.currentMime = encoded.mime;
          snapshot.currentEncoding = encoded.encoding || encoded.extension;
          snapshot.currentBytes = encoded.blob.size || 0;
          if (encoded.compared) { snapshot.pngBytes = encoded.pngBytes || 0; snapshot.webpBytes = encoded.webpBytes || 0; }
          entries.push({ name: snapshot.currentEntry, blob: encoded.blob });
        }
        photos.push(snapshot);
        if (progressLabel) setBatchProgress(i + 1, state.photoItems.length, progressLabel);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const stickerBlob = await customStickerToBlob();
      if (stickerBlob) entries.push({ name: "assets/custom-sticker.png", blob: stickerBlob });
      const manifest = {
        format: PROJECT_FORMAT,
        schemaVersion: PROJECT_SCHEMA_VERSION,
        appVersion: "4.2",
        projectStorage: "optimized-v4-auto-snapshot",
        createdAt,
        activeIndex: Math.max(0, state.photoItems.indexOf(getActivePhotoItem())),
        photoFilter: state.photoFilter || "all",
        faceReviewMode: !!state.faceReviewMode,
        settings: getUserSettingsSnapshot(),
        hasCustomSticker: !!stickerBlob,
        photos
      };
      entries.unshift({ name: "manifest.json", blob: new Blob([JSON.stringify(manifest)], { type: "application/json" }) });
      const projectBlob = await makeZip(entries);
      return { projectBlob, manifest, photos };
    }

    async function saveWorkProject() {
      if (!state.photoItems.length || state.multiProcessing || state.autoBackupInProgress) return;
      state.multiProcessing = true; beginCancellableOperation("儲存工作"); updateButtons();
      try {
        const { projectBlob, photos } = await buildWorkProjectPackage({ progressLabel: "儲存工作" });
        multiPhotoStatus.textContent = "正在建立工作專案檔…";
        const d = new Date(), pad = (n) => String(n).padStart(2, "0");
        downloadBlob(projectBlob, `mk_photo_mask-work-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.mkpm`);
        const reusedOriginalCount = photos.filter((photo) => !photo.currentEntry).length;
        const webpCount = photos.filter((photo) => /webp/.test(photo.currentEncoding || "")).length;
        const pngCount = photos.filter((photo) => /png/.test(photo.currentEncoding || "")).length;
        const autoText = state.projectSnapshotFormat === "auto" ? `；自動比較結果：WebP ${webpCount} 張、PNG ${pngCount} 張` : "";
        multiPhotoStatus.textContent = `工作專案已儲存，共 ${state.photoItems.length} 張照片；${reusedOriginalCount} 張未修改照片不重複保存畫面副本${autoText}。`;
        showToast("工作專案已儲存（智慧壓縮完成）");
      } catch (error) {
        if (isOperationCancelledError(error)) { multiPhotoStatus.textContent = "儲存工作已停止，未產生專案檔。"; showToast("儲存工作已停止"); }
        else { console.error("儲存工作專案失敗", error); showToast(`儲存工作失敗：${readableError(error)}`); }
      } finally {
        finishCancellableOperation();
        state.multiProcessing = false;
        setBatchProgress(0, 0);
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    }

    async function readStoredProjectZip(file) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const decoder = new TextDecoder("utf-8");
      const entries = new Map();
      let offset = 0;
      while (offset + 4 <= bytes.length) {
        const signature = view.getUint32(offset, true);
        if (signature === 0x02014b50 || signature === 0x06054b50) break;
        if (signature !== 0x04034b50 || offset + 30 > bytes.length) throw new Error("不是有效的 mk_photo_mask 工作專案檔");
        const method = view.getUint16(offset + 8, true);
        const compressedSize = view.getUint32(offset + 18, true);
        const nameLength = view.getUint16(offset + 26, true);
        const extraLength = view.getUint16(offset + 28, true);
        if (method !== 0) throw new Error("此專案檔使用了不支援的壓縮格式");
        const nameStart = offset + 30;
        const dataStart = nameStart + nameLength + extraLength;
        const dataEnd = dataStart + compressedSize;
        if (dataEnd > bytes.length) throw new Error("工作專案檔內容不完整");
        const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));
        // 使用原始專案 File 的 slice，避免為每個 ZIP entry 再複製一份完整位元組。
        entries.set(name, file.slice(dataStart, dataEnd));
        offset = dataEnd;
      }
      return entries;
    }

    async function restoreProjectPhotoState(item, meta, currentBlob) {
      if (currentBlob) {
        const currentFile = new File([currentBlob], `current.${meta.currentMime === "image/webp" ? "webp" : "png"}`, { type: meta.currentMime || currentBlob.type || "image/png" });
        const currentCanvas = await fileToCanvas(currentFile);
        if (item.canvas.width !== currentCanvas.width || item.canvas.height !== currentCanvas.height) {
          item.canvas.width = currentCanvas.width; item.canvas.height = currentCanvas.height;
          item.overlay.width = currentCanvas.width; item.overlay.height = currentCanvas.height;
        }
        item.ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
        item.ctx.drawImage(currentCanvas, 0, 0, item.canvas.width, item.canvas.height);
      }
      // schema v2 若 currentBlob 為空，代表目前像素與原圖相同；loadMainPhoto/createAdditionalPreview 已載入原圖。
      item.overlayCtx.clearRect(0, 0, item.overlay.width, item.overlay.height);
      item.sourceName = meta.sourceName || safeBaseName(meta.fileName || "photo");
      item.faces = Array.isArray(meta.faces) ? meta.faces.map((face) => ({ ...face })) : [];
      item.selections = cloneSelections(Array.isArray(meta.selections) ? meta.selections : []);
      item.selectedFaces = new Set(Array.isArray(meta.selectedFaces) ? meta.selectedFaces : []);
      item.activeAiFaceIndex = Number.isInteger(meta.activeAiFaceIndex) ? meta.activeAiFaceIndex : -1;
      item.aiSelectionsCustomized = !!meta.aiSelectionsCustomized;
      item.detected = !!meta.detected;
      item.applied = !!meta.applied;
      item.engine = meta.engine || "";
      item.manualSelections = cloneSelections(Array.isArray(meta.manualSelections) ? meta.manualSelections : []);
      item.manualSelection = null;
      item.activeManualIndex = Number.isInteger(meta.activeManualIndex) ? meta.activeManualIndex : -1;
      item.history = [];
      item.redoHistory = [];
      item.downloaded = !!meta.downloaded;
      // 專案檔不保存龐大的 ImageData Undo patch；已套用修改改以 untracked 標記保留狀態。
      item.hasUntrackedEdits = !!meta.hasUntrackedEdits || !!meta.applied;
      item.outputBlob = null;
      if (item.statusEl && meta.statusText) item.statusEl.textContent = meta.statusText;
      if (item.metaEl && meta.metaText) item.metaEl.textContent = meta.metaText;
      refreshPhotoThumbnail(item);
    }

    async function loadWorkProject(file) {
      if (!file || state.multiProcessing || state.autoBackupInProgress) return false;
      if (state.photoItems.length && state.photoItems.some(isPhotoUnsaved)) {
        const ok = window.confirm("目前工作區還有尚未輸出的修改。\n\n載入工作專案會取代目前工作區，確定要繼續嗎？");
        if (!ok) return false;
      }
      state.multiProcessing = true; updateButtons();
      try {
        const entries = await readStoredProjectZip(file);
        const manifestBlob = entries.get("manifest.json");
        if (!manifestBlob) throw new Error("工作專案缺少 manifest.json");
        const manifest = JSON.parse(await manifestBlob.text());
        const schemaVersion = Number(manifest?.schemaVersion);
        if (manifest?.format !== PROJECT_FORMAT || !PROJECT_SUPPORTED_SCHEMA_VERSIONS.has(schemaVersion)) throw new Error("工作專案格式或版本不相容");
        if (!Array.isArray(manifest.photos) || !manifest.photos.length) throw new Error("工作專案沒有照片資料");
        manifest.photos.forEach((meta, index) => {
          if (!entries.has(meta?.originalEntry)) throw new Error(`第 ${index + 1} 張照片原始資料不完整`);
          if (meta?.currentEntry && !entries.has(meta.currentEntry)) throw new Error(`第 ${index + 1} 張照片處理資料不完整`);
        });

        clearAdditionalPreviews();
        setBatchProgress(0, manifest.photos.length, "載入工作");
        for (let i = 0; i < manifest.photos.length; i++) {
          const meta = manifest.photos[i] || {};
          const originalBlob = entries.get(meta.originalEntry);
          const currentBlob = meta.currentEntry ? entries.get(meta.currentEntry) : null;
          if (!originalBlob || (meta.currentEntry && !currentBlob)) throw new Error(`第 ${i + 1} 張照片資料不完整`);
          const originalFile = new File([originalBlob], meta.fileName || `photo-${i + 1}.png`, { type: meta.fileType || "application/octet-stream" });
          let item;
          if (i === 0) item = await loadMainPhoto(originalFile);
          else {
            const source = await fileToCanvas(originalFile);
            item = createAdditionalPreview(originalFile, source, i);
          }
          state.photoItems.push(item);
          await restoreProjectPhotoState(item, meta, currentBlob);
          setBatchProgress(i + 1, manifest.photos.length, "載入工作");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        if (manifest.settings) { applyUserSettingsSnapshot(manifest.settings); saveUserSettings(); }
        if (manifest.hasCustomSticker && entries.has("assets/custom-sticker.png")) {
          state.customSticker = await imageBlobToImage(entries.get("assets/custom-sticker.png"));
          state.customStickerRevision += 1;
          stickerStatus.textContent = "已從工作專案恢復自訂貼圖。";
        }

        state.faceReviewMode = state.photoItems.some((item) => (item.selections || []).length > 0);
        state.photoFilter = ["all", "original", "detected", "pending", "modified", "unsaved"].includes(manifest.photoFilter) ? manifest.photoFilter : "all";
        const activeIndex = Math.max(0, Math.min(state.photoItems.length - 1, Number(manifest.activeIndex) || 0));
        state.activePhotoItem = state.photoItems[activeIndex] || state.photoItems[0];
        const filteredAfterLoad = getFilteredPhotoItems();
        if (filteredAfterLoad.length && !filteredAfterLoad.includes(state.activePhotoItem)) state.activePhotoItem = filteredAfterLoad[0];
        state.history = state.photoItems[0]?.history || [];
        state.redoHistory = state.photoItems[0]?.redoHistory || [];
        state.originalImageData = null;
        updatePhotoItemLabels();
        renderPhotoNavigator();
        state.photoItems.forEach((item) => state.faceReviewMode ? drawFaceReview(item) : drawManualSelectionsForItem(item));
        activatePhotoItem(state.activePhotoItem);
        updatePhotoFilterUi();
        updateButtons();
        photoSummary.textContent = `共 ${state.photoItems.length} 張照片`;
        multiPhotoStatus.textContent = `已載入工作專案，共 ${state.photoItems.length} 張照片；Undo／Redo 會從本次工作重新開始。`;
        showToast(`已恢復 ${state.photoItems.length} 張照片的工作進度`);
        scheduleCanvasMemoryMaintenance();
        return true;
      } catch (error) {
        console.error("載入工作專案失敗", error);
        resetToEmptyPhotoState();
        showToast(`載入工作失敗：${readableError(error)}`);
        return false;
      } finally {
        state.multiProcessing = false;
        setBatchProgress(0, 0);
        updateButtons();
      }
    }

    function openAutoBackupDatabase() {
      return new Promise((resolve, reject) => {
        if (!window.indexedDB) { reject(new Error("目前瀏覽器不支援本機自動備份")); return; }
        const request = indexedDB.open(AUTO_BACKUP_DB_NAME, AUTO_BACKUP_DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(AUTO_BACKUP_STORE)) db.createObjectStore(AUTO_BACKUP_STORE, { keyPath: "id" });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("無法開啟自動備份資料庫"));
      });
    }

    async function readAutoBackupRecord() {
      const db = await openAutoBackupDatabase();
      try {
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(AUTO_BACKUP_STORE, "readonly");
          const request = tx.objectStore(AUTO_BACKUP_STORE).get(AUTO_BACKUP_KEY);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error || new Error("讀取自動備份失敗"));
        });
      } finally { db.close(); }
    }

    async function writeAutoBackupRecord(record) {
      const db = await openAutoBackupDatabase();
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(AUTO_BACKUP_STORE, "readwrite");
          tx.objectStore(AUTO_BACKUP_STORE).put(record);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error("寫入自動備份失敗"));
          tx.onabort = () => reject(tx.error || new Error("自動備份已中止"));
        });
      } finally { db.close(); }
    }

    async function deleteAutoBackupRecord() {
      const db = await openAutoBackupDatabase();
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(AUTO_BACKUP_STORE, "readwrite");
          tx.objectStore(AUTO_BACKUP_STORE).delete(AUTO_BACKUP_KEY);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error || new Error("清除自動備份失敗"));
        });
      } finally { db.close(); }
    }

    function formatAutoBackupTime(timestamp) {
      if (!timestamp) return "";
      try {
        return new Intl.DateTimeFormat("zh-TW", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hour12:false }).format(new Date(timestamp));
      } catch (_) { return new Date(timestamp).toLocaleString(); }
    }

    function setAutoBackupStatus(message, kind = "idle") {
      if (!autoBackupStatus) return;
      autoBackupStatus.textContent = message;
      autoBackupStatus.dataset.kind = kind;
    }

    function formatByteSize(bytes) {
      const value = Number(bytes || 0);
      if (!value) return "0 MB";
      if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
      return `${(value / (1024 * 1024)).toFixed(value >= 100 * 1024 * 1024 ? 0 : 1)} MB`;
    }

    async function refreshBackupStorageInfo() {
      if (!backupStorageInfo) return;
      const backupText = state.autoBackupSizeBytes ? `最近備份 ${formatByteSize(state.autoBackupSizeBytes)}` : "尚無本機備份";
      try {
        if (!navigator.storage?.estimate) { backupStorageInfo.textContent = `備份容量：${backupText}`; return; }
        const estimate = await navigator.storage.estimate();
        const usage = Number(estimate.usage || 0);
        const quota = Number(estimate.quota || 0);
        if (!quota) { backupStorageInfo.textContent = `備份容量：${backupText}`; return; }
        const ratio = quota ? usage / quota : 0;
        const percent = Math.min(100, Math.round(ratio * 100));
        backupStorageInfo.dataset.level = ratio >= BACKUP_STORAGE_DANGER_RATIO ? "danger" : ratio >= BACKUP_STORAGE_WARN_RATIO ? "warn" : "ok";
        const warning = ratio >= BACKUP_STORAGE_DANGER_RATIO ? "｜⚠ 空間接近上限" : ratio >= BACKUP_STORAGE_WARN_RATIO ? "｜空間使用偏高" : "";
        backupStorageInfo.textContent = `備份容量：${backupText}｜本站儲存 ${formatByteSize(usage)} / ${formatByteSize(quota)}（${percent}%）${warning}`;
      } catch (_) {
        backupStorageInfo.textContent = `備份容量：${backupText}`;
      }
    }

    function roundSelectionForFingerprint(selection) {
      if (!selection) return null;
      return [Math.round(selection.x || 0), Math.round(selection.y || 0), Math.round(selection.width || 0), Math.round(selection.height || 0), selection.shape || "rect"];
    }

    function getWorkspaceBackupFingerprint() {
      const photos = state.photoItems.map((item) => ({
        f: getPhotoFileSignature(item.file),
        d: !!item.detected,
        a: !!item.applied,
        e: item.engine || "",
        o: !!item.downloaded,
        u: !!item.hasUntrackedEdits,
        h: getHistoryForItem(item).length,
        r: getRedoHistoryForItem(item).length,
        sf: [...(item.selectedFaces || [])].sort((a,b)=>a-b),
        ai: (item.selections || []).map(roundSelectionForFingerprint),
        m: ensureManualSelections(item).map(roundSelectionForFingerprint)
      }));
      return JSON.stringify({
        p: photos,
        active: Math.max(0, state.photoItems.indexOf(getActivePhotoItem())),
        filter: state.photoFilter || "all",
        faceReview: !!state.faceReviewMode,
        settings: getUserSettingsSnapshot(),
        sticker: state.customStickerRevision
      });
    }

    async function refreshAutoBackupAvailability() {
      try {
        const record = await readAutoBackupRecord();
        state.autoBackupAvailable = !!record?.blob;
        state.autoBackupSizeBytes = Number(record?.blob?.size || 0);
        state.autoBackupLastSavedAt = Number(record?.savedAt || 0);
        state.autoBackupLastFingerprint = String(record?.fingerprint || "");
        state.autoBackupError = "";
        if (state.autoBackupAvailable) {
          const prefix = autoBackupEnabled?.checked ? "自動備份" : "備份已保留";
          setAutoBackupStatus(`${prefix}：${formatAutoBackupTime(state.autoBackupLastSavedAt)}`, "ok");
        } else {
          setAutoBackupStatus(autoBackupEnabled?.checked ? "自動備份：等待工作變更" : "自動備份：已停用", "idle");
        }
      } catch (error) {
        state.autoBackupAvailable = false;
        state.autoBackupSizeBytes = 0;
        state.autoBackupError = readableError(error);
        setAutoBackupStatus("自動備份無法使用", "error");
        if (autoBackupEnabled) autoBackupEnabled.checked = false;
      }
      refreshBackupStorageInfo();
      updateButtons();
    }

    function hasWorkspaceWorkToBackup() {
      if (state.customSticker) return true;
      return state.photoItems.some((item) =>
        !!item.detected || !!item.applied || !!item.hasUntrackedEdits ||
        (item.selectedFaces?.size || 0) > 0 ||
        (item.selections?.length || 0) > 0 ||
        ensureManualSelections(item).length > 0 ||
        getHistoryForItem(item).length > 0 || getRedoHistoryForItem(item).length > 0
      );
    }

    async function runAutoBackup({ force = false, allowDisabled = false } = {}) {
      if ((!autoBackupEnabled?.checked && !allowDisabled) || !state.photoItems.length || state.autoBackupInProgress || state.multiProcessing || state.faceDetecting || state.applyInProgress) return false;
      if (!force && !hasWorkspaceWorkToBackup()) return false;
      const now = Date.now();
      if (!force && now - state.lastUserActivityAt < AUTO_BACKUP_IDLE_MS) return false;
      if (!force && state.autoBackupLastSavedAt && now - state.autoBackupLastSavedAt < AUTO_BACKUP_MIN_INTERVAL_MS) return false;
      const fingerprint = getWorkspaceBackupFingerprint();
      if (!force && fingerprint === state.autoBackupLastFingerprint) return false;

      try {
        if (navigator.storage?.estimate) {
          const estimate = await navigator.storage.estimate();
          const usage = Number(estimate.usage || 0), quota = Number(estimate.quota || 0);
          if (!force && quota && usage / quota >= BACKUP_STORAGE_DANGER_RATIO) {
            setAutoBackupStatus("備份空間接近上限，請先清理", "error");
            refreshBackupStorageInfo();
            return false;
          }
        }
      } catch (_) {}
      state.autoBackupInProgress = true;
      setAutoBackupStatus("自動備份中…", "busy");
      updateButtons();
      try {
        const { projectBlob } = await buildWorkProjectPackage({ createdAt: new Date(now).toISOString() });
        await writeAutoBackupRecord({
          id: AUTO_BACKUP_KEY,
          blob: projectBlob,
          savedAt: now,
          fingerprint,
          photoCount: state.photoItems.length,
          appVersion: "4.2"
        });
        state.autoBackupAvailable = true;
        state.autoBackupSizeBytes = Number(projectBlob.size || 0);
        state.autoBackupLastSavedAt = now;
        state.autoBackupLastFingerprint = fingerprint;
        state.autoBackupError = "";
        setAutoBackupStatus(`${force && allowDisabled ? "立即備份" : "自動備份"}：${formatAutoBackupTime(now)}`, "ok");
        refreshBackupStorageInfo();
        return true;
      } catch (error) {
        state.autoBackupError = readableError(error);
        console.warn("自動備份失敗", error);
        if (error?.name === "QuotaExceededError") {
          if (autoBackupEnabled) autoBackupEnabled.checked = false;
          localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, "0");
          setAutoBackupStatus("備份空間不足，已停用", "error");
        } else {
          setAutoBackupStatus("自動備份失敗", "error");
        }
        refreshBackupStorageInfo();
        return false;
      } finally {
        state.autoBackupInProgress = false;
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    }

    async function restoreLatestAutoBackup() {
      if (state.autoBackupInProgress || state.multiProcessing || state.faceDetecting) return;
      try {
        const record = await readAutoBackupRecord();
        if (!record?.blob) { state.autoBackupAvailable = false; updateButtons(); showToast("目前沒有可恢復的自動備份"); return; }
        const backupFile = new File([record.blob], `mk_photo_mask-auto-backup-${record.savedAt || Date.now()}.mkpm`, { type:"application/zip" });
        const restored = await loadWorkProject(backupFile);
        if (restored) {
          state.autoBackupAvailable = true;
          state.autoBackupSizeBytes = Number(record.blob?.size || 0);
          state.autoBackupLastSavedAt = Number(record.savedAt || Date.now());
          state.autoBackupLastFingerprint = getWorkspaceBackupFingerprint();
          setAutoBackupStatus(`已恢復：${formatAutoBackupTime(state.autoBackupLastSavedAt)}`, "ok");
          refreshBackupStorageInfo();
          multiPhotoStatus.textContent = `已從本機自動備份恢復 ${state.photoItems.length} 張照片。`;
          showToast("已從本機自動備份恢復工作");
        }
      } catch (error) {
        console.error("恢復自動備份失敗", error);
        showToast(`恢復備份失敗：${readableError(error)}`);
      } finally { updateButtons(); }
    }

    async function clearLatestAutoBackup() {
      if (!state.autoBackupAvailable || state.autoBackupInProgress) return;
      if (!window.confirm("確定要清理本機備份空間嗎？\n\n只會刪除瀏覽器中的復原備份，不會影響目前工作區與電腦中的原始照片。")) return;
      try {
        await deleteAutoBackupRecord();
        state.autoBackupAvailable = false;
        state.autoBackupSizeBytes = 0;
        state.autoBackupLastSavedAt = 0;
        state.autoBackupLastFingerprint = "";
        setAutoBackupStatus(autoBackupEnabled?.checked ? "自動備份：等待工作變更" : "自動備份：已停用", "idle");
        refreshBackupStorageInfo();
        showToast("本機備份空間已清理");
      } catch (error) {
        showToast(`清除備份失敗：${readableError(error)}`);
      } finally { updateButtons(); }
    }

    function initializeAutoBackup() {
      const saved = localStorage.getItem(AUTO_BACKUP_ENABLED_KEY);
      if (autoBackupEnabled) autoBackupEnabled.checked = saved !== "0";
      ["pointerdown", "keydown", "input", "change"].forEach((eventName) => {
        document.addEventListener(eventName, () => { state.lastUserActivityAt = Date.now(); }, { capture:true, passive:true });
      });
      autoBackupEnabled?.addEventListener("change", () => {
        localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, autoBackupEnabled.checked ? "1" : "0");
        state.lastUserActivityAt = Date.now();
        if (autoBackupEnabled.checked) {
          setAutoBackupStatus(state.autoBackupAvailable ? `自動備份：${formatAutoBackupTime(state.autoBackupLastSavedAt)}` : "自動備份：等待工作變更", state.autoBackupAvailable ? "ok" : "idle");
        } else {
          setAutoBackupStatus(state.autoBackupAvailable ? `備份已保留：${formatAutoBackupTime(state.autoBackupLastSavedAt)}` : "自動備份：已停用", state.autoBackupAvailable ? "ok" : "idle");
        }
      });
      restoreAutoBackupBtn?.addEventListener("click", restoreLatestAutoBackup);
      clearAutoBackupBtn?.addEventListener("click", clearLatestAutoBackup);
      backupNowBtn?.addEventListener("click", async () => {
        if (!state.photoItems.length || state.autoBackupInProgress || state.multiProcessing || state.faceDetecting) return;
        const ok = await runAutoBackup({ force:true, allowDisabled:true });
        if (ok) { multiPhotoStatus.textContent = `已立即建立本機恢復備份，共 ${state.photoItems.length} 張照片。`; showToast("本機備份已更新"); }
      });
      refreshAutoBackupAvailability();
      setInterval(() => { runAutoBackup().catch((error) => console.warn("自動備份排程失敗", error)); }, AUTO_BACKUP_CHECK_MS);
    }

    initializeAutoBackup();

    saveProjectBtn?.addEventListener("click", saveWorkProject);
    loadProjectBtn?.addEventListener("click", () => projectFileInput?.click());
    projectFileInput?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) await loadWorkProject(file);
    });
    downloadAllZipBtn.addEventListener("click", async () => {
      if (!state.photoItems.length) return;
      state.multiProcessing = true;
      beginCancellableOperation("全部下載");
      downloadAllZipBtn.disabled = true;
      multiPhotoStatus.textContent = "正在建立 ZIP…";
      setBatchProgress(0, state.photoItems.length, "準備下載");
      try {
        const entries = [];
        for (let i = 0; i < state.photoItems.length; i++) {
          throwIfOperationCancelled();
          const item = state.photoItems[i];
          await ensurePhotoCanvasLoaded(item);
          entries.push({ name: `${safeBaseName(item.file.name)}-privacy.png`, blob: await canvasToBlob(item.canvas) });
          setBatchProgress(i + 1, state.photoItems.length, "準備下載");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
        multiPhotoStatus.textContent = "正在打包 ZIP…";
        const zip = await makeZip(entries), d = new Date(), pad = (n) => String(n).padStart(2, "0");
        downloadBlob(zip, `privacy-photos-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.zip`);
        state.photoItems.forEach((item) => { item.downloaded = true; updatePhotoNavStatus(item); });
        updatePhotoFilterUi();
        multiPhotoStatus.textContent = `ZIP 已建立，共 ${entries.length} 張。`;
        showToast("ZIP 已下載");
      } catch (error) {
        if (isOperationCancelledError(error)) { multiPhotoStatus.textContent = "全部下載已停止，尚未完成 ZIP。"; showToast("全部下載已停止"); }
        else { console.error("全部下載失敗", error); showToast(`全部下載失敗：${readableError(error)}`); }
      } finally { finishCancellableOperation(); state.multiProcessing = false; updateButtons(); }
    });

    /* =========================================================
       7. 復原、重設與下載
       ========================================================= */

    function captureCurrentPatchGroup(item, patchGroup) {
      const ctx = item?.ctx || mainCtx;
      return (patchGroup || []).map((patch) => ({
        x: patch.x,
        y: patch.y,
        imageData: ctx.getImageData(patch.x, patch.y, patch.imageData.width, patch.imageData.height)
      }));
    }

    function applyPatchGroup(item, patchGroup) {
      const ctx = item?.ctx || mainCtx;
      (patchGroup || []).forEach((patch) => ctx.putImageData(patch.imageData, patch.x, patch.y));
      if (!item) return;
      item.manualSelections = [];
      item.manualSelection = null;
      item.activeManualIndex = -1;
      state.selection = null;
      item.overlayCtx.clearRect(0, 0, item.overlay.width, item.overlay.height);
      if (state.faceReviewMode) drawFaceReview(item);
      else drawManualSelectionsForItem(item);
      refreshPhotoThumbnail(item);
      selectionInfo.textContent = "尚未框選範圍";
    }

    undoBtn.addEventListener("click", () => {
      const item = getActivePhotoItem();
      const history = getHistoryForItem(item);
      const previous = history.pop();
      if (!previous) { showToast("目前沒有可復原的步驟"); return; }
      const redoGroup = captureCurrentPatchGroup(item, previous);
      const redoHistory = getRedoHistoryForItem(item);
      redoHistory.push(redoGroup);
      if (redoHistory.length > MAX_HISTORY) redoHistory.shift();
      enforceHistoryMemoryBudget(item);
      applyPatchGroup(item, previous);
      item.applied = history.length > 0 || !!item.hasUntrackedEdits;
      item.outputBlob = null;
      item.downloaded = false;
      item.statusEl.textContent = `第 ${state.photoItems.indexOf(item)+1} 張｜已復原上一個步驟`;
      updateButtons();
      showToast(`第 ${Math.max(1,state.photoItems.indexOf(item)+1)} 張已復原上一個步驟`);
    });

    redoBtn.addEventListener("click", () => {
      const item = getActivePhotoItem();
      const redoHistory = getRedoHistoryForItem(item);
      const next = redoHistory.pop();
      if (!next) { showToast("目前沒有可重做的步驟"); return; }
      const undoGroup = captureCurrentPatchGroup(item, next);
      const history = getHistoryForItem(item);
      history.push(undoGroup);
      if (history.length > MAX_HISTORY) history.shift();
      enforceHistoryMemoryBudget(item);
      applyPatchGroup(item, next);
      item.applied = true;
      item.outputBlob = null;
      item.downloaded = false;
      item.statusEl.textContent = `第 ${state.photoItems.indexOf(item)+1} 張｜已重做上一個步驟`;
      updateButtons();
      showToast(`第 ${Math.max(1,state.photoItems.indexOf(item)+1)} 張已重做上一個步驟`);
    });

    resetBtn.addEventListener("click", async () => {
      if (!state.photoItems.length || state.multiProcessing) return;

      const photoCount = state.photoItems.length;
      const confirmed = window.confirm(
        photoCount > 1
          ? `確定要全部重來嗎？\n\n目前 ${photoCount} 張照片的 AI 辨識、遮罩、手動框選與復原紀錄都會清除，並回到剛載入時的初始狀態。`
          : "確定要全部重來嗎？\n\n目前照片的 AI 辨識、遮罩、手動框選與復原紀錄都會清除，並回到剛載入時的初始狀態。"
      );
      if (!confirmed) return;

      state.faceReviewMode = false;
      state.faceDetecting = false;
      state.multiProcessing = true;
      beginCancellableOperation("全部重來");
      state.selection = null;
      clearInteraction();
      setBatchProgress(0, photoCount, "全部重來");
      updateButtons();

      try {
        for (let index = 0; index < state.photoItems.length; index++) {
          throwIfOperationCancelled();
          const item = state.photoItems[index];
          await restoreItemOriginalPixels(item);
          clearPhotoTransientState(item);
          if (item.statusEl) item.statusEl.textContent = item.originalStatusText || `第 ${index + 1} 張｜${item.file.name}`;
          if (item.metaEl) item.metaEl.textContent = item.originalMetaText || `${item.canvas.width} × ${item.canvas.height} px｜本機處理`;
          refreshPhotoThumbnail(item);
          setBatchProgress(index + 1, photoCount, "全部重來");
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        state.history = [];
        state.redoHistory = [];
        state.originalImageData = null;
        state.activePhotoItem = state.photoItems[0] || null;
        firstFaceControls.hidden = true;
        firstFaceControls.innerHTML = "";
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        selectionInfo.textContent = "尚未框選範圍";
        multiPhotoStatus.textContent = state.photoItems.length > 1
          ? `已全部重來，${state.photoItems.length} 張照片都回到初始狀態。`
          : "已全部重來，照片已回到初始狀態。";
        setAiStatus("idle", "已全部重來", `已將 ${state.photoItems.length} 張照片恢復到初始狀態；可重新進行 AI 辨識或手動框選。`);
        renderPhotoNavigator();
        syncPhotoNavigatorActive();
        showToast(state.photoItems.length > 1 ? `已全部重來 ${state.photoItems.length} 張照片` : "已全部重來");
      } catch (error) {
        if (isOperationCancelledError(error)) { multiPhotoStatus.textContent = "全部重來已停止；已完成重設的照片維持原始狀態。"; showToast("全部重來已停止"); }
        else { console.error("全部重來失敗", error); showToast(`全部重來失敗：${readableError(error)}`); }
      } finally {
        finishCancellableOperation();
        state.multiProcessing = false;
        setBatchProgress(0, 0);
        updateButtons();
        scheduleCanvasMemoryMaintenance();
      }
    });

    clearSelectionBtn.addEventListener("click", () => {
      clearManualSelections(getActivePhotoItem(), true);
    });

    downloadBtn.addEventListener("click", async () => {
      if (!state.photoItems.length) return;

      // 單張照片直接下載；多張照片則與上方 全部下載使用相同批次打包功能。
      if (state.photoItems.length === 1) {
        await downloadPhotoItem(state.photoItems[0]);
        showToast("圖片已下載");
        return;
      }

      downloadAllZipBtn.click();
    });

    window.addEventListener("beforeunload", (event) => {
      if (!state.photoItems.some(isPhotoUnsaved)) return;
      event.preventDefault();
      event.returnValue = "";
    });

    /* =========================================================
       8. 鍵盤快捷鍵
       ========================================================= */

    window.addEventListener("keydown", (event) => {
      const activeTag = document.activeElement?.tagName;
      const isTyping = ["INPUT", "SELECT", "TEXTAREA"].includes(activeTag);

      if (event.key === "Escape" && state.cancellableOperationLabel && !state.cancelRequested) {
        event.preventDefault();
        cancelOperationBtn?.click();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redoBtn.click();
        else undoBtn.click();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redoBtn.click();
        return;
      }

      if (isTyping) return;

      if (event.key === "Delete" || event.key === "Backspace") {
        const activeItem = getActivePhotoItem();
        // Delete / Backspace 僅刪除手動框；即使 AI 人臉框正在顯示也可使用。
        if (state.selection) {
          event.preventDefault();
          deleteActiveManualSelection(activeItem, true);
          return;
        }
      }

      // 方向鍵可微調目前選中的框；按住 Shift 時一次移動 10 像素。
      if (
        state.selection &&
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const next = cloneSelection(state.selection);

        if (event.key === "ArrowUp") next.y -= step;
        if (event.key === "ArrowDown") next.y += step;
        if (event.key === "ArrowLeft") next.x -= step;
        if (event.key === "ArrowRight") next.x += step;

        const activeItem = getActivePhotoItem();
        const activeCanvas = activeItem?.overlay || overlayCanvas;
        next.x = clamp(next.x, 0, Math.max(0, activeCanvas.width - next.width));
        next.y = clamp(next.y, 0, Math.max(0, activeCanvas.height - next.height));

        state.selection = next;
        syncActiveManualSelection(activeItem);
        if (activeItem) drawManualSelectionsForItem(activeItem);
        updateSelectionInfo();
        if (activeItem?.statusEl) activeItem.statusEl.textContent = "已使用方向鍵微調目前選取框";
        return;
      }

      if (event.key === "Enter" && !applyBtn.disabled) {
        event.preventDefault();
        applyCurrentMasks();
      }

      if (event.key === "Escape") {
        const item = getActivePhotoItem();
        if (item) {
          if (state.selection && item.activeManualIndex >= 0) {
            item.activeManualIndex = -1;
            state.selection = null;
            drawManualSelectionsForItem(item);
            updateSelectionInfoForItem(item);
            updateButtons();
            showToast("已取消目前手動框的選取；其他框仍保留");
          } else if (state.faceReviewMode && item.activeAiFaceIndex >= 0) {
            item.activeAiFaceIndex = -1;
            drawFaceReview(item);
            showToast("已取消目前 AI 人臉框的選取");
          }
        }
      }
    });

    // 啟動後直接自動檢查主要離線 AI 與 dlib Lite，結果合併顯示在上方狀態欄。
    window.addEventListener("load", () => {
      setTimeout(async () => {
        try {
          renderUnifiedAiEnvironmentState();
          await checkOfflineAi();
          await checkAdvancedAiHelper({ quiet: true });
          renderUnifiedAiEnvironmentState();
        } catch (error) {
          setMainAiEnvironmentState(false, `離線 AI 自動檢查失敗｜${readableError(error)}`);
          setAiStatus("error", "啟動 AI 自我檢查失敗", readableError(error));
        }
      }, 250);
    });
  