#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""mk_photo_mask V3.5 optional local dlib Lite helper.

Local-only HTTP helper. Listens on 127.0.0.1:8777.
Uses dlib.get_frontal_face_detector() (HOG) only to supplement
the main MediaPipe / FaceAPI pipeline by catching possible missed faces.
"""
from __future__ import annotations

import argparse
import io
import json
import sys
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

try:
    import dlib
    import numpy as np
    from PIL import Image, ImageOps
except Exception as exc:  # pragma: no cover
    print(f"[FATAL] Cannot import dlib lite stack: {exc}", file=sys.stderr)
    raise

MAX_BODY = 80 * 1024 * 1024
DETECTOR = dlib.get_frontal_face_detector()


def json_bytes(payload: dict) -> bytes:
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def load_rgb_image(raw: bytes):
    with Image.open(io.BytesIO(raw)) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        return np.asarray(image)


class Handler(BaseHTTPRequestHandler):
    server_version = "mk_photo_mask-advanced-ai/2.5"

    def log_message(self, fmt, *args):
        print("[advanced-ai] " + (fmt % args))

    def _send(self, code: int, payload: dict):
        body = json_bytes(payload)
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Image-Name")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(200, {"ok": True})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            self._send(200, {
                "ok": True,
                "service": "mk_photo_mask advanced-ai-helper",
                "version": "3.5",
                "dlib_version": getattr(dlib, "__version__", "unknown"),
                "model": "dlib Lite HOG",
                "runtime": "builtin-runtime or helper-exe",
                "bind": "127.0.0.1",
            })
            return
        self._send(404, {"ok": False, "error": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/detect":
            self._send(404, {"ok": False, "error": "Not Found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY:
            self._send(413, {"ok": False, "error": "Image body is empty or too large"})
            return

        try:
            query = parse_qs(parsed.query)
            upsample = max(0, min(3, int(query.get("upsample", ["1"])[0])))
            raw = self.rfile.read(length)
            image = load_rgb_image(raw)
            dets = DETECTOR(image, upsample)
            height, width = image.shape[:2]
            faces = []
            for det in dets:
                left = max(0, min(int(det.left()), width - 1))
                top = max(0, min(int(det.top()), height - 1))
                right = max(left + 1, min(int(det.right()) + 1, width))
                bottom = max(top + 1, min(int(det.bottom()) + 1, height))
                faces.append({
                    "x": left,
                    "y": top,
                    "width": right - left,
                    "height": bottom - top,
                    "score": 0,
                    "source": "dlib-hog-lite",
                })

            self._send(200, {
                "ok": True,
                "width": width,
                "height": height,
                "count": len(faces),
                "model": "dlib Lite HOG",
                "upsample": upsample,
                "faces": faces,
            })
        except Exception as exc:
            traceback.print_exc()
            self._send(500, {"ok": False, "error": str(exc)})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8777)
    args = parser.parse_args()
    if args.host not in {"127.0.0.1", "localhost"}:
        raise SystemExit("For privacy, advanced_ai_helper only allows loopback binding.")
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"mk_photo_mask V3.5 advanced AI helper: http://127.0.0.1:{args.port}/")
    print("Local-only; image bytes are processed in memory and never uploaded.")
    print(f"Using dlib version: {getattr(dlib, '__version__', 'unknown')} (Lite HOG detector)")
    try:
        server.serve_forever(poll_interval=0.5)
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
