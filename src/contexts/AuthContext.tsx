"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import {
  authLogin,
  authLogout,
  authRefresh,
  getAccessToken as getMemToken,
  setAccessToken,
  onAuthRefreshed,
  onAuthLoggedOut,
  type DeviceInfo,
} from '@/lib/apiClient';
import { api } from '@/lib/api';
import { removeAuthToken, setUser as setUserInAuth, getUser as getUserFromAuth } from '@/lib/auth';
import { checkPrinterStatus } from '@/lib/printer-check';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  api: typeof api;
  updateUser: (partial: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const isAuthenticated = !!token && !!user;
  const queryClient = useQueryClient();

  // Inicializa estado a partir da memória (token/user não são mais persistidos em localStorage)
  useEffect(() => {
    const existingToken = getMemToken();
    const existingUser = getUserFromAuth();
    if (existingToken && existingUser) {
      setToken(existingToken);
      setUser(existingUser);
    } else if (existingToken) {
      setAccessToken(null);
      removeAuthToken();
    }
  }, []);

  // Tenta refresh silencioso ao montar (usa cookie httpOnly)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const existingToken = getMemToken();
      const existingUser = getUserFromAuth();
      if (existingToken && existingUser) {
        setToken(existingToken);
        setUser(existingUser);
        return;
      }
      try {
        const data = await authRefresh();
        if (!mounted) return;
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setUserInAuth(data.user);
      } catch {
        // Fica deslogado em silêncio se não havia sessão válida
      }
    })();

    // Listener para logout automático (login em outro dispositivo)
    const handleAutoLogout = (event: CustomEvent) => {
      const reason = event.detail?.reason;
      // Sempre limpa estado em qualquer logout automático; toast só para login em outro dispositivo
      setAccessToken(null);
      setToken(null);
      setUser(null);
      removeAuthToken();
      if (reason === 'login-em-outro-dispositivo') {
        toast.error('Você foi desconectado porque fez login em outro dispositivo');
      }
    };

    const offRef = onAuthRefreshed(({ user, accessToken }) => {
      setUser(user);
      setToken(accessToken);
      setUserInAuth(user);
    });
    const offOut = onAuthLoggedOut(() => {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      removeAuthToken();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:auto-logout', handleAutoLogout as EventListener);
    }

    return () => {
      mounted = false;
      offRef();
      offOut();
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:auto-logout', handleAutoLogout as EventListener);
      }
    };
  }, []);

  // Polling: verifica periodicamente se a sessão ainda é válida (ex.: login em outro dispositivo)
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return;

    const SESSION_CHECK_INTERVAL_MS = 2 * 60 * 1000; // 2 minutos

    const checkSession = async () => {
      try {
        const data = await authRefresh();
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setUserInAuth(data.user);
      } catch (err: unknown) {
        const ax = err as { response?: { status?: number; data?: { message?: string } } };
        const msg = ax?.response?.data?.message ?? '';
        const isRevoked =
          ax?.response?.status === 401 &&
          (msg === 'Refresh token revoked' ||
            msg.toLowerCase().includes('invalid') ||
            msg.toLowerCase().includes('expired') ||
            msg.toLowerCase().includes('revoked'));

        if (isRevoked) {
          setAccessToken(null);
          setToken(null);
          setUser(null);
          removeAuthToken();
          queryClient.clear();
          window.dispatchEvent(
            new CustomEvent('auth:auto-logout', { detail: { reason: 'login-em-outro-dispositivo' } })
          );
        }
      }
    };

    const intervalId = window.setInterval(checkSession, SESSION_CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, queryClient]);

  const getDeviceInfo = useCallback((): DeviceInfo => {
    // Gerar ou recuperar deviceId único para este navegador
    const DEVICE_ID_KEY = 'montshop_device_id';
    let deviceId = typeof window !== 'undefined' ? localStorage.getItem(DEVICE_ID_KEY) : null;
    
    if (!deviceId) {
      // Gerar um ID único baseado em informações do navegador
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset().toString(),
        navigator.hardwareConcurrency?.toString() || '',
      ].join('|');
      
      // Hash simples
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      deviceId = `web_${Math.abs(hash).toString(36)}${Date.now().toString(36)}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
      }
    }

    // Gerar nome descritivo do dispositivo
    const ua = navigator.userAgent.toLowerCase();
    let browser = 'Navegador';
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
    }

    let os = '';
    if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }

    const deviceName = os ? `${browser} no ${os}` : browser;

    return {
      deviceId,
      deviceName,
    };
  }, []);

  const login = useCallback(async (login: string, password: string) => {
    try {
      const deviceInfo = getDeviceInfo();
      const data = await authLogin(login, password, deviceInfo);
      setAccessToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      setUserInAuth(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  }, [getDeviceInfo]);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } catch {
      // Continua com a limpeza local mesmo se a API falhar
    } finally {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      removeAuthToken();
      queryClient.clear();
    }
  }, [queryClient]);

  const getAccessToken = useCallback(() => getMemToken(), []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      setUserInAuth(next);
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, login, logout, getAccessToken, api, updateUser }),
    [user, isAuthenticated, login, logout, getAccessToken, updateUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
