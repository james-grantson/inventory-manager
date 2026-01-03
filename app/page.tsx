export default function Home() {
  return (
    <div className="container text-center py-5">
      <h1>Inventory Manager</h1>
      <p className="lead">Your inventory management system</p>
      <div className="mt-4">
        <a href="/products" className="btn btn-primary">View Products</a>
      </div>
    </div>
  )
}
