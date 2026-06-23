import { NextResponse } from 'next/server';
import { getDistrictMetrics } from '@/lib/actions/districts';

export const revalidate = 300;

const KIGALI_DISTRICT_QUERY = new URL(
  'https://moegis.environment.gov.rw/server/rest/services/Hosted/Administrative_boundaries/FeatureServer/0/query'
);

function normalizeDistrictName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim();
}

export async function GET() {
  try {
    const metrics = await getDistrictMetrics();
    const metricsMap = new Map(metrics.map((m) => [m.district, m]));

    KIGALI_DISTRICT_QUERY.searchParams.set('where', "province='Kigali City'");
    KIGALI_DISTRICT_QUERY.searchParams.set('outFields', 'province,province_id,district,district_id');
    KIGALI_DISTRICT_QUERY.searchParams.set('returnGeometry', 'true');
    KIGALI_DISTRICT_QUERY.searchParams.set('f', 'geojson');
    KIGALI_DISTRICT_QUERY.searchParams.set('outSR', '4326');

    const response = await fetch(KIGALI_DISTRICT_QUERY.toString(), {
      // District boundaries are stable, but the response is still enriched with live metrics.
      next: { revalidate },
    });

    if (!response.ok) {
      throw new Error(`Boundary fetch failed with ${response.status}`);
    }

    const geojson = await response.json();

    const enriched = {
      ...geojson,
      features: Array.isArray(geojson.features)
        ? geojson.features.map((feature: any) => {
          const districtName = normalizeDistrictName(
            feature?.properties?.district ?? feature?.properties?.name
          );
          const metric = metricsMap.get(districtName);

          return {
            ...feature,
            properties: {
              ...feature.properties,
              district: districtName,
              name: feature?.properties?.name ?? districtName,
              avgSeverity: metric?.avgSeverity ?? 0,
              reportCount: metric?.reportCount ?? 0,
            },
          };
        })
        : [],
    };

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('[api/geojson]', error);
    return NextResponse.json(
      { error: 'Failed to load district boundaries.' },
      { status: 500 }
    );
  }
}
