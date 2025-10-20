"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  login: z.string().min(1, 'Informe o login'),
  password: z.string().min(1, 'Informe a senha'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'vendedor' ? '/sales' : '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (data: FormData) => {
    console.log('[LoginForm] Tentando login:', { login: data.login, password: '***' });
    setLoading(true);
    try {
      const logged = await login(data.login, data.password);
      console.log('[LoginForm] Login bem-sucedido, redirecionando...');
      router.push(logged.role === 'vendedor' ? '/sales' : '/dashboard');
    } catch (e: any) {
      console.error('[LoginForm] Erro no login:', e);
      // Mensagem amigável (evitar vazamento de detalhes)
      alert(e?.response?.data?.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Entrar</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Use suas credenciais para acessar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="login">Login</Label>
              <Input 
                id="login" 
                {...register('login')} 
                disabled={loading}
                placeholder="empresa@example.com"
                defaultValue="empresa@example.com"
                aria-describedby={errors.login ? "login-error" : undefined}
                aria-invalid={!!errors.login}
              />
              {errors.login && (
                <p id="login-error" className="text-xs sm:text-sm text-red-500 mt-1" role="alert">
                  {errors.login.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                disabled={loading}
                placeholder="company123"
                defaultValue="company123"
                aria-describedby={errors.password ? "password-error" : undefined}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p id="password-error" className="text-xs sm:text-sm text-red-500 mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              aria-describedby="login-status"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <div id="login-status" className="sr-only" aria-live="polite">
              {loading ? 'Fazendo login...' : 'Pronto para fazer login'}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
