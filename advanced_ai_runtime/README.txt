This folder is reserved for the built-in dlib Lite runtime.

After running advanced-ai-helper\prepare-bundled-runtime.cmd on Windows,
this folder should contain:
- python.exe
- advanced_ai_helper.py
- Lib\site-packages\dlib*.pyd
- numpy / Pillow and related files

build-windows-singlefile.cmd will automatically package this folder into
the final mk_photo_mask_v3.2.exe because it copies the whole app folder.
