import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, profileApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fitai_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fitai_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setProfile(res.data.profile);
          }
        } catch (error) {
          console.warn('[AuthContext] Session invalid or server offline:', error.message);
          localStorage.removeItem('fitai_token');
          setUser(null);
          setProfile(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('fitai_token', newToken);
      setToken(newToken);
      setUser(newUser);

      // Fetch profile
      try {
        const profRes = await profileApi.getProfile();
        if (profRes.data.success) {
          setProfile(profRes.data.profile);
        }
      } catch (e) {
        // Fallback profile
      }
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('fitai_token', newToken);
      setToken(newToken);
      setUser(newUser);

      try {
        const profRes = await profileApi.getProfile();
        if (profRes.data.success) {
          setProfile(profRes.data.profile);
        }
      } catch (e) {}
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    localStorage.removeItem('fitai_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await profileApi.getProfile();
      if (res.data.success) {
        setProfile(res.data.profile);
      }
    } catch (e) {
      console.warn('[AuthContext] Failed to refresh profile:', e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
