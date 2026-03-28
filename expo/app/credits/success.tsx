import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, CreditCard, ArrowLeft, Ticket } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useTickets } from '@/providers/tickets-provider';
import { useAuth } from '@/providers/auth-provider';

interface PurchaseDetails {
  sessionId: string;
  packageName: string;
  credits: number;
  bonus: number;
  totalCredits: number;
  amount: number;
  purchaseDate: string;
}

export default function PurchaseSuccessScreen() {
  const { user } = useAuth();
  const { addCredits, accountBalance } = useTickets();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifyPurchase = async () => {
      try {
        const sessionId = params.session_id as string;
        if (!sessionId) {
          throw new Error('No session ID provided');
        }

        // For demo purposes, simulate successful purchase verification
        // In production, this would call your actual backend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful response based on session ID
        const data = {
          success: true,
          purchaseDetails: {
            sessionId,
            packageName: 'Professional Pack',
            credits: 30,
            bonus: 5,
            totalCredits: 35,
            amount: 250,
            purchaseDate: new Date().toLocaleDateString(),
          }
        };
        
        if (data.success && data.purchaseDetails) {
          setPurchaseDetails(data.purchaseDetails);
          
          // Add credits to account
          await addCredits(data.purchaseDetails.totalCredits);
          
          console.log('Purchase verified and credits added:', data.purchaseDetails);
        } else {
          throw new Error('Failed to verify purchase');
        }
      } catch (error) {
        console.error('Purchase verification error:', error);
        Alert.alert(
          'Verification Error',
          'There was an issue verifying your purchase. Please contact support if credits were not added to your account.',
          [
            { text: 'Contact Support', onPress: () => router.push('/(tabs)/support') },
            { text: 'Continue', onPress: () => router.push('/(tabs)/home') }
          ]
        );
      } finally {
        setIsProcessing(false);
      }
    };

    verifyPurchase();
  }, [params.session_id, user?.id, addCredits]);

  const handleContinue = () => {
    router.push('/(tabs)/home');
  };

  const handleViewCredits = () => {
    router.push('/credits/add');
  };

  if (isProcessing) {
    return (
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <View style={styles.loadingContainer}>
            <CreditCard size={48} color={Colors.primary} />
            <Text style={styles.loadingTitle}>Verifying Purchase...</Text>
            <Text style={styles.loadingText}>Please wait while we confirm your payment</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  if (!purchaseDetails) {
    return (
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Purchase Error</Text>
            <Text style={styles.errorText}>Unable to verify your purchase. Please contact support.</Text>
            <TouchableOpacity style={styles.supportButton} onPress={() => router.push('/(tabs)/support')}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

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
        <Text style={styles.headerTitle}>Purchase Complete</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <LinearGradient
            colors={[Colors.successAlpha, Colors.cardBackground]}
            style={styles.successIconGradient}
          >
            <CheckCircle size={64} color={Colors.success} />
          </LinearGradient>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your credits have been added to your account
          </Text>
        </View>

        {/* Purchase Details */}
        <View style={styles.detailsCard}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.detailsGradient}
          >
            <View style={styles.detailsHeader}>
              <Ticket size={24} color={Colors.primary} />
              <Text style={styles.detailsTitle}>Purchase Details</Text>
            </View>
            
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Package:</Text>
                <Text style={styles.detailValue}>{purchaseDetails.packageName}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Credits Added:</Text>
                <Text style={[styles.detailValue, { color: Colors.success }]}>
                  {purchaseDetails.credits}
                  {purchaseDetails.bonus > 0 && (
                    <Text style={styles.bonusText}> + {purchaseDetails.bonus} bonus</Text>
                  )}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Credits:</Text>
                <Text style={[styles.detailValue, { color: Colors.primary }]}>
                  {purchaseDetails.totalCredits}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid:</Text>
                <Text style={styles.detailValue}>${purchaseDetails.amount}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchase Date:</Text>
                <Text style={styles.detailValue}>{purchaseDetails.purchaseDate}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID:</Text>
                <Text style={[styles.detailValue, styles.transactionId]}>
                  {purchaseDetails.sessionId.slice(-12).toUpperCase()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[Colors.primaryAlpha, Colors.cardBackground]}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Current Ticket Balance</Text>
              <Text style={styles.balanceValue}>{accountBalance.ticketBalance}</Text>
              <Text style={styles.balanceSubtext}>
                {accountBalance.usedTickets} used • {accountBalance.ticketBalance} remaining
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleViewCredits}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.secondaryGradient}
          >
            <Text style={styles.secondaryButtonText}>View Credits</Text>
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
    borderColor: Colors.success,
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
  bonusText: {
    color: Colors.warning,
  },
  transactionId: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  balanceCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
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