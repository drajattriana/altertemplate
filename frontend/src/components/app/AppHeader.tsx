import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import { useTheme } from "../../contexts/ThemeContext";
import { logoutDemo } from "../../utils/demoAuth";
import AppIcon from "./AppIcon";

const AppHeader = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const handleLogout = () => {
    logoutDemo();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-header">
      <div className="header-primary">
        <button type="button" className="header-icon-button sidebar-toggle" aria-label="Buka atau tutup sidebar" onClick={handleSidebarToggle}>
          <AppIcon name={isMobileOpen ? "chevron" : "menu"} />
        </button>

        <div className="header-mobile-brand"><span>A</span><strong>alterdev.</strong></div>

        <button type="button" className="header-mobile-more" aria-label="Buka menu aplikasi" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((current) => !current)}>
          <AppIcon name="more" />
        </button>

        <label className="header-search">
          <AppIcon name="search" />
          <input ref={searchRef} type="search" placeholder="Search or type command..." aria-label="Pencarian dashboard" />
          <kbd>CTRL K</kbd>
        </label>
      </div>

      <div className={`header-actions ${mobileMenuOpen ? "is-open" : ""}`}>
        <button type="button" className="header-icon-button" aria-label={theme === "dark" ? "Gunakan tema terang" : "Gunakan tema gelap"} onClick={toggleTheme}>
          <AppIcon name={theme === "dark" ? "sun" : "moon"} />
        </button>

        <div className="header-popover-wrap">
          <button type="button" className="header-icon-button notification-trigger" aria-label="Notifikasi" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((current) => !current); setUserOpen(false); }}>
            <span className="notification-dot" /><AppIcon name="bell" />
          </button>
          {notificationsOpen && (
            <div className="header-popover notification-popover">
              <div className="popover-heading"><strong>Notification</strong><button type="button" onClick={() => setNotificationsOpen(false)}>×</button></div>
              <div className="notification-item"><span>RF</span><p><strong>Rafi</strong> mengirim pembaruan desain.<small>5 menit lalu</small></p></div>
              <div className="notification-item"><span>AN</span><p><strong>Anisa</strong> menambahkan komentar proyek.<small>20 menit lalu</small></p></div>
              <button type="button" className="popover-action">View All Notifications</button>
            </div>
          )}
        </div>

        <div className="header-popover-wrap">
          <button type="button" className="header-user" aria-expanded={userOpen} onClick={() => { setUserOpen((current) => !current); setNotificationsOpen(false); }}>
            <span className="header-avatar">AD</span>
            <span className="header-user-copy"><strong>Administrator</strong><small>Admin</small></span>
            <span className="header-chevron">⌄</span>
          </button>
          {userOpen && (
            <div className="header-popover user-popover">
              <div className="user-summary"><strong>Administrator</strong><small>admin@alterdev.id</small></div>
              <button type="button"><AppIcon name="user" size={18} /> Edit profile</button>
              <button type="button"><AppIcon name="list" size={18} /> Account settings</button>
              <button type="button" className="signout-item" onClick={handleLogout}><AppIcon name="logout" size={18} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

