import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        created_at: 'desc',  // FIXED: changed from createdAt to created_at
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// CREATE a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        description: body.description || '',
        category: body.category,
        purchase_price: parseFloat(body.purchase_price),
        selling_price: parseFloat(body.selling_price),
        total_quantity: parseInt(body.total_quantity) || 0,
        low_stock_alert: parseInt(body.low_stock_alert) || 10,
        supplier: body.supplier || '',
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}