import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const retryRef = useRef(null);

  const checkAuth = useCallback(async (attempt = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await authService.getMe();
      setUser(response.data.user);
      setLoading(false);
    } catch (err) {
      const isNetworkError = !err || err.message === 'Network error';
      const isServerError = err?.status && err.status >= 500;

      if ((isNetworkError || isServerError) && attempt < 3) {
        const delay = 1000 * (attempt + 1);
        retryRef.current = setTimeout(() => checkAuth(attempt + 1), delay);
        return;
      }

      // Only clear session on explicit auth failure (401)
      if (err?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [checkAuth]);

  const login = async (data) => {
    const response = await authService.login(data);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
