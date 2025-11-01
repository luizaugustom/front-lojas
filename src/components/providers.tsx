'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { AuthProvider } from '@/contexts/AuthContext';
import { CompanyColorProvider } from '@/components/CompanyColorProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Não tenta novamente em erros 4xx (exceto 401 que é tratado separadamente)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2; // Máximo 2 tentativas
      },
      onError: (error: any) => {
        // Loga erros de query automaticamente
        console.error('[React Query Error]', error);
      },
    },
    mutations: {
      onError: (error: any) => {
        // Loga erros de mutations automaticamente
        console.error('[React Query Mutation Error]', error);
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const setTheme = useUIStore((state) => state.setTheme);

  useEffect(() => {
    // Initialize auth
    initialize();

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [initialize, setTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CompanyColorProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'white',
                },
              },
            }}
          />
        </CompanyColorProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
