"use client";

import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

type ImageDoc = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  storagePath: string;
  downloadURL: string;
  createdAt?: any;
};

export default function ImagePage({ params }: { params: { id: string } }) {
  const { db } = getFirebase();
  const [img, setImg] = useState<ImageDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "images", params.id));
        if (!snap.exists()) {
          if (isMounted) setError("Image not found");
          return;
        }
        const data = snap.data() as ImageDoc;
        if (isMounted) setImg(data);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Failed to load image");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [db, params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="text-red-700">{error}</p>
        <Link className="text-blue-600 underline" href="/upload">
          Upload an image
        </Link>
      </div>
    );
  }

  if (!img) return null;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold truncate">{img.filename}</h1>
        <div className="flex items-center gap-3">
          <a className="text-blue-600 underline" href={img.downloadURL} target="_blank">
            Direct link
          </a>
          <Link className="text-blue-600 underline" href="/upload">
            Upload another
          </Link>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.downloadURL}
          alt={img.filename}
          className="mx-auto max-h-[70vh] object-contain"
        />
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Content type: {img.contentType}</p>
        <p>Size: {(img.size / 1024).toFixed(1)} KB</p>
        <p>Storage path: {img.storagePath}</p>
      </div>
    </div>
  );
}
