'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, FileText, User, Phone, Mail, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency } from '@/lib/utils-clean';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/hooks/useAuth';

interface BudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BudgetDialog({ open, onClose, onSuccess }: BudgetDialogProps) {
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCpfCnpj, setClientCpfCnpj] = useState('');
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState('7');
  
  const { items, getTotal } = useCartStore();
  const { user, api } = useAuth();

  const total = getTotal();

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!open) {
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setClientCpfCnpj('');
      setNotes('');
      setValidityDays('7');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Adicione produtos ao carrinho antes de criar um orçamento');
      return;
    }

    const validDays = parseInt(validityDays);
    if (isNaN(validDays) || validDays < 1) {
      toast.error('Dias de validade deve ser um número maior que 0');
      return;
    }

    setLoading(true);

    try {
      // Calcular data de validade
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);
      validUntil.setHours(23, 59, 59, 999);

      // Preparar dados do orçamento
      const budgetData: any = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        validUntil: validUntil.toISOString(),
      };

      // Adicionar campos opcionais apenas se tiverem valor
      if (clientName && clientName.trim()) {
        budgetData.clientName = clientName.trim();
      }
      if (clientPhone && clientPhone.trim()) {
        budgetData.clientPhone = clientPhone.trim();
      }
      if (clientEmail && clientEmail.trim()) {
        budgetData.clientEmail = clientEmail.trim();
      }
      if (clientCpfCnpj && clientCpfCnpj.trim()) {
        budgetData.clientCpfCnpj = clientCpfCnpj.trim();
      }
      if (notes && notes.trim()) {
        budgetData.notes = notes.trim();
      }
      if (user?.role === 'vendedor' && user.id) {
        budgetData.sellerId = user.id;
      }

      console.log('[Budget] Criando orçamento:', budgetData);

      const response = await api.post('/budget', budgetData);

      console.log('[Budget] Orçamento criado:', response.data);

      toast.success('Orçamento criado com sucesso!');
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('[Budget] Erro ao criar orçamento:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Criar Orçamento
          </DialogTitle>
          <DialogDescription>
            Crie um orçamento para enviar ao cliente. O orçamento não altera o estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumo do Carrinho */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <h3 className="font-medium mb-3">Produtos do Orçamento</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between text-base font-bold">
              <span>Total:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Dados do Cliente (Opcional)
            </h3>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Telefone</Label>
                  <InputWithIcon
                    id="clientPhone"
                    icon={<Phone className="h-4 w-4" />}
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <InputWithIcon
                    id="clientEmail"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="clientCpfCnpj">CPF/CNPJ</Label>
                <InputWithIcon
                  id="clientCpfCnpj"
                  icon={<CreditCard className="h-4 w-4" />}
                  value={clientCpfCnpj}
                  onChange={(e) => setClientCpfCnpj(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          {/* Validade e Observações */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="validityDays">Validade do Orçamento (dias)</Label>
              <InputWithIcon
                id="validityDays"
                type="number"
                min="1"
                icon={<Calendar className="h-4 w-4" />}
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Válido até {new Date(Date.now() + parseInt(validityDays || '0') * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Informações adicionais sobre o orçamento..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || items.length === 0}>
              {loading ? 'Criando...' : 'Criar Orçamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

