"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebase } from "@/lib/firebase";
import {
  collection,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
} from "firebase/firestore";

type ImageDoc = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  storagePath: string;
  downloadURL: string;
  createdAt?: DocumentData; // Firestore Timestamp (serverTimestamp)
};

export default function Home() {
  const { db } = getFirebase();
  const [items, setItems] = useState<ImageDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(
        collection(db, "images"),
        orderBy("createdAt", "desc"),
        fsLimit(15)
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const rows: ImageDoc[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
          setItems(rows);
        },
        (err) => setError(err?.message || "Failed to load images")
      );
      return () => unsub();
    } catch (e: any) {
      setError(e?.message || "Failed to load images");
    }
  }, [db]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Recent uploads</h1>
        <Link
          href="/upload"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Upload an image
        </Link>
      </div>

      {error && (
        <div className="rounded bg-red-50 text-red-700 p-3 mb-4">{error}</div>
      )}

      {items === null && !error && (
        <p className="text-gray-600">Loading latest images…</p>
      )}

      {items && items.length === 0 && (
        <p className="text-gray-600">No images yet. Be the first to upload!</p>
      )}

      {items && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((img) => (
            <div key={img.id} className="border rounded overflow-hidden bg-white shadow-sm">
              {/* Using plain <img> to avoid Next Image remote domain config in dev/emulator */}
              <a href={`/i/${img.id}`}>
                <img
                  src={img.downloadURL}
                  alt={img.filename || "Image"}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              </a>
              <div className="p-2 text-sm flex items-center justify-between gap-2">
                <a className="text-blue-600 underline" href={`/i/${img.id}`}>
                  View
                </a>
                <a
                  className="text-blue-600 underline"
                  href={img.downloadURL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Direct
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
