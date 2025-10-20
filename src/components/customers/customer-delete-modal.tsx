'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { generateCoherentUUID } from '@/lib/utils';
import { apiCallWithIdConversion } from '@/lib/apiClient';
import type { Customer } from '@/types';

interface CustomerDeleteModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSuccess: () => void;
}

export function CustomerDeleteModal({ 
  open, 
  onClose, 
  customer, 
  onSuccess 
}: CustomerDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

  const handleDelete = async () => {
    if (!customer) return;

    setLoading(true);
    try {
      const activityId = generateCoherentUUID();
      // Tentar usar ID original primeiro
      try {
        await api.delete(`/customer/${customer.id}`, { params: { activityId } });
        toast.success('Cliente excluído com sucesso!');
        onSuccess();
        onClose();
      } catch (error: any) {
        // Se der erro de UUID, mostrar mensagem informativa
        if (error.response?.status === 400 && 
            error.response?.data?.message?.includes('uuid is expected')) {
          toast.error('Operação não disponível: Backend requer UUIDs para esta operação');
        } else {
          handleApiError(error);
        }
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-destructive/10 text-destructive">
              <Trash2 size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Excluir Cliente
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Esta ação não pode ser desfeita
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted-foreground/10 text-muted-foreground">
                <User size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{customer.name}</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  {customer.email && (
                    <p>Email: {customer.email}</p>
                  )}
                  {customer.phone && (
                    <p>Telefone: {customer.phone}</p>
                  )}
                  {customer.cpfCnpj && (
                    <p>CPF/CNPJ: {customer.cpfCnpj}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Atenção!</p>
                <p className="mt-1">
                  Ao excluir este cliente, todos os dados relacionados serão removidos permanentemente, 
                  incluindo histórico de compras e informações pessoais.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-border text-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Excluindo...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 size={16} />
                Excluir Cliente
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
