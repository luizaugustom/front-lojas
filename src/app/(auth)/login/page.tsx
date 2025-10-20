'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginSchema } from '@/lib/validations';
import { getRandomVerse } from '@/lib/verses';
import { handleApiError } from '@/lib/handleApiError';
import { useAuth } from '@/hooks/useAuth';
import type { LoginDto } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verse, setVerse] = useState<{ reference: string; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Se já estiver autenticado, redireciona pela role
    if (isAuthenticated && user) {
      router.replace(user.role === 'vendedor' ? '/sales' : '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Gera um versículo aleatório a cada montagem do componente
  useEffect(() => {
    const v = getRandomVerse();
    setVerse(v);
  }, []);

  const onSubmit = async (data: LoginDto) => {
    setLoading(true);
    try {
      const logged = await login(data.login, data.password);
      toast.success('Login realizado com sucesso!');
      router.push(logged.role === 'vendedor' ? '/sales' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="MontShop Logo" 
              width={128} 
              height={128} 
              className="h-32 w-32"
            />
          </div>
          <CardTitle className="text-2xl font-bold -m-10">MontShop</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                type="text"
                placeholder="seu@email.com"
                {...register('login')}
                disabled={loading}
              />
              {errors.login && (
                <p className="text-sm text-destructive">{errors.login.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* versão removida conforme solicitado */}
          {verse && (
            <div className="mt-4 text-center text-muted-foreground">
              <p className="italic text-xs">“{verse.text}”</p>
              <p className="mt-1 font-medium text-[10px]">{verse.reference}</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      {/* Marca fixa no canto inferior direito */}
      <div className="fixed right-4 bottom-4 select-none flex flex-col items-center">
        <div className="text-sky-300 font-extrabold tracking-widest">MONT</div>
        <div className="text-white text-[11px]">Tecnologia da Informação</div>
      </div>
    </>
  );
}
