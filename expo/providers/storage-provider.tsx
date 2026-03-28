import { useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface StorageContextType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const [StorageProvider, useStorage] = createContextHook<StorageContextType>(() => {
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!key?.trim() || key.length > 100) {
      console.error('Invalid storage key');
      return null;
    }
    
    try {
      return await AsyncStorage.getItem(key.trim());
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }, []);

  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) {
      console.error('Invalid storage key');
      return;
    }
    if (!value) {
      console.error('Invalid storage value');
      return;
    }
    
    try {
      await AsyncStorage.setItem(key.trim(), value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
    }
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) {
      console.error('Invalid storage key');
      return;
    }
    
    try {
      await AsyncStorage.removeItem(key.trim());
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  }, []);

  const clear = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }, []);

  return useMemo(() => ({
    getItem,
    setItem,
    removeItem,
    clear,
  }), [getItem, setItem, removeItem, clear]);
});