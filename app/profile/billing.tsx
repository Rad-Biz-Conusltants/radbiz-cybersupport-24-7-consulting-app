import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Calendar, DollarSign, Download, Plus, ArrowLeft, Crown, Clock } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSubscription } from '@/providers/subscription-provider';
import { useTickets } from '@/providers/tickets-provider';

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { subscription, getSubscriptionStatus } = useSubscription();
  const { accountBalance } = useTickets();
  const [isLoading, setIsLoading] = useState(false);
  
  const subscriptionStatus = getSubscriptionStatus();
  
  const billingHistory: BillingHistory[] = [
    {
      id: '1',
      date: '2024-09-01',
      description: 'Monthly Subscription - Pro Plan',
      amount: 29.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/1'
    },
    {
      id: '2',
      date: '2024-08-15',
      description: 'Additional Credits Purchase',
      amount: 19.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/2'
    },
    {
      id: '3',
      date: '2024-08-01',
      description: 'Monthly Subscription - Pro Plan',
      amount: 29.99,
      status: 'paid',
      invoiceUrl: 'https://example.com/invoice/3'
    },
  ];

  const handleAddCredits = () => {
    router.push('/credits/add');
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'This will redirect you to the billing portal where you can update your payment method, view invoices, and manage your subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          // In a real app, this would open the Stripe customer portal
          Alert.alert('Info', 'Billing portal integration coming soon.');
        }}
      ]
    );
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    Alert.alert('Download Invoice', 'Invoice download functionality coming soon.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Billing & Credits',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundStart },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan */}
          <View style={styles.planSection}>
            <Text style={styles.sectionTitle}>Current Plan</Text>
            <View style={styles.planCard}>
              <LinearGradient
                colors={subscriptionStatus.isActive 
                  ? [Colors.primaryAlpha, Colors.cardBackground]
                  : [Colors.cardBackground, '#2A2A2A']
                }
                style={styles.planGradient}
              >
                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { 
                    backgroundColor: subscriptionStatus.isActive ? Colors.primaryAlpha : Colors.cardBorder 
                  }]}>
                    <Crown size={24} color={subscriptionStatus.isActive ? Colors.primary : Colors.textMuted} />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planName}>{subscriptionStatus.displayStatus}</Text>
                    {subscription && (
                      <View style={styles.planDetails}>
                        <Clock size={12} color={Colors.textMuted} />
                        <Text style={styles.planDate}>
                          {subscriptionStatus.isOnTrial 
                            ? `Trial ends ${subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'soon'}`
                            : `Next billing: ${new Date(subscription.nextBillingDate).toLocaleDateString()}`
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planPrice}>
                    {subscriptionStatus.isOnTrial ? 'Free' : '$29.99/mo'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.manageButton}
                  onPress={handleManageSubscription}
                >
                  <Text style={styles.manageButtonText}>Manage Subscription</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>

          {/* Credits Balance */}
          <View style={styles.creditsSection}>
            <Text style={styles.sectionTitle}>Credits & Usage</Text>
            <View style={styles.creditsGrid}>
              <View style={styles.creditCard}>
                <LinearGradient
                  colors={[Colors.cardBackground, '#2A2A2A']}
                  style={styles.creditGradient}
                >
                  <Text style={styles.creditValue}>{accountBalance.ticketBalance}</Text>
                  <Text style={styles.creditLabel}>Available Credits</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.creditCard}>
                <LinearGradient
                  colors={[Colors.cardBackground, '#2A2A2A']}
                  style={styles.creditGradient}
                >
                  <Text style={styles.creditValue}>{accountBalance.usedTickets}</Text>
                  <Text style={styles.creditLabel}>Credits Used</Text>
                </LinearGradient>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.addCreditsButton}
              onPress={handleAddCredits}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryAlpha]}
                style={styles.addCreditsGradient}
              >
                <Plus size={20} color={Colors.textPrimary} />
                <Text style={styles.addCreditsText}>Add Credits</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Billing History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Billing History</Text>
            
            {billingHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <LinearGradient
                  colors={[Colors.cardBackground, '#2A2A2A']}
                  style={styles.historyGradient}
                >
                  <View style={styles.historyContent}>
                    <View style={styles.historyLeft}>
                      <View style={[styles.historyIcon, { backgroundColor: Colors.accentAlpha }]}>
                        <CreditCard size={16} color={Colors.accent} />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyDescription}>{item.description}</Text>
                        <View style={styles.historyMeta}>
                          <Calendar size={10} color={Colors.textMuted} />
                          <Text style={styles.historyDate}>
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.historyRight}>
                      <Text style={styles.historyAmount}>${item.amount.toFixed(2)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                          {getStatusText(item.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {item.invoiceUrl && item.status === 'paid' && (
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={() => handleDownloadInvoice(item.invoiceUrl!)}
                    >
                      <Download size={14} color={Colors.accent} />
                      <Text style={styles.downloadText}>Download Invoice</Text>
                    </TouchableOpacity>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerButton: {
    padding: 8,
  },
  planSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  planGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  planDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  manageButton: {
    backgroundColor: Colors.accentAlpha,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  creditsSection: {
    marginBottom: 32,
  },
  creditsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  creditCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  creditGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  creditValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  creditLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addCreditsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addCreditsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addCreditsText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    marginBottom: 32,
  },
  historyItem: {
    marginBottom: 12,
  },
  historyGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  downloadText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomSpacer: {
    height: 40,
  },
});