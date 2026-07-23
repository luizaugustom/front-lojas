'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lock, Save, Settings as SettingsIcon, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { adminApi, managerApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import type { UserRole } from '@/types';

interface FocusNfeConfigResponse {
  ibptToken?: string;
  hasIbptToken?: boolean;
}

interface ManagerCompany {
  id: string;
  name?: string;
  fantasyName?: string;
}

interface CompanyPasswordModalState {
  companyId: string;
  companyName: string;
}

const LoaderBlock = ({ label }: { label: string }) => (
  <div
    role="status"
    aria-live="polite"
    aria-label={label}
    className="flex flex-col items-center justify-center gap-2 py-8"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

export function AdministracaoSettings() {
  const { user, api: authApi } = useAuth();
  const role: UserRole | undefined = (user?.role as UserRole | undefined) ?? undefined;
  const isAdmin = role === 'admin';
  const isGestor = role === 'gestor';

  // Admin: Token IBPT global via /admin/nfeio-config
  const [adminIbptConfig, setAdminIbptConfig] = useState<FocusNfeConfigResponse | null>(null);
  const [loadingAdminIbpt, setLoadingAdminIbpt] = useState(false);
  const [savingAdminIbpt, setSavingAdminIbpt] = useState(false);
  const [adminIbptForm, setAdminIbptForm] = useState({ ibptToken: '' });

  const loadAdminIbptConfig = useCallback(async () => {
    try {
      setLoadingAdminIbpt(true);
      const response = await adminApi.getFocusNfeConfig();
      const data = (response.data ?? {}) as FocusNfeConfigResponse;
      setAdminIbptConfig(data);
      setAdminIbptForm({ ibptToken: data.ibptToken ?? '' });
    } catch (error) {
      console.error('Erro ao carregar token IBPT global:', error);
      setAdminIbptConfig(null);
    } finally {
      setLoadingAdminIbpt(false);
    }
  }, []);

  const handleSaveAdminIbpt = async () => {
    try {
      setSavingAdminIbpt(true);
      await adminApi.updateFocusNfeConfig({ ibptToken: adminIbptForm.ibptToken });
      toast.success('Token IBPT global salvo com sucesso!');
      await loadAdminIbptConfig();
    } catch (error) {
      console.error('Erro ao salvar token IBPT global:', error);
      handleApiError(error);
    } finally {
      setSavingAdminIbpt(false);
    }
  };

  // Gestor: lista de empresas + dialog para troca de senha
  const { data: gestorCompaniesData, isLoading: loadingGestorCompanies } = useQuery({
    queryKey: ['manager', 'my-companies'],
    queryFn: () => managerApi.myCompanies().then((r) => r.data as ManagerCompany[] | undefined),
    enabled: isGestor,
  });
  const gestorCompanies: ManagerCompany[] = Array.isArray(gestorCompaniesData)
    ? gestorCompaniesData
    : [];

  const [companyPasswordModal, setCompanyPasswordModal] = useState<CompanyPasswordModalState | null>(
    null,
  );
  const [companyPasswordForm, setCompanyPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [savingCompanyPassword, setSavingCompanyPassword] = useState(false);

  const handleChangeCompanyPassword = async () => {
    if (!companyPasswordModal) return;
    try {
      const newPwd = companyPasswordForm.newPassword;
      if (!newPwd || newPwd.length < 8) {
        toast.error('Nova senha deve ter no minimo 8 caracteres');
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPwd)) {
        toast.error('Nova senha deve conter pelo menos uma letra maiuscula, uma minuscula e um numero');
        return;
      }
      if (companyPasswordForm.newPassword !== companyPasswordForm.confirmPassword) {
        toast.error('As senhas nao coincidem');
        return;
      }
      setSavingCompanyPassword(true);
      await authApi.changeCompanyPassword(
        companyPasswordModal.companyId,
        companyPasswordForm.newPassword,
      );
      toast.success('Senha de login da empresa alterada com sucesso.');
      setCompanyPasswordModal(null);
      setCompanyPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingCompanyPassword(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      void loadAdminIbptConfig();
    }
  }, [isAdmin, loadAdminIbptConfig]);

  if (!isAdmin && !isGestor) {
    // Defesa explicita: shell ja guarda, mas o componente tambem deve ser defensivo.
    return (
      <Card>
        <CardHeader>
          <CardTitle>Administracao</CardTitle>
          <CardDescription>Categoria nao disponivel para este perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Apenas administradores e gestores podem acessar esta secao.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Token IBPT global (opcional)
            </CardTitle>
            <CardDescription>
              Token opcional da API IBPT (Lei 12.741) associado ao administrador. Cada empresa
              tambem pode ter seu proprio token em dados fiscais.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingAdminIbpt ? (
              <LoaderBlock label="Carregando..." />
            ) : (
              <>
                <div
                  role="note"
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                >
                  <p className="mb-1 font-semibold">Sobre o IBPT</p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>Usado para exibir tributos aproximados nos documentos fiscais</li>
                    <li>Opcional; a emissao na SEFAZ depende do certificado A1 e dos dados fiscais da empresa</li>
                    <li>Obtenha o token em ibpt.org.br</li>
                  </ul>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="administracao-ibptToken">Token IBPT</Label>
                    <Input
                      id="administracao-ibptToken"
                      type="password"
                      value={adminIbptForm.ibptToken}
                      onChange={(e) =>
                        setAdminIbptForm({ ...adminIbptForm, ibptToken: e.target.value })
                      }
                      placeholder="Cole o token IBPT (opcional)"
                    />
                    <p className="text-xs text-muted-foreground">
                      <a
                        href="https://deolhonoimposto.ibpt.org.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        deolhonoimposto.ibpt.org.br
                      </a>
                    </p>
                    {adminIbptConfig?.hasIbptToken ? (
                      <p
                        className="text-xs text-green-600 dark:text-green-400"
                        data-testid="ibpt-configured-flag"
                      >
                        OK Token IBPT global configurado
                      </p>
                    ) : null}
                  </div>

                  <Button
                    onClick={handleSaveAdminIbpt}
                    disabled={savingAdminIbpt}
                    className="w-full"
                  >
                    {savingAdminIbpt ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar token IBPT global
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {isGestor ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Senha de login das empresas
            </CardTitle>
            <CardDescription>
              Altere a senha de login das empresas que voce gerencia. A empresa precisara usar a
              nova senha no proximo acesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingGestorCompanies ? (
              <LoaderBlock label="Carregando empresas..." />
            ) : gestorCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma empresa vinculada ao seu perfil.
              </p>
            ) : (
              <ul className="space-y-2">
                {gestorCompanies.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4 border-b py-2 last:border-0"
                  >
                    <span className="font-medium">{c.name || c.fantasyName || c.id}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCompanyPasswordModal({
                          companyId: c.id,
                          companyName: (c.name || c.fantasyName || c.id) as string,
                        });
                        setCompanyPasswordForm({ newPassword: '', confirmPassword: '' });
                      }}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Alterar senha
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={!!companyPasswordModal}
        onOpenChange={(open) => !open && setCompanyPasswordModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha de login</DialogTitle>
            <DialogDescription>
              Definir nova senha de login para {companyPasswordModal?.companyName}. A empresa
              precisara usar esta senha no proximo acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="administracao-companyNewPassword">Nova senha *</Label>
              <Input
                id="administracao-companyNewPassword"
                type="password"
                value={companyPasswordForm.newPassword}
                onChange={(e) =>
                  setCompanyPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
                }
                placeholder="********"
              />
              <p className="text-xs text-muted-foreground">
                Min. 8 caracteres, com uma maiuscula, uma minuscula e um numero
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="administracao-companyConfirmPassword">Confirmar nova senha *</Label>
              <Input
                id="administracao-companyConfirmPassword"
                type="password"
                value={companyPasswordForm.confirmPassword}
                onChange={(e) =>
                  setCompanyPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))
                }
                placeholder="********"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyPasswordModal(null)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeCompanyPassword} disabled={savingCompanyPassword}>
              {savingCompanyPassword ? (
                <>
                  <span className="mr-2 animate-spin">...</span>
                  Salvando...
                </>
              ) : (
                'Salvar senha'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdministracaoSettings;
