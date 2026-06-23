'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { createReport, type ReportFormData } from '@/lib/actions/reports';
import { MapPin, Upload, AlertTriangle, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(5, 'At least 5 characters').max(100),
  description: z.string().optional(),
  wasteType: z.enum(['Plastic', 'E-Waste', 'Organic', 'Chemical', 'Construction', 'Mixed', 'Other']),
  severityLevel: z.number().int().min(1).max(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  nearestLandmark: z.string().optional(),
  districtName: z.string().min(1, 'District required'),
  imageUrl: z.string().optional().or(z.literal('')),
  reportedBy: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const WASTE_TYPES = ['Plastic', 'E-Waste', 'Organic', 'Chemical', 'Construction', 'Mixed', 'Other'] as const;
const KIGALI_DISTRICTS = ['Gasabo', 'Kicukiro', 'Nyarugenge'];
const SEVERITY_LABELS = ['', 'Minimal', 'Low', 'Moderate', 'High', 'Critical'];
const SEVERITY_COLORS = ['', '#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#7f1d1d'];

export function ReportForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { severityLevel: 3, reportedBy: 'Anonymous' },
  });

  const severity = watch('severityLevel');
  const wasteType = watch('wasteType');
  const lat = watch('latitude');
  const lng = watch('longitude');

  // Auto-geolocate on mount
  useEffect(() => { handleGeolocate(); }, []);

  async function handleGeolocate() {
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setValue('latitude', latitude);
        setValue('longitude', longitude);

        // Reverse geocode via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'User-Agent': 'KigaliCleanApp/1.0' } }
          );
          const data = await res.json();
          const addr = data.address ?? {};
          const landmark = [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(', ');
          const rawDistrict = addr.county ?? addr.city_district ?? addr.suburb ?? '';
          const matchedDistrict = KIGALI_DISTRICTS.find(d =>
            rawDistrict.toLowerCase().includes(d.toLowerCase())
          ) ?? 'Gasabo';

          setValue('nearestLandmark', landmark || addr.display_name?.split(',')[0]);
          setValue('districtName', matchedDistrict);
        } catch {
          setValue('districtName', 'Gasabo');
        }
        setLocating(false);
      },
      (err) => {
        setLocError('Could not get location. Please enter manually.');
        setValue('districtName', 'Gasabo');
        setValue('latitude', -1.9441);
        setValue('longitude', 30.0619);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const publicKey = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY;

    try {
      // fallback (no key configured)
      if (!publicKey || publicKey === 'your_uploadcare_public_key_here') {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setValue('imageUrl', url);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('UPLOADCARE_PUB_KEY', publicKey);
      formData.append('UPLOADCARE_STORE', '1');
      formData.append('file', file);

      const res = await fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      // ✅ robust UUID extraction (fixes your bug)
      const uuid =
        data.file ||
        data.uuid ||
        data.result?.uuid ||
        data.file_id ||
        data?.result?.file;

      if (!uuid) {
        throw new Error('Uploadcare did not return a valid file UUID');
      }

      // ✅ clean CDN URL (no risky transforms at upload time)
      const cdnUrl = `https://55f0bqp84g.ucarecd.net/${uuid}/`;

      setPreviewUrl(cdnUrl);
      setValue('imageUrl', cdnUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  }
  async function goNext() {
    const fieldsPerStep: Record<number, (keyof FormData)[]> = {
      1: ['title', 'wasteType', 'severityLevel'],
      2: ['latitude', 'longitude', 'districtName'],
    };
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(s => s + 1);
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    const result = await createReport(data as ReportFormData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push('/'), 2000);
    } else {
      alert(result.error);
    }
    setSubmitting(false);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-sm text-gray-500">Thank you for helping keep Kigali clean.</p>
        <p className="text-xs text-gray-400 mt-2">Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${step === s ? 'bg-gray-900 text-white scale-110' :
              step > s ? 'bg-forest-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
              {step > s ? <Check className="w-3.5 h-3.5" /> : s}
            </div>
            {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-forest-400' : 'bg-gray-100'}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-400">
          {step === 1 ? 'Incident Details' : step === 2 ? 'Location' : 'Review & Submit'}
        </span>
      </div>

      {/* Step 1: Incident Details */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Report Title *</label>
            <input
              {...register('title')}
              placeholder="e.g. Large plastic dump near Kimironko market"
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300 transition"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Waste Type *</label>
            <div className="grid grid-cols-4 gap-2">
              {WASTE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('wasteType', type)}
                  className={`h-9 px-2 text-xs font-medium rounded-xl border transition-all ${wasteType === type
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.wasteType && <p className="text-xs text-red-500 mt-1">Select a waste type</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Severity Level *
              <span className="ml-2 font-normal" style={{ color: SEVERITY_COLORS[severity] }}>
                — {SEVERITY_LABELS[severity]}
              </span>
            </label>
            <Controller
              name="severityLevel"
              control={control}
              render={({ field }) => (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => field.onChange(n)}
                      className={`flex-1 h-10 rounded-xl border text-sm font-bold transition-all ${field.value >= n ? 'border-transparent text-white' : 'bg-white border-gray-200 text-gray-300'
                        }`}
                      style={field.value >= n ? { background: SEVERITY_COLORS[n] } : {}}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe what you see — quantity, conditions, proximity to water sources…"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300 transition resize-none"
            />
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-700">Current Location</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleGeolocate} loading={locating}>
                {locating ? 'Locating…' : 'Re-pin Location'}
              </Button>
            </div>

            {locError && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{locError}</p>}

            {lat && lng && (
              <p className="text-xs text-gray-500 font-mono bg-white rounded-lg px-3 py-2 border border-gray-100">
                {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nearest Landmark</label>
            <input
              {...register('nearestLandmark')}
              placeholder="Auto-detected from GPS, or enter manually"
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-300 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">District *</label>
            <Controller
              name="districtName"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {KIGALI_DISTRICTS.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => field.onChange(d)}
                      className={`h-10 text-sm font-medium rounded-xl border transition-all ${field.value === d
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.districtName && <p className="text-xs text-red-500 mt-1">Please select a district</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Photo Evidence</label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-all"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Click to upload photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Review your report</h3>
            <dl className="space-y-2 text-sm">
              {[
                ['Title', watch('title')],
                ['Waste Type', watch('wasteType')],
                ['Severity', `${watch('severityLevel')}/5 — ${SEVERITY_LABELS[watch('severityLevel')]}`],
                ['District', watch('districtName')],
                ['Landmark', watch('nearestLandmark') || '—'],
                ['Coordinates', lat && lng ? `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-gray-500 text-xs">{k}</dt>
                  <dd className="text-gray-900 text-xs font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {previewUrl && (
            <div className="rounded-2xl overflow-hidden h-36">
              <img src={previewUrl} alt="Evidence" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Your name (optional)</label>
            <input
              {...register('reportedBy')}
              placeholder="Anonymous"
              className="w-full h-10 px-3 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-300 transition"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}>
            ← Back
          </Button>
        ) : <div />}

        {step < 3 ? (
          <Button type="button" variant="primary" onClick={goNext}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" variant="secondary" loading={submitting}>
            {submitting ? 'Submitting…' : '🌿 Submit Report'}
          </Button>
        )}
      </div>
    </form>
  );
}
