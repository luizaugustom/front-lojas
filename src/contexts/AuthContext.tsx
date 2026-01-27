"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
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
import { api } from '@/lib/api'; // ← API com todos os métodos incluindo notificações
import { removeAuthToken, setUser as setUserStorage, getUser as getUserStorage, setAuthToken as setAuthTokenStorage, getAuthToken as getAuthTokenStorage } from '@/lib/auth';
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

  // Inicializa token e user do storage se existirem
  useEffect(() => {
    // Tenta primeiro do sessionStorage (memória), depois do localStorage
    let existingToken = getMemToken();
    if (!existingToken) {
      existingToken = getAuthTokenStorage();
      // Se encontrou no localStorage, também salva no sessionStorage para consistência
      if (existingToken) {
        setAccessToken(existingToken);
      }
    }
    const existingUser = getUserStorage();
    
    if (existingToken && existingUser) {
      console.log('[AuthContext] Inicializando com token e user existentes');
      setToken(existingToken);
      setUser(existingUser);
    } else if (existingToken) {
      console.log('[AuthContext] Token encontrado mas user não encontrado, limpando token');
      // Se há token mas não há user, limpa o token (estado inconsistente)
      setAccessToken(null);
      removeAuthToken();
    }
  }, []);

  // Tenta refresh silencioso ao montar (usa cookie httpOnly)
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Primeiro verifica se já existe um token válido e user
      const existingToken = getMemToken();
      const existingUser = getUserStorage();
      if (existingToken && existingUser) {
        console.log('[AuthContext] Token e user existentes encontrados, pulando refresh');
        // Garantir que o estado está sincronizado
        setToken(existingToken);
        setUser(existingUser);
        return;
      }
      
      // Desabilitado temporariamente para debug
      console.log('[AuthContext] Refresh automático desabilitado para debug');
      return;
      
      try {
        const data = await authRefresh();
        if (!mounted) return;
        setAccessToken(data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        // Salvar token e user no localStorage para persistência
        setAuthTokenStorage(data.access_token);
        setUserStorage(data.user);
      } catch {
        // Fica deslogado em silêncio apenas se não havia token
        console.log('[AuthContext] Refresh falhou, mas não havia token para limpar');
      }
    })();

    // Listener para logout automático (login em outro dispositivo)
    const handleAutoLogout = (event: CustomEvent) => {
      if (event.detail?.reason === 'login-em-outro-dispositivo') {
        console.log('[AuthContext] Logout automático detectado: login em outro dispositivo');
        // Limpar estado local
        setAccessToken(null);
        setToken(null);
        setUser(null);
        removeAuthToken();
        
        // Mostrar notificação
        toast.error('Você foi desconectado porque fez login em outro dispositivo');
      }
    };

    // Listeners de refresh/logout disparados pelos interceptors
    const offRef = onAuthRefreshed(({ user, accessToken }) => {
      setUser(user);
      setToken(accessToken);
      // Salvar token e user no localStorage quando há refresh
      if (accessToken) {
        setAuthTokenStorage(accessToken);
      }
      setUserStorage(user);
    });
    const offOut = onAuthLoggedOut(() => {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      // Limpa também o localStorage quando logout é disparado pelos interceptors
      removeAuthToken();
    });

    // Adicionar listener para logout automático
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
    console.log('[AuthContext.login] Iniciando login...', { login, password: '***' });
    try {
      const deviceInfo = getDeviceInfo();
      const data = await authLogin(login, password, deviceInfo);
      console.log('[AuthContext.login] Login bem-sucedido, setando token:', {
        hasToken: !!data.access_token,
        tokenPreview: data.access_token ? `${data.access_token.substring(0, 20)}...` : null,
        user: data.user,
        deviceInfo,
      });
      setAccessToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      // Salvar token e user no localStorage para persistência
      setAuthTokenStorage(data.access_token);
      setUserStorage(data.user);
      console.log('[AuthContext.login] Token e user setados no contexto e localStorage');
      
      return data.user;
    } catch (error) {
      console.error('[AuthContext.login] Erro no login:', error);
      throw error;
    }
  }, [getDeviceInfo]);

  const logout = useCallback(async () => {
    console.log('[AuthContext.logout] Iniciando logout...');
    try {
      await authLogout();
      console.log('[AuthContext.logout] Logout da API bem-sucedido');
    } catch (error) {
      console.error('[AuthContext.logout] Erro no logout da API:', error);
      // Continua com a limpeza local mesmo se a API falhar
    } finally {
      // Sempre limpa o estado local
      console.log('[AuthContext.logout] Limpando estado local...');
      setAccessToken(null);
      setToken(null);
      setUser(null);
      // Limpa também o localStorage (token e user)
      removeAuthToken();
      console.log('[AuthContext.logout] Logout concluído');
    }
  }, []);

  const getAccessToken = useCallback(() => getMemToken(), []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }
      const next = { ...prev, ...partial };
      setUserStorage(next);
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
