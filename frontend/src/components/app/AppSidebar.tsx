import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";
import AppIcon, { type AppIconName } from "./AppIcon";
import SidebarWidget from "./SidebarWidget";

type SidebarMenuItem = {
  key: string;
  label: string;
  icon: AppIconName;
  badge?: string;
  children?: { label: string; to: string }[];
};

const mainMenu: SidebarMenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "grid", children: [{ label: "Ecommerce", to: "/admin" }] },
  { key: "calendar", label: "Calendar", icon: "calendar" },
  { key: "profile", label: "User Profile", icon: "user" },
  { key: "forms", label: "Forms", icon: "list", badge: "soon" },
  { key: "tables", label: "Tables", icon: "list", badge: "soon" },
];

const otherMenu: SidebarMenuItem[] = [
  { key: "charts", label: "Charts", icon: "grid", badge: "soon" },
  { key: "ui", label: "UI Elements", icon: "box", badge: "soon" },
];

const AppSidebar = () => {
  const { isExpanded, isHovered, isMobileOpen, openSubmenu, setIsHovered, toggleSubmenu, closeMobileSidebar } = useSidebar();
  const location = useLocation();
  const showContent = isExpanded || isHovered || isMobileOpen;

  useEffect(() => {
    if (location.pathname === "/admin" && openSubmenu !== "dashboard") toggleSubmenu("dashboard");
  }, [location.pathname]);

  const renderMenu = (items: SidebarMenuItem[]) => items.map((item) => (
    <div className="sidebar-menu-item" key={item.key}>
      {item.children ? (
        <button type="button" className={`sidebar-nav-item ${location.pathname === "/admin" ? "active" : ""}`} onClick={() => toggleSubmenu(item.key)}>
          <AppIcon name={item.icon} /><span>{item.label}</span>{showContent && <AppIcon name="chevron" size={16} className={`sidebar-arrow ${openSubmenu === item.key ? "open" : ""}`} />}
        </button>
      ) : (
        <button type="button" className="sidebar-nav-item disabled" title="Menu akan dikembangkan" disabled>
          <AppIcon name={item.icon} /><span>{item.label}</span>{showContent && item.badge && <small>SOON</small>}
        </button>
      )}
      {item.children && showContent && (
        <div className={`sidebar-submenu ${openSubmenu === item.key ? "open" : ""}`}>
          {item.children.map((child) => <NavLink key={child.to} to={child.to} end onClick={closeMobileSidebar}>{child.label}</NavLink>)}
        </div>
      )}
    </div>
  ));

  return (
    <aside className={`app-sidebar ${isExpanded || isMobileOpen ? "expanded" : "compact"} ${isHovered ? "hovered" : ""} ${isMobileOpen ? "mobile-open" : ""}`} onMouseEnter={() => !isExpanded && setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="app-sidebar-logo">
        <span className="app-logo-mark">A</span>{showContent && <strong>alterdev<span>.</span></strong>}
      </div>
      <div className="app-sidebar-scroll">
        <nav>
          <div className="sidebar-group-title">{showContent ? "MENU" : "•••"}</div>
          {renderMenu(mainMenu)}
          <div className="sidebar-group-title other-title">{showContent ? "OTHERS" : "•••"}</div>
          {renderMenu(otherMenu)}
        </nav>
        {showContent && <SidebarWidget />}
      </div>
    </aside>
  );
};

export default AppSidebar;
