import { NextRequest, NextResponse } from 'next/server';
import { getCommunes } from '@/lib/locations/senegal';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || undefined;
    const department = searchParams.get('department') || undefined;

    return NextResponse.json({
        success: true,
        source: 'sendocu-internal-galsen-reference',
        communes: getCommunes(department, region),
    });
}
