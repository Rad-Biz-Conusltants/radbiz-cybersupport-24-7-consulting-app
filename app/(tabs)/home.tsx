import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Monitor, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

export default function SupportSelectionScreen() {
  const insets = useSafeAreaInsets();

  const handleITSupport = () => {
    router.push('/(auth)/signup?supportType=it');
  };

  const handleCybersecuritySupport = () => {
    router.push('/(auth)/signup?supportType=cybersecurity');
  };

  const stats = [
    { id: 'uptime', label: 'Uptime', value: '99.9%', icon: CheckCircle },
    { id: 'response', label: 'Response Time', value: '5 min', icon: Clock },
    { id: 'devices', label: 'Protected Devices', value: '10k+', icon: Users },
  ];

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/adaptive-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandName}>RadBiz Security</Text>
          <Text style={styles.tagline}>Enterprise-Grade Cybersecurity Support</Text>
          <Text style={styles.description}>
            24/7 IT and cybersecurity expertise at your fingertips.
            Protect your business from threats before they happen.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statItem}>
              <stat.icon size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.supportOptions}>
          <Text style={styles.sectionTitle}>Which support do you need?</Text>
          
          <TouchableOpacity 
            style={styles.supportCard}
            onPress={handleITSupport}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.accentAlpha }]}>
                  <Monitor size={32} color={Colors.accent} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>IT Support</Text>
                  <Text style={styles.cardSubtitle}>Technical assistance & infrastructure management</Text>
                </View>
                <ArrowRight size={24} color={Colors.textMuted} />
              </View>
              
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>• 24/7 Help Desk Support</Text>
                <Text style={styles.featureText}>• Network & Server Management</Text>
                <Text style={styles.featureText}>• Software Installation & Updates</Text>
                <Text style={styles.featureText}>• Hardware Troubleshooting</Text>
              </View>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.trialButton}
                  onPress={handleITSupport}
                >
                  <LinearGradient
                    colors={[Colors.accent, Colors.accentDark]}
                    style={styles.trialGradient}
                  >
                    <Text style={styles.trialButtonText}>Start Free Trial</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.supportCard}
            onPress={handleCybersecuritySupport}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.primaryAlpha }]}>
                  <Shield size={32} color={Colors.primary} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>Cybersecurity Support</Text>
                  <Text style={styles.cardSubtitle}>Advanced threat protection & security monitoring</Text>
                </View>
                <ArrowRight size={24} color={Colors.textMuted} />
              </View>
              
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>• Real-time Threat Monitoring</Text>
                <Text style={styles.featureText}>• Vulnerability Assessments</Text>
                <Text style={styles.featureText}>• Incident Response & Recovery</Text>
                <Text style={styles.featureText}>• Security Policy Development</Text>
              </View>
              
              <View style={styles.cardFooter}>
                <TouchableOpacity 
                  style={styles.trialButton}
                  onPress={handleCybersecuritySupport}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.trialGradient}
                  >
                    <Text style={styles.trialButtonText}>Start Free Trial</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.whyChoose}>
          <Text style={styles.whyTitle}>Why Choose RadBiz?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.primaryAlpha }]}>
                <Shield size={20} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>24/7 Protection</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.accentAlpha }]}>
                <Monitor size={20} color={Colors.accent} />
              </View>
              <Text style={styles.benefitText}>Expert IT Team</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: Colors.successAlpha }]}>
                <CheckCircle size={20} color={Colors.success} />
              </View>
              <Text style={styles.benefitText}>Proven Results</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  logo: {
    width: 200,
    height: 200,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    paddingVertical: 20,
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  supportOptions: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  supportCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardFeatures: {
    marginBottom: 24,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'center',
  },
  trialButton: {
    width: '100%',
  },
  trialGradient: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  whyChoose: {
    alignItems: 'center',
  },
  whyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});