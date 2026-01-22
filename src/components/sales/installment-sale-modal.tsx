'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Search, User, Calendar, DollarSign, RefreshCw } from 'lucide-react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { handleApiError } from '@/lib/handleApiError';
import { customerApi } from '@/lib/api-endpoints';
import { formatCurrency, formatDate, formatCPFCNPJ, debounce } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Customer } from '@/types';

interface InstallmentSaleModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (customerId: string, installmentData: InstallmentData, customerInfo: { name: string; cpfCnpj?: string }) => void;
  totalAmount: number;
}

interface InstallmentData {
  installments: number;
  installmentValue: number;
  firstDueDate: Date;
  description?: string;
}

interface CustomerWithDebt extends Customer {
  totalDebt?: number;
  overdueInstallments?: number;
}

export function InstallmentSaleModal({ 
  open, 
  onClose, 
  onConfirm, 
  totalAmount 
}: InstallmentSaleModalProps) {
  const { isAuthenticated, user, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<CustomerWithDebt[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithDebt[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithDebt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [installments, setInstallments] = useState(1);
  const [firstDueDate, setFirstDueDate] = useState<Date | null>(null);
  const [minSearchLength] = useState(3); // Mínimo de 3 caracteres para buscar
  const [lastSearchTerm, setLastSearchTerm] = useState(''); // Controle de busca duplicada
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Controle de carregamento inicial
  const [companyConfig, setCompanyConfig] = useState<{ installmentInterestRates?: Record<string, number>; maxInstallments?: number }>({
    installmentInterestRates: {},
    maxInstallments: 12,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<{ description?: string }>({
    resolver: zodResolver(require('@/lib/validations').installmentSaleSchema),
  });

  // Carregar configurações da empresa
  const loadCompanyConfig = async () => {
    try {
      const response = await api.get('/company/my-company');
      const rates = response.data?.installmentInterestRates || {};
      setCompanyConfig({
        installmentInterestRates: rates,
        maxInstallments: response.data?.maxInstallments ?? 12,
      });
    } catch (error) {
      console.error('Erro ao carregar configurações da empresa:', error);
      // Usar valores padrão em caso de erro
      setCompanyConfig({
        installmentInterestRates: {},
        maxInstallments: 12,
      });
    }
  };

  // Carregar configurações da empresa e clientes quando o modal abrir
  useEffect(() => {
    if (open && isAuthenticated && isInitialLoad) {
      console.log('[DEBUG] Carregamento inicial do modal');
      loadCompanyConfig();
      loadCustomers();
      // Definir data padrão para um mês após a data atual, preservando o dia corrente quando possível
      const now = new Date();
      const initialTarget = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
      const daysInTargetMonth = new Date(initialTarget.getFullYear(), initialTarget.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(now.getDate(), daysInTargetMonth);

      initialTarget.setDate(targetDay);
      initialTarget.setHours(0, 0, 0, 0);

      // Criar data em UTC para evitar problemas de timezone
      const utcDate = new Date(
        Date.UTC(
          initialTarget.getFullYear(),
          initialTarget.getMonth(),
          initialTarget.getDate(),
          0,
          0,
          0,
          0,
        ),
      );

      setFirstDueDate(utcDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated, isInitialLoad]);


  // Função de busca otimizada com controle de chamadas duplicadas
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      // Evitar chamadas duplicadas
      if (term === lastSearchTerm) {
        console.log('[DEBUG] Busca duplicada evitada:', term);
        return;
      }
      
      // Só busca se tiver o número mínimo de caracteres
      if (term.trim().length >= minSearchLength) {
        console.log('[DEBUG] Buscando na API:', term);
        setLastSearchTerm(term);
        await loadCustomers(term);
      } else if (term.trim().length === 0) {
        // Se campo estiver vazio, carrega todos os clientes apenas se necessário
        if (customers.length === 0) {
          console.log('[DEBUG] Carregando todos os clientes');
          setLastSearchTerm('');
          await loadCustomers();
        }
      }
    }, 500), // Aumentei o debounce para 500ms
    [minSearchLength, lastSearchTerm, customers.length]
  );

  // Filtrar clientes baseado na busca (otimizado para reduzir chamadas à API)
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    // Sempre fazer busca local primeiro (instantânea)
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpfCnpj?.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);

    // Só buscar na API se:
    // 1. Tiver o mínimo de caracteres
    // 2. Não for o carregamento inicial
    // 3. Não for uma busca duplicada
    if (searchTerm.length >= minSearchLength && !isInitialLoad && searchTerm !== lastSearchTerm) {
      console.log('[DEBUG] Busca local feita, agendando busca na API');
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, customers, debouncedSearch, minSearchLength, isInitialLoad, lastSearchTerm]);

  // Resetar estado quando o modal fechar
  useEffect(() => {
    if (!open) {
      setSelectedCustomer(null);
      setSearchTerm('');
      setInstallments(1);
      setLastSearchTerm('');
      setIsInitialLoad(true);
      reset();
    }
  }, [open, reset]);

  const loadCustomers = async (searchTerm?: string) => {
    console.log('[DEBUG] loadCustomers chamada com:', { 
      searchTerm, 
      loading, 
      isAuthenticated, 
      user, 
      isInitialLoad,
      customersCount: customers.length 
    });
    
    if (!isAuthenticated) {
      console.error('[DEBUG] Usuário não autenticado');
      toast.error('Você precisa estar logado para acessar os clientes');
      return;
    }

    // Evitar chamadas desnecessárias
    if (loading) {
      console.log('[DEBUG] Já está carregando, evitando chamada duplicada');
      return;
    }

    setLoading(true);
    try {
      // Usar busca da API se houver termo de busca
      const params: any = searchTerm 
        ? { limit: 1000, search: searchTerm }
        : { limit: 1000 };
      
      // Adicionar companyId se disponível (igual à página de clientes)
      if (user?.companyId) {
        params.companyId = user.companyId;
      }
        
      console.log('[DEBUG] Parâmetros da API:', params);
      
      // Usar customerApi.list() com companyId
      const response = await customerApi.list(params);
      console.log('[DEBUG] Resposta da API:', response);
      
      // Tentar diferentes estruturas de resposta (igual à página de clientes)
      let customersList = [];
      if (response.data?.customers) {
        customersList = response.data.customers;
      } else if (response.data?.data) {
        customersList = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        customersList = response.data;
      } else if (Array.isArray(response)) {
        customersList = response;
      }
      
      console.log('[DEBUG] Lista de clientes extraída:', customersList);
      
      // Carregar informações de dívidas para cada cliente
      const customersWithDebt = await Promise.all(
        customersList.map(async (customer: Customer) => {
          try {
            const installmentsResponse = await api.get(`/customer/${customer.id}/installments`);
            const installments = installmentsResponse.data.data || [];
            
            const now = new Date();
            // Normalizar data atual para meia-noite para comparação correta
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const unpaidInstallments = installments.filter((inst: any) => !inst.isPaid);
            const totalDebt = unpaidInstallments.reduce((sum: number, inst: any) => sum + Number(inst.amount || 0), 0);
            
            // Filtrar apenas parcelas realmente vencidas (dueDate < hoje)
            const overdueInstallments = unpaidInstallments.filter((inst: any) => {
              if (!inst.dueDate) return false;
              const dueDate = new Date(inst.dueDate);
              // Normalizar data de vencimento para meia-noite para comparação
              const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
              return dueDateNormalized < today;
            });
            
            return {
              ...customer,
              totalDebt,
              overdueInstallments: overdueInstallments.length,
            };
          } catch (error) {
            console.error(`Erro ao carregar parcelas do cliente ${customer.id}:`, error);
            return {
              ...customer,
              totalDebt: 0,
              overdueInstallments: 0,
            };
          }
        })
      );
      
      console.log('[DEBUG] Clientes com dívidas:', customersWithDebt);
      setCustomers(customersWithDebt);
      setFilteredCustomers(customersWithDebt);
      
      // Marcar que não é mais carregamento inicial
      if (isInitialLoad) {
        setIsInitialLoad(false);
        console.log('[DEBUG] Carregamento inicial concluído');
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      
      // Se for erro de autenticação, mostrar mensagem específica
      if (error.response?.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error('Erro ao carregar lista de clientes');
      }
      
      // Em caso de erro, usar dados mock como fallback
      console.log('[DEBUG] Usando dados mock como fallback');
      const mockCustomers = [
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@email.com',
          phone: '(11) 99999-9999',
          cpfCnpj: '123.456.789-00',
          companyId: 'company-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalDebt: 150.00,
          overdueInstallments: 1,
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@email.com',
          phone: '(11) 88888-8888',
          cpfCnpj: '987.654.321-00',
          companyId: 'company-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalDebt: 0,
          overdueInstallments: 0,
        },
        {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro@email.com',
          phone: '(11) 77777-7777',
          cpfCnpj: '456.789.123-00',
          companyId: 'company-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalDebt: 300.50,
          overdueInstallments: 2,
        }
      ];
      
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  };

  const calculateInstallmentValue = (parcelaNumber: number = 1) => {
    const interestRates = companyConfig?.installmentInterestRates || {};
    const interestRate = interestRates[parcelaNumber.toString()] ?? 0;
    const baseAmount = totalAmount / installments;
    const installmentAmountRaw = baseAmount * (1 + interestRate / 100);
    // Arredondar para 2 casas decimais
    return Math.round(installmentAmountRaw * 100) / 100;
  };

  const calculateTotalWithInterest = () => {
    const interestRates = companyConfig?.installmentInterestRates || {};
    let total = 0;
    for (let i = 1; i <= installments; i++) {
      const interestRate = interestRates[i.toString()] ?? 0;
      const baseAmount = totalAmount / installments;
      const installmentAmountRaw = baseAmount * (1 + interestRate / 100);
      // Arredondar cada parcela para 2 casas decimais
      total += Math.round(installmentAmountRaw * 100) / 100;
    }
    // Arredondar o total final para 2 casas decimais
    return Math.round(total * 100) / 100;
  };

  const calculateTotalInterest = () => {
    return calculateTotalWithInterest() - totalAmount;
  };

  const onSubmit = (data: { description?: string }) => {
    if (!selectedCustomer) {
      toast.error('Selecione um cliente!');
      return;
    }

    // Validar limite de parcelas
    const maxInstallments = companyConfig?.maxInstallments ?? 12;
    if (installments < 1 || installments > maxInstallments) {
      toast.error(`Número de parcelas deve estar entre 1 e ${maxInstallments}`);
      return;
    }

    if (installments < 1 || installments > 24) {
      toast.error('Número de parcelas deve ser entre 1 e 24!');
      return;
    }

    if (!firstDueDate) {
      toast.error('Selecione a data do primeiro vencimento!');
      return;
    }

    const installmentData: InstallmentData = {
      installments,
      installmentValue: calculateInstallmentValue(1), // Valor da primeira parcela (usado como referência)
      firstDueDate: firstDueDate!,
      description: data.description,
    };

    onConfirm(selectedCustomer.id, installmentData, { name: selectedCustomer.name, cpfCnpj: selectedCustomer.cpfCnpj });
  };

  const getDebtStatus = (customer: CustomerWithDebt) => {
    if (customer.totalDebt === 0) return { label: 'Em dia', variant: 'default' as const };
    if (customer.overdueInstallments && customer.overdueInstallments > 0) {
      return { label: `${customer.overdueInstallments} em atraso`, variant: 'destructive' as const };
    }
    return { label: 'Pendente', variant: 'secondary' as const };
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Venda a Prazo
          </DialogTitle>
          <DialogDescription>
            Selecione um cliente e configure as parcelas para a venda de {formatCurrency(totalAmount)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Verificação de Autenticação */}
          {!isAuthenticated && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
              <p>Você precisa estar logado para acessar os clientes</p>
              <p className="text-sm text-muted-foreground">Faça login para continuar</p>
            </div>
          )}

          {/* Busca de Clientes */}
          {isAuthenticated && (
            <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Buscar cliente por nome, CPF/CNPJ ou email... (mín. ${minSearchLength} caracteres)`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadCustomers()}
                disabled={loading}
                className="px-3"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            
             {searchTerm && searchTerm.length < minSearchLength && (
               <div className="text-sm text-amber-600">
                 Busca local ativa - Digite {minSearchLength} caracteres para busca completa na API
               </div>
             )}

             {searchTerm && searchTerm.length >= minSearchLength && loading && (
               <div className="text-sm text-muted-foreground">
                 Buscando clientes da empresa...
               </div>
             )}

             {searchTerm && searchTerm.length >= minSearchLength && !loading && (
               <div className="text-sm text-green-600 dark:text-green-400">
                 Busca local + API concluída
               </div>
             )}

            {filteredCustomers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}
              </div>
            )}


            {/* Lista de Clientes */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {loading ? (
                    <>
                      <p>Carregando clientes...</p>
                      <p className="text-sm">Buscando na base de dados da empresa</p>
                    </>
                  ) : searchTerm ? (
                    <>
                      <p>Nenhum cliente encontrado</p>
                      <p className="text-sm">
                        {searchTerm.length < minSearchLength 
                          ? `Digite pelo menos ${minSearchLength} caracteres para busca completa`
                          : 'Tente outro termo de busca'
                        }
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Nenhum cliente cadastrado</p>
                      <p className="text-sm">Cadastre clientes na seção de Clientes</p>
                    </>
                  )}
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const debtStatus = getDebtStatus(customer);
                  return (
                    <Card
                      key={customer.id}
                      className={`cursor-pointer transition-colors ${
                        selectedCustomer?.id === customer.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{customer.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              {customer.cpfCnpj && (
                                <span>{formatCPFCNPJ(customer.cpfCnpj)}</span>
                              )}
                              {customer.email && (
                                <span>{customer.email}</span>
                              )}
                              {customer.phone && (
                                <span>{customer.phone}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={debtStatus.variant}>
                              {debtStatus.label}
                            </Badge>
                            {customer.totalDebt && customer.totalDebt > 0 && (
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                Dívida: {formatCurrency(customer.totalDebt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
          )}

          {/* Configuração das Parcelas */}
          {isAuthenticated && selectedCustomer && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Configuração das Parcelas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Select
                    value={installments.toString()}
                    onValueChange={(value) => setInstallments(Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: Math.max(1, Math.min(companyConfig?.maxInstallments ?? 12, 24)) }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="installmentValue">Valor da Parcela</Label>
                  <Input
                    id="installmentValue"
                    value={formatCurrency(calculateInstallmentValue())}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstDueDate">Primeiro Vencimento</Label>
                  <DatePicker
                    date={firstDueDate || undefined}
                    onSelect={(date) => setFirstDueDate(date || null)}
                    placeholder="Selecione a data do primeiro vencimento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição (Opcional)</Label>
                <Input
                  id="description"
                  placeholder="Ex: Venda de produtos diversos"
                  {...register('description')}
                />
              </div>

              {/* Resumo */}
              <div className="p-3 bg-background rounded border">
                <h4 className="font-medium mb-2">Resumo da Venda a Prazo</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor Original:</span>
                    <p className="font-medium">{formatCurrency(totalAmount)}</p>
                  </div>
                  {(() => {
                    const interestRates = companyConfig?.installmentInterestRates || {};
                    const hasAnyInterest = Object.values(interestRates).some(rate => rate > 0);
                    const totalInterest = calculateTotalInterest();
                    return hasAnyInterest && totalInterest > 0 ? (
                      <>
                        <div>
                          <span className="text-muted-foreground">Total de Juros:</span>
                          <p className="font-medium text-green-600 dark:text-green-400">+{formatCurrency(totalInterest)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total com Juros:</span>
                          <p className="font-medium text-primary">{formatCurrency(calculateTotalWithInterest())}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                  <div>
                    <span className="text-muted-foreground">Parcelas:</span>
                    <p className="font-medium">{installments}x de {formatCurrency(calculateInstallmentValue())}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Primeiro vencimento:</span>
                    <p className="font-medium">{firstDueDate ? formatDate(firstDueDate.toISOString().split('T')[0]) : 'Não selecionado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedCustomer || !isAuthenticated}
            >
              {loading ? 'Processando...' : 'Confirmar Venda a Prazo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
