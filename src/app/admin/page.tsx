import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminPage() {
  const { data: weddings } = await supabase
    .from("weddings")
    .select("slug")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-6">
            Wedding Admin
          </h1>

          <div className="space-y-2">
            {weddings && weddings.length > 0 ? (
              weddings.map((wedding) => (
                <Link
                  key={wedding.slug}
                  href={`/admin/${wedding.slug}`}
                  className="block p-4 border border-gray-200 rounded hover:border-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {wedding.slug}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No weddings found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
