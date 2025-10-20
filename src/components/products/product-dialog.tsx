'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/hooks/useAuth';
import { handleApiError } from '@/lib/handleApiError';
import { productFormSchema } from '@/lib/validations';
import { generateCoherentUUID, ensureUUID } from '@/lib/utils';
import { productApi } from '@/lib/api-endpoints';
import type { Product, CreateProductDto } from '@/types';

// Função utilitária para garantir conversão correta de dados
function sanitizeProductData(data: any) {
  return {
    name: String(data.name || ''),
    barcode: String(data.barcode || ''),
    price: Number(data.price || 0),
    stockQuantity: Number(data.stockQuantity || 0),
    category: data.category ? String(data.category) : undefined,
    ...(data.expirationDate && { expirationDate: String(data.expirationDate) }),
  };
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [existingPhotosToDelete, setExistingPhotosToDelete] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive';
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!product;
  const { api } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductDto>({
    resolver: zodResolver(productFormSchema),
  });

  useEffect(() => {
    if (product) {
      console.log('[ProductDialog] Produto recebido:', product);
      console.log('[ProductDialog] Fotos do produto:', product.photos);
      console.log('[ProductDialog] Tipo das fotos:', typeof product.photos);
      console.log('[ProductDialog] Array das fotos:', Array.isArray(product.photos));
      
      reset({
        name: product.name,
        barcode: product.barcode,
        price: product.price,
        stockQuantity: product.stockQuantity,
        category: product.category,
        expirationDate: product.expirationDate,
      });
    } else {
      reset({
        name: '',
        barcode: '',
        price: 0,
        stockQuantity: 0,
      });
      setSelectedPhotos([]);
      setPhotoPreviewUrls([]);
      setExistingPhotosToDelete([]);
    }
  }, [product, reset]);

  // Limpeza das URLs de pré-visualização quando o componente for desmontado
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      addPhotos(fileArray);
    }
  };

  const addPhotos = (files: File[]) => {
    // Filtrar apenas arquivos de imagem
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Apenas arquivos de imagem são permitidos');
    }
    
    if (imageFiles.length > 0) {
      const newPhotos = [...selectedPhotos, ...imageFiles];
      setSelectedPhotos(newPhotos);
      
      // Gerar URLs de pré-visualização para as novas fotos
      const newPreviewUrls = imageFiles.map(file => URL.createObjectURL(file));
      setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      addPhotos(Array.from(files));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteExistingPhoto = (photoUrl: string) => {
    setConfirmationModal({
      open: true,
      title: 'Excluir Foto',
      description: 'Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.',
      variant: 'destructive',
      onConfirm: () => {
        setExistingPhotosToDelete(prev => [...prev, photoUrl]);
        toast.success('Foto marcada para exclusão');
        setConfirmationModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleRestoreExistingPhoto = (photoUrl: string) => {
    setExistingPhotosToDelete(prev => prev.filter(url => url !== photoUrl));
    toast.success('Foto restaurada');
  };

  const handleDeleteAllPhotos = () => {
    setConfirmationModal({
      open: true,
      title: 'Excluir Todas as Fotos',
      description: `Tem certeza que deseja marcar todas as ${product?.photos?.length || 0} fotos para exclusão? Esta ação não pode ser desfeita.`,
      variant: 'destructive',
      onConfirm: () => {
        setExistingPhotosToDelete(product?.photos || []);
        toast.success('Todas as fotos foram marcadas para exclusão');
        setConfirmationModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const handleRestoreAllPhotos = () => {
    setConfirmationModal({
      open: true,
      title: 'Restaurar Todas as Fotos',
      description: 'Tem certeza que deseja restaurar todas as fotos marcadas para exclusão?',
      variant: 'default',
      onConfirm: () => {
        setExistingPhotosToDelete([]);
        toast.success('Todas as fotos foram restauradas');
        setConfirmationModal(prev => ({ ...prev, open: false }));
      },
    });
  };

  const onSubmit = async (data: CreateProductDto) => {
    setLoading(true);
    try {
      if (isEditing) {
        console.log('[ProductDialog] Editando produto - ID original:', product!.id);
        console.log('[ProductDialog] Produto completo:', product);
        
        // Usar o ID original do produto (o backend espera o ID do Prisma)
        const productId = product!.id;
        console.log('[ProductDialog] Usando ID original do Prisma:', productId);
        console.log('[ProductDialog] Tipo do ID:', typeof productId);
        console.log('[ProductDialog] Comprimento do ID:', productId.length);
        
        // Criar objeto limpo apenas com os campos necessários
        const dataToSend = sanitizeProductData(data);
        
        // Log detalhado
        console.log('[ProductDialog] Dados originais do formulário:', data);
        console.log('[ProductDialog] Dados limpos para envio:', dataToSend);
        console.log('[ProductDialog] Tipo do name:', typeof dataToSend.name);
        console.log('[ProductDialog] Valor do name:', dataToSend.name);
        console.log('[ProductDialog] JSON.stringify do name:', JSON.stringify(dataToSend.name));
        console.log('[ProductDialog] ID do produto:', productId);
        
        try {
          // Verificar se o ID é válido antes de fazer a requisição
          if (!productId || productId.length < 10) {
            throw new Error('ID do produto inválido');
          }
          
          // Incluir o ID nos dados para evitar problemas na URL
          const dataWithId = {
            ...dataToSend,
            id: productId
          };
          
          console.log('[ProductDialog] Fazendo requisição PATCH para:', `/product/${productId}`);
          console.log('[ProductDialog] Dados sendo enviados:', dataWithId);
          
          // Tentar usar o endpoint de atualização do productApi
          await productApi.update(productId, dataToSend);
          
          // Gerenciar fotos (adicionar novas e remover existentes)
          const currentPhotos = product!.photos || [];
          let updatedPhotos = [...currentPhotos];
          
          // Remover fotos marcadas para exclusão
          if (existingPhotosToDelete.length > 0) {
            updatedPhotos = updatedPhotos.filter(photo => !existingPhotosToDelete.includes(photo));
            console.log('[ProductDialog] Fotos removidas:', existingPhotosToDelete);
          }
          
          // Adicionar fotos novas se houver
          if (selectedPhotos.length > 0) {
            console.log('[ProductDialog] Adicionando fotos ao produto existente');
            
            // Fazer upload das fotos usando o endpoint de upload múltiplo
            const uploadResponse = await api.post('/upload/multiple', 
              selectedPhotos.reduce((formData, photo) => {
                formData.append('files', photo);
                return formData;
              }, new FormData()),
              {
                headers: { 'Content-Type': 'multipart/form-data' },
              }
            );
            
            console.log('[ProductDialog] Upload das fotos concluído:', uploadResponse.data);
            
            // Adicionar as URLs das fotos ao produto
            if (uploadResponse.data && uploadResponse.data.urls) {
              updatedPhotos = [...updatedPhotos, ...uploadResponse.data.urls];
              console.log('[ProductDialog] Fotos adicionadas ao produto');
            }
          }
          
          // Atualizar as fotos do produto se houve mudanças
          if (existingPhotosToDelete.length > 0 || selectedPhotos.length > 0) {
            await api.patch(`/product/${productId}`, {
              photos: updatedPhotos
            });
            
            console.log('[ProductDialog] Fotos do produto atualizadas:', updatedPhotos);
          }
          
          toast.success('Produto atualizado com sucesso!');
        } catch (patchError) {
          console.error('[ProductDialog] Erro específico na edição:', patchError);
          throw patchError;
        }
      } else {
        // Para criação de produto
        if (selectedPhotos.length > 0) {
          // Usar endpoint específico para upload e criação quando há fotos
          console.log('[ProductDialog] Criando produto com fotos usando /product/upload-and-create');
          
          const formData = new FormData();
          
          // Adicionar dados do produto
          const generatedId = generateCoherentUUID(); // Gerar UUID coerente com backend
          const sanitizedData = sanitizeProductData(data);
          
          formData.append('id', generatedId);
          formData.append('name', sanitizedData.name);
          formData.append('barcode', sanitizedData.barcode);
          formData.append('price', sanitizedData.price.toString());
          formData.append('stockQuantity', sanitizedData.stockQuantity.toString());
          
          if (sanitizedData.category) formData.append('category', sanitizedData.category);
          if (data.description) formData.append('description', String(data.description));
          if (sanitizedData.expirationDate) formData.append('expirationDate', sanitizedData.expirationDate);
          if (data.costPrice) formData.append('costPrice', Number(data.costPrice || 0).toString());
          if (data.minStockQuantity) formData.append('minStockQuantity', Number(data.minStockQuantity || 0).toString());
          
          // Adicionar fotos
          selectedPhotos.forEach((photo, index) => {
            formData.append(`photos`, photo);
          });
          
          console.log('[ProductDialog] UUID gerado para novo produto com fotos:', generatedId);
          console.log('[ProductDialog] Dados do FormData:', {
            id: generatedId,
            name: data.name,
            barcode: data.barcode,
            price: data.price,
            stockQuantity: data.stockQuantity,
            photosCount: selectedPhotos.length
          });
          
          await productApi.createWithPhotos(formData);
        } else {
          // Usar endpoint padrão quando não há fotos
          console.log('[ProductDialog] Criando produto sem fotos usando /product');
          
          const productData = {
            id: generateCoherentUUID(), // Gerar UUID coerente com backend
            ...sanitizeProductData(data),
          };
          
          console.log('[ProductDialog] UUID gerado para novo produto:', productData.id);
          console.log('[ProductDialog] Dados para criação:', productData);
          console.log('[ProductDialog] Tipo do name:', typeof productData.name);
          console.log('[ProductDialog] Valor do name:', productData.name);
          console.log('[ProductDialog] JSON.stringify do name:', JSON.stringify(productData.name));
          
          await productApi.create(productData);
        }
        
        toast.success('Produto criado com sucesso!');
      }
      onClose();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing
              ? 'Atualize as informações do produto'
              : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome *</Label>
              <Input id="name" {...register('name')} disabled={loading} className="text-foreground" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode" className="text-foreground">Código de Barras *</Label>
              <Input id="barcode" {...register('barcode')} disabled={loading} className="text-foreground" />
              {errors.barcode && (
                <p className="text-sm text-destructive">{errors.barcode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Categoria</Label>
              <Input id="category" {...register('category')} disabled={loading} className="text-foreground" />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Preço de Venda *</Label>
              <Input
                id="price"
                type="text"
                placeholder="0.00"
                {...register('price', { 
                  valueAsNumber: true,
                  onChange: (e) => {
                    // Permitir apenas números e ponto decimal
                    let value = e.target.value.replace(/[^0-9.]/g, '');
                    
                    // Se o valor for vazio ou apenas pontos, definir como vazio
                    if (value === '' || value === '.') {
                      e.target.value = '';
                    } else {
                      e.target.value = value;
                    }
                  },
                  onFocus: (e) => {
                    // Se o valor for 0, limpar o campo ao focar
                    if (e.target.value === '0' || e.target.value === '0.00') {
                      e.target.value = '';
                    }
                  },
                  onBlur: (e) => {
                    // Se o campo estiver vazio ao sair, definir como 0
                    if (e.target.value === '') {
                      e.target.value = '0';
                    }
                  }
                })}
                disabled={loading}
                className="text-foreground"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity" className="text-foreground">Quantidade em Estoque *</Label>
              <Input
                id="stockQuantity"
                type="text"
                placeholder="0"
                {...register('stockQuantity', { 
                  valueAsNumber: true,
                  onChange: (e) => {
                    // Permitir apenas números inteiros
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = value;
                  },
                  onFocus: (e) => {
                    // Se o valor for 0, limpar o campo ao focar
                    if (e.target.value === '0') {
                      e.target.value = '';
                    }
                  },
                  onBlur: (e) => {
                    // Se o campo estiver vazio ao sair, definir como 0
                    if (e.target.value === '') {
                      e.target.value = '0';
                    }
                  }
                })}
                disabled={loading}
                className="text-foreground"
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate" className="text-foreground">Data de Validade</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register('expirationDate')}
                disabled={loading}
                className="text-foreground"
              />
              {errors.expirationDate && (
                <p className="text-sm text-destructive">{errors.expirationDate.message}</p>
              )}
            </div>

          </div>

          {/* Campo de Upload de Fotos */}
          <div className="space-y-2">
            <Label htmlFor="photos" className="text-foreground">
              {isEditing ? 'Adicionar Mais Fotos' : 'Fotos do Produto'}
            </Label>
            
            {/* Mostrar fotos existentes quando editando */}
            {isEditing && product?.photos && product.photos.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Fotos existentes ({product.photos.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.photos.map((photoUrl, index) => {
                    console.log(`[ProductDialog] Renderizando foto ${index}:`, photoUrl);
                    const isMarkedForDeletion = existingPhotosToDelete.includes(photoUrl);
                    
                    // Verificar se a URL é válida e construir URL completa se necessário
                    const getImageUrl = (url: string) => {
                      if (!url) return '';
                      
                      // Se já é uma URL completa, usar como está
                      if (url.startsWith('http://') || url.startsWith('https://')) {
                        return url;
                      }
                      
                      // Se é um caminho relativo, construir URL completa
                      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                      return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
                    };
                    
                    const fullImageUrl = getImageUrl(photoUrl);
                    console.log(`[ProductDialog] URL completa da foto ${index}:`, fullImageUrl);
                    
                    return (
                      <div key={`existing-${index}`} className="relative group">
                        <div className={`w-16 h-16 rounded border flex items-center justify-center transition-all duration-200 ${
                          isMarkedForDeletion 
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                            : 'border-border bg-muted group-hover:border-border/80'
                        }`}>
                          <img
                            src={fullImageUrl}
                            alt={`Foto existente ${index + 1}`}
                            className={`w-full h-full object-cover rounded transition-all duration-200 ${
                              isMarkedForDeletion 
                                ? 'opacity-50 grayscale' 
                                : ''
                            }`}
                            onLoad={() => console.log(`[ProductDialog] Foto ${index} carregada com sucesso:`, fullImageUrl)}
                            onError={(e) => {
                              console.error(`[ProductDialog] Erro ao carregar foto ${index}:`, {
                                originalUrl: photoUrl,
                                fullUrl: fullImageUrl,
                                error: e
                              });
                              // Mostrar placeholder quando a imagem falha ao carregar
                              const imgElement = e.target as HTMLImageElement;
                              imgElement.style.display = 'none';
                              const placeholder = imgElement.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                          {/* Placeholder quando a imagem não carrega */}
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs hidden">
                            <span>Erro</span>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {index + 1}
                        </div>
                        
                        {/* Botão X que aparece no hover */}
                        {!isMarkedForDeletion && (
                          <button
                            type="button"
                            className="absolute inset-0 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                            onClick={() => handleDeleteExistingPhoto(photoUrl)}
                            title="Excluir foto"
                          >
                            <X size={20} className="text-white" />
                          </button>
                        )}
                        
                        {/* Botão de restaurar para fotos marcadas para exclusão */}
                        {isMarkedForDeletion && (
                          <button
                            type="button"
                            className="absolute inset-0 bg-green-500 bg-opacity-90 rounded flex items-center justify-center hover:bg-opacity-100 transition-all duration-200"
                            onClick={() => handleRestoreExistingPhoto(photoUrl)}
                            title="Restaurar foto"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                              <path d="M3 12a9 9 0 1 0 9-9c2.52 0 4.93 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {existingPhotosToDelete.length > 0 && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-red-600">
                      {existingPhotosToDelete.length} foto(s) marcada(s) para exclusão
                    </p>
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={handleRestoreAllPhotos}
                    >
                      Restaurar todas
                    </button>
                  </div>
                )}
                
                {product.photos && product.photos.length > 0 && existingPhotosToDelete.length === 0 && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:text-red-800 underline"
                      onClick={handleDeleteAllPhotos}
                    >
                      Excluir todas as fotos
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Input de arquivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={loading}
              className="hidden"
            />
            
            {/* Input customizado */}
            <div
                className={`
                w-16 h-16 border-2 border-dashed rounded-lg cursor-pointer
                flex flex-col items-center justify-center
                transition-all duration-200 ease-in-out
                ${isDragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-border hover:border-primary hover:bg-muted'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={openFileDialog}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Plus 
                size={16} 
                className={`
                  text-muted-foreground transition-colors duration-200
                  ${isDragOver ? 'text-primary' : 'group-hover:text-primary'}
                `} 
              />
              <span className="text-xs text-muted-foreground mt-0.5 text-center px-0.5 leading-tight">
                {isDragOver ? 'Solte' : '+'}
              </span>
            </div>
            {isEditing && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Passe o mouse sobre uma foto existente para excluí-la</p>
                <p>• Fotos marcadas para exclusão ficam com borda vermelha</p>
                <p>• Clique no ícone de restaurar para cancelar a exclusão</p>
                <p>• As novas fotos serão adicionadas ao produto</p>
              </div>
            )}
            {selectedPhotos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedPhotos.length} foto(s) selecionada(s):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photoPreviewUrls[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-border"
                      />
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                           onClick={() => {
                             const newPhotos = selectedPhotos.filter((_, i) => i !== index);
                             const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
                             setSelectedPhotos(newPhotos);
                             setPhotoPreviewUrls(newPreviewUrls);
                             // Revogar a URL que está sendo removida
                             URL.revokeObjectURL(photoPreviewUrls[index]);
                           }}>
                        <X size={12} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate w-16">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="text-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Modal de Confirmação */}
      <ConfirmationModal
        open={confirmationModal.open}
        onClose={() => setConfirmationModal(prev => ({ ...prev, open: false }))}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        description={confirmationModal.description}
        variant={confirmationModal.variant}
        confirmText={confirmationModal.variant === 'destructive' ? 'Excluir' : 'Confirmar'}
        cancelText="Cancelar"
      />
    </Dialog>
  );
}
