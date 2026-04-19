import { create } from 'zustand';
import { MASTER_API_URL } from './constants';

interface User {
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  apiUrl: string;
  login: (email: string) => Promise<void>;
  logout: () => void;
  setApiUrl: (url: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('auth_user'),
  // Priorité 1: Le lien en dur (Infaillible pour GitHub Pages)
  // Priorité 2: Variable d'environnement
  // Priorité 3: Cache local
  apiUrl: MASTER_API_URL || import.meta.env.VITE_API_URL || localStorage.getItem('api_url') || '',
  
  login: async (email: string) => {
    const role: 'admin' | 'user' = email.toLowerCase() === 'admin@example.com' ? 'admin' : 'user';
    const user = { email, role };
    
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false });
  },

  setApiUrl: (url: string) => {
    localStorage.setItem('api_url', url);
    set({ apiUrl: url });
  },
}));
