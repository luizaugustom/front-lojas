import { User, UserRole } from '@/types';
import { setAccessToken, getAccessToken, clearAccessToken } from './apiClient';

// Token: delegado ao apiClient (apenas memória; sem localStorage para reduzir risco de XSS)
export function setAuthToken(token: string): void {
  setAccessToken(token);
}

export function getAuthToken(): string | null {
  return getAccessToken();
}

export function removeAuthToken(): void {
  clearAccessToken();
  currentUser = null;
}

// User: apenas em memória (não persistir em localStorage)
let currentUser: User | null = null;

export function setUser(user: User): void {
  const roleMap: Record<string, string> = {
    company: 'empresa',
    empresa: 'empresa',
    seller: 'vendedor',
    vendedor: 'vendedor',
    admin: 'admin',
    administrador: 'admin',
    manager: 'gestor',
    gestor: 'gestor',
  };
  const normalizedRole = (roleMap[(user.role || '').toString().toLowerCase()] || user.role) as UserRole;
  currentUser = { ...user, role: normalizedRole };
}

export function getUser(): User | null {
  return currentUser;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function hasRole(role: string | string[]): boolean {
  const user = getUser();
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
}

export function canAccessRoute(route: string): boolean {
  const user = getUser();
  if (!user) return false;

  // Admin has access to everything
  if (user.role === 'admin') return true;

  // Gestor: apenas rotas de multilojas
  if (user.role === 'gestor') {
    const gestorRoutes = ['/dashboard', '/stock-transfer', '/reports', '/settings', '/metrics'];
    return gestorRoutes.includes(route) || route.startsWith('/gestor');
  }

  // Define route permissions
  const permissions: Record<string, string[]> = {
    '/dashboard': ['admin', 'empresa', 'vendedor'],
    '/products': ['admin', 'empresa', 'vendedor'],
    '/sales': ['admin', 'empresa', 'vendedor'],
    '/customers': ['admin', 'empresa', 'vendedor'],
    '/installments': ['admin', 'empresa', 'vendedor'],
    '/bills': ['admin', 'empresa'],
    '/cash-closure': ['admin', 'empresa', 'vendedor'],
    '/reports': ['admin', 'empresa'],
    '/stock-transfer': ['gestor'],
    '/gestores': ['admin'],
    '/devices': ['empresa', 'vendedor'],
    '/settings': ['admin', 'empresa'],
  };

  const allowedRoles = permissions[route];
  if (!allowedRoles) return false;

  return allowedRoles.includes(user.role);
}
