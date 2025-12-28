import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ ULTRA-SIMPLE: Just make it work
export async function GET(request: Request, { params }: any) {
  try {
    const id = Number(params.id);
    const product = await prisma.product.findUnique({
      where: { id: id },
    });
    return NextResponse.json(product || { error: 'Not found' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const id = Number(params.id);
    await prisma.product.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}