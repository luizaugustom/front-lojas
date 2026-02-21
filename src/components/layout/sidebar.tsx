'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  FileBarChart,
  Receipt,
  FileDown,
  CreditCard,
  DollarSign,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  TestTube,
  CalendarClock,
  ClipboardList,
  FileText,
  MessageSquare,
  ArrowLeftRight,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'empresa', 'gestor'] },
  { name: 'Produtos', href: '/products', icon: Package, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Vendas', href: '/sales', icon: ShoppingCart, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Orçamentos', href: '/budgets', icon: FileText, roles: ['empresa', 'vendedor'] },
  { name: 'Histórico de Vendas', href: '/sales-history', icon: ClipboardList, roles: ['empresa', 'vendedor'] },
  { name: 'Clientes', href: '/customers', icon: Users, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Vendedores', href: '/sellers', icon: UserCheck, roles: ['admin', 'empresa'] },
  { name: 'Pagamentos a Prazo', href: '/installments', icon: CalendarClock, roles: ['empresa', 'vendedor'] },
  { name: 'Contas e Gastos', href: '/bills', icon: CreditCard, roles: ['admin', 'empresa'] },
  { name: 'Fechamento de Caixa', href: '/cash-closure', icon: DollarSign, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Relatórios', href: '/reports', icon: FileBarChart, roles: ['admin', 'empresa', 'gestor'] },
  { name: 'Transferência de estoque', href: '/stock-transfer', icon: ArrowLeftRight, roles: ['gestor'] },
  // Visível apenas para empresas: Notas Fiscais
  { name: 'Notas Fiscais', href: '/invoices', icon: Receipt, roles: ['empresa'] },
  // Visível apenas para empresas: Notas de Entrada
  { name: 'Notas de Entrada', href: '/inbound-invoices', icon: FileDown, roles: ['empresa'] },
  // Visível apenas para admin: Gerenciar Empresas e Gestores
  { name: 'Empresas', href: '/companies', icon: Building2, roles: ['admin'] },
  { name: 'Gestores', href: '/gestores', icon: Briefcase, roles: ['admin'] },
  // Testes da API - visível apenas para admin
  { name: 'Testes da API', href: '/test-api', icon: TestTube, roles: ['admin'] },
  // Teste WhatsApp - visível apenas para admin
  { name: 'Teste WhatsApp', href: '/whatsapp-test', icon: MessageSquare, roles: ['admin'] },
  { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin', 'empresa', 'gestor'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) => {
    if (!user) {
      console.log('No user found, filtering out all items');
      return false;
    }
    // Gestor: apenas itens com role gestor
    if (user.role === 'gestor') {
      return item.roles.includes('gestor');
    }
    // Se for admin, ocultar itens sensíveis conforme solicitado
    const adminExcluded = new Set([
      'Dashboard',
      'Produtos',
      'Vendas',
      'Clientes',
      'Vendedores',
      'Contas e Gastos',
      'Relatórios',
      'Fechamento de Caixa',
    ]);

    if (user.role === 'admin' && adminExcluded.has(item.name)) {
      return false;
    }

    // Notas Fiscais: empresa sempre; vendedor apenas se nfeEmissionEnabled
    if (item.name === 'Notas Fiscais') {
      return user.role === 'empresa' || (user.role === 'vendedor' && user.nfeEmissionEnabled === true);
    }

    // O role já foi normalizado na API (company -> empresa)
    return item.roles.includes(user.role);
  });
  

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform border-r bg-card transition-all duration-300 ease-in-out lg:translate-x-0',
          // Largura dinâmica no desktop
          sidebarCollapsed ? 'w-16' : 'w-64',
          // Drawer no mobile
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="navigation"
        aria-label="Menu principal"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              {!sidebarCollapsed && (
                <Image 
                  src="/logo.png" 
                  alt="MontShop Logo" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6"
                />
              )}
              {!sidebarCollapsed && <span className="text-lg font-bold dark:text-white">MontShop</span>}
            </Link>
            <div className="flex items-center gap-1">
              {/* Toggle collapse (desktop) */}
              <button
                onClick={toggleSidebarCollapsed}
                title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
                className="hidden lg:inline-flex items-center justify-center p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                aria-label={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
              </button>

              {/* Fechar drawer (mobile) */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="inline-flex lg:hidden items-center justify-center p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                title="Fechar menu"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn('flex-1 space-y-1 overflow-y-auto', sidebarCollapsed ? 'p-2' : 'p-4')} role="navigation" aria-label="Menu de navegação">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center rounded-lg py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                  {sidebarCollapsed && (
                    <span className="sr-only">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          {user && (
            <div className={cn('border-t', sidebarCollapsed ? 'p-2' : 'p-4')}>
              <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {(
                    (user.name && user.name.length > 0 && user.name.charAt(0)) ||
                    (user.email && user.email.length > 0 && user.email.charAt(0)) ||
                    (user.login && user.login.length > 0 && user.login.charAt(0)) ||
                    '?'
                  ).toString().toUpperCase()}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium dark:text-white">{user.name || user.email || user.login || 'Usuário'}</p>
                    <p className="truncate text-xs text-muted-foreground dark:text-gray-300 capitalize">{user.role}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
