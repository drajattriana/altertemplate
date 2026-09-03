import { Link } from "react-router-dom";
import "../../styles/PublicHome.css";

const services = [
  { no: "01", title: "Product Design", copy: "Pengalaman digital yang terasa sederhana, jelas, dan menyenangkan untuk digunakan." },
  { no: "02", title: "Web Development", copy: "Website cepat dan solid, dibangun dengan teknologi modern yang siap berkembang." },
  { no: "03", title: "Digital Strategy", copy: "Arah produk yang tajam berdasarkan kebutuhan bisnis dan perilaku pengguna." },
];

const projects = [
  { tag: "FINTECH / 2026", title: "Nusa Pay", className: "project-lime", symbol: "N/" },
  { tag: "COMMERCE / 2026", title: "Mori Goods", className: "project-coral", symbol: "m°" },
  { tag: "PLATFORM / 2025", title: "Orbit Space", className: "project-blue", symbol: "◯" },
];

const HomePage = () => (
  <div className="alter-home">
    <section className="hero-section">
      <div className="hero-grid" aria-hidden="true" />
      <div className="alter-container hero-content">
        <div className="hero-status"><span /> TERSEDIA UNTUK PROYEK BARU</div>
        <h1>Kami mengubah<br />ide menjadi <em>impact.</em></h1>
        <div className="hero-lower">
          <p>Alterdev adalah studio digital yang merancang dan membangun produk berani untuk brand yang ingin bergerak maju.</p>
          <a href="#karya" className="circle-action" aria-label="Lihat karya kami">↓</a>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit-core">A</span><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit-dot" />
        </div>
      </div>
    </section>

    <div className="marquee" aria-label="Keahlian Alterdev"><div>DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> STRATEGY</div></div>

    <section id="layanan" className="services-section">
      <div className="alter-container">
        <div className="section-heading"><p className="eyebrow">APA YANG KAMI LAKUKAN</p><h2>Dari pertanyaan sulit<br />menjadi solusi <em>cerdas.</em></h2></div>
        <div className="service-list">
          {services.map((service) => (
            <article key={service.no} className="service-row"><span>{service.no}</span><h3>{service.title}</h3><p>{service.copy}</p><span className="service-arrow">↗</span></article>
          ))}
        </div>
      </div>
    </section>

    <section id="karya" className="work-section">
      <div className="alter-container">
        <div className="work-heading"><div><p className="eyebrow">KARYA PILIHAN</p><h2>Kerja baik.<br /><em>Dampak nyata.</em></h2></div><p>Beberapa kolaborasi yang kami banggakan—dari identitas awal hingga produk yang dipakai setiap hari.</p></div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <article key={project.title} className={`project-card ${project.className} ${index === 0 ? "project-wide" : ""}`}>
              <span className="project-tag">{project.tag}</span><div className="project-symbol">{project.symbol}</div><div className="project-title"><h3>{project.title}</h3><span>↗</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section id="proses" className="process-section">
      <div className="alter-container process-grid">
        <div><p className="eyebrow">CARA KAMI BEKERJA</p><h2>Kecil, fokus,<br />dan <em>transparan.</em></h2></div>
        <div className="process-copy"><p>Kami bekerja sebagai satu tim dengan Anda. Tanpa lapisan komunikasi yang rumit, tanpa kejutan di akhir.</p><div className="process-steps"><span>01 Temukan</span><span>02 Rancang</span><span>03 Bangun</span><span>04 Tumbuhkan</span></div><Link to="/login" className="text-link">Masuk ke ruang kolaborasi <span>→</span></Link></div>
      </div>
    </section>
  </div>
);

export default HomePage;
