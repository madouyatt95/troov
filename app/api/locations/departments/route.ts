import { NextRequest, NextResponse } from 'next/server';
import { getDepartments } from '@/lib/locations/senegal';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || undefined;

    return NextResponse.json({
        success: true,
        source: 'sendocu-internal-galsen-reference',
        departments: getDepartments(region),
    });
}
