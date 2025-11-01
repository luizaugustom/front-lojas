import { User, UserRole } from '@/types';

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export function setUser(user: User): void {
  if (typeof window !== 'undefined') {
    // Normalize role variants coming from backend to expected frontend roles
    const roleMap: Record<string, string> = {
      company: 'empresa',
      empresa: 'empresa',
      seller: 'vendedor',
      vendedor: 'vendedor',
      admin: 'admin',
      administrador: 'admin',
    };

    const normalizedRole = (roleMap[(user.role || '').toString().toLowerCase()] || user.role) as UserRole;
    const normalizedUser = { ...user, role: normalizedRole };
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
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
    '/devices': ['empresa'],
    '/settings': ['admin', 'empresa'],
  };

  const allowedRoles = permissions[route];
  if (!allowedRoles) return false;

  return allowedRoles.includes(user.role);
}
