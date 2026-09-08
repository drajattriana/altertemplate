import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../../icons";

import {
  useSidebar,
} from "../../context/SidebarContext";

import {
  getAuthUser,
  getSidebar,
  getToken,
} from "../../utils/auth";

import {
  MenuIcon,
} from "../../utils/menuIcons";

import SidebarWidget from "./SidebarWidget";


const API_URL =
  import.meta.env.VITE_API_URL;


/*
|--------------------------------------------------------------------------
| TYPE MENU
|--------------------------------------------------------------------------
*/

type MenuItem = {
  id: number;

  name: string;

  path: string | null;

  icon: string | null;

  sort_order: number;

  badge_key: string | null;

  children: MenuItem[];
};


/*
|--------------------------------------------------------------------------
| TYPE BADGE RESPONSE
|--------------------------------------------------------------------------
*/

type BadgeResponse = {
  badges: Record<
    string,
    number
  >;
};


/*
|--------------------------------------------------------------------------
| CHECK MENU ACTIVE
|--------------------------------------------------------------------------
*/

const menuIsActive = (
  menu: MenuItem,
  pathname: string
): boolean => {
  if (
    menu.path === pathname
  ) {
    return true;
  }

  return menu.children.some(
    (child) =>
      menuIsActive(
        child,
        pathname
      )
  );
};


/*
|--------------------------------------------------------------------------
| CARI PARENT DARI ROUTE ACTIVE
|--------------------------------------------------------------------------
*/

