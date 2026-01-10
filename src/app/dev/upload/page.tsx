"use client";

import { useState } from "react";

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    publicId: string;
    slug: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !slug.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

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

      const data = await response.json();
      setResult({
        url: data.url,
        publicId: data.publicId,
        slug: data.slug,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Cloudinary Upload Test
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wedding Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., john-and-jane"
                className="block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || !slug.trim() || loading}
              className="w-full py-2.5 px-4 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={result.url}
                  alt="Uploaded"
                  className="w-full h-auto"
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">URL:</span>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline break-all mt-1"
                  >
                    {result.url}
                  </a>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Public ID:</span>
                  <span className="block text-gray-600 mt-1">
                    {result.publicId}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Slug:</span>
                  <span className="block text-gray-600 mt-1">
                    {result.slug}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
