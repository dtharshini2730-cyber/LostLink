import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lostlink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('lostlink_token');
    if (savedToken) {
      try {
        const profile = await authApi.getMe();
        setUser(profile);
      } catch (err) {
        console.warn("Token expired or invalid, clearing session");
        localStorage.removeItem('lostlink_token');
        setToken(null);
        setUser(null);
      }
    } else {
      // Auto login default demo passenger so the app works seamlessly out of the box
      try {
        const res = await authApi.login('passenger@lostlink.demo', 'LostLink123');
        localStorage.setItem('lostlink_token', res.access_token);
        setToken(res.access_token);
        setUser(res.user);
      } catch (e) {
        console.log("Seeding or backend loading...");
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login(email, pass);
    localStorage.setItem('lostlink_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (payload: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await authApi.register(payload);
    localStorage.setItem('lostlink_token', res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('lostlink_token');
    setToken(null);
    setUser(null);
  };

  const quickSwitchRole = async (role: UserRole) => {
    let email = 'passenger@lostlink.demo';
    if (role === 'WITNESS') email = 'witness@lostlink.demo';
    if (role === 'STAFF') email = 'staff@lostlink.demo';

    try {
      const res = await authApi.login(email, 'LostLink123');
      localStorage.setItem('lostlink_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (e) {
      console.error("Quick switch role failed", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, quickSwitchRole }}>
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
