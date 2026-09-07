const orders = [
  { image: "/images/product/product-01.jpg", product: "Macbook Pro 13”", variant: "2 Variants", category: "Laptop", price: "Rp18.999.000", status: "Delivered" },
  { image: "/images/product/product-02.jpg", product: "Apple Watch Ultra", variant: "1 Variant", category: "Watch", price: "Rp8.999.000", status: "Pending" },
  { image: "/images/product/product-03.jpg", product: "iPhone 15 Pro Max", variant: "2 Variants", category: "SmartPhone", price: "Rp21.499.000", status: "Delivered" },
  { image: "/images/product/product-04.jpg", product: "iPad Pro 3rd Gen", variant: "2 Variants", category: "Electronics", price: "Rp12.700.000", status: "Canceled" },
];

const RecentOrders = () => (
  <section className="dashboard-card recent-orders-card">
    <div className="card-heading"><div><h2>Recent Orders</h2><p>Pesanan terbaru dari pelanggan</p></div><button type="button" className="text-button">See all</button></div>
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead><tr><th>Products</th><th>Category</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>{orders.map((order) => <tr key={order.product}><td><div className="product-cell"><img src={order.image} alt=""/><div><strong>{order.product}</strong><small>{order.variant}</small></div></div></td><td>{order.category}</td><td>{order.price}</td><td><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></td></tr>)}</tbody>
      </table>
    </div>
  </section>
);

export default RecentOrders;

