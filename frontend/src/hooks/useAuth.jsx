import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser, signupUser } from "@/services/api";

const AuthContext = createContext({
  user: null,
  token: null,
  isLoading: false,
  login: async () => { },
  signup: async () => { },
  logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

const TOKEN_STORAGE_KEY = "cavistamed_auth_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(token);
        if (isActive) {
          setUser(response.user);
        }
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (isActive) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      isActive = false;
    };
  }, [token]);

  const login = async ({ email, password }) => {
    const response = await loginUser({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const signup = async ({ name, email, password, role }) => {
    const response = await signupUser({ name, email, password, role });
    localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({ user, token, isLoading, login, signup, logout }),
    [user, token, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
