import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Wedding Project</h1>
        <p className="text-lg text-gray-600">Choose your page:</p>
        <div className="space-y-4">
          <div>
            <Link
              href="/preview"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Layout Preview
            </Link>
          </div>
          <div>
            <Link
              href="/test"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
