import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Products API',
    status: 'ok',
    note: 'Full API coming soon'
  });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ 
    message: 'Product created',
    data,
    status: 'success'
  });
}
