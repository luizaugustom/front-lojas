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
      
      // Atualiza também a cor da scrollbar para usar a mesma cor da empresa
      document.documentElement.style.setProperty('--scrollbar-color', primaryColor);
      
      // Cria uma versão mais escura para o hover da scrollbar
      if (companyColor) {
        const hsl = primaryColor.split(' ');
        if (hsl.length === 3) {
          const [h, s, l] = hsl;
          const lValue = parseFloat(l.replace('%', ''));
          const darkerL = Math.max(lValue - 8, 30); // 8% mais escuro, mínimo 30%
          document.documentElement.style.setProperty('--scrollbar-color-hover', `${h} ${s} ${darkerL}%`);
        }
      } else {
        // Cor padrão para hover (azul mais escuro)
        document.documentElement.style.setProperty('--scrollbar-color-hover', '221.2 83.2% 45%');
      }
    }
  },
}));
