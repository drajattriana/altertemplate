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

const TOKEN_KEY = "access_token";
const USER_KEY = "auth_user";

export const saveAuth = (
  token: string,
  user: AuthUser,
  remember: boolean
) => {
  clearAuth();

  const storage = remember
    ? localStorage
    : sessionStorage;

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem(TOKEN_KEY)
  );
};

export const getAuthUser = (): AuthUser | null => {
  const raw =
    localStorage.getItem(USER_KEY) ||
    sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];

    let base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (base64.length % 4) {
      base64 += "=";
    }

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export const getTokenExpiration = (): number | null => {
  const token = getToken();

  if (!token) {
    return null;
  }

  const payload = decodeToken(token);

  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
};

export const isAuthenticated = (): boolean => {
  const token = getToken();

  if (!token) {
    return false;
  }

  const expiresAt = getTokenExpiration();

  if (!expiresAt) {
    clearAuth();
    return false;
  }

  if (Date.now() >= expiresAt) {
    clearAuth();
    return false;
  }

  return true;
};