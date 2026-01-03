import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        message: 'API is working! Supabase not configured yet.',
        products: [],
        status: 'demo-mode'
      })
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        error: 'Database error',
        products: []
      }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Products fetched successfully',
      products: products || []
    })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      products: []
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      const body = await request.json()
      return NextResponse.json({
        message: 'Demo mode: Product would be saved to Supabase',
        product: { ...body, id: Date.now(), created_at: new Date().toISOString() },
        note: 'Supabase credentials needed for persistence'
      }, { status: 201 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Product created successfully',
      product: data
    }, { status: 201 })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
