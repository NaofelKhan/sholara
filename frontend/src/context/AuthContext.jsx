import { createContext, useContext, useEffect, useState } from 'react';
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
    const stored = localStorage.getItem('scholara_token');
    if (!stored) { setLoading(false); return; }
    setAuthToken(stored);
    getMe().then(setUser).catch(() => { localStorage.removeItem('scholara_token'); setAuthToken(null); }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => { const data = await loginApi(email, password); localStorage.setItem('scholara_token', data.token); setAuthToken(data.token); setUser(data); return data; };
  const signup = async (name, email, password) => { const data = await signupApi(name, email, password); localStorage.setItem('scholara_token', data.token); setAuthToken(data.token); setUser(data); return data; };
  const logout = () => {
    localStorage.removeItem("scholara_token");
    setAuthToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
};
