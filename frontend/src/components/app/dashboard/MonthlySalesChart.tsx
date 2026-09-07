import AppIcon from "../AppIcon";

const sales = [42, 68, 50, 61, 47, 45, 59, 35, 52, 72, 62, 38];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MonthlySalesChart = () => (
  <section className="dashboard-card monthly-sales-card">
    <div className="card-heading"><div><h2>Monthly Sales</h2><p>Penjualan sepanjang tahun ini</p></div><button type="button" aria-label="Menu monthly sales"><AppIcon name="more" /></button></div>
    <div className="bar-chart" aria-label="Grafik penjualan bulanan">
      {sales.map((value, index) => <div className="bar-column" key={months[index]}><div><span style={{ height: `${value}%` }} /></div><small>{months[index]}</small></div>)}
    </div>
  </section>
);

export default MonthlySalesChart;

