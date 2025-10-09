import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Building, Shield, LogOut, Edit3, Bell, CreditCard, HelpCircle, Calendar, Crown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';
import { useTickets } from '@/providers/tickets-provider';

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  showArrow?: boolean;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { subscription, getSubscriptionStatus } = useSubscription();
  const { accountBalance } = useTickets();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  
  const subscriptionStatus = getSubscriptionStatus();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('Starting sign out process...');
              await signOut();
              console.log('Sign out successful, navigating to login...');
              
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 100);
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleNotifications = () => {
    router.push('/profile/notifications');
  };

  const handleBilling = () => {
    router.push('/profile/billing');
  };

  const handleSupport = () => {
    router.push('/(tabs)/support');
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: Edit3,
      action: handleEditProfile,
      showArrow: true
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: Bell,
      action: handleNotifications,
      showArrow: true
    },
    {
      id: 'billing',
      title: 'Billing & Credits',
      subtitle: 'Manage your subscription and credits',
      icon: CreditCard,
      action: handleBilling,
      showArrow: true
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Get help from our support team',
      icon: HelpCircle,
      action: handleSupport,
      showArrow: true
    }
  ];

  if (!user) {
    return (
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <View style={styles.emptyState}>
          <User size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Not Signed In</Text>
          <Text style={styles.emptyText}>Please sign in to view your profile</Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.profileGradient}
          >
            <View style={styles.profileInfo}>
              <View style={[styles.profileAvatar, { backgroundColor: Colors.primaryAlpha }]}>
                <User size={32} color={Colors.primary} />
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>{user.name}</Text>
                <View style={styles.profileEmailRow}>
                  <Mail size={14} color={Colors.textMuted} />
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
                {user.company && (
                  <View style={styles.profileCompanyRow}>
                    <Building size={14} color={Colors.textMuted} />
                    <Text style={styles.profileCompany}>{user.company}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.accountBadge}>
              <View style={[styles.badgeContainer, { backgroundColor: user.planType === 'business' ? Colors.primaryAlpha : Colors.accentAlpha }]}>
                <Shield size={16} color={user.planType === 'business' ? Colors.primary : Colors.accent} />
                <Text style={[styles.badgeText, { color: user.planType === 'business' ? Colors.primary : Colors.accent }]}>
                  {user.planType === 'business' ? 'Business Account' : 'Personal Account'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Subscription Status */}
        <View style={styles.subscriptionSection}>
          <Text style={styles.sectionTitle}>Subscription Status</Text>
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={subscriptionStatus.isActive 
                ? [Colors.primaryAlpha, Colors.cardBackground]
                : [Colors.cardBackground, '#2A2A2A']
              }
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <View style={[styles.subscriptionIcon, { 
                  backgroundColor: subscriptionStatus.isActive ? Colors.primaryAlpha : Colors.cardBorder 
                }]}>
                  <Crown size={24} color={subscriptionStatus.isActive ? Colors.primary : Colors.textMuted} />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionStatus}>{subscriptionStatus.displayStatus}</Text>
                  {subscription && (
                    <View style={styles.subscriptionDetails}>
                      <Calendar size={12} color={Colors.textMuted} />
                      <Text style={styles.subscriptionDate}>
                        {subscriptionStatus.isOnTrial 
                          ? `Trial ends ${subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : 'soon'}`
                          : `Next billing: ${new Date(subscription.nextBillingDate).toLocaleDateString()}`
                        }
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              {!subscriptionStatus.isActive && (
                <TouchableOpacity 
                  style={styles.upgradeButton}
                  onPress={() => Alert.alert('Upgrade', 'Subscription upgrade coming soon')}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </View>

        {/* Account Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Account Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.statGradient}
              >
                <Text style={styles.statValue}>{accountBalance.usedTickets}</Text>
                <Text style={styles.statLabel}>Tickets Used</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.statCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.statGradient}
              >
                <Text style={styles.statValue}>{accountBalance.ticketBalance}</Text>
                <Text style={styles.statLabel}>Ticket Balance</Text>
              </LinearGradient>
            </View>
            
            {user.planType === 'business' && (
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.cardBackground, '#2A2A2A']}
                  style={styles.statGradient}
                >
                  <Text style={styles.statValue}>8</Text>
                  <Text style={styles.statLabel}>Team Members</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {profileOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.action}
              >
                <LinearGradient
                  colors={[Colors.cardBackground, '#2A2A2A']}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.optionIcon, { backgroundColor: Colors.accentAlpha }]}>
                      <IconComponent size={20} color={Colors.accent} />
                    </View>
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionTitle}>{option.title}</Text>
                      {option.subtitle && (
                        <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                      )}
                    </View>
                    {option.showArrow && (
                      <View style={styles.optionArrow}>
                        <Text style={styles.arrowText}>›</Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out */}
        <View style={styles.signOutSection}>
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[Colors.errorAlpha, Colors.cardBackground]}
              style={styles.signOutGradient}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.signOutText}>
                {isLoading ? 'Signing Out...' : 'Sign Out'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>RadBiz Security v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 RadBiz Consultants</Text>
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
    marginBottom: 24,
  },
  profileGradient: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  profileEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  profileCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCompany: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  accountBadge: {
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  subscriptionSection: {
    marginBottom: 24,
  },
  subscriptionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subscriptionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  optionsSection: {
    marginBottom: 24,
  },
  optionCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  optionArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: '300',
  },
  signOutSection: {
    marginBottom: 24,
  },
  signOutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  signOutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.errorAlpha,
    borderRadius: 12,
  },
  signOutText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  signInButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});