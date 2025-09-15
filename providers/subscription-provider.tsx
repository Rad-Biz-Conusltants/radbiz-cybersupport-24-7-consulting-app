import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { FEATURES, IS_DEMO } from '@/constants/environment';

interface Subscription {
  plan: 'individual' | 'business';
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  nextBillingDate: string;
  trialEndDate?: string;
  subscriptionId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  createSubscription: (plan: 'individual' | 'business', billingCycle: 'monthly' | 'yearly') => Promise<string>;
  getSubscriptionStatus: () => {
    isActive: boolean;
    isOnTrial: boolean;
    daysUntilExpiry: number;
    displayStatus: string;
  };
  isDemoMode: boolean;
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

  const createSubscription = useCallback(async (plan: 'individual' | 'business', billingCycle: 'monthly' | 'yearly') => {
    if (IS_DEMO && FEATURES.mockPayments) {
      console.log('Demo mode: Creating mock subscription');
      const mockSubscription: Subscription = {
        plan,
        billingCycle,
        status: 'trial',
        nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionId: 'demo-sub-' + Date.now(),
        customerId: 'demo-customer-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setSubscription(mockSubscription);
      return 'demo://checkout/success';
    }
    
    try {
      const response = await fetch('https://toolkit.rork.com/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          billingCycle,
          returnUrl: 'radbiz://subscription/success',
          cancelUrl: 'radbiz://subscription/cancel'
        })
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        return data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }, [setSubscription]);

  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) {
      return {
        isActive: false,
        isOnTrial: false,
        daysUntilExpiry: 0,
        displayStatus: 'No Subscription'
      };
    }

    const now = new Date();
    const nextBilling = new Date(subscription.nextBillingDate);
    const daysUntilExpiry = Math.ceil((nextBilling.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isOnTrial = subscription.status === 'trial';
    const isActive = subscription.status === 'active' || isOnTrial;

    let displayStatus = 'Inactive';
    if (isOnTrial) {
      displayStatus = `Trial (${daysUntilExpiry} days left)`;
    } else if (isActive) {
      const planName = subscription.plan === 'business' ? 'Business' : 'Individual';
      const cycle = subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
      displayStatus = `${planName} ${cycle}`;
    } else if (subscription.status === 'expired') {
      displayStatus = 'Expired';
    }

    return {
      isActive,
      isOnTrial,
      daysUntilExpiry,
      displayStatus
    };
  }, [subscription]);

  return useMemo(() => ({
    subscription,
    setSubscription,
    cancelSubscription,
    createSubscription,
    getSubscriptionStatus,
    isDemoMode: IS_DEMO,
  }), [subscription, setSubscription, cancelSubscription, createSubscription, getSubscriptionStatus]);
});