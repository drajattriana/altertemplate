export interface AuthUser {
  id: number;
  username: string;
  email: string | null;

  role: {
    id: number;
    name: string;
    slug: string;
  };

  redirect_path: string;
}

const API_URL =
  import.meta.env.VITE_API_URL;

const TOKEN_KEY =
  "access_token";

const USER_KEY =
  "auth_user";

const SIDEBAR_KEY =
  "auth_sidebar";


export type SidebarMenu = {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  sort_order: number;
  badge_key: string | null;
  children: SidebarMenu[];
};


/*
|--------------------------------------------------------------------------
| ACTIVE STORAGE
|--------------------------------------------------------------------------
*/

const getActiveStorage =
  (): Storage | null => {
    if (
      localStorage.getItem(
        TOKEN_KEY
      )
    ) {
      return localStorage;
    }

    if (
      sessionStorage.getItem(
        TOKEN_KEY
      )
    ) {
      return sessionStorage;
    }

    return null;
  };


/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

export const saveSidebar = (
  menus: SidebarMenu[],
  remember: boolean
) => {
  localStorage.removeItem(
    SIDEBAR_KEY
  );

  sessionStorage.removeItem(
    SIDEBAR_KEY
  );

  const storage =
    remember
      ? localStorage
      : sessionStorage;

  storage.setItem(
    SIDEBAR_KEY,
    JSON.stringify(
      menus
    )
  );
};


export const getSidebar =
  (): SidebarMenu[] => {
    const storage =
      getActiveStorage();

    if (!storage) {
      return [];
    }

    const raw =
      storage.getItem(
        SIDEBAR_KEY
      );

    if (!raw) {
      return [];
    }

    try {
      return JSON.parse(
        raw
      ) as SidebarMenu[];
    } catch {
      return [];
    }
  };


export const hasSidebarPath = (
  path: string
): boolean => {
  const menus =
    getSidebar();

  const findPath = (
    items: SidebarMenu[]
  ): boolean => {
    for (
      const item of items
    ) {
      if (
        item.path ===
        path
      ) {
        return true;
      }

      if (
        item.children.length >
          0 &&
        findPath(
          item.children
        )
      ) {
        return true;
      }
    }

    return false;
  };

  return findPath(
    menus
  );
};


/*
|--------------------------------------------------------------------------
| AUTH STORAGE
|--------------------------------------------------------------------------
*/

export const saveAuth = (
  token: string,
  user: AuthUser,
  remember: boolean
) => {
  clearAuth();

  const storage =
    remember
      ? localStorage
      : sessionStorage;

  storage.setItem(
    TOKEN_KEY,
    token
  );

  storage.setItem(
    USER_KEY,
    JSON.stringify(
      user
    )
  );
};


export const getToken =
  (): string | null => {
    const storage =
      getActiveStorage();

    if (!storage) {
      return null;
    }

    return storage.getItem(
      TOKEN_KEY
    );
  };


export const getAuthUser =
  (): AuthUser | null => {
    const storage =
      getActiveStorage();

    if (!storage) {
      return null;
    }

    const raw =
      storage.getItem(
        USER_KEY
      );

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(
        raw
      ) as AuthUser;
    } catch {
      return null;
    }
  };


export const clearAuth =
  () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );

    localStorage.removeItem(
      SIDEBAR_KEY
    );

    sessionStorage.removeItem(
      TOKEN_KEY
    );

    sessionStorage.removeItem(
      USER_KEY
    );

    sessionStorage.removeItem(
      SIDEBAR_KEY
    );
  };


/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logout =
  async (): Promise<void> => {
    const token =
      getToken();

    try {
      if (token) {
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method:
              "POST",

            credentials:
              "omit",

            headers: {
              Accept:
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },
          }
        );
      }
    } catch {
      //
    } finally {
      clearAuth();
    }
  };


/*
|--------------------------------------------------------------------------
| JWT
|--------------------------------------------------------------------------
*/

const decodeToken = (
  token: string
) => {
  try {
    const payload =
      token.split(".")[1];

    let base64 =
      payload
        .replace(
          /-/g,
          "+"
        )
        .replace(
          /_/g,
          "/"
        );

    while (
      base64.length % 4
    ) {
      base64 += "=";
    }

    return JSON.parse(
      atob(base64)
    );
  } catch {
    return null;
  }
};


export const getTokenExpiration =
  (): number | null => {
    const token =
      getToken();

    if (!token) {
      return null;
    }

    const payload =
      decodeToken(
        token
      );

    if (!payload?.exp) {
      return null;
    }

    return (
      payload.exp *
      1000
    );
  };


export const isAuthenticated =
  (): boolean => {
    const token =
      getToken();

    if (!token) {
      return false;
    }

    const expiresAt =
      getTokenExpiration();

    if (!expiresAt) {
      clearAuth();

      return false;
    }

    if (
      Date.now() >=
      expiresAt
    ) {
      clearAuth();

      return false;
    }

    return true;
  };