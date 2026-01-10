"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface WeddingData {
  slug: string;
  brideName: string;
  groomName: string;
  eventDate: string;
  venueName: string;
  coverImageUrl: string;
  coverImagePublicId: string;
}

export default function AdminEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<WeddingData>({
    slug: "",
    brideName: "",
    groomName: "",
    eventDate: "",
    venueName: "",
    coverImageUrl: "",
    coverImagePublicId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchWedding() {
      try {
        const response = await fetch(`/api/admin/weddings/${slug}`);

        if (!response.ok) {
          setError("Wedding not found");
          setLoading(false);
          return;
        }

        const wedding = await response.json();
        setData({
          slug: wedding.slug,
          brideName: wedding.brideName || "",
          groomName: wedding.groomName || "",
          eventDate: wedding.eventDate || "",
          venueName: wedding.venueName || "",
          coverImageUrl: wedding.coverImageUrl || "",
          coverImagePublicId: wedding.coverImagePublicId || "",
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch wedding");
        setLoading(false);
      }
    }

    fetchWedding();
  }, [slug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setData((prev) => ({
        ...prev,
        coverImageUrl: result.url,
        coverImagePublicId: result.publicId,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/weddings/${slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brideName: data.brideName,
          groomName: data.groomName,
          eventDate: data.eventDate,
          venueName: data.venueName,
          coverImageUrl: data.coverImageUrl,
          coverImagePublicId: data.coverImagePublicId,
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Edit Wedding
            </h1>
            <button
              onClick={() => router.push("/admin")}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to list
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={data.slug}
                disabled
                className="block w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bride Name
              </label>
              <input
                type="text"
                value={data.brideName}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, brideName: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Groom Name
              </label>
              <input
                type="text"
                value={data.groomName}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, groomName: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={data.eventDate}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, eventDate: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name
              </label>
              <input
                type="text"
                value={data.venueName}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, venueName: e.target.value }))
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>

              {data.coverImageUrl && (
                <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={data.coverImageUrl}
                    alt="Cover"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer disabled:opacity-50"
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                Saved successfully!
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
