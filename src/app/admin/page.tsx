import Link from 'next/link';
import { getReports } from '@/lib/actions/reports';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { Leaf, ArrowLeft, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel — KigaliClean',
  description: 'Admin dashboard for managing pollution reports.',
};

export default async function AdminPage() {
  const reports = await getReports(true); // include archived

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span className="text-gray-200">|</span>
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-forest-600 rounded-md flex items-center justify-center">
                <Leaf className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">KigaliClean</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Shield className="w-3.5 h-3.5" />
            Admin Panel
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Report Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Update statuses, add notes, or remove spam reports. All changes are logged.
          </p>
        </div>

        <AdminPanel reports={reports} />
      </div>
    </div>
  );
}
