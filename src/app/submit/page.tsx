import Link from 'next/link';
import { ReportForm } from '@/components/reports/ReportForm';
import { Leaf, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report an Incident — KigaliClean',
  description: 'Submit a new illegal dumping or pollution incident report in Kigali.',
};

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">KigaliClean</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to map
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-forest-50 text-forest-700 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 bg-forest-500 rounded-full" />
            Anonymous reporting enabled
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Report a Pollution Incident
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Your report helps Kigali authorities identify and clean up illegal dumping sites faster.
            Location is auto-detected from your device.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[var(--shadow-card)] p-6">
          <ReportForm />
        </div>

        <p className="text-xs text-center text-gray-400 mt-6">
          By submitting, you agree that your report is factual and relates to environmental violations.
        </p>
      </div>
    </div>
  );
}
