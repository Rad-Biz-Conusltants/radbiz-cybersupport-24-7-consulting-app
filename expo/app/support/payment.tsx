import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, DollarSign, Lock, CheckCircle, ArrowLeft, Smartphone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useSupport } from '@/providers/support-provider';

type PaymentMethod = 'card' | 'paypal' | 'apple_pay';

export default function SupportPaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;
  
  const { createSupportDepositCheckout, verifyDepositPayment } = useSupport();
  
  const [depositAmount, setDepositAmount] = useState('50');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const amount = parseFloat(depositAmount) || 0;
  const processingFee = amount * 0.029 + 0.30;
  const totalAmount = amount + processingFee;

  const paymentMethods = [
    { id: 'card' as PaymentMethod, name: 'Credit Card', icon: CreditCard, available: true },
    { id: 'paypal' as PaymentMethod, name: 'PayPal', icon: DollarSign, available: true },
    { id: 'apple_pay' as PaymentMethod, name: 'Apple Pay', icon: Smartphone, available: Platform.OS === 'ios' },
  ];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const validatePayment = (): boolean => {
    if (amount < 10) {
      Alert.alert('Invalid Amount', 'Minimum deposit is $10');
      return false;
    }
    
    if (amount > 10000) {
      Alert.alert('Invalid Amount', 'Maximum deposit is $10,000');
      return false;
    }

    if (selectedMethod === 'card') {
      if (!cardholderName.trim()) {
        Alert.alert('Missing Information', 'Please enter cardholder name');
        return false;
      }
      
      if (cardNumber.replace(/\s/g, '').length < 13) {
        Alert.alert('Invalid Card', 'Please enter a valid card number');
        return false;
      }
      
      if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
        Alert.alert('Invalid Expiry', 'Please enter expiry date in MM/YY format');
        return false;
      }
      
      if (cvv.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter a valid CVV');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    
    setIsProcessing(true);
    
    try {
      console.log(`Processing ${selectedMethod} payment for ${totalAmount.toFixed(2)}`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await createSupportDepositCheckout(totalAmount, sessionId);
      
      if (result.success) {
        console.log('Payment processed successfully:', result.sessionId);
        
        const verifyResult = await verifyDepositPayment(result.sessionId!, sessionId);
        
        if (verifyResult.success) {
          Alert.alert(
            'Payment Successful',
            `Your deposit of ${totalAmount.toFixed(2)} has been processed successfully! You can now start your support session.`,
            [
              {
                text: 'Start Support Session',
                onPress: () => router.back()
              }
            ]
          );
        } else {
          Alert.alert('Payment Error', verifyResult.error || 'Failed to verify payment');
        }
      } else {
        Alert.alert('Payment Error', result.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'An error occurred while processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Get Support</Text>
            <Text style={styles.headerSubtitle}>
              Pay a deposit to start your support session
            </Text>
          </View>

          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Deposit Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <Text style={styles.amountHint}>Minimum $10 - Maximum $10,000</Text>
          </View>

          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.methodsGrid}>
              {paymentMethods.filter(m => m.available).map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedMethod === method.id && styles.methodCardSelected
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <method.icon 
                    size={24} 
                    color={selectedMethod === method.id ? Colors.primary : Colors.textSecondary} 
                  />
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.methodNameSelected
                  ]}>
                    {method.name}
                  </Text>
                  {selectedMethod === method.id && (
                    <View style={styles.selectedIndicator}>
                      <CheckCircle size={16} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedMethod === 'card' && (
            <View style={styles.cardDetailsSection}>
              <Text style={styles.sectionTitle}>Card Details</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={cardholderName}
                  onChangeText={setCardholderName}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    placeholder="MM/YY"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={cvv}
                    onChangeText={setCvv}
                    placeholder="123"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>
          )}

          <View style={styles.summarySection}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.summaryCard}
            >
              <Text style={styles.summaryTitle}>Payment Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deposit Amount</Text>
                <Text style={styles.summaryValue}>${amount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Processing Fee</Text>
                <Text style={styles.summaryValue}>${processingFee.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                <Text style={styles.summaryTotalValue}>${totalAmount.toFixed(2)}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.securityNote}>
            <Lock size={16} color={Colors.success} />
            <Text style={styles.securityText}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <LinearGradient
              colors={isProcessing ? [Colors.textMuted, Colors.textMuted] : [Colors.primary, Colors.primaryDark]}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>
                {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)} & Start`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 120,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  amountSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  amountHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  paymentMethodSection: {
    marginBottom: 32,
  },
  methodsGrid: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
  },
  methodCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryAlpha,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  methodNameSelected: {
    color: Colors.primary,
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  cardDetailsSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    color: Colors.success,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
