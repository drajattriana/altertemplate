const DEMO_AUTH_KEY = "alterdev_demo_admin";

export const DEMO_USERNAME = "admin";
export const DEMO_PASSWORD = "admin";

export const isDemoAuthenticated = () => {
  return localStorage.getItem(DEMO_AUTH_KEY) === "true" || sessionStorage.getItem(DEMO_AUTH_KEY) === "true";
};

export const loginDemo = (remember: boolean) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;
  otherStorage.removeItem(DEMO_AUTH_KEY);
  storage.setItem(DEMO_AUTH_KEY, "true");
};

export const logoutDemo = () => {
  localStorage.removeItem(DEMO_AUTH_KEY);
  sessionStorage.removeItem(DEMO_AUTH_KEY);
};

