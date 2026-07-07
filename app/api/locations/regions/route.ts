import { NextResponse } from 'next/server';
import { getRegions } from '@/lib/locations/senegal';

export async function GET() {
    return NextResponse.json({
        success: true,
        source: 'sendocu-internal-galsen-reference',
        regions: getRegions(),
    });
}
