'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Report } from '@/db/schema';
import type { DistrictMetric } from '@/lib/actions/districts';
import { getChoroplethColor, getSeverityColor, getStatusColor } from '@/lib/utils';
import { MapSkeleton } from '@/components/ui/Skeleton';

// Dynamically import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const GeoJSON = dynamic(() => import('react-leaflet').then(m => m.GeoJSON), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false });

interface PollutionMapProps {
  reports: Report[];
  districtMetrics: DistrictMetric[];
}

export default function PollutionMap({ reports, districtMetrics }: PollutionMapProps) {
  const [geoJSON, setGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [mounted, setMounted] = useState(false);
  const metricsMap = new Map(districtMetrics.map(m => [m.district, m]));

  useEffect(() => {
    setMounted(true);
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    fetch('/api/geojson')
      .then(r => r.json())
      .then(setGeoJSON)
      .catch(console.error);
  }, []);

  if (!mounted) return <MapSkeleton />;

  const styleFeature = (feature?: GeoJSON.Feature) => {
    const districtName = feature?.properties?.district as string;
    const metric = metricsMap.get(districtName);
    const avg = metric?.avgSeverity ?? 0;
    return {
      fillColor: avg > 0 ? getChoroplethColor(avg) : '#f3f4f6',
      weight: 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: avg > 0 ? 0.7 : 0.3,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const district = feature.properties?.district as string;
    const metric = metricsMap.get(district);
    if ((layer as L.Path).bindTooltip) {
      (layer as L.Path).bindTooltip(
        `<div style="font-family:system-ui;padding:8px 12px;min-width:160px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${district}</div>
          ${metric
            ? `<div style="font-size:12px;color:#6b7280">${metric.reportCount} report${metric.reportCount !== 1 ? 's' : ''}</div>
               <div style="font-size:12px;color:#6b7280">Avg severity: ${metric.avgSeverity.toFixed(1)}/5</div>`
            : `<div style="font-size:12px;color:#9ca3af">No reports yet</div>`
          }
        </div>`,
        { sticky: true, opacity: 1, className: 'leaflet-tooltip-clean' }
      );
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-[var(--shadow-map)]">
      <MapContainer
        center={[-1.9441, 30.0619]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Layer A: District choropleth */}
        {geoJSON && (
          <GeoJSON
            key={JSON.stringify(districtMetrics)}
            data={geoJSON}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Layer B: Hotspot markers */}
        {reports.map(report => (
          <CircleMarker
            key={report.id}
            center={[Number(report.latitude), Number(report.longitude)]}
            radius={8 + (report.severityLevel - 1) * 2}
            pathOptions={{
              fillColor: getSeverityColor(report.severityLevel),
              color: '#ffffff',
              weight: 2,
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="w-64 overflow-hidden rounded-xl">
                {report.imageUrl && (
                  <img
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm text-gray-900 leading-tight">{report.title}</h3>
                    <span
                      className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: getStatusColor(report.status) + '20', color: getStatusColor(report.status) }}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📍 {report.districtName}</span>
                    <span>•</span>
                    <span>⚠️ Level {report.severityLevel}</span>
                  </div>
                  {report.wasteType && (
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {report.wasteType}
                    </span>
                  )}
                  <a
                    href={`/reports/${report.id}`}
                    className="block w-full text-center text-xs font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg py-1.5 mt-1 transition-colors"
                  >
                    View Full Report →
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
