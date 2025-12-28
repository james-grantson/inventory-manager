"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load product');
      }
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product deleted!');
        router.push('/products');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: 'bold' }}>Product not found</h2>
          <Link 
            href="/products"
            style={{ marginTop: '1rem', display: 'inline-block', color: '#2563eb' }}
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link 
          href="/products"
          style={{ color: '#2563eb', marginBottom: '0.5rem', display: 'inline-block' }}
        >
          ← Back to Products
        </Link>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{product.name}</h1>
        <p style={{ color: '#6b7280' }}>SKU: {product.sku}</p>
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link
          href={`/products/${params.id}/edit`}
          style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '0.375rem', textDecoration: 'none' }}
        >
          Edit Product
        </Link>
        <button
          onClick={handleDelete}
          style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
        >
          Delete Product
        </button>
      </div>

      {/* Product Details */}
      <div style={{ background: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          {/* Basic Info */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Basic Information</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Description</div>
                <div>{product.description || 'No description'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Category</div>
                <div>{product.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Supplier</div>
                <div>{product.supplier || 'Not specified'}</div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Pricing & Stock</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Purchase Price</div>
                <div>${parseFloat(product.purchase_price).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Selling Price</div>
                <div>${parseFloat(product.selling_price).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Total Stock</div>
                <div style={{ fontWeight: 'bold', color: product.total_quantity <= 0 ? '#dc2626' : 'inherit' }}>
                  {product.total_quantity} units
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Low Stock Alert</div>
                <div>{product.low_stock_alert || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Additional Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Created</div>
              <div>{new Date(product.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Last Updated</div>
              <div>{new Date(product.updated_at).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>ID</div>
              <div style={{ fontFamily: 'monospace' }}>{product.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}