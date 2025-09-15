import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Check, CreditCard, X, Monitor, DollarSign } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';
import { createSubscriptionCheckout } from '@/functions/stripe-functions';
import Colors from '@/constants/colors';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { setSubscription } = useSubscription();
  const { plan: urlPlan } = useLocalSearchParams<{ plan?: string }>();
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'business' | 'guest'>(urlPlan === 'guest' ? 'guest' : (user?.planType || 'individual'));
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  
  const isGuestPlan = selectedPlan === 'guest';
  const supportType = user ? 'cybersecurity' : 'it'; // Default based on user or fallback

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
    guest: {
      deposit: 150,
      hourly: 100,
      features: [
        'Immediate Support Access',
        'Pay-as-you-go Pricing',
        'No Long-term Commitment',
        'Expert IT & Cybersecurity Help',
        'Emergency Response Available',
        'One-time Issue Resolution',
      ],
    },
  };

  const currentPlan = plans[selectedPlan as keyof typeof plans];
  const price = isGuestPlan 
    ? (currentPlan as typeof plans.guest).deposit 
    : (currentPlan as typeof plans.individual | typeof plans.business)[billingCycle];
  const yearlyDiscount = !isGuestPlan && billingCycle === 'yearly' 
    ? Math.round(((currentPlan as typeof plans.individual | typeof plans.business).monthly * 12 - (currentPlan as typeof plans.individual | typeof plans.business).yearly) / ((currentPlan as typeof plans.individual | typeof plans.business).monthly * 12) * 100) 
    : 0;
  
  const getSupportTypeInfo = () => {
    return {
      title: user ? 'IT & Cybersecurity Support' : 'Professional Support',
      subtitle: 'Expert assistance for all your technical needs',
      icon: supportType === 'it' ? Monitor : Shield,
      color: supportType === 'it' ? Colors.accent : Colors.primary,
    };
  };
  
  const supportInfo = getSupportTypeInfo();

  const handleCheckout = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'User email is required for checkout');
      return;
    }

    setLoading(true);
    
    try {
      if (isGuestPlan) {
        // For guest plan, simulate payment for now
        Alert.alert('Payment Successful!', 'Your guest support session is ready. You can now get immediate help.', [
          { text: 'Start Getting Support', onPress: () => router.replace('/(tabs)/support') }
        ]);
      } else {
        // Create Stripe checkout session for subscription
        const result = await createSubscriptionCheckout({
          plan: selectedPlan as 'individual' | 'business',
          billingCycle,
          userId: user.id,
          userEmail: user.email,
          returnUrl: `${Platform.OS === 'web' ? window.location.origin : 'exp://'}/(tabs)/home?checkout=success`,
          cancelUrl: `${Platform.OS === 'web' ? window.location.origin : 'exp://'}/(tabs)/home?checkout=cancelled`,
        });

        if (result.success && result.checkoutUrl) {
          // Open Stripe checkout in browser
          const supported = await Linking.canOpenURL(result.checkoutUrl);
          if (supported) {
            await Linking.openURL(result.checkoutUrl);
            
            // Set subscription as trial while waiting for webhook confirmation
            setSubscription({
              plan: selectedPlan as 'individual' | 'business',
              billingCycle,
              status: 'trial',
              nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            
            // Navigate to success page
            router.replace('/subscription/success');
          } else {
            Alert.alert('Error', 'Cannot open checkout URL');
          }
        } else {
          Alert.alert('Error', result.error || 'Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
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
          <Text style={styles.headerTitle}>
            {isGuestPlan ? 'Guest Support Payment' : 'Choose Your Plan'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {user && (
          <View style={styles.supportTypeHeader}>
            <View style={[styles.supportTypeIcon, { backgroundColor: supportInfo.color + '20' }]}>
              <supportInfo.icon size={24} color={supportInfo.color} />
            </View>
            <View style={styles.supportTypeInfo}>
              <Text style={styles.supportTypeTitle}>{supportInfo.title}</Text>
              <Text style={styles.supportTypeSubtitle}>{supportInfo.subtitle}</Text>
            </View>
          </View>
        )}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!isGuestPlan && (
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
          )}

          {isGuestPlan ? (
            <View style={[styles.planCard, styles.planCardActive]}>
              <View style={styles.guestBadge}>
                <DollarSign size={16} color={Colors.textPrimary} />
                <Text style={styles.guestBadgeText}>PAY AS YOU GO</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Guest Support</Text>
                <View style={styles.guestPriceContainer}>
                  <View style={styles.guestPriceRow}>
                    <Text style={styles.price}>${plans.guest.deposit}</Text>
                    <Text style={styles.period}>deposit</Text>
                  </View>
                  <Text style={styles.guestPlusText}>+</Text>
                  <View style={styles.guestPriceRow}>
                    <Text style={styles.price}>${plans.guest.hourly}</Text>
                    <Text style={styles.period}>/hour</Text>
                  </View>
                </View>
              </View>
              <View style={styles.featuresContainer}>
                {plans.guest.features.map((feature) => (
                  <View key={feature} style={styles.feature}>
                    <Check size={16} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.selectedIndicator}>
                <Check size={20} color={Colors.textPrimary} />
              </View>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.planCard, selectedPlan === 'individual' && styles.planCardActive]}
                onPress={() => setSelectedPlan('individual')}
              >
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
            </>
          )}

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>
                {isGuestPlan ? 'Guest Support' : (selectedPlan === 'individual' ? 'Individual' : 'Small Business Pro')}
              </Text>
            </View>
            {!isGuestPlan && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Billing Cycle</Text>
                <Text style={styles.summaryValue}>
                  {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {isGuestPlan 
                  ? `${(currentPlan as typeof plans.guest).deposit} + ${(currentPlan as typeof plans.guest).hourly}/hr`
                  : `${price}/${billingCycle === 'monthly' ? 'mo' : 'yr'}`
                }
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.checkoutText}>
                {loading ? 'Processing...' : (isGuestPlan ? 'Pay Deposit & Start' : 'Start Trial')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Shield size={16} color={Colors.textMuted} />
            <Text style={styles.securityText}>
              Secure payment powered by Stripe. Cancel anytime.
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
  supportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 16,
  },
  supportTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  supportTypeInfo: {
    flex: 1,
  },
  supportTypeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  supportTypeSubtitle: {
    fontSize: 14,
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
  guestBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guestBadgeText: {
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
  guestPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  guestPlusText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textSecondary,
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
  checkoutButton: {
    marginBottom: 16,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutText: {
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
  },
  headerSpacer: {
    width: 40,
  },
});