import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, RegisterData } from '@/types';
import { AuthService } from '@/services/authServices';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  addFavorite: (articleId: string) => void;
  removeFavorite: (articleId: string) => void;
  toggleFavorite: (articleId: string) => void;
  isFavorited: (articleId: string) => boolean;
  addToHistory: (articleId: string) => void;
  updateProfile: (updates: Partial<Pick<User, 'username' | 'avatar'>>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && AuthService.isAuthenticated()) {
      setUser(currentUser);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const result = await AuthService.login({ email, password });
    setUser(result);
    return result;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    const result = await AuthService.register(data);
    setUser(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const addFavorite = useCallback((articleId: string) => {
    AuthService.addFavorite(articleId);
    const updated = AuthService.getCurrentUser();
    if (updated) setUser(updated);
  }, []);

  const removeFavorite = useCallback((articleId: string) => {
    AuthService.removeFavorite(articleId);
    const updated = AuthService.getCurrentUser();
    if (updated) setUser(updated);
  }, []);

  const toggleFavorite = useCallback((articleId: string) => {
    if (!user) return;
    if (user.favorites.includes(articleId)) {
      removeFavorite(articleId);
    } else {
      addFavorite(articleId);
    }
  }, [user, addFavorite, removeFavorite]);

  const isFavorited = useCallback((articleId: string): boolean => {
    return !!user?.favorites.includes(articleId);
  }, [user]);

  const addToHistory = useCallback((articleId: string) => {
    AuthService.addToHistory(articleId);
    const updated = AuthService.getCurrentUser();
    if (updated) setUser(updated);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, 'username' | 'avatar'>>): Promise<User> => {
    const result = await AuthService.updateProfile(updates);
    setUser(result);
    return result;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorited,
        addToHistory,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
