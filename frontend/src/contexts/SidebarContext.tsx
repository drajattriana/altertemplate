import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type SidebarContextValue = {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setIsHovered: (value: boolean) => void;
  toggleSubmenu: (value: string) => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("dashboard");

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const value = useMemo(() => ({
    isExpanded: isDesktop && isExpanded,
    isMobileOpen,
    isHovered,
    openSubmenu,
    toggleSidebar: () => setIsExpanded((current) => !current),
    toggleMobileSidebar: () => setIsMobileOpen((current) => !current),
    closeMobileSidebar: () => setIsMobileOpen(false),
    setIsHovered,
    toggleSubmenu: (item: string) => setOpenSubmenu((current) => current === item ? null : item),
  }), [isDesktop, isExpanded, isMobileOpen, isHovered, openSubmenu]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar harus digunakan di dalam SidebarProvider");
  return context;
};

