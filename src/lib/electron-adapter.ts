/**
 * Adaptador para usar a aplicação tanto em browser quanto em Electron
 */

// Verificar se está rodando no Electron
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && (window as any).electron?.isElectron === true;
};

// Obter plataforma
export const getPlatform = (): string => {
  if (isElectron()) {
    return (window as any).electron.platform;
  }
  return 'web';
};

// API Configuration
export const getApiConfig = async () => {
  if (isElectron()) {
    return await (window as any).electron.getApiConfig();
  }
  return {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 30000,
    retryAttempts: 3,
  };
};

export const setApiConfig = async (config: {
  url?: string;
  timeout?: number;
  retryAttempts?: number;
}) => {
  if (isElectron()) {
    return await (window as any).electron.setApiConfig(config);
  }
  console.warn('setApiConfig só funciona no Electron');
  return { success: false };
};

// Offline Operations
export const saveOffline = async (type: string, data: any) => {
  if (isElectron()) {
    return await (window as any).electron.saveOffline({ type, data });
  }
  
  // Fallback para localStorage no browser
  try {
    const key = `offline_${type}`;
    const existing = localStorage.getItem(key);
    const items = existing ? JSON.parse(existing) : [];
    items.push({ data, timestamp: Date.now(), synced: false });
    localStorage.setItem(key, JSON.stringify(items));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getOfflineData = async (type: string) => {
  if (isElectron()) {
    return await (window as any).electron.getOfflineData(type);
  }
  
  // Fallback para localStorage no browser
  try {
    const key = `offline_${type}`;
    const existing = localStorage.getItem(key);
    const items = existing ? JSON.parse(existing) : [];
    return { success: true, data: items.map((item: any) => item.data) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const syncNow = async () => {
  if (isElectron()) {
    return await (window as any).electron.syncNow();
  }
  console.warn('syncNow só funciona no Electron');
  return { success: false };
};

// Connection Status
export const checkConnection = async (): Promise<boolean> => {
  if (isElectron()) {
    return await (window as any).electron.checkConnection();
  }
  
  // Fallback para browser
  return navigator.onLine;
};

// Event Listeners
export const onConnectionStatus = (callback: (status: { isOnline: boolean }) => void) => {
  if (isElectron()) {
    return (window as any).electron.onConnectionStatus(callback);
  }
  
  // Fallback para browser
  const handler = () => callback({ isOnline: navigator.onLine });
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
};

export const onSyncStatus = (
  callback: (status: { syncing: boolean; success?: boolean; error?: any }) => void
) => {
  if (isElectron()) {
    return (window as any).electron.onSyncStatus(callback);
  }
  
  // No browser, não há sincronização automática
  return () => {};
};

// API Request with offline support
export const apiRequestWithOfflineSupport = async (params: {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  endpoint: string;
  data?: any;
  config?: any;
}) => {
  if (isElectron()) {
    return await (window as any).electron.apiRequest(params);
  }
  
  // No browser, usar API normal
  throw new Error('Use a API normal no browser');
};

// Show notification
export const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
};

