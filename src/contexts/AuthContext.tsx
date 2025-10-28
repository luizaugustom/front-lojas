"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types';
import {
  authLogin,
  authLogout,
  authRefresh,
  getAccessToken as getMemToken,
  setAccessToken,
  onAuthRefreshed,
  onAuthLoggedOut,
} from '@/lib/apiClient';
import { api } from '@/lib/api'; // ← API com todos os métodos incluindo notificações
import { removeAuthToken } from '@/lib/auth';
import { checkPrinterStatus } from '@/lib/printer-check';

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  api: typeof api;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const isAuthenticated = !!token && !!user;

  // Inicializa token do sessionStorage se existir
  useEffect(() => {
    const existingToken = getMemToken();
    if (existingToken) {
      console.log('[AuthContext] Inicializando com token existente');
      setToken(existingToken);
    }
  }, []);

  // Tenta refresh silencioso ao montar (usa cookie httpOnly)
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Primeiro verifica se já existe um token válido
      const existingToken = getMemToken();
      if (existingToken) {
        console.log('[AuthContext] Token existente encontrado, pulando refresh');
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
      } catch {
        // Fica deslogado em silêncio apenas se não havia token
        console.log('[AuthContext] Refresh falhou, mas não havia token para limpar');
      }
    })();

    // Listeners de refresh/logout disparados pelos interceptors
    const offRef = onAuthRefreshed(({ user, accessToken }) => {
      setUser(user);
      setToken(accessToken);
    });
    const offOut = onAuthLoggedOut(() => {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      // Limpa também o localStorage quando logout é disparado pelos interceptors
      removeAuthToken();
    });

    return () => {
      mounted = false;
      offRef();
      offOut();
    };
  }, []);

  const login = useCallback(async (login: string, password: string) => {
    console.log('[AuthContext.login] Iniciando login...', { login, password: '***' });
    try {
      const data = await authLogin(login, password);
      console.log('[AuthContext.login] Login bem-sucedido, setando token:', {
        hasToken: !!data.access_token,
        tokenPreview: data.access_token ? `${data.access_token.substring(0, 20)}...` : null,
        user: data.user
      });
      setAccessToken(data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      console.log('[AuthContext.login] Token setado no contexto');
      
      // Verificar status da impressora após login bem-sucedido
      try {
        console.log('[AuthContext.login] Verificando impressoras...');
        await checkPrinterStatus();
      } catch (printerError) {
        console.error('[AuthContext.login] Erro ao verificar impressoras:', printerError);
        // Não bloqueia o login se houver erro na verificação da impressora
      }
      
      return data.user;
    } catch (error) {
      console.error('[AuthContext.login] Erro no login:', error);
      throw error;
    }
  }, []);

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
      // Limpa também o localStorage
      removeAuthToken();
      console.log('[AuthContext.logout] Logout concluído');
    }
  }, []);

  const getAccessToken = useCallback(() => getMemToken(), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, login, logout, getAccessToken, api }),
    [user, isAuthenticated, login, logout, getAccessToken]
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
