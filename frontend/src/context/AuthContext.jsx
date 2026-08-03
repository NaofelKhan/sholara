import { createContext, useContext, useEffect, useState } from "react";
import {
  login as loginApi,
  signup as signupApi,
  getMe,
  setAuthToken,
} from "../api/auth";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("scholara_token");

    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    getMe()
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("scholara_token");
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login
  const login = async (email, password) => {
    const data = await loginApi(email, password);

    localStorage.setItem("scholara_token", data.token);

    setAuthToken(data.token);

    setUser(data);

    return data;
  };

  // Register (Sign Up)
  const register = async (formData) => {
    const data = await signupApi(formData);

    localStorage.setItem("scholara_token", data.token);

    setAuthToken(data.token);

    setUser(data);

    return data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("scholara_token");
    setAuthToken(null);
    setUser(null);
  };

return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
