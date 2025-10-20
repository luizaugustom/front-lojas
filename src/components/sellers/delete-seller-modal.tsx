'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Trash2, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sellerApi } from '@/lib/api-endpoints';
import { handleApiError } from '@/lib/handleApiError';
import type { Seller } from '@/types';

interface DeleteSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  seller: Seller | null;
}

export function DeleteSellerModal({ isOpen, onClose, onSuccess, seller }: DeleteSellerModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!seller) return;

    setIsDeleting(true);
    try {
      // Tentar usar ID original primeiro
      try {
        await sellerApi.delete(seller.id);
        toast.success('Vendedor excluído com sucesso!');
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
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!seller) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Confirmar Exclusão
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Esta ação não pode ser desfeita
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Vendedor */}
          <Card className="p-4 bg-muted border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{seller.name}</h3>
                <p className="text-sm text-muted-foreground">{seller.login}</p>
                {seller.email && (
                  <p className="text-sm text-muted-foreground">{seller.email}</p>
                )}
              </div>
            </div>
            
            {/* Estatísticas do vendedor */}
            <div className="mt-3 flex gap-2">
              {seller.totalSales !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {seller.totalSales} vendas
                </Badge>
              )}
              {seller.totalRevenue !== undefined && (
                <Badge variant="outline" className="text-xs">
                  R$ {seller.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              )}
            </div>
          </Card>

          {/* Aviso de Impacto */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-2">
                  Atenção! Esta ação terá impacto:
                </h4>
                <ul className="text-sm text-destructive space-y-1">
                  <li>• O vendedor será removido permanentemente</li>
                  <li>• Todas as vendas associadas serão mantidas</li>
                  <li>• O histórico de vendas não será perdido</li>
                  <li>• Esta ação não pode ser desfeita</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmação */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                <strong>Confirmação necessária:</strong> Digite o nome do vendedor para confirmar a exclusão.
              </p>
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-foreground mb-2">
                Nome do vendedor: <span className="font-mono bg-muted px-2 py-1 rounded text-destructive">{seller.name}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Excluindo...
                </div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

