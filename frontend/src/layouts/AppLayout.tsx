import { Outlet } from "react-router-dom";
import AppFooter from "../components/app/AppFooter";
import AppHeader from "../components/app/AppHeader";
import AppSidebar from "../components/app/AppSidebar";
import Backdrop from "../components/app/Backdrop";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/App.css";

const LayoutContent = () => {
  const { isExpanded, isHovered } = useSidebar();
  const sidebarWide = isExpanded || isHovered;

  return (
    <div className="app-shell">
      <AppSidebar />
      <Backdrop />
      <div className={`app-main ${sidebarWide ? "sidebar-wide" : "sidebar-compact"}`}>
        <AppHeader />
        <main className="app-content"><Outlet /></main>
        <AppFooter />
      </div>
    </div>
  );
};

const AppLayout = () => (
  <ThemeProvider>
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  </ThemeProvider>
);

export default AppLayout;

