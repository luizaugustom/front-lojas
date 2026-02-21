'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Briefcase, Loader2, Pencil, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { managerApi, companyApi } from '@/lib/api-endpoints';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function GestoresPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [managers, setManagers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [companiesOpen, setCompaniesOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any | null>(null);
  const [formLogin, setFormLogin] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formName, setFormName] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchManagers = async () => {
    try {
      const res = await managerApi.list();
      setManagers(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Erro ao carregar gestores');
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await companyApi.list();
      const data = res.data || res || [];
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      setCompanies([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchManagers();
    fetchCompanies();
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLogin.trim() || !formPassword.trim()) {
      toast.error('Login e senha são obrigatórios');
      return;
    }
    setSubmitting(true);
    try {
      await managerApi.create({
        login: formLogin.trim(),
        password: formPassword.trim(),
        name: formName.trim() || undefined,
      });
      toast.success('Gestor criado com sucesso');
      setCreateOpen(false);
      setFormLogin('');
      setFormPassword('');
      setFormName('');
      fetchManagers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar gestor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;
    setSubmitting(true);
    try {
      await managerApi.update(selectedManager.id, {
        login: formLogin.trim() || undefined,
        password: formPassword.trim() || undefined,
        name: formName.trim() || undefined,
      });
      toast.success('Gestor atualizado');
      setEditOpen(false);
      setSelectedManager(null);
      fetchManagers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: any) => {
    if (!confirm(`Excluir o gestor "${m.login}"?`)) return;
    try {
      await managerApi.delete(m.id);
      toast.success('Gestor excluído');
      fetchManagers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao excluir');
    }
  };

  const openCompaniesModal = async (m: any) => {
    setSelectedManager(m);
    try {
      const res = await managerApi.getOne(m.id);
      const ids = (res.data as any)?.companyIds ?? [];
      setSelectedCompanyIds(ids);
    } catch {
      setSelectedCompanyIds([]);
    }
    setCompaniesOpen(true);
  };

  const saveCompanies = async () => {
    if (!selectedManager) return;
    setSubmitting(true);
    try {
      await managerApi.setCompanies(selectedManager.id, selectedCompanyIds);
      toast.success('Lojas atualizadas');
      setCompaniesOpen(false);
      setSelectedManager(null);
      fetchManagers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCompany = (id: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Acesso restrito ao administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestores (Multilojas)</h1>
          <p className="text-muted-foreground">Crie e gerencie gestores que podem ver métricas e transferir estoque entre lojas</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo gestor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Lista de gestores
          </CardTitle>
          <CardDescription>Clique em &quot;Lojas&quot; para definir em quais empresas o gestor pode acessar.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : managers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum gestor cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Login</th>
                    <th className="text-left py-2">Nome</th>
                    <th className="text-left py-2">Lojas</th>
                    <th className="text-right py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {managers.map((m) => (
                    <tr key={m.id} className="border-b">
                      <td className="py-2">{m.login}</td>
                      <td className="py-2">{m.name || '—'}</td>
                      <td className="py-2">{m._count?.companies ?? 0} loja(s)</td>
                      <td className="text-right py-2 flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openCompaniesModal(m)}>
                          <Building2 className="h-4 w-4 mr-1" />
                          Lojas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedManager(m);
                            setFormLogin(m.login);
                            setFormPassword('');
                            setFormName(m.name || '');
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(m)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo gestor</DialogTitle>
            <DialogDescription>O gestor usará o login e senha para acessar o sistema. Depois de criar, defina as lojas em &quot;Lojas&quot;.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Login</Label>
              <Input value={formLogin} onChange={(e) => setFormLogin(e.target.value)} placeholder="email ou usuário" required />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="mín. 6 caracteres" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Nome (opcional)</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nome do gestor" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar gestor</DialogTitle>
            <DialogDescription>Altere login, nome ou senha. Deixe a senha em branco para não alterar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Login</Label>
              <Input value={formLogin} onChange={(e) => setFormLogin(e.target.value)} placeholder="Login" />
            </div>
            <div className="space-y-2">
              <Label>Nova senha (deixe em branco para não alterar)</Label>
              <Input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Senha" />
            </div>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nome" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={companiesOpen} onOpenChange={setCompaniesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lojas do gestor</DialogTitle>
            <DialogDescription>
              Selecione as empresas (lojas) que o gestor &quot;{selectedManager?.login}&quot; pode acessar.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-2 py-2">
            {companies.map((c: any) => (
              <div key={c.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`company-${c.id}`}
                  checked={selectedCompanyIds.includes(c.id)}
                  onCheckedChange={() => toggleCompany(c.id)}
                />
                <label htmlFor={`company-${c.id}`} className="text-sm cursor-pointer">
                  {c.fantasyName || c.name}
                </label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCompaniesOpen(false)}>Cancelar</Button>
            <Button onClick={saveCompanies} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
