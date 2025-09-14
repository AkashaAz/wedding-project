import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e9ecf3] to-[#dbe6f6]">
      <div
        className="w-full max-w-md rounded-3xl p-10 shadow-2xl bg-white/60 backdrop-blur-xl border border-white/30 flex flex-col items-center"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)" }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight text-center drop-shadow-sm">
          Wedding Project
        </h1>
        <p className="text-xl font-light text-gray-500 mb-8 text-center">
          Choose your page
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/preview"
            className="w-full py-4 rounded-2xl bg-white/80 shadow border border-white/40 text-gray-900 font-semibold text-lg hover:bg-blue-100/80 transition flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <rect width="20" height="20" rx="6" fill="#2563eb" />
              <path
                d="M7 10l3 3 3-3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Layout Preview
          </Link>
          <Link
            href="/test"
            className="w-full py-4 rounded-2xl bg-white/80 shadow border border-white/40 text-gray-900 font-semibold text-lg hover:bg-green-100/80 transition flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <rect width="20" height="20" rx="6" fill="#22c55e" />
              <path
                d="M7 10l3 3 3-3"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Test Page
          </Link>
        </div>
      </div>
    </div>
  );
}
