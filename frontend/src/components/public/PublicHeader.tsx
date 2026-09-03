import { useState } from "react";
import { Link } from "react-router-dom";

const navItems = [
  { label: "Layanan", href: "#layanan" },
  { label: "Karya", href: "#karya" },
  { label: "Proses", href: "#proses" },
  { label: "Kontak", href: "#kontak" },
];

const PublicHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="alter-header">
      <div className="alter-container alter-nav">
        <Link to="/" className="alter-brand" aria-label="Alterdev beranda">
          <span className="alter-brand-mark">A</span>
          <span>alterdev<span className="brand-dot">.</span></span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="login-link">Masuk</Link>
          <a href="#kontak" className="nav-cta">Mulai proyek <span>↗</span></a>
        </div>

        <button type="button" className="menu-toggle" aria-label="Buka menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
          <span /><span />
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Navigasi seluler">
          {navItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <Link to="/login" onClick={() => setMenuOpen(false)}>Masuk ke akun</Link>
        </nav>
      )}
    </header>
  );
};

export default PublicHeader;
