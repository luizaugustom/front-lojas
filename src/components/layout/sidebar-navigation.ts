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
  Building2,
  TestTube,
  CalendarClock,
  ClipboardList,
  FileText,
  MessageSquare,
  ArrowLeftRight,
  Briefcase,
  BarChart3,
  Banknote,
  Store,
  Clock,
} from 'lucide-react';

export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'empresa', 'gestor'] },
  { name: 'Produtos', href: '/products', icon: Package, roles: ['admin', 'empresa', 'vendedor', 'gestor'] },
  { name: 'Vendas', href: '/sales', icon: ShoppingCart, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Orçamentos', href: '/budgets', icon: FileText, roles: ['empresa', 'vendedor'] },
  { name: 'Histórico de Vendas', href: '/sales-history', icon: ClipboardList, roles: ['empresa', 'vendedor'] },
  { name: 'Clientes', href: '/customers', icon: Users, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Vendedores', href: '/sellers', icon: UserCheck, roles: ['admin', 'empresa'] },
  { name: 'Pagamentos a Prazo', href: '/installments', icon: CalendarClock, roles: ['empresa', 'vendedor'] },
  { name: 'Contas e Gastos', href: '/bills', icon: CreditCard, roles: ['admin', 'empresa'] },
  { name: 'Fechamento de Caixa', href: '/cash-closure', icon: DollarSign, roles: ['admin', 'empresa', 'vendedor'] },
  { name: 'Relatórios', href: '/reports', icon: FileBarChart, roles: ['admin', 'empresa', 'gestor'] },
  { name: 'Ponto Eletrônico', href: '/time-clock', icon: Clock, roles: ['vendedor', 'empresa', 'admin', 'gestor'] },
  { name: 'Métricas', href: '/metrics', icon: BarChart3, roles: ['gestor'] },
  { name: 'Transferência de estoque', href: '/stock-transfer', icon: ArrowLeftRight, roles: ['gestor'] },
  { name: 'Notas Fiscais', href: '/invoices', icon: Receipt, roles: ['empresa'] },
  { name: 'Estabelecimentos', href: '/establishments', icon: Store, roles: ['empresa'] },
  { name: 'Notas de Entrada', href: '/inbound-invoices', icon: FileDown, roles: ['empresa'] },
  { name: 'Boletos', href: '/boletos', icon: Banknote, roles: ['empresa'] },
  { name: 'Empresas', href: '/companies', icon: Building2, roles: ['admin'] },
  { name: 'Gestores', href: '/gestores', icon: Briefcase, roles: ['admin'] },
  { name: 'Testes da API', href: '/test-api', icon: TestTube, roles: ['admin'] },
  { name: 'Teste WhatsApp', href: '/whatsapp-test', icon: MessageSquare, roles: ['admin'] },
  { name: 'Configurações', href: '/settings', icon: Settings, roles: ['admin', 'empresa', 'gestor'] },
];

interface NavigationUser {
  role: string;
  nfeEmissionEnabled?: boolean;
}

export function getVisibleNavigation(user: NavigationUser | null) {
  if (!user) return [];

  if (user.role === 'gestor') {
    return navigation.filter((item) => item.roles.includes('gestor'));
  }

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

  return navigation.filter((item) => {
    if (user.role === 'admin' && adminExcluded.has(item.name)) return false;

    if (item.name === 'Notas Fiscais') {
      return user.role === 'empresa' || (user.role === 'vendedor' && user.nfeEmissionEnabled === true);
    }

    if (item.name === 'Estabelecimentos') return false;

    return item.roles.includes(user.role);
  });
}