const findActiveTrail = (
  items: MenuItem[],
  pathname: string,
  trail: number[] = []
): number[] | null => {
  for (
    const item of items
  ) {
    const currentTrail = [
      ...trail,
      item.id,
    ];

    if (
      item.path === pathname
    ) {
      return currentTrail;
    }

    if (
      item.children.length > 0
    ) {
      const result =
        findActiveTrail(
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


/*
|--------------------------------------------------------------------------
| APP SIDEBAR
|--------------------------------------------------------------------------
*/

const AppSidebar: React.FC =
  () => {
    const {
      isExpanded,
      isMobileOpen,
      isHovered,
      setIsHovered,
    } = useSidebar();


    const location =
      useLocation();


    /*
    |--------------------------------------------------------------------------
    | SIDEBAR DARI STORAGE
    |--------------------------------------------------------------------------
    |
    | Tetap tidak request API.
    |
    | Menu sudah disimpan saat login.
    |
    */

    const [menus] =
      useState<MenuItem[]>(
        () =>
          getSidebar()
      );


    /*
    |--------------------------------------------------------------------------
    | BADGES
    |--------------------------------------------------------------------------
    |
    | Badge TIDAK ikut cache sidebar.
    |
    | Nilai badge diambil live.
    |
    */

    const [
      badges,
      setBadges,
    ] = useState<
      Record<string, number>
    >({});


    /*
    |--------------------------------------------------------------------------
    | OPEN SUBMENU
    |--------------------------------------------------------------------------
    */

    const [
      openMenus,
      setOpenMenus,
    ] = useState<
      Record<number, boolean>
    >({});


    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    const user =
      getAuthUser();


    const homePath =
      user?.redirect_path ??
      "/";


    /*
    |--------------------------------------------------------------------------
    | LOAD BADGES
    |--------------------------------------------------------------------------
    */

    const loadBadges =
      useCallback(
        async () => {
          const token =
            getToken();

          if (!token) {
            setBadges({});
            return;
          }


          try {
            const response =
              await fetch(
                `${API_URL}/auth/notifications/badges`,
                {
                  method: "GET",

                  headers: {
                    Accept:
                      "application/json",

                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );


            if (
              !response.ok
            ) {
              return;
            }


            const data =
              (await response.json()) as BadgeResponse;


            setBadges(
              data.badges ?? {}
            );
          } catch {
            /*
             * Badge bukan data kritikal.
             *
             * Kalau request gagal,
             * sidebar tetap dapat digunakan.
             */
          }
        },
        []
      );


    /*
    |--------------------------------------------------------------------------
    | LOAD + REFRESH BADGE
    |--------------------------------------------------------------------------
    |
    | - Saat sidebar pertama tampil
    | - Setiap 60 detik
    | - Saat browser/tab kembali aktif
    |
    */

    useEffect(() => {
      loadBadges();


      const interval =
        window.setInterval(
          () => {
            loadBadges();
          },
          60000
        );


      const handleFocus =
        () => {
          loadBadges();
        };


      window.addEventListener(
        "focus",
        handleFocus
      );


      return () => {
        window.clearInterval(
          interval
        );

        window.removeEventListener(
          "focus",
          handleFocus
        );
      };
    }, [
      loadBadges,
    ]);


    /*
    |--------------------------------------------------------------------------
    | AUTO OPEN PARENT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
      const trail =
        findActiveTrail(
          menus,
          location.pathname
        );


      if (!trail) {
        return;
      }


      setOpenMenus(
        (previous) => {
          const next = {
            ...previous,
          };


          trail
            .slice(0, -1)
            .forEach(
              (id) => {
                next[id] =
                  true;
              }
            );


          return next;
        }
      );
    }, [
      menus,
      location.pathname,
    ]);


    /*
    |--------------------------------------------------------------------------
    | TOGGLE MENU
    |--------------------------------------------------------------------------
    */

    const toggleMenu = (
      id: number
    ) => {
      setOpenMenus(
        (previous) => ({
          ...previous,

          [id]:
            !previous[id],
        })
      );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER BADGE
    |--------------------------------------------------------------------------
    */

    const renderBadge = (
      badgeKey:
        | string
        | null
    ): ReactNode => {
      if (!badgeKey) {
        return null;
      }


      const total =
        badges[badgeKey] ??
        0;


      if (
        total <= 0
      ) {
        return null;
      }


      return (
        <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
          {total > 99
            ? "99+"
            : total}
        </span>
      );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER MENU RECURSIVE
    |--------------------------------------------------------------------------
    */

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

          {items.map(
            (menu) => {
              const hasChildren =
                menu.children.length >
                0;


              const active =
                menuIsActive(
                  menu,
                  location.pathname
                );


              const open =
                openMenus[
                  menu.id
                ] ?? false;


              const showText =
                isExpanded ||
                isHovered ||
                isMobileOpen;


              /*
              |--------------------------------------------------------------------------
              | MENU UTAMA
              |--------------------------------------------------------------------------
              */

              if (
                level === 0
              ) {
                return (
                  <li
                    key={
                      menu.id
                    }
                  >

                    {hasChildren ? (
                      <button
                        type="button"

                        onClick={() =>
                          toggleMenu(
                            menu.id
                          )
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
                          <MenuIcon
                            name={
                              menu.icon
                            }
                          />
                        </span>


                        {showText && (
                          <span className="menu-item-text">
                            {menu.name}
                          </span>
                        )}


                        {showText && (
                          <div className="ml-auto flex items-center gap-2">

                            {renderBadge(
                              menu.badge_key
                            )}


                            <ChevronDownIcon
                              className={`h-5 w-5 transition-transform duration-200 ${
                                open
                                  ? "rotate-180 text-brand-500"
                                  : ""
                              }`}
                            />

                          </div>
                        )}

                      </button>
                    ) : (

                      menu.path && (
                        <Link
                          to={
                            menu.path
                          }

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
                            <MenuIcon
                              name={
                                menu.icon
                              }
                            />
                          </span>


                          {showText && (
                            <>
                              <span className="menu-item-text">
                                {menu.name}
                              </span>

                              {renderBadge(
                                menu.badge_key
                              )}
                            </>
                          )}

                        </Link>
                      )
                    )}


                    {hasChildren && (
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                          open &&
                          showText
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]"
                        }`}
                      >

                        <div className="overflow-hidden">

                          <div className="ml-9">

                            {renderMenuItems(
                              menu.children,
                              level +
                                1
                            )}

                          </div>

                        </div>

                      </div>
                    )}

                  </li>
                );
              }


              /*
              |--------------------------------------------------------------------------
              | SUBMENU
              |--------------------------------------------------------------------------
              */

              return (
                <li
                  key={
                    menu.id
                  }
                >

                  {hasChildren ? (

                    <button
                      type="button"

                      onClick={() =>
                        toggleMenu(
                          menu.id
                        )
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


                      <div className="ml-auto flex items-center gap-2">

                        {renderBadge(
                          menu.badge_key
                        )}


                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform duration-200 ${
                            open
                              ? "rotate-180 text-brand-500"
                              : ""
                          }`}
                        />

                      </div>

                    </button>

                  ) : (

                    menu.path && (
                      <Link
                        to={
                          menu.path
                        }

                        className={`menu-dropdown-item ${
                          active
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >

                        <span>
                          {menu.name}
                        </span>


                        {renderBadge(
                          menu.badge_key
                        )}

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
                            level +
                              1
                          )}

                        </div>

                      </div>

                    </div>
                  )}

                </li>
              );
            }
          )}

        </ul>
      );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

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
          setIsHovered(
            true
          )
        }

        onMouseLeave={() =>
          setIsHovered(
            false
          )
        }
      >

        {/* LOGO */}

        <div
          className={`py-8 flex ${
            !isExpanded &&
            !isHovered
              ? "lg:justify-center"
              : "justify-start"
          }`}
        >

          <Link
            to={
              homePath
            }
          >

            {isExpanded ||
            isHovered ||
            isMobileOpen ? (
              <>
                <img
                  className="dark:hidden"

                  src="/images/logo/logo.svg"

                  alt="Logo"

                  width={
                    150
                  }

                  height={
                    40
                  }
                />


                <img
                  className="hidden dark:block"

                  src="/images/logo/logo-dark.svg"

                  alt="Logo"

                  width={
                    150
                  }

                  height={
                    40
                  }
                />
              </>
            ) : (
              <img
                src="/images/logo/logo-icon.svg"

                alt="Logo"

                width={
                  32
                }

                height={
                  32
                }
              />
            )}

          </Link>

        </div>


        {/* SIDEBAR CONTENT */}

        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">

          <nav className="mb-6">

            <div className="flex flex-col gap-6">

              {menus.map(
                (section) => (
                  <div
                    key={
                      section.id
                    }
                  >

                    {/* SECTION */}

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

                        section.name

                      ) : (

                        <HorizontaLDots className="size-6" />

                      )}

                    </h2>


                    {/* MENU */}

                    {renderMenuItems(
                      section.children,
                      0
                    )}

                  </div>
                )
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