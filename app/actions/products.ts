'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqisohfzdoxmhsdxzcrg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_O3BPZNAcNG3hojR3Gsk9iQ_73yCbPmn'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return { product: data, error: null }
  } catch (error: any) {
    return { product: null, error: error.message }
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { product: data, error: null }
  } catch (error: any) {
    return { product: null, error: error.message }
  }
}
