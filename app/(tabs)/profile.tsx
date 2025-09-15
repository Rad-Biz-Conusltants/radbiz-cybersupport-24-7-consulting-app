import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Building, CreditCard, Bell, Shield, LogOut, ChevronRight, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/');
          }
        },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', value: user?.name || 'User' },
        { icon: Mail, label: 'Email', value: user?.email || 'user@example.com' },
        { icon: Building, label: 'Company', value: user?.company || 'Not specified' },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { 
          icon: Crown, 
          label: 'Current Plan', 
          value: subscription?.plan === 'business' ? 'Small Business Pro' : 'Individual',
          action: () => router.push('/checkout'),
        },
        { 
          icon: CreditCard, 
          label: 'Billing', 
          value: subscription?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly',
          action: () => router.push('/checkout'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'Enabled', action: () => {} },
        { icon: Shield, label: 'Privacy & Security', value: '', action: () => {} },
      ],
    },
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
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <User size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.planBadge}>
            <Crown size={14} color={Colors.warning} />
            <Text style={styles.planBadgeText}>
              {subscription?.plan === 'business' ? 'Business' : 'Individual'} Plan
            </Text>
          </View>
        </View>

        {profileSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={`${section.title}-${itemIndex}`}
                  style={styles.settingItem}
                  onPress={'action' in item ? item.action : undefined}
                  disabled={!('action' in item)}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <item.icon size={20} color={Colors.accent} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      {item.value ? (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      ) : null}
                    </View>
                  </View>
                  {'action' in item && (
                    <ChevronRight size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>RadBiz IT & Cyber Security v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2025 RadBiz Consultants. All rights reserved.</Text>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningAlpha,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.warning,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.accentAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});