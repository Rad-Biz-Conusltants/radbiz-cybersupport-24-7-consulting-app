import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface User {
  id: string;
  email: string;
  name: string;
  planType: 'individual' | 'business';
  company?: string;
  userType: 'client' | 'tech';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, planType: 'individual' | 'business', company?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthContextType>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    // Simulate API call with demo accounts
    if (email === 'client@radbiz.com' && password === 'password') {
      const userData: User = {
        id: '1',
        email: 'client@radbiz.com',
        name: 'Demo Client',
        planType: 'business',
        company: 'Demo Company Inc.',
        userType: 'client',
      };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } else if (email === 'tech@radbiz.com' && password === 'password') {
      const userData: User = {
        id: '2',
        email: 'tech@radbiz.com',
        name: 'RadBiz Tech Consultant',
        planType: 'business',
        company: 'RadBiz Consultants',
        userType: 'tech',
      };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } else {
      throw new Error('Invalid credentials');
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, planType: 'individual' | 'business', company?: string) => {
    // Simulate API call
    const userData: User = {
      id: Date.now().toString(),
      email,
      name,
      planType,
      company,
      userType: 'client',
    };
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('subscription');
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut]);
});