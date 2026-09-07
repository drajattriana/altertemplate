import AppIcon from "../AppIcon";

const metrics = [
  { label: "Customers", value: "3,782", change: "11.01%", trend: "up", icon: "users" as const },
  { label: "Orders", value: "5,359", change: "9.05%", trend: "down", icon: "box" as const },
];

const EcommerceMetrics = () => (
  <section className="metric-grid" aria-label="Ecommerce metrics">
    {metrics.map((metric) => (
      <article className="dashboard-card metric-card" key={metric.label}>
        <span className="metric-icon"><AppIcon name={metric.icon} size={24} /></span>
        <div className="metric-bottom">
          <div><span>{metric.label}</span><strong>{metric.value}</strong></div>
          <span className={`trend-badge ${metric.trend}`}>{metric.trend === "up" ? "↗" : "↘"} {metric.change}</span>
        </div>
      </article>
    ))}
  </section>
);

export default EcommerceMetrics;

