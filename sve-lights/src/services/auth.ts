import { apiRequest } from './api';
import type { AuthResponse } from '../types';

type AuthPayload = {
  name?: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
};

export const loginRequest = (payload: AuthPayload) =>
  apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });

export const registerRequest = (payload: AuthPayload) =>
  apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });

export const adminLoginRequest = (payload: { password: string }) =>
  apiRequest<AuthResponse>('/api/auth/admin-login', {
    method: 'POST',
    body: payload,
  });
