import { Link } from "react-router-dom";

const PublicFooter = () => (
  <footer id="kontak" className="alter-footer">
    <div className="alter-container footer-top">
      <div>
        <p className="footer-kicker">PUNYA IDE?</p>
        <h2>Mari buat sesuatu<br />yang <em>berarti.</em></h2>
      </div>
      <a href="mailto:hello@alterdev.id" className="footer-email">hello@alterdev.id <span>↗</span></a>
    </div>
    <div className="alter-container footer-bottom">
      <Link to="/" className="alter-brand footer-brand">
        <span className="alter-brand-mark">A</span>
        <span>alterdev<span className="brand-dot">.</span></span>
      </Link>
      <p>Studio produk digital independen dari Indonesia.</p>
      <div className="footer-links"><a href="#karya">Instagram</a><a href="#karya">Dribbble</a><a href="#karya">LinkedIn</a></div>
      <span>© 2026 Alterdev</span>
    </div>
  </footer>
);

export default PublicFooter;
