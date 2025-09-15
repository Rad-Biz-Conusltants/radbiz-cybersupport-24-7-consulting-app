import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CreditCard, DollarSign, Zap, Star, CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { useTickets } from '@/providers/tickets-provider';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
  description: string;
}

export default function AddCreditsScreen() {
  const { user } = useAuth();
  const { addCredits, accountBalance } = useTickets();
  const insets = useSafeAreaInsets();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 10,
      price: 100,
      description: 'Perfect for small teams'
    },
    {
      id: 'professional',
      name: 'Professional Pack',
      credits: 30,
      price: 250,
      bonus: 5,
      popular: true,
      description: 'Most popular choice'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 65,
      price: 500,
      bonus: 15,
      description: 'Best value for large teams'
    },
    {
      id: 'unlimited',
      name: 'Premium Monthly',
      credits: 150,
      price: 1000,
      description: 'Maximum tickets for enterprise'
    }
  ];

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('No Package Selected', 'Please select a credit package to continue.');
      return;
    }

    const pkg = creditPackages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    Alert.alert(
      'Confirm Purchase',
      `Purchase ${pkg.name} for ${pkg.price}?\n\nThis will add ${pkg.credits}${pkg.bonus ? ` + ${pkg.bonus} bonus` : ''} tickets to your account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Simulate payment processing
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Add credits to account
              await addCredits(pkg.price);
              
              Alert.alert(
                'Purchase Successful',
                `${pkg.price} has been added to your account. You now have ${pkg.credits}${pkg.bonus ? ` + ${pkg.bonus} bonus` : ''} additional support tickets.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to process payment. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Credits</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.currentBalance}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <View style={[styles.balanceIcon, { backgroundColor: Colors.primaryAlpha }]}>
                <DollarSign size={24} color={Colors.primary} />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balanceValue}>${accountBalance.balance}</Text>
              </View>
            </View>
            <View style={styles.balanceDetails}>
              <Text style={styles.balanceText}>
                {accountBalance.usedTickets} tickets used out of {accountBalance.totalTickets} available
              </Text>
              <View style={styles.usageBar}>
                <View style={styles.usageBarBackground}>
                  <View style={[
                    styles.usageBarFill, 
                    { width: `${(accountBalance.usedTickets / accountBalance.totalTickets) * 100}%` }
                  ]} />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Choose Credit Package</Text>
        
        {creditPackages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              selectedPackage === pkg.id && styles.packageCardSelected
            ]}
            onPress={() => setSelectedPackage(pkg.id)}
          >
            <LinearGradient
              colors={selectedPackage === pkg.id 
                ? [Colors.primaryAlpha, Colors.cardBackground]
                : [Colors.cardBackground, '#2A2A2A']
              }
              style={styles.packageGradient}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Star size={12} color={Colors.textPrimary} />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>
              )}
              
              <View style={styles.packageHeader}>
                <View style={styles.packageInfo}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                </View>
                <View style={styles.packagePricing}>
                  <Text style={styles.packagePrice}>${pkg.price}</Text>
                  {pkg.id !== 'unlimited' && (
                    <Text style={styles.pricePerTicket}>
                      ${(pkg.price / (pkg.credits + (pkg.bonus || 0))).toFixed(2)}/ticket
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.packageFeatures}>
                <View style={styles.featureItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.featureText}>
                    {pkg.id === 'unlimited' ? 'Unlimited tickets for 30 days' : `${pkg.credits} support tickets`}
                  </Text>
                </View>
                {pkg.bonus && (
                  <View style={styles.featureItem}>
                    <Zap size={16} color={Colors.warning} />
                    <Text style={[styles.featureText, { color: Colors.warning }]}>
                      +{pkg.bonus} bonus tickets
                    </Text>
                  </View>
                )}
                <View style={styles.featureItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.featureText}>24/7 priority support</Text>
                </View>
                <View style={styles.featureItem}>
                  <CheckCircle size={16} color={Colors.success} />
                  <Text style={styles.featureText}>No expiration date</Text>
                </View>
              </View>
              
              {selectedPackage === pkg.id && (
                <View style={styles.selectedIndicator}>
                  <CheckCircle size={20} color={Colors.primary} />
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
        
        <View style={styles.paymentInfo}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.paymentGradient}
          >
            <View style={styles.paymentHeader}>
              <CreditCard size={20} color={Colors.accent} />
              <Text style={styles.paymentTitle}>Secure Payment</Text>
            </View>
            <Text style={styles.paymentText}>
              Your payment is processed securely through our encrypted payment system. 
              Credits are added to your account immediately after successful payment.
            </Text>
            <View style={styles.paymentFeatures}>
              <Text style={styles.paymentFeature}>• 256-bit SSL encryption</Text>
              <Text style={styles.paymentFeature}>• PCI DSS compliant</Text>
              <Text style={styles.paymentFeature}>• Instant credit activation</Text>
              <Text style={styles.paymentFeature}>• 30-day money-back guarantee</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      <View style={[styles.purchaseContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.purchaseButton, { opacity: (selectedPackage && !isProcessing) ? 1 : 0.5 }]}
          onPress={handlePurchase}
          disabled={!selectedPackage || isProcessing}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.purchaseGradient}
          >
            <CreditCard size={20} color={Colors.textPrimary} />
            <Text style={styles.purchaseButtonText}>
              {isProcessing 
                ? 'Processing...'
                : selectedPackage 
                  ? `Purchase ${creditPackages.find(p => p.id === selectedPackage)?.name}`
                  : 'Select a Package'
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentBalance: {
    marginBottom: 32,
  },
  balanceGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  balanceDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
  },
  balanceText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: Colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageBarBackground: {
    flex: 1,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  packageCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  packageCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  packageGradient: {
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  packagePricing: {
    alignItems: 'flex-end',
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  pricePerTicket: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  packageFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 8,
  },
  paymentInfo: {
    marginBottom: 20,
  },
  paymentGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  paymentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  paymentFeatures: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
  },
  paymentFeature: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  purchaseContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  purchaseButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
});