// hooks/useAuth.ts

import { useState, useContext, createContext, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check if user is already logged in on mount
    return !!localStorage.getItem('authToken');
  });

  const login = useCallback((token: string) => {
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    // Add any additional logout logic here (e.g., API calls)
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};