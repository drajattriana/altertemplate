import AppIcon from "../AppIcon";

const MonthlyTarget = () => (
  <section className="dashboard-card target-card">
    <div className="card-heading"><div><h2>Monthly Target</h2><p>Target yang ditetapkan bulan ini</p></div><button type="button" aria-label="Menu monthly target"><AppIcon name="more" /></button></div>
    <div className="target-gauge"><div className="gauge-ring"><div><strong>75.55%</strong><span>+10%</span></div></div></div>
    <p className="target-copy">Pendapatan hari ini lebih tinggi dari bulan lalu. Pertahankan performa baik ini!</p>
    <div className="target-summary">
      <div><span>Target</span><strong>Rp20jt <em className="down">↓</em></strong></div>
      <div><span>Revenue</span><strong>Rp18jt <em>↑</em></strong></div>
      <div><span>Today</span><strong>Rp2jt <em>↑</em></strong></div>
    </div>
  </section>
);

export default MonthlyTarget;

