import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-6xl">🌿</div>
        <h1 className="text-2xl font-bold text-gray-900">Report not found</h1>
        <p className="text-sm text-gray-500">This report may have been removed or doesn&apos;t exist.</p>
        <Link href="/" className="inline-flex items-center gap-2 h-10 px-5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
