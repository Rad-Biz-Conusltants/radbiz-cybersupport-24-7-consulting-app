import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Crown, ArrowLeft, Calendar } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSubscription } from '@/providers/subscription-provider';
import { useAuth } from '@/providers/auth-provider';

interface SubscriptionDetails {
  sessionId: string;
  subscriptionId: string;
  customerId: string;
  plan: string;
  billingCycle: string;
  status: string;
  trialEndDate?: string;
  nextBillingDate: string;
  amount: number;
  createdAt: string;
}

export default function SubscriptionSuccessScreen() {
  const { user } = useAuth();
  const { setSubscription } = useSubscription();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        const sessionId = params.session_id as string;
        if (!sessionId) {
          throw new Error('No session ID provided');
        }

        // For demo purposes, simulate successful subscription verification
        // In production, this would call your actual backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful subscription response
        const data = {
          success: true,
          subscriptionDetails: {
            sessionId,
            subscriptionId: `sub_${Date.now()}`,
            customerId: `cus_${Date.now()}`,
            plan: 'business',
            billingCycle: 'monthly',
            status: 'trial',
            trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
            nextBillingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 99.99,
            createdAt: new Date().toISOString(),
          }
        };
        
        if (data.success && data.subscriptionDetails) {
          setSubscriptionDetails(data.subscriptionDetails);
          
          // Update subscription in provider
          await setSubscription({
            plan: data.subscriptionDetails.plan as 'individual' | 'business',
            billingCycle: data.subscriptionDetails.billingCycle as 'monthly' | 'yearly',
            status: data.subscriptionDetails.status as 'active' | 'inactive' | 'trial' | 'expired',
            nextBillingDate: data.subscriptionDetails.nextBillingDate,
            trialEndDate: data.subscriptionDetails.trialEndDate,
            subscriptionId: data.subscriptionDetails.subscriptionId,
            customerId: data.subscriptionDetails.customerId,
            createdAt: data.subscriptionDetails.createdAt,
            updatedAt: new Date().toISOString(),
          });
          
          console.log('Subscription verified and updated:', data.subscriptionDetails);
        } else {
          throw new Error('Failed to verify subscription');
        }
      } catch (error) {
        console.error('Subscription verification error:', error);
        Alert.alert(
          'Verification Error',
          'There was an issue verifying your subscription. Please contact support if your subscription was not activated.',
          [
            { text: 'Contact Support', onPress: () => router.push('/(tabs)/support') },
            { text: 'Continue', onPress: () => router.push('/(tabs)/home') }
          ]
        );
      } finally {
        setIsProcessing(false);
      }
    };

    verifySubscription();
  }, [params.session_id, user?.id, setSubscription]);

  const handleContinue = () => {
    router.push('/(tabs)/home');
  };

  const handleViewProfile = () => {
    router.push('/(tabs)/profile');
  };

  if (isProcessing) {
    return (
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <View style={styles.loadingContainer}>
            <Crown size={48} color={Colors.primary} />
            <Text style={styles.loadingTitle}>Activating Subscription...</Text>
            <Text style={styles.loadingText}>Please wait while we set up your account</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (!subscriptionDetails) {
    return (
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Subscription Error</Text>
            <Text style={styles.errorText}>Unable to verify your subscription. Please contact support.</Text>
            <TouchableOpacity style={styles.supportButton} onPress={() => router.push('/(tabs)/support')}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const planName = subscriptionDetails.plan === 'business' ? 'Business' : 'Individual';
  const cycleName = subscriptionDetails.billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
  const isOnTrial = subscriptionDetails.status === 'trial';

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Active</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <LinearGradient
            colors={[Colors.primaryAlpha, Colors.cardBackground]}
            style={styles.successIconGradient}
          >
            <Crown size={64} color={Colors.primary} />
          </LinearGradient>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>
            {isOnTrial ? 'Free Trial Started!' : 'Subscription Active!'}
          </Text>
          <Text style={styles.successSubtitle}>
            {isOnTrial 
              ? 'Your 14-day free trial has begun'
              : 'Your subscription is now active'
            }
          </Text>
        </View>

        {/* Subscription Details */}
        <View style={styles.detailsCard}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.detailsGradient}
          >
            <View style={styles.detailsHeader}>
              <Crown size={24} color={Colors.primary} />
              <Text style={styles.detailsTitle}>Subscription Details</Text>
            </View>
            
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Plan:</Text>
                <Text style={styles.detailValue}>{planName} {cycleName}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, { color: isOnTrial ? Colors.warning : Colors.success }]}>
                  {isOnTrial ? 'Free Trial' : 'Active'}
                </Text>
              </View>
              
              {isOnTrial && subscriptionDetails.trialEndDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Trial Ends:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscriptionDetails.trialEndDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Next Billing:</Text>
                <Text style={styles.detailValue}>
                  {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>${subscriptionDetails.amount}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subscription ID:</Text>
                <Text style={[styles.detailValue, styles.subscriptionId]}>
                  {subscriptionDetails.subscriptionId.slice(-12).toUpperCase()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Features Card */}
        <View style={styles.featuresCard}>
          <LinearGradient
            colors={[Colors.primaryAlpha, Colors.cardBackground]}
            style={styles.featuresGradient}
          >
            <View style={styles.featuresHeader}>
              <Text style={styles.featuresTitle}>What's Included</Text>
            </View>
            
            <View style={styles.featuresList}>
              {subscriptionDetails.plan === 'business' ? (
                <>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Unlimited support tickets</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Priority 24/7 support</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Advanced security tools</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Team management</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>50 tickets per month</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Email support</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <CheckCircle size={16} color={Colors.success} />
                    <Text style={styles.featureText}>Basic security tools</Text>
                  </View>
                </>
              )}
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewProfile}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.secondaryGradient}
          >
            <Text style={styles.secondaryButtonText}>View Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  supportButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  supportButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  detailsGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  detailsContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  subscriptionId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  featuresCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuresGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
  },
  featuresHeader: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  secondaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});