// app/page.tsx
export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1> Inventory Stock Manager</h1>
      <p>Your inventory management system is ready!</p>
      
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <a href="/dashboard" style={{ padding: '1rem', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
          Go to Dashboard
        </a>
        <a href="/products" style={{ padding: '1rem', background: '#8b5cf6', color: 'white', textDecoration: 'none', borderRadius: '8px' }}>
          Manage Products
        </a>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
        <p><strong>Note:</strong> This app uses Supabase for data storage.</p>
        <p>Connect your Supabase project in Vercel environment variables.</p>
      </div>
    </div>
  )
}
