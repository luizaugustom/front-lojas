'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Company } from '@/types';

interface CompanyStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function CompanyStatusModal({ 
  open, 
  onOpenChange, 
  company, 
  onConfirm, 
  loading = false 
}: CompanyStatusModalProps) {
  if (!company) return null;

  const isActivating = !company.isActive;
  const action = isActivating ? 'ativar' : 'desativar';
  const actionCapitalized = isActivating ? 'Ativar' : 'Desativar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {isActivating ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            )}
            <div>
              <DialogTitle>{actionCapitalized} Empresa</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Esta ação pode ser revertida a qualquer momento
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <span className="text-sm font-medium text-primary">
                  {company.name?.charAt(0)?.toUpperCase() || 'E'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{company.name || 'Nome não informado'}</p>
                <p className="text-sm text-muted-foreground">{company.cnpj || 'CNPJ não informado'}</p>
              </div>
              <div className="flex items-center gap-2">
                {company.isActive ? (
                  <div className="flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-1">
                    <div className="h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Ativo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-1">
                    <XCircle className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Inativo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-muted/30 p-3">
            <p className="text-sm">
              <strong>Tem certeza que deseja {action} esta empresa?</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isActivating 
                ? 'A empresa voltará a funcionar normalmente no sistema.'
                : 'A empresa será desabilitada e não poderá ser usada até ser reativada.'
              }
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            variant={isActivating ? 'default' : 'destructive'}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </>
            ) : (
              `${actionCapitalized} Empresa`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
