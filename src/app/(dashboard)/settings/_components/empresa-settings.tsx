'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Lock, Save, Upload, User as UserIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { companyApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import { getImageUrl } from '@/lib/image-utils';
import { useUIStore } from '@/store/ui-store';
import type { UserRole } from '@/types';

interface ProfileResponse {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  login?: string;
  role?: string;
  cpf?: string;
  cnpj?: string;
}

interface CompanyResponse {
  brandColor?: string;
  fantasyName?: string;
  logoUrl?: string | null;
}

const passthroughLoader = ({ src }: { src: string }) => src;

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

export function EmpresaSettings() {
  const { user, api: authApi } = useAuth();
  const role: UserRole | undefined = (user?.role as UserRole | undefined) ?? undefined;
  const setCompanyColor = useUIStore((s) => s.setCompanyColor);

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    login: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [companyData, setCompanyData] = useState<CompanyResponse | null>(null);
  const [loadingCompanyData, setLoadingCompanyData] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);
  const [brandColor, setBrandColor] = useState<string>('#3B82F6');
  const [savingBrandColor, setSavingBrandColor] = useState(false);
  const [companyNickname, setCompanyNickname] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);

  const loadCompanyData = useCallback(async () => {
    try {
      setLoadingCompanyData(true);
      const response = await authApi.get('/company/my-company');
      const data: CompanyResponse = response.data ?? {};
      setCompanyData(data);
      if (data.brandColor) {
        setBrandColor(data.brandColor);
        setCompanyColor(data.brandColor);
      }
      if (data.fantasyName !== undefined) {
        setCompanyNickname(data.fantasyName ?? '');
      }
      if (data.logoUrl !== undefined) {
        setCompanyLogo(data.logoUrl ?? null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
      setCompanyData(null);
    } finally {
      setLoadingCompanyData(false);
    }
  }, [authApi, setCompanyColor]);

  const loadCompanyLogo = useCallback(async () => {
    try {
      const response = await companyApi.myCompany();
      const logoUrl = response.data?.logoUrl;
      setCompanyLogo(logoUrl ?? null);
    } catch (error) {
      console.error('Erro ao carregar logo da empresa:', error);
      setCompanyLogo(null);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      let data: ProfileResponse | null = null;
      try {
        data = (await authApi.getProfile()) as ProfileResponse;
      } catch (error) {
        data = (user as ProfileResponse | null) ?? null;
        console.warn('Falha ao carregar perfil via API, usando contexto:', error);
      }
      setProfile(data);
      setProfileForm({
        name: data?.name ?? '',
        email: data?.email ?? '',
        phone: data?.phone ?? '',
        login: data?.login ?? '',
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      if (user) {
        const fallback = user as ProfileResponse;
        setProfile(fallback);
        setProfileForm({
          name: fallback.name ?? '',
          email: fallback.email ?? '',
          phone: fallback.phone ?? '',
          login: fallback.login ?? '',
        });
      }
      handleApiError(error);
    } finally {
      setLoadingProfile(false);
    }
  }, [authApi, user]);

  useEffect(() => {
    if (role !== 'empresa') {
      void loadProfile();
      return;
    }
    void loadCompanyData();
    void loadProfile();
  }, [role, loadCompanyData, loadProfile]);

  const logoPreviewUrl = useMemo(() => {
    if (!logoFile) return null;
    return URL.createObjectURL(logoFile);
  }, [logoFile]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      if (!profileForm.login || profileForm.login.length < 3) {
        toast.error('Login deve ter no mínimo 3 caracteres');
        return;
      }
      if (profileForm.email && !profileForm.email.includes('@')) {
        toast.error('Email inválido');
        return;
      }

      const originalName = profile?.name ?? '';
      const originalEmail = profile?.email ?? '';
      const originalPhone = profile?.phone ?? '';
      const originalLogin = profile?.login ?? '';

      const updates: Record<string, string> = {};
      if (profileForm.name !== originalName) updates.name = profileForm.name;
      if (profileForm.email !== originalEmail) updates.email = profileForm.email;
      if (profileForm.phone !== originalPhone) updates.phone = profileForm.phone;
      if (profileForm.login !== originalLogin) updates.login = profileForm.login;

      if (Object.keys(updates).length === 0) {
        toast.error('Nenhuma alteração detectada');
        return;
      }

      await authApi.updateProfile(updates);
      toast.success('Perfil atualizado com sucesso!');
      await loadProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      handleApiError(error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordForm.currentPassword) {
        toast.error('Digite sua senha atual');
        return;
      }
      const pwd = passwordForm.newPassword;
      if (!pwd || pwd.length < 8) {
        toast.error('Nova senha deve ter no mínimo 8 caracteres');
        return;
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) {
        toast.error('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('As senhas não coincidem');
        return;
      }
      if (passwordForm.currentPassword === passwordForm.newPassword) {
        toast.error('A nova senha deve ser diferente da atual');
        return;
      }

      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Senha alterada com sucesso! Você será redirecionado para fazer login novamente.', {
        duration: 3000,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }, 3000);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      handleApiError(error);
    }
  };

  const handleSaveBrandColor = async () => {
    try {
      setSavingBrandColor(true);
      await companyApi.updateMyCompany({ brandColor });
      setCompanyColor(brandColor);
      toast.success('Cor da empresa atualizada!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingBrandColor(false);
    }
  };

  const handleSaveCompanyNickname = async () => {
    try {
      setSavingNickname(true);
      await companyApi.updateMyCompany({ fantasyName: companyNickname });
      toast.success('Apelido da empresa atualizado!');
      await loadCompanyData();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingNickname(false);
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Apenas imagens são aceitas.');
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo permitido: 5MB');
      return;
    }
    setLogoFile(file);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }
    try {
      setUploadingLogo(true);
      await companyApi.uploadLogo(logoFile);
      toast.success('Logo enviado com sucesso!');
      setLogoFile(null);
      await loadCompanyLogo();
    } catch (error) {
      console.error('Erro ao enviar logo:', error);
      handleApiError(error);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setRemovingLogo(true);
      await companyApi.removeLogo();
      toast.success('Logo removido com sucesso!');
      await loadCompanyLogo();
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      handleApiError(error);
    } finally {
      setRemovingLogo(false);
    }
  };

  if (loadingProfile) {
    return <LoaderBlock label="Carregando..." />;
  }

  const isEmpresa = role === 'empresa';
  const defaultTab = isEmpresa ? 'empresa' : 'perfil';

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList aria-label="Secoes da categoria Empresa">
        {isEmpresa ? <TabsTrigger value="empresa">Dados da empresa</TabsTrigger> : null}
        <TabsTrigger value="perfil">Meu perfil</TabsTrigger>
        <TabsTrigger value="seguranca">Seguranca</TabsTrigger>
      </TabsList>

      {isEmpresa ? (
        <TabsContent value="empresa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo e Cor da Empresa
              </CardTitle>
              <CardDescription>
                Configure o logo e a cor principal que sera usada no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingCompanyData ? (
                <LoaderBlock label="Carregando dados da empresa..." />
              ) : (
                <>
                  {companyLogo ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Logo Atual</Label>
                        <div className="mt-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                          <Image
                            src={getImageUrl(companyLogo)}
                            alt="Logo atual da empresa"
                            className="mx-auto h-16 w-auto object-contain"
                            width={160}
                            height={64}
                            unoptimized
                            loader={passthroughLoader}
                            onError={() => setCompanyLogo(null)}
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleRemoveLogo}
                        disabled={removingLogo}
                        className="w-full sm:w-auto"
                      >
                        {removingLogo ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Removendo...
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Remover Logo
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="empresa-logo-upload">
                        {companyLogo ? 'Substituir Logo' : 'Adicionar Logo'}
                      </Label>
                      <div className="mt-2">
                        <Input
                          id="empresa-logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/80"
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Formatos aceitos: JPG, PNG, GIF, WebP. Tamanho maximo: 5MB
                      </p>
                    </div>

                    {logoFile ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Pre-visualizacao</Label>
                          <div className="mt-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                            <Image
                              src={logoPreviewUrl ?? ''}
                              alt="Pre-visualizacao do logo"
                              className="mx-auto h-16 w-auto object-contain"
                              width={160}
                              height={64}
                              unoptimized
                              loader={passthroughLoader}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleUploadLogo}
                            disabled={uploadingLogo}
                            className="flex-1 sm:flex-none"
                          >
                            {uploadingLogo ? (
                              <>
                                <Save className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                {companyLogo ? 'Substituir Logo' : 'Adicionar Logo'}
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setLogoFile(null)}
                            disabled={uploadingLogo}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa-brand-color">Cor da empresa</Label>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <input
                        id="empresa-brand-color-picker"
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-10 w-14 rounded border"
                        aria-label="Selecionar cor da empresa"
                      />
                      <Input
                        id="empresa-brand-color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-36"
                        placeholder="#3B82F6"
                      />
                      <Button onClick={handleSaveBrandColor} disabled={savingBrandColor}>
                        {savingBrandColor ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar cor
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Essa cor sera aplicada como primaria (botoes, destaques e graficos).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="empresa-fantasyName">Apelido da Empresa</Label>
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                      <Input
                        id="empresa-fantasyName"
                        value={companyNickname}
                        onChange={(e) => setCompanyNickname(e.target.value)}
                        placeholder="Digite um apelido para a empresa"
                        className="flex-1"
                      />
                      <Button onClick={handleSaveCompanyNickname} disabled={savingNickname}>
                        {savingNickname ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar apelido
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Define um nome amigavel para identificar a empresa no sistema.
                    </p>
                  </div>

                  <Alert>
                    <AlertTitle>Informacao</AlertTitle>
                    <AlertDescription>
                      O logo sera exibido no header e a cor sera aplicada em todo o sistema.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ) : null}

      <TabsContent value="perfil" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>Informacoes da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="empresa-perfil-login">Login *</Label>
                <Input
                  id="empresa-perfil-login"
                  value={profileForm.login}
                  onChange={(e) => setProfileForm({ ...profileForm, login: e.target.value })}
                  placeholder="Digite seu login"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa-perfil-name">Nome</Label>
                <Input
                  id="empresa-perfil-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Digite seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa-perfil-email">Email</Label>
                <Input
                  id="empresa-perfil-email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="Digite seu email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="empresa-perfil-phone">Telefone</Label>
                <Input
                  id="empresa-perfil-phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="Digite seu telefone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Usuario</Label>
              <Input value={user?.role ?? ''} disabled className="bg-muted capitalize" />
            </div>

            {profile?.cpf ? (
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input value={profile.cpf} disabled className="bg-muted" />
              </div>
            ) : null}

            {profile?.cnpj ? (
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value={profile.cnpj} disabled className="bg-muted" />
              </div>
            ) : null}

            <Button
              onClick={handleUpdateProfile}
              disabled={updatingProfile}
              className="w-full sm:w-auto"
            >
              {updatingProfile ? (
                <>
                  <span className="mr-2 animate-spin">...</span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alteracoes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="seguranca" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Seguranca
            </CardTitle>
            <CardDescription>Altere sua senha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="empresa-seguranca-current">Senha Atual *</Label>
              <Input
                id="empresa-seguranca-current"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="********"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa-seguranca-new">Nova Senha *</Label>
              <Input
                id="empresa-seguranca-new"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="********"
              />
              <p className="text-xs text-muted-foreground">
                Min. 8 caracteres, com uma maiuscula, uma minuscula e um numero
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa-seguranca-confirm">Confirmar Nova Senha *</Label>
              <Input
                id="empresa-seguranca-confirm"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="********"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full sm:w-auto">
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default EmpresaSettings;
