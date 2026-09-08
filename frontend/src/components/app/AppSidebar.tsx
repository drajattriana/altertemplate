import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  UserCircleIcon,
} from "../../icons";

import { useSidebar } from "../../context/SidebarContext";

import {
  clearAuth,
  getAuthUser,
  getToken,
} from "../../utils/auth";

import SidebarWidget from "./SidebarWidget";


const API_URL = import.meta.env.VITE_API_URL;


type MenuItem = {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  badge_key: string | null;
  children: MenuItem[];
};


const menuIsActive = (
  menu: MenuItem,
  pathname: string
): boolean => {
  if (menu.path === pathname) {
    return true;
  }

  return menu.children.some((child) =>
    menuIsActive(child, pathname)
  );
};


const findActiveTrail = (
  items: MenuItem[],
  pathname: string,
  trail: number[] = []
): number[] | null => {
  for (const item of items) {
    const currentTrail = [
      ...trail,
      item.id,
    ];

    if (item.path === pathname) {
      return currentTrail;
    }

    if (item.children.length > 0) {
      const result = findActiveTrail(
        item.children,
        pathname,
        currentTrail
      );

      if (result) {
        return result;
      }
    }
  }

  return null;
};


const AppSidebar: React.FC = () => {
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
  } = useSidebar();

  const location = useLocation();
  const navigate = useNavigate();

  const [menus, setMenus] =
    useState<MenuItem[]>([]);

  const [openMenus, setOpenMenus] =
    useState<Record<number, boolean>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const user = getAuthUser();

  const homePath =
    user?.redirect_path ?? "/";


  useEffect(() => {
    let mounted = true;

    const loadMenus = async () => {
      const token = getToken();

      if (!token) {
        clearAuth();

        navigate("/login", {
          replace: true,
        });

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/auth/sidebar`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          clearAuth();

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Gagal mengambil sidebar"
          );
        }

        const data =
          await response.json();

        if (mounted) {
          setMenus(
            data.menus ?? []
          );
        }

      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            "Gagal memuat menu"
          );
        }

      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMenus();

    return () => {
      mounted = false;
    };

  }, [navigate]);


  useEffect(() => {
    const trail = findActiveTrail(
      menus,
      location.pathname
    );

    if (!trail) {
      return;
    }

    setOpenMenus((previous) => {
      const next = {
        ...previous,
      };

      trail
        .slice(0, -1)
        .forEach((id) => {
          next[id] = true;
        });

      return next;
    });

  }, [
    menus,
    location.pathname,
  ]);


  const toggleMenu = (
    id: number
  ) => {
    setOpenMenus((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };


  const renderIcon = (
    iconName: string | null
  ): ReactNode => {
    switch (iconName) {
      case "GridIcon":
        return <GridIcon />;

      case "ListIcon":
        return <ListIcon />;

      case "PageIcon":
        return <PageIcon />;

      case "UserCircleIcon":
        return <UserCircleIcon />;

      default:
        return null;
    }
  };


  const renderMenuItems = (
    items: MenuItem[],
    level = 0
  ): ReactNode => {
    return (
      <ul
        className={
          level === 0
            ? "flex flex-col gap-4"
            : "mt-2 space-y-1"
        }
      >
        {items.map((menu) => {
          const hasChildren =
            menu.children.length > 0;

          const active =
            menuIsActive(
              menu,
              location.pathname
            );

          const open =
            openMenus[menu.id] ?? false;

          const showText =
            isExpanded ||
            isHovered ||
            isMobileOpen;


          if (level === 0) {
            return (
              <li key={menu.id}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() =>
                      toggleMenu(menu.id)
                    }
                    className={`menu-item group w-full ${
                      active
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    } cursor-pointer ${
                      !isExpanded &&
                      !isHovered
                        ? "lg:justify-center"
                        : "lg:justify-start"
                    }`}
                  >
                    <span
                      className={`menu-item-icon-size ${
                        active
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {renderIcon(menu.icon)}
                    </span>

                    {showText && (
                      <span className="menu-item-text">
                        {menu.name}
                      </span>
                    )}

                    {showText && (
                      <ChevronDownIcon
                        className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                          open
                            ? "rotate-180 text-brand-500"
                            : ""
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  menu.path && (
                    <Link
                      to={menu.path}
                      className={`menu-item group ${
                        active
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      }`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          active
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {renderIcon(menu.icon)}
                      </span>

                      {showText && (
                        <span className="menu-item-text">
                          {menu.name}
                        </span>
                      )}
                    </Link>
                  )
                )}

                {hasChildren && (
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      open && showText
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-9">
                        {renderMenuItems(
                          menu.children,
                          level + 1
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          }


          return (
            <li key={menu.id}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(menu.id)
                  }
                  className={`menu-dropdown-item w-full ${
                    active
                      ? "menu-dropdown-item-active"
                      : "menu-dropdown-item-inactive"
                  }`}
                >
                  <span>
                    {menu.name}
                  </span>

                  <ChevronDownIcon
                    className={`ml-auto w-4 h-4 transition-transform duration-200 ${
                      open
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                </button>
              ) : (
                menu.path && (
                  <Link
                    to={menu.path}
                    className={`menu-dropdown-item ${
                      active
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    {menu.name}
                  </Link>
                )
              )}

              {hasChildren && (
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    open
                      ? "grid-rows-[1fr]"
                      : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="ml-5">
                      {renderMenuItems(
                        menu.children,
                        level + 1
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded ||
          isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
        lg:translate-x-0`}
      onMouseEnter={() =>
        !isExpanded &&
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
    >

      <div
        className={`py-8 flex ${
          !isExpanded &&
          !isHovered
            ? "lg:justify-center"
            : "justify-start"
        }`}
      >
        <Link to={homePath}>

          {isExpanded ||
          isHovered ||
          isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />

              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}

        </Link>
      </div>


      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">

        <nav className="mb-6">

          <div>

            <h2
              className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded &&
                !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
              }`}
            >
              {isExpanded ||
              isHovered ||
              isMobileOpen ? (
                "Menu"
              ) : (
                <HorizontaLDots className="size-6" />
              )}
            </h2>


            {loading ? (
              (isExpanded ||
                isHovered ||
                isMobileOpen) && (
                <div className="text-sm text-gray-400">
                  Memuat menu...
                </div>
              )
            ) : error ? (
              (isExpanded ||
                isHovered ||
                isMobileOpen) && (
                <div className="text-sm text-error-500">
                  {error}
                </div>
              )
            ) : (
              renderMenuItems(menus)
            )}

          </div>

        </nav>


        {isExpanded ||
        isHovered ||
        isMobileOpen ? (
          <SidebarWidget />
        ) : null}

      </div>

    </aside>
  );
};


export default AppSidebar;