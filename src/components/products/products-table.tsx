'use client';

import { useState } from 'react';
import { Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { formatCurrency, formatDate, generateUUID } from '@/lib/utils';
import { ensureValidUUID as ensureUUID } from '@/lib/utils-clean';
import { getImageUrl } from '@/lib/image-utils';
import { ProductImage } from './product-image';
import type { Product } from '@/types';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRefetch: () => void;
  canManage?: boolean; // quando false, esconde/impede editar/excluir
}

export function ProductsTable({ products, isLoading, onEdit, onRefetch, canManage = true }: ProductsTableProps) {
  const { api } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ images: string[], index: number } | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    product: Product | null;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    product: null,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const handleImageClick = (product: Product) => {
    if (product.photos && product.photos.length > 0) {
      const validImages = product.photos
        .map(photo => getImageUrl(photo))
        .filter(Boolean);
      
      if (validImages.length > 0) {
        setSelectedImage({ images: validImages, index: 0 });
      }
    }
  };

  const handleDeleteClick = (product: Product) => {
    if (!canManage) {
      toast.error('Você não tem permissão para excluir produtos.');
      return;
    }

    setConfirmationModal({
      open: true,
      product,
      title: 'Excluir Produto',
      description: `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita e todas as informações do produto serão perdidas permanentemente.`,
      onConfirm: () => {
        setConfirmationModal(prev => ({ ...prev, open: false }));
        executeDelete(product.id);
      },
    });
  };

  const executeDelete = async (id: string) => {
    setDeleting(id);
    try {
      // Usar o ID original do Prisma
      const productId = id;
      console.log('[ProductsTable] Deletando produto com ID original:', productId);
      await api.delete(`/product/${productId}`);
      toast.success('Produto excluído com sucesso!');
      onRefetch();
    } catch (error) {
      console.error('[ProductsTable] Erro ao deletar produto:', error);
      handleApiError(error);
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 sm:p-8 text-center">
          <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">Carregando produtos...</p>
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <div className="p-4 sm:p-8 text-center">
          <Package className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-2 text-sm sm:text-base font-semibold">Nenhum produto encontrado</h3>
          {canManage ? (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Comece adicionando um novo produto ao seu catálogo.
            </p>
          ) : (
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Não há produtos para exibir.
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Código de Barras</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Validade</TableHead>
            {canManage && <TableHead className="text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const stockNum = Number(product.stockQuantity ?? 0);
            const minNum = Number(product.minStockQuantity ?? 0);
            const isLowStock = !Number.isNaN(stockNum) && stockNum <= 3;
            const isExpiringSoon = product.expirationDate && 
              new Date(product.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            const isExpired = product.expirationDate && 
              new Date(product.expirationDate) <= new Date();

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <ProductImage 
                    photos={product.photos} 
                    name={product.name} 
                    size="md"
                    onClick={() => handleImageClick(product)}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{product.stockQuantity}</span>
                    {isLowStock && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.category || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.expirationDate && product.expirationDate !== 'null' ? formatDate(product.expirationDate) : '-'}
                    {isExpiringSoon && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(product)}
                        aria-label={`Editar produto ${product.name}`}
                        className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteClick(product)}
                        disabled={deleting === product.id}
                        aria-label={`Excluir produto ${product.name}`}
                        className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={confirmationModal.open}
        onClose={() => setConfirmationModal(prev => ({ ...prev, open: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        description={confirmationModal.description}
        variant="destructive"
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={deleting === confirmationModal.product?.id}
      />

      {/* Modal de Visualização de Imagem */}
      {selectedImage && (
        <ImageViewer
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          images={selectedImage.images}
          initialIndex={selectedImage.index}
          alt="Imagem do produto"
        />
      )}
    </Card>
  );
}
