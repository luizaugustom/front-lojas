"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Mail, Send } from 'lucide-react';

interface PromotionalEmailDialogProps {
  children: React.ReactNode;
}

export function PromotionalEmailDialog({ children }: PromotionalEmailDialogProps) {
  const { api } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    description: '',
    discount: '',
    validUntil: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.description || !formData.discount || !formData.validUntil) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      await api.sendBulkPromotionalEmail(formData);
      toast.success('Email promocional enviado com sucesso para todos os clientes!');
      setOpen(false);
      setFormData({
        title: '',
        message: '',
        description: '',
        discount: '',
        validUntil: ''
      });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao enviar email promocional');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Mail className="h-5 w-5" />
            Email Promocional em Massa
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Título da Promoção</Label>
            <Input
              id="title"
              placeholder="Ex: Promoção de Natal - 30% OFF"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground">Mensagem Principal</Label>
            <Input
              id="message"
              placeholder="Ex: Celebre o Natal conosco! Descontos especiais para você!"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Ofertas válidas até o Natal. Não perca!"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount" className="text-foreground">Desconto</Label>
            <Input
              id="discount"
              placeholder="Ex: 30% de desconto"
              value={formData.discount}
              onChange={(e) => handleInputChange('discount', e.target.value)}
              required
              className="text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil" className="text-foreground">Válido Até</Label>
            <DatePicker
              date={formData.validUntil ? new Date(formData.validUntil) : undefined}
              onSelect={(date) => handleInputChange('validUntil', date?.toISOString().split('T')[0] || '')}
              placeholder="Selecione a data de validade"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
