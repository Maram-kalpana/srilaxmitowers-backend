import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

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
    try {
      const rawUser = localStorage.getItem(STORAGE_KEY);
      if (rawUser) {
        setUser(JSON.parse(rawUser));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  const register = useCallback(async (data) => {
    const users = loadAuthUsers();
    const username = (data.email || data.name || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .slice(0, 32);

    if (users.some((u) => u.username === username)) {
      return false;
    }

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
    const users = loadAuthUsers();
    const loginId = (data.login || data.username || "").trim().toLowerCase();
    const match = users.find(
      (u) =>
        u.username?.toLowerCase() === loginId ||
        u.email?.toLowerCase() === loginId
    );

    if (!match || match.password !== data.password) {
      return false;
    }

    const sessionUser = { id: match.id, name: match.name, role: match.role };
    setUser(sessionUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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
