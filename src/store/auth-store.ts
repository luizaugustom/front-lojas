import { create } from 'zustand';
import { User } from '@/types';
import { setAuthToken, setUser, removeAuthToken, getUser, getAuthToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (user, token) => {
    console.log('Auth store login called with:', { user, token });
    setAuthToken(token);
    setUser(user);
    set({ user, token, isAuthenticated: true });
    console.log('Auth store state updated, isAuthenticated: true');
  },
  
  logout: () => {
    removeAuthToken();
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initialize: () => {
    const user = getUser();
    const token = getAuthToken();
    if (user && token) {
      set({ user, token, isAuthenticated: true });
    }
  },
}));
