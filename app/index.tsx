import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Monitor, ArrowRight, Clock, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';
import Colors from '@/constants/colors';

export default function LandingScreen() {
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home' as any);
    }
  }, [user]);

  const supportOptions = [
    {
      id: 'it',
      title: 'IT Support',
      subtitle: 'Technical assistance & infrastructure management',
      description: 'Get expert help with hardware, software, network issues, and system maintenance.',
      icon: Monitor,
      color: Colors.accent,
      gradient: [Colors.accent, Colors.accentDark] as [string, string],
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity Support',
      subtitle: 'Advanced threat protection & security monitoring',
      description: 'Protect your business from cyber threats with 24/7 monitoring and incident response.',
      icon: Shield,
      color: Colors.primary,
      gradient: [Colors.primary, Colors.primaryDark] as [string, string],
    },
  ];

  const handleSupportSelection = (supportType: string) => {
    router.push(`/(auth)/signup?supportType=${supportType}`);
  };

  const handleGuestSupport = () => {
    router.push('/checkout?plan=guest');
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('@/assets/images/adaptive-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>RadBiz Consultants</Text>
            </View>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>
              24/7 IT & Cybersecurity{'\n'}Support
            </Text>
            <Text style={styles.heroSubtitle}>
              Professional IT and cybersecurity expertise for individuals and small businesses.{'\n'}
              Choose your support type and start protecting your digital assets today.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Clock size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>24/7 Support</Text>
              </View>
              <View style={styles.stat}>
                <Shield size={20} color={Colors.accent} />
                <Text style={styles.statLabel}>Expert Team</Text>
              </View>
              <View style={styles.stat}>
                <Monitor size={20} color={Colors.primary} />
                <Text style={styles.statLabel}>All Devices</Text>
              </View>
            </View>
          </View>

          <View style={styles.supportSection}>
            <Text style={styles.sectionTitle}>Which Support Do You Need?</Text>
            
            {supportOptions.map((option) => (
              <View key={option.id} style={styles.supportCard}>
                <View style={styles.supportHeader}>
                  <View style={[styles.supportIcon, { backgroundColor: option.color + '20' }]}>
                    <option.icon size={32} color={option.color} />
                  </View>
                  <View style={styles.supportInfo}>
                    <Text style={styles.supportTitle}>{option.title}</Text>
                    <Text style={styles.supportSubtitle}>{option.subtitle}</Text>
                  </View>
                </View>
                
                <Text style={styles.supportDescription}>{option.description}</Text>
                
                <TouchableOpacity 
                  style={styles.trialButton}
                  onPress={() => handleSupportSelection(option.id)}
                >
                  <LinearGradient
                    colors={option.gradient}
                    style={styles.trialGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.trialButtonText}>Start Free Trial</Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.guestSection}>
            <View style={styles.guestCard}>
              <View style={styles.guestHeader}>
                <DollarSign size={24} color={Colors.warning} />
                <Text style={styles.guestTitle}>Need Immediate Help?</Text>
              </View>
              <Text style={styles.guestDescription}>
                Get instant support without a subscription. Pay as you go with our guest support option.
              </Text>
              <View style={styles.guestPricing}>
                <Text style={styles.guestPrice}>$150 deposit + $100/hour thereafter</Text>
              </View>
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={handleGuestSupport}
              >
                <Text style={styles.guestButtonText}>Get Guest Support</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 RadBiz Consultants. Professional IT & Cybersecurity Support.
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  signInText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  supportSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
  },
  supportCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  supportIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  supportSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  supportDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  trialButton: {
    width: '100%',
  },
  trialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  trialButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  guestSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  guestCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guestDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  guestPricing: {
    backgroundColor: Colors.warningAlpha,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },
  guestPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warning,
    textAlign: 'center',
  },
  guestButton: {
    backgroundColor: Colors.warning,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});