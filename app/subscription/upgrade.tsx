import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Check, CreditCard, X, ArrowRight, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';
import { Asset } from 'expo-asset';
import { FEATURES, IS_DEMO } from '@/constants/environment';

import Colors from '@/constants/colors';

export default function UpgradePlanScreen() {
  const { user } = useAuth();
  const { subscription, setSubscription, getSubscriptionStatus } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'business'>(subscription?.plan || 'individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(subscription?.billingCycle || 'monthly');
  const [loading, setLoading] = useState(false);
  
  const subscriptionStatus = getSubscriptionStatus();

  const plans = {
    individual: {
      monthly: 29,
      yearly: 290,
      features: [
        '24/7 IT & Cybersecurity Support',
        'Personal Device Protection',
        'Monthly Security Audits',
        'Priority Email Support',
        'Incident Response',
        'Basic Security Training',
      ],
    },
    business: {
      monthly: 99,
      yearly: 990,
      features: [
        'Everything in Individual',
        'Up to 25 Devices & Users',
        'Weekly Security Reports',
        'Dedicated Account Manager',
        'Custom Security Policies',
        'Team Training Sessions',
        'Network Infrastructure Support',
        'Compliance Assistance (GDPR, SOX)',
        'Emergency Response Hotline',
      ],
    },
  };

  const currentPlan = plans[selectedPlan];
  const price = currentPlan[billingCycle];
  const yearlyDiscount = billingCycle === 'yearly' 
    ? Math.round(((currentPlan.monthly * 12 - currentPlan.yearly) / (currentPlan.monthly * 12)) * 100) 
    : 0;

  const isCurrentPlan = subscription?.plan === selectedPlan && subscription?.billingCycle === billingCycle;
  const isUpgrade = !subscription || 
    (selectedPlan === 'business' && subscription.plan === 'individual') ||
    (billingCycle === 'yearly' && subscription.billingCycle === 'monthly');

  const handleUpgrade = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User email is required');
      return;
    }

    if (isCurrentPlan) {
      Alert.alert('Current Plan', 'This is your current plan. Please select a different plan to upgrade or downgrade.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Upgrading subscription for user:', user.id);
      
      if (Platform.OS === 'web') {
        const asset = Asset.fromModule(require('@/assets/checkout.html'));
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
        const assetUri = asset.localUri ?? asset.uri;
        const params = new URLSearchParams({
          plan: selectedPlan,
          billing: billingCycle,
          userId: user.id,
          userEmail: user.email,
          upgrade: 'true',
        }).toString();
        const checkoutUrl = `${assetUri}?${params}`;
        window.location.assign(checkoutUrl);
      } else {
        if (IS_DEMO || FEATURES.mockPayments) {
          console.log('Demo mode: Upgrading subscription');
          const updatedSubscription = {
            plan: selectedPlan,
            billingCycle,
            status: subscription?.status || ('trial' as const),
            nextBillingDate: subscription?.nextBillingDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            trialEndDate: subscription?.trialEndDate,
            subscriptionId: subscription?.subscriptionId || 'demo-sub-' + Date.now(),
            customerId: subscription?.customerId || 'demo-customer-' + Date.now(),
            createdAt: subscription?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setSubscription(updatedSubscription);
          
          Alert.alert(
            'Plan Updated!',
            `Your plan has been ${isUpgrade ? 'upgraded' : 'changed'} to ${selectedPlan === 'business' ? 'Business' : 'Individual'} ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}.`,
            [
              { text: 'View Profile', onPress: () => router.replace('/(tabs)/profile') }
            ]
          );
        } else {
          Alert.alert(
            'Subscription Update',
            'Stripe integration is not fully configured for mobile. Please use the web version or contact support.',
            [
              { text: 'OK', onPress: () => router.back() }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      Alert.alert('Error', 'Failed to process upgrade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upgrade Your Plan</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {subscription && (
          <View style={styles.currentPlanHeader}>
            <View style={styles.currentPlanIcon}>
              <Crown size={20} color={Colors.primary} />
            </View>
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanLabel}>Current Plan</Text>
              <Text style={styles.currentPlanText}>
                {subscription.plan === 'business' ? 'Business' : 'Individual'} {subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
              <Text style={styles.currentPlanStatus}>{subscriptionStatus.displayStatus}</Text>
            </View>
          </View>
        )}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[styles.billingOptionText, billingCycle === 'monthly' && styles.billingOptionTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text style={[styles.billingOptionText, billingCycle === 'yearly' && styles.billingOptionTextActive]}>
                Yearly
              </Text>
              {yearlyDiscount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>Save {yearlyDiscount}%</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'individual' && styles.planCardActive]}
            onPress={() => setSelectedPlan('individual')}
          >
            {subscription?.plan === 'individual' && subscription?.billingCycle === billingCycle && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Individual</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${plans.individual[billingCycle]}</Text>
                <Text style={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'year'}</Text>
              </View>
            </View>
            <View style={styles.featuresContainer}>
              {plans.individual.features.map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Check size={16} color={Colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {selectedPlan === 'individual' && (
              <View style={styles.selectedIndicator}>
                <Check size={20} color={Colors.textPrimary} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'business' && styles.planCardActive]}
            onPress={() => setSelectedPlan('business')}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>BEST FOR SMALL BUSINESS</Text>
            </View>
            {subscription?.plan === 'business' && subscription?.billingCycle === billingCycle && (
              <View style={[styles.currentBadge, { top: 20 }]}>
                <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Small Business Pro</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${plans.business[billingCycle]}</Text>
                <Text style={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'year'}</Text>
              </View>
            </View>
            <View style={styles.featuresContainer}>
              {plans.business.features.map((feature) => (
                <View key={feature} style={styles.feature}>
                  <Check size={16} color={Colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {selectedPlan === 'business' && (
              <View style={styles.selectedIndicator}>
                <Check size={20} color={Colors.textPrimary} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Selected Plan</Text>
              <Text style={styles.summaryValue}>
                {selectedPlan === 'individual' ? 'Individual' : 'Small Business Pro'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Billing Cycle</Text>
              <Text style={styles.summaryValue}>
                {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${price}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.upgradeButton, isCurrentPlan && styles.upgradeButtonDisabled]}
            onPress={handleUpgrade}
            disabled={loading || isCurrentPlan}
          >
            <LinearGradient
              colors={isCurrentPlan ? [Colors.cardBorder, Colors.cardBorder] : [Colors.primary, Colors.primaryDark]}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isCurrentPlan ? (
                <>
                  <Check size={20} color={Colors.textMuted} />
                  <Text style={[styles.upgradeText, { color: Colors.textMuted }]}>
                    Current Plan
                  </Text>
                </>
              ) : (
                <>
                  {loading ? (
                    <Text style={styles.upgradeText}>Processing...</Text>
                  ) : (
                    <>
                      <ArrowRight size={20} color="#FFFFFF" />
                      <Text style={styles.upgradeText}>
                        {isUpgrade ? 'Upgrade Plan' : 'Change Plan'}
                      </Text>
                    </>
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Shield size={16} color={Colors.textMuted} />
            <Text style={styles.securityText}>
              {isUpgrade ? 'Upgrade now and get immediate access to new features.' : 'Changes will take effect on your next billing cycle.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 16,
  },
  currentPlanIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  currentPlanStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  billingOptionActive: {
    backgroundColor: Colors.cardBorder,
  },
  billingOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  billingOptionTextActive: {
    color: Colors.textPrimary,
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  planCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.primary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  period: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  summary: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  upgradeButton: {
    marginBottom: 16,
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  upgradeText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    flex: 1,
  },
});
