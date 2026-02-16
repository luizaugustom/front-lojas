'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, MessageCircle, FileText } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [rememberEmail, setRememberEmail] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    // Se já estiver autenticado, redireciona pela role
    if (isAuthenticated && user) {
      router.replace(user.role === 'vendedor' ? '/seller/profile' : '/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Gera um versículo aleatório a cada montagem do componente
  useEffect(() => {
    const v = getRandomVerse();
    setVerse(v);
  }, []);

  // Carrega e-mails salvos no dispositivo
  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedLoginEmails');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          setSavedEmails(list.filter((e) => typeof e === 'string'));
        }
      }
    } catch (_) {
      // ignora erros de parse/storage
    }
  }, []);

  const onSubmit = async (data: LoginDto) => {
    setLoading(true);
    try {
      const logged = await login(data.login, data.password);
      toast.success('Login realizado com sucesso!');

      // Salva o e-mail localmente (sem credenciais) se marcado
      if (rememberEmail && data.login) {
        try {
          const current = new Set<string>([...savedEmails, String(data.login).trim()]);
          // Limita para evitar crescimento infinito (mantém os mais recentes no final)
          const next = Array.from(current).slice(-10);
          localStorage.setItem('savedLoginEmails', JSON.stringify(next));
          setSavedEmails(next);
        } catch (_) {
          // storage pode falhar (quota, privacidade) — ignora silenciosamente
        }
      }
      // Usar replace para evitar problemas de navegação e garantir que o estado foi atualizado
      const redirectPath = logged.role === 'vendedor' ? '/seller/profile' : '/dashboard';
      // Pequeno delay para garantir que o estado foi propagado
      await new Promise(resolve => setTimeout(resolve, 50));
      router.replace(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const [showSavedEmailsDialog, setShowSavedEmailsDialog] = useState(false);
  const [emailSearchTerm, setEmailSearchTerm] = useState('');

  const filteredSavedEmails = (emailSearchTerm
    ? savedEmails.filter((e) => e.toLowerCase().includes(emailSearchTerm.toLowerCase()))
    : savedEmails
  ).slice(0, 50);

  const handlePickEmail = (email: string) => {
    setValue('login', email);
    setShowSavedEmailsDialog(false);
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-3 py-4 sm:py-6 overflow-x-hidden">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-0.5 text-center p-2 sm:p-4 pb-2">
          <div className="flex justify-center mb-1">
            <Image 
              src="/logo.png" 
              alt="MontShop Logo" 
              width={60} 
              height={60} 
              className="h-12 w-12 sm:h-16 sm:w-16"
            />
          </div>
          <CardTitle className="text-lg sm:text-2xl font-bold -mt-6 sm:-m-10">MontShop</CardTitle>
          <CardDescription className="text-[10px] sm:text-sm mt-0.5">Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-2 sm:pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="login" className="text-xs sm:text-sm">Login</Label>
              <Input
                id="login"
                type="text"
                placeholder="seu@email.com"
                className="h-8 sm:h-9 text-xs sm:text-sm"
                {...register('login')}
                disabled={loading}
              />
              {savedEmails.length > 0 && (
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">E-mails salvos</span>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowSavedEmailsDialog(true)} disabled={loading} className="text-[10px] sm:text-xs h-6 sm:h-7 px-2">
                    Selecionar
                  </Button>
                </div>
              )}
              {errors.login && (
                <p className="text-[10px] sm:text-sm text-destructive">{errors.login.message}</p>
              )}
              <div className="flex items-center gap-1.5 pt-0.5">
                <input
                  id="rememberEmail"
                  type="checkbox"
                  className="h-3 w-3 sm:h-4 sm:w-4"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  disabled={loading}
                />
                <Label htmlFor="rememberEmail" className="text-[10px] sm:text-xs text-muted-foreground">
                  Salvar e-mail
                </Label>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs sm:text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-8 sm:h-9 text-xs sm:text-sm"
                  {...register('password')}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] sm:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-8 sm:h-10 text-xs sm:text-sm mt-1" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Link para Termos de Uso */}
          <div className="mt-3 text-center">
            <Link
              href="/termos-de-uso"
              target="_blank"
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
            >
              <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Termos de Uso
            </Link>
          </div>

          {/* versão removida conforme solicitado */}
          {verse && (
            <div className="mt-1.5 sm:mt-2 text-center text-muted-foreground">
              <p className="italic text-[10px] sm:text-xs">"{verse.text}"</p>
              <p className="mt-0.5 font-medium text-[8px] sm:text-[9px]">{verse.reference}</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      <Dialog open={showSavedEmailsDialog} onOpenChange={setShowSavedEmailsDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-[92vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-mails salvos</DialogTitle>
            <DialogDescription>
              Escolha um e-mail salvo para preencher o campo de login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Pesquisar e-mail..."
              value={emailSearchTerm}
              onChange={(e) => setEmailSearchTerm(e.target.value)}
            />
            {filteredSavedEmails.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Nenhum e-mail salvo encontrado.
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y rounded-md border">
                {filteredSavedEmails.map((email) => (
                  <li key={email} className="p-3 hover:bg-accent/60 flex items-center justify-between gap-2">
                    <div className="truncate text-sm">{email}</div>
                    <Button type="button" size="sm" onClick={() => handlePickEmail(email)}>
                      Usar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Botão SAC no canto inferior esquerdo */}
      <a
        href="https://wa.me/5548998482590?text=Eu%20sou%20usuario%20do%20MontShop%20e%20preciso%20de%20atendimento"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed left-2 sm:left-4 bottom-2 sm:bottom-4 bg-primary hover:bg-primary/90 text-primary-foreground p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110 group"
        title="Serviço de Atendimento ao Consumidor"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 sm:ml-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-900 text-white text-[10px] sm:text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 pointer-events-none">
          Serviço de Atendimento ao Consumidor
        </span>
      </a>
      
      {/* Marca fixa no canto inferior direito */}
      <div className="fixed right-2 sm:right-4 bottom-2 sm:bottom-4 select-none flex flex-col items-center">
        <div className="text-sky-300 font-extrabold tracking-widest text-xs sm:text-sm">MONT</div>
        <div className="text-white text-[9px] sm:text-[11px]">Tecnologia da Informação</div>
      </div>
    </>
  );
}
