"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Megaphone, Send } from 'lucide-react';

interface AdminBroadcastDialogProps {
  children: React.ReactNode;
}

export function AdminBroadcastDialog({ children }: AdminBroadcastDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'all' as 'all' | 'companies' | 'sellers',
    actionUrl: '',
    actionLabel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/broadcast-notification', formData);

      toast.success(`Notificação enviada para ${response.data.count} usuário(s)!`, {
        duration: 5000,
      });

      // Limpar formulário
      setFormData({
        title: '',
        message: '',
        target: 'all',
        actionUrl: '',
        actionLabel: '',
      });

      setOpen(false);
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Megaphone className="h-5 w-5" />
            Enviar Novidade do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Nova funcionalidade disponível!"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Descreva a novidade ou atualização do sistema..."
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
              className="text-foreground min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-foreground">Enviar para</Label>
            <select
              id="target"
              value={formData.target}
              onChange={(e) => handleInputChange('target', e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
              required
            >
              <option value="all">Todos (Empresas e Vendedores)</option>
              <option value="companies">Apenas Empresas</option>
              <option value="sellers">Apenas Vendedores</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionUrl" className="text-foreground">
              URL de Ação (Opcional)
            </Label>
            <Input
              id="actionUrl"
              placeholder="Ex: /products"
              value={formData.actionUrl}
              onChange={(e) => handleInputChange('actionUrl', e.target.value)}
              className="text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Rota para onde o usuário será direcionado ao clicar na notificação
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actionLabel" className="text-foreground">
              Texto do Botão (Opcional)
            </Label>
            <Input
              id="actionLabel"
              placeholder="Ex: Ver Novidades"
              value={formData.actionLabel}
              onChange={(e) => handleInputChange('actionLabel', e.target.value)}
              className="text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

