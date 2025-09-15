import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Check, CreditCard, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { setSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'individual' | 'business'>(user?.planType || 'individual');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = {
    individual: {
      monthly: 29,
      yearly: 290,
      features: [
        '24/7 Support Access',
        'Personal Device Protection',
        'Monthly Security Audits',
        'Priority Email Support',
        'Incident Response',
      ],
    },
    business: {
      monthly: 99,
      yearly: 990,
      features: [
        'Everything in Individual',
        'Up to 10 Devices',
        'Weekly Security Reports',
        'Dedicated Account Manager',
        'Custom Security Policies',
        'Team Training Sessions',
      ],
    },
  };

  const currentPlan = plans[selectedPlan];
  const price = currentPlan[billingCycle];
  const yearlyDiscount = billingCycle === 'yearly' ? Math.round((currentPlan.monthly * 12 - currentPlan.yearly) / (currentPlan.monthly * 12) * 100) : 0;

  const handleCheckout = async () => {
    setLoading(true);
    
    // Simulate Stripe checkout URL generation
    const checkoutUrl = `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(7)}#plan=${selectedPlan}&billing=${billingCycle}`;
    
    try {
      // In a real app, you would:
      // 1. Call your backend to create a Stripe checkout session
      // 2. Get the checkout URL
      // 3. Open it in a web browser or in-app browser
      
      Alert.alert(
        'Stripe Checkout',
        `You would be redirected to Stripe to complete payment for:\n\n${selectedPlan === 'individual' ? 'Individual' : 'Small Business'} Plan\n$${price}/${billingCycle === 'monthly' ? 'month' : 'year'}\n\nFor demo purposes, we'll simulate a successful payment.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue to Stripe',
            onPress: async () => {
              // Simulate successful payment
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              setSubscription({
                plan: selectedPlan,
                billingCycle,
                status: 'active',
                nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              });
              
              Alert.alert('Success!', 'Your subscription is now active.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
              ]);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <View style={{ width: 40 }} />
        </View>

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
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Individual</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${plans.individual[billingCycle]}</Text>
                <Text style={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'year'}</Text>
              </View>
            </View>
            <View style={styles.featuresContainer}>
              {plans.individual.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {selectedPlan === 'individual' && (
              <View style={styles.selectedIndicator}>
                <Check size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'business' && styles.planCardActive]}
            onPress={() => setSelectedPlan('business')}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMMENDED</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Small Business</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${plans.business[billingCycle]}</Text>
                <Text style={styles.period}>/{billingCycle === 'monthly' ? 'month' : 'year'}</Text>
              </View>
            </View>
            <View style={styles.featuresContainer}>
              {plans.business.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            {selectedPlan === 'business' && (
              <View style={styles.selectedIndicator}>
                <Check size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plan</Text>
              <Text style={styles.summaryValue}>
                {selectedPlan === 'individual' ? 'Individual' : 'Small Business'}
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
            style={styles.checkoutButton}
            onPress={handleCheckout}
            disabled={loading}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.checkoutText}>
                {loading ? 'Processing...' : 'Continue to Payment'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Shield size={16} color="#64748B" />
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
    borderBottomColor: '#334155',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
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
    backgroundColor: '#334155',
  },
  billingOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  billingOptionTextActive: {
    color: '#FFFFFF',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#3B82F6',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  period: {
    fontSize: 16,
    color: '#94A3B8',
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
    color: '#CBD5E1',
    flex: 1,
  },
  summary: {
    backgroundColor: '#1E293B',
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
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
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
    color: '#FFFFFF',
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
    color: '#64748B',
    textAlign: 'center',
  },
});