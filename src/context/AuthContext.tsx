import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(localStorage.getItem('isAuthenticated') === 'true');

  // Check if the user is authenticated when the app loads
  useEffect(() => {
    const storedAuthStatus = localStorage.getItem('isAuthenticated');
    if (storedAuthStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email: string, password: string) => {
    if (email === 'admin@gmail.com' && password === 'admin') {
      // On successful login, store authentication status in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('email', email); // Optionally store email in localStorage
      setIsAuthenticated(true);
      return true;
    }
    return false; // Authentication failed
  };

  const logout = () => {
    // Clear authentication from localStorage on logout
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
