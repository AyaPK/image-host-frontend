"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";

function classNames(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

// Generate a 7-character case-sensitive ID using crypto-safe randomness
const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
function randomId(length = 7) {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ID_ALPHABET[buf[i] % ID_ALPHABET.length];
  }
  return out;
}

export default function UploadPage() {
  const { db, storage } = getFirebase();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    id: string;
    viewUrl: string;
    downloadURL: string;
  } | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const file = files[0];
      if (!file) return;
      setError(null);
      setResult(null);
      setUploading(true);
      setProgress(0);
      try {
        const id = randomId(7);
        // Derive a safe extension. Prefer the original filename's extension, then fall back to MIME type.
        const originalExt = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
        const mimeExtMap: Record<string, string> = {
          "image/jpeg": "jpg",
          "image/jpg": "jpg",
          "image/png": "png",
          "image/gif": "gif",
          "image/webp": "webp",
          "image/svg+xml": "svg",
          "image/heic": "heic",
          "image/heif": "heif",
          "image/bmp": "bmp",
          "image/tiff": "tiff",
        };
        const fallbackExt = mimeExtMap[file.type] || "";
        const ext = (originalExt || fallbackExt).replace(/[^a-z0-9]/g, "");
        const path = `${id}${ext ? "." + ext : ""}`;
        const ref = storageRef(storage, path);
        const task = uploadBytesResumable(ref, file, { contentType: file.type });

        await new Promise<void>((resolve, reject) => {
          task.on(
            "state_changed",
            (snap) => {
              if (snap.totalBytes) {
                setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
              }
            },
            (err) => reject(err),
            () => resolve()
          );
        });

        const url = await getDownloadURL(ref);
        const meta = {
          id,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          storagePath: path,
          downloadURL: url,
          createdAt: serverTimestamp(),
        } as const;
        await setDoc(doc(db, "images", id), meta);

        setResult({ id, viewUrl: `/i/${id}`, downloadURL: url });
      } catch (e: any) {
        setError(e?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [db, storage]
  );

  const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const onDrop = useCallback<React.DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const f = e.dataTransfer.files;
      if (f && f.length > 0) handleFiles(f);
    },
    [handleFiles]
  );

  const onDragOver = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const onDragLeave = useCallback<React.DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const buttonText = useMemo(() => {
    if (uploading) return `Uploading ${progress}%`;
    if (result) return "Upload another";
    return "Choose file";
  }, [uploading, progress, result]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload an image</h1>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={classNames(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        )}
      >
        <p className="mb-3 text-gray-600">Drag & drop a file here</p>
        <p className="mb-6 text-gray-500">or</p>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={classNames(
            "px-4 py-2 rounded bg-blue-600 text-white",
            uploading && "opacity-60"
          )}
        >
          {buttonText}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error && (
        <div className="mt-4 rounded bg-red-50 text-red-700 p-3">{error}</div>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className="h-2 bg-blue-600 rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}%</p>
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-2">
          <p className="text-green-700">Upload complete!</p>
          <div className="flex items-center gap-3">
            <a className="text-blue-600 underline" href={result.viewUrl}>
              View page
            </a>
            <a className="text-blue-600 underline" href={result.downloadURL} target="_blank">
              Direct link
            </a>
          </div>
          <p className="text-gray-500 text-sm">Shareable page: {result.viewUrl}</p>
        </div>
      )}
    </div>
  );
}

