import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { setAccessToken } from "../api/apiInstance";
import { useExpenseStore } from "../store/expenseStore";

const AuthContext = createContext();
const normalizeUser = (userData) => {
  const [firstName = "", ...lastNameParts] = (userData.name || "").split(" ");
  return {
    ...userData,
    id: userData.id || userData._id,
    firstName: userData.firstName || firstName,
    lastName: userData.lastName || lastNameParts.join(" "),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi.me()
      .then(({ user: currentUser }) => {
        if (active) setUser(normalizeUser(currentUser));
      })
      .catch(() => {
        setAccessToken(null);
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = ({ accessToken, user: userData }) => {
    setAccessToken(accessToken);
    setUser(normalizeUser(userData));
  };

  const clearSession = () => {
    setAccessToken(null);
    setUser(null);
    useExpenseStore.getState().clearExpenses();
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
