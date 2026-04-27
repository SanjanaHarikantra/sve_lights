import { useState, type ReactNode } from 'react';
import { loginRequest, registerRequest, adminLoginRequest } from '../services/auth';
import type { AuthUser } from '../types';
import {
  AuthContext,
  AUTH_STORAGE_KEY,
  type StoredAuth,
} from './authContext';

const readStoredAuth = (): StoredAuth | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredAuth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storedAuth = readStoredAuth();
  const [user, setUser] = useState(storedAuth?.user ?? null);
  const [token, setToken] = useState<string | null>(storedAuth?.token ?? null);

  const persistAuth = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        token: nextToken,
        user: nextUser,
      })
    );
  };

  const login = async (email: string, password: string) => {
    const response = await loginRequest({ email, password });
    persistAuth(response.token, response.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    wantsAdmin = false
  ) => {
    const response = await registerRequest({
      name,
      email,
      password,
      role: wantsAdmin ? 'admin' : 'user',
    });
    persistAuth(response.token, response.user);
  };

  const adminLogin = async (password: string) => {
    const response = await adminLoginRequest({ password });
    persistAuth(response.token, response.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    login,
    register,
    adminLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
