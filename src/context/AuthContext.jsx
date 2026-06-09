import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { USE_API } from "../api/client.js";
import * as authApi from "../api/authApi.js";

export const AuthContext = createContext(null);

const STORAGE_KEY = "erp_auth";
const AUTH_USERS_KEY = "erp_auth_users";

const DEFAULT_USERS = [
  {
    id: "admin-1",
    username: "admin",
    password: "admin123",
    name: "Admin",
    role: "admin",
  },
];

function loadAuthUsers() {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function saveAuthUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        if (USE_API && localStorage.getItem("erp_access_token")) {
          const me = await authApi.meApi();
          if (me) {
            setUser({ id: me.id, name: me.name, role: me.role });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(me));
            setReady(true);
            return;
          }
        }
        const rawUser = localStorage.getItem(STORAGE_KEY);
        if (rawUser) setUser(JSON.parse(rawUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("erp_access_token");
        setUser(null);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  const register = useCallback(async (data) => {
    if (USE_API) {
      try {
        const result = await authApi.registerApi({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: "admin",
        });
        const sessionUser = {
          id: result.user.id,
          name: result.user.name,
          role: result.user.role,
        };
        setUser(sessionUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        return true;
      } catch {
        return false;
      }
    }

    const users = loadAuthUsers();
    const username = (data.email || data.name || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .slice(0, 32);

    if (users.some((u) => u.username === username)) return false;

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      password: data.password,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: "admin",
    };

    saveAuthUsers([...users, newUser]);
    const sessionUser = { id: newUser.id, name: newUser.name, role: newUser.role };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return true;
  }, []);

  const login = useCallback(async (data) => {
    if (USE_API) {
      try {
        const result = await authApi.loginApi({
          login: data.login || data.username,
          password: data.password,
        });
        const sessionUser = {
          id: result.user.id,
          name: result.user.name,
          role: result.user.role,
        };
        setUser(sessionUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
        return true;
      } catch {
        return false;
      }
    }

    const users = loadAuthUsers();
    const loginId = (data.login || data.username || "").trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.username?.toLowerCase() === loginId ||
        u.email?.toLowerCase() === loginId
    );

    if (!match || match.password !== data.password) return false;

    const sessionUser = { id: match.id, name: match.name, role: match.role };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return true;
  }, []);

  const logout = useCallback(async () => {
    if (USE_API) {
      try {
        await authApi.logoutApi();
      } catch {
        /* ignore */
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("erp_access_token");
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
      ready,
      isAuthenticated: !!user,
    }),
    [user, login, register, logout, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
