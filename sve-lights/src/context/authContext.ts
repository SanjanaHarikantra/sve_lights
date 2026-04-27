import { createContext } from 'react';
import type { AuthUser } from '../types';

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, wantsAdmin?: boolean) => Promise<void>;
  adminLogin: (password: string) => Promise<void>;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = 'sve-auth';

export type StoredAuth = {
  token: string;
  user: AuthUser;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
