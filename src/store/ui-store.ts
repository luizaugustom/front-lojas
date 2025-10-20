import { create } from 'zustand';
import { applyCompanyColor } from '@/lib/colorUtils';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  companyColor: string | null;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCompanyColor: (color: string | null) => void;
  updatePrimaryColor: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Mobile drawer aberto/fechado (padrão: fechado)
  sidebarOpen: false,
  // Sidebar no desktop: colapsado (ícones) vs expandido (ícones + texto)
  sidebarCollapsed: true,
  theme: 'light',
  companyColor: null,
  
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen });
  },

  toggleSidebarCollapsed: () => {
    set({ sidebarCollapsed: !get().sidebarCollapsed });
  },
  
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  },
  
  setTheme: (theme) => {
    set({ theme });
    
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  },

  setCompanyColor: (color) => {
    set({ companyColor: color });
    get().updatePrimaryColor();
  },

  updatePrimaryColor: () => {
    if (typeof window !== 'undefined') {
      const { companyColor } = get();
      const primaryColor = applyCompanyColor(companyColor);
      
      // Atualiza a variável CSS --primary
      document.documentElement.style.setProperty('--primary', primaryColor);
    }
  },
}));
