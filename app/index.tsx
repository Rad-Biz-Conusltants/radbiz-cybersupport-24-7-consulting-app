import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Lock, Users, CheckCircle, ArrowRight, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

export default function LandingScreen() {
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/home' as any);
    }
  }, [user]);

  const features = [
    {
      icon: Shield,
      title: '24/7 Protection',
      description: 'Round-the-clock monitoring and support',
      color: '#3B82F6',
    },
    {
      icon: Zap,
      title: 'Instant Response',
      description: 'Average response time under 5 minutes',
      color: '#8B5CF6',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and protection',
      color: '#10B981',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Certified security professionals',
      color: '#F59E0B',
    },
  ];

  const plans = [
    {
      name: 'Individual',
      price: '$29',
      period: '/month',
      features: [
        '24/7 Support Access',
        'Personal Device Protection',
        'Monthly Security Audits',
        'Priority Email Support',
        'Incident Response',
      ],
      gradient: ['#3B82F6', '#2563EB'] as [string, string],
    },
    {
      name: 'Small Business',
      price: '$99',
      period: '/month',
      features: [
        'Everything in Individual',
        'Up to 10 Devices',
        'Weekly Security Reports',
        'Dedicated Account Manager',
        'Custom Security Policies',
        'Team Training Sessions',
      ],
      gradient: ['#8B5CF6', '#7C3AED'] as [string, string],
      popular: true,
    },
  ];

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Shield size={32} color="#3B82F6" />
              <Text style={styles.logoText}>RadBiz Security</Text>
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
              Enterprise-Grade{'\n'}Cybersecurity Support
            </Text>
            <Text style={styles.heroSubtitle}>
              24/7 IT and cybersecurity expertise at your fingertips.{'\n'}
              Protect your business from threats before they happen.
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>99.9%</Text>
                <Text style={styles.statLabel}>Uptime</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>5 min</Text>
                <Text style={styles.statLabel}>Response Time</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>10k+</Text>
                <Text style={styles.statLabel}>Protected Devices</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => router.push('/(auth)/signup')}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaText}>Start Free Trial</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose RadBiz?</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature) => (
                <View key={feature.title} style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                    <feature.icon size={24} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.pricingSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            <Text style={styles.sectionSubtitle}>
              Start with a 14-day free trial. No credit card required.
            </Text>
            
            {plans.map((plan) => (
              <View key={plan.name} style={styles.planCard}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <LinearGradient
                  colors={plan.gradient}
                  style={styles.planGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </LinearGradient>
                
                <View style={styles.planFeatures}>
                  {plan.features.map((feature) => (
                    <View key={feature} style={styles.planFeature}>
                      <CheckCircle size={16} color="#10B981" />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity 
                  style={[styles.selectPlanButton, plan.popular && styles.popularButton]}
                  onPress={() => router.push('/(auth)/signup')}
                >
                  <Text style={[styles.selectPlanText, plan.popular && styles.popularButtonText]}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 RadBiz Security. Enterprise protection for everyone.
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
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signInButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  signInText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 320,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  featureCard: {
    width: '48%',
    maxWidth: 180,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  planCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planGradient: {
    padding: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 16,
    color: '#E2E8F0',
    marginLeft: 4,
  },
  planFeatures: {
    padding: 24,
    gap: 12,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#CBD5E1',
    flex: 1,
  },
  selectPlanButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  popularButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  selectPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  popularButtonText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
});