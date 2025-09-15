import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface Subscription {
  plan: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'trial';
  nextBillingDate: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const [SubscriptionProvider, useSubscription] = createContextHook<SubscriptionContextType>(() => {
  const [subscription, setSubscriptionState] = useState<Subscription | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('subscription');
      if (data) {
        setSubscriptionState(JSON.parse(data));
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    }
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const setSubscription = useCallback(async (sub: Subscription) => {
    if (!sub || typeof sub !== 'object') return;
    setSubscriptionState(sub);
    await AsyncStorage.setItem('subscription', JSON.stringify(sub));
  }, []);

  const cancelSubscription = useCallback(async () => {
    setSubscriptionState(null);
    await AsyncStorage.removeItem('subscription');
  }, []);

  return useMemo(() => ({
    subscription,
    setSubscription,
    cancelSubscription,
  }), [subscription, setSubscription, cancelSubscription]);
});