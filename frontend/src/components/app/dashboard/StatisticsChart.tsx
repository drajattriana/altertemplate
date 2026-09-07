const StatisticsChart = () => (
  <section className="dashboard-card statistics-card">
    <div className="statistics-heading">
      <div><h2>Statistics</h2><p>Revenue dan sales bulanan</p></div>
      <div className="chart-tabs"><button type="button" className="active">Overview</button><button type="button">Sales</button><button type="button">Revenue</button></div>
    </div>
    <div className="line-chart-wrap">
      <div className="y-axis"><span>300</span><span>200</span><span>100</span><span>0</span></div>
      <div className="line-chart">
        <div className="chart-grid-lines"><i/><i/><i/><i/></div>
        <svg viewBox="0 0 1000 260" preserveAspectRatio="none" role="img" aria-label="Grafik statistik sales dan revenue">
          <polyline className="chart-line primary" points="0,115 90,108 180,125 270,132 360,120 450,128 540,120 630,82 720,60 810,75 900,48 1000,54" />
          <polyline className="chart-line secondary" points="0,220 90,228 180,210 270,220 360,204 450,220 540,190 630,165 720,155 810,145 900,120 1000,132" />
        </svg>
        <div className="x-axis">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month) => <span key={month}>{month}</span>)}</div>
      </div>
    </div>
  </section>
);

export default StatisticsChart;

