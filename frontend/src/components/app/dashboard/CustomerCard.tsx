const countries = [
  { flag: "🇺🇸", name: "USA", customers: "2,379 Customers", share: "79%" },
  { flag: "🇫🇷", name: "France", customers: "589 Customers", share: "23%" },
];

const CustomerCard = () => (
  <section className="dashboard-card customer-card">
    <div className="card-heading"><div><h2>Customers Demographic</h2><p>Jumlah pelanggan berdasarkan negara</p></div></div>
    <div className="map-placeholder" aria-label="Ilustrasi persebaran pelanggan"><span className="map-dot dot-one"/><span className="map-dot dot-two"/><span className="map-dot dot-three"/><strong>WORLDWIDE</strong></div>
    <div className="country-list">{countries.map((country) => <div key={country.name}><span className="country-flag">{country.flag}</span><p><strong>{country.name}</strong><small>{country.customers}</small></p><span className="country-share">{country.share}</span></div>)}</div>
  </section>
);

export default CustomerCard;

