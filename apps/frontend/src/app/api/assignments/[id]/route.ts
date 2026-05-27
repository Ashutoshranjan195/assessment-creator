import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // Use BACKEND_INTERNAL_URL if available (set by docker-compose), otherwise fall back to backend service name
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://backend:4000';

  try {
    const response = await fetch(`${backendUrl}/api/assignments/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
