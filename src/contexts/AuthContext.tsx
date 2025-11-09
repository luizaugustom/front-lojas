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
import { removeAuthToken, setUser as setUserStorage, getUser as getUserStorage, setAuthToken as setAuthTokenStorage, getAuthToken as getAuthTokenStorage } from '@/lib/auth';
import { checkPrinterStatus } from '@/lib/printer-check';
import { getComputerId, detectAllDevices } from '@/lib/device-detection';
import { scaleApi } from '@/lib/api-endpoints';

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

    return () => {
      mounted = false;
      offRef();
      offOut();
    };
  }, []);

  // Função para detectar e registrar dispositivos do computador
  const detectAndRegisterDevices = useCallback(async () => {
    try {
      const computerId = getComputerId();
      console.log('[AuthContext] Detectando dispositivos para computador:', computerId);

      // Detecta todos os dispositivos disponíveis
      const { printers, scales } = await detectAllDevices();

      // Configuração de impressoras removida - não registra mais

      // Registra balanças no backend
      if (scales.length > 0) {
        try {
          await scaleApi.registerDevices({ computerId, scales });
          console.log(`[AuthContext] ${scales.length} balança(s) registrada(s)`);
        } catch (error) {
          console.error('[AuthContext] Erro ao registrar balanças:', error);
        }
      }

      if (printers.length === 0 && scales.length === 0) {
        console.log('[AuthContext] Nenhum dispositivo detectado automaticamente. O usuário pode selecionar manualmente.');
      }
    } catch (error) {
      console.error('[AuthContext] Erro ao detectar dispositivos:', error);
    }
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
      // Salvar token e user no localStorage para persistência
      setAuthTokenStorage(data.access_token);
      setUserStorage(data.user);
      console.log('[AuthContext.login] Token e user setados no contexto e localStorage');
      
      // Detectar e registrar dispositivos do computador após login bem-sucedido
      try {
        console.log('[AuthContext.login] Detectando dispositivos do computador...');
        await detectAndRegisterDevices();
      } catch (deviceError) {
        console.error('[AuthContext.login] Erro ao detectar dispositivos:', deviceError);
        // Não bloqueia o login se houver erro na detecção de dispositivos
      }
      
      return data.user;
    } catch (error) {
      console.error('[AuthContext.login] Erro no login:', error);
      throw error;
    }
  }, [detectAndRegisterDevices]);

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
