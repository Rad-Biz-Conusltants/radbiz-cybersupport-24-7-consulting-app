import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './auth-provider';

export interface ManagedUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  lastFourSSN: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  createdAt: string;
  createdBy: string;
  createdByName: string;
  lastLogin?: string;
  ticketsCreated: number;
}

interface UsersContextType {
  users: ManagedUser[];
  isLoading: boolean;
  addUser: (userData: Omit<ManagedUser, 'id' | 'createdAt' | 'createdBy' | 'createdByName' | 'status' | 'ticketsCreated'>) => Promise<void>;
  updateUser: (userId: string, updates: Partial<ManagedUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  getUserById: (userId: string) => ManagedUser | undefined;
}

export const [UsersProvider, useUsers] = createContextHook<UsersContextType>(() => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('managedUsers');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Initialize with demo data
        const demoUsers: ManagedUser[] = [
          {
            id: '1',
            fullName: 'John Smith',
            phone: '+1 (555) 123-4567',
            email: 'john.smith@democompany.com',
            lastFourSSN: '1234',
            role: 'admin',
            status: 'active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'system',
            createdByName: 'System Admin',
            lastLogin: '2 hours ago',
            ticketsCreated: 15
          },
          {
            id: '2',
            fullName: 'Sarah Johnson',
            phone: '+1 (555) 234-5678',
            email: 'sarah.johnson@democompany.com',
            lastFourSSN: '5678',
            role: 'user',
            status: 'active',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
            createdByName: 'John Smith',
            lastLogin: '1 day ago',
            ticketsCreated: 8
          },
          {
            id: '3',
            fullName: 'Mike Davis',
            phone: '+1 (555) 345-6789',
            email: 'mike.davis@democompany.com',
            lastFourSSN: '9012',
            role: 'user',
            status: 'inactive',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
            createdByName: 'John Smith',
            lastLogin: '1 week ago',
            ticketsCreated: 3
          },
          {
            id: '4',
            fullName: 'Emily Wilson',
            phone: '+1 (555) 456-7890',
            email: 'emily.wilson@democompany.com',
            lastFourSSN: '3456',
            role: 'manager',
            status: 'active',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: '1',
            createdByName: 'John Smith',
            lastLogin: '3 hours ago',
            ticketsCreated: 12
          }
        ];
        setUsers(demoUsers);
        await AsyncStorage.setItem('managedUsers', JSON.stringify(demoUsers));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const saveUsers = useCallback(async (updatedUsers: ManagedUser[]) => {
    try {
      await AsyncStorage.setItem('managedUsers', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to save users:', error);
      throw error;
    }
  }, []);

  const addUser = useCallback(async (userData: Omit<ManagedUser, 'id' | 'createdAt' | 'createdBy' | 'createdByName' | 'status' | 'ticketsCreated'>) => {
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const newUser: ManagedUser = {
      ...userData,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      ticketsCreated: 0
    };

    const updatedUsers = [...users, newUser];
    await saveUsers(updatedUsers);
  }, [users, currentUser, saveUsers]);

  const updateUser = useCallback(async (userId: string, updates: Partial<ManagedUser>) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    await saveUsers(updatedUsers);
  }, [users, saveUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    await saveUsers(updatedUsers);
  }, [users, saveUsers]);

  const toggleUserStatus = useCallback(async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await updateUser(userId, { status: newStatus });
    }
  }, [users, updateUser]);

  const getUserById = useCallback((userId: string) => {
    return users.find(user => user.id === userId);
  }, [users]);

  return useMemo(() => ({
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserById,
  }), [users, isLoading, addUser, updateUser, deleteUser, toggleUserStatus, getUserById]);
});