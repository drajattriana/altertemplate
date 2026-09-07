import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { DEMO_PASSWORD, DEMO_USERNAME, isDemoAuthenticated, loginDemo } from "../../utils/demoAuth";
import "../../styles/Login.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  if (isDemoAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    const remember = form.get("remember") === "on";

    if (!username || !password) {
      setMessage("Lengkapi username dan kata sandi terlebih dahulu.");
      return;
    }

    if (username !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      setMessage("Username atau kata sandi salah. Gunakan admin / admin.");
      return;
    }

    loginDemo(remember);
    navigate("/admin", { replace: true });
  };

  return (
    <main className="login-page">
      <section className="login-showcase">
        <Link to="/" className="alter-brand login-brand" aria-label="Kembali ke beranda Alterdev">
          <span className="alter-brand-mark">A</span>
          <span>alterdev<span className="brand-dot">.</span></span>
        </Link>
        <div className="login-showcase-copy">
          <span className="login-kicker">ALTERDEV WORKSPACE</span>
          <h1>Semua proyek.<br />Satu ruang <em>kerja.</em></h1>
          <p>Pantau progres, berikan feedback, dan temukan seluruh dokumen kolaborasi Anda di satu tempat.</p>
        </div>
        <div className="login-art" aria-hidden="true">
          <div className="login-ring ring-one" /><div className="login-ring ring-two" /><div className="login-art-core">A</div><span className="art-dot-one" /><span className="art-dot-two" />
        </div>
        <div className="showcase-note"><span>●</span> RUANG KOLABORASI YANG AMAN</div>
      </section>

      <section className="login-panel">
        <div className="login-panel-inner">
          <Link to="/" className="back-link"><span>←</span> Kembali ke beranda</Link>
          <div className="login-heading">
            <p className="login-kicker">SELAMAT DATANG KEMBALI</p>
            <h2>Masuk ke akun Anda.</h2>
            <p>Masuk dengan akun demo untuk membuka dashboard admin.</p>
          </div>

          <div className="demo-credentials"><span>AKUN DEMO</span><strong>admin</strong><i>/</i><strong>admin</strong></div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="username">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" placeholder="Masukkan username" onChange={() => setMessage("")} />

            <div className="password-label"><label htmlFor="password">Kata sandi</label><a href="#forgot">Lupa kata sandi?</a></div>
            <div className="password-field">
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan kata sandi" onChange={() => setMessage("")} />
              <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Sembunyikan" : "Lihat"}</button>
            </div>

            <label className="remember-row"><input type="checkbox" name="remember" /><span>Ingat saya di perangkat ini</span></label>
            {message && <p className="form-message" role="status">{message}</p>}
            <button className="submit-button" type="submit">Masuk ke workspace <span>→</span></button>
          </form>

          <p className="login-help">Login ini sementara untuk kebutuhan template dan belum memakai backend.</p>
        </div>
        <p className="login-legal">Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi Alterdev.</p>
      </section>
    </main>
  );
};

export default LoginPage;
