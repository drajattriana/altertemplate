import { useSidebar } from "../../contexts/SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;
  return <button type="button" className="app-backdrop" aria-label="Tutup sidebar" onClick={closeMobileSidebar} />;
};

export default Backdrop;

