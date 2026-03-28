import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Mail, MessageSquare, Shield, Smartphone, ArrowLeft, Save } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: any;
  enabled: boolean;
  category: 'security' | 'updates' | 'marketing';
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Get notified about security threats and suspicious activities',
      icon: Shield,
      enabled: true,
      category: 'security'
    },
    {
      id: 'ticket_updates',
      title: 'Ticket Updates',
      description: 'Receive updates when your support tickets are responded to',
      icon: MessageSquare,
      enabled: true,
      category: 'updates'
    },
    {
      id: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive important updates via email',
      icon: Mail,
      enabled: true,
      category: 'updates'
    },
    {
      id: 'push_notifications',
      title: 'Push Notifications',
      description: 'Get instant notifications on your device',
      icon: Smartphone,
      enabled: false,
      category: 'updates'
    },
    {
      id: 'system_maintenance',
      title: 'System Maintenance',
      description: 'Be informed about scheduled maintenance and downtime',
      icon: Bell,
      enabled: true,
      category: 'updates'
    },
    {
      id: 'product_updates',
      title: 'Product Updates',
      description: 'Learn about new features and improvements',
      icon: Bell,
      enabled: false,
      category: 'marketing'
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    ));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Notification preferences saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const groupedSettings = {
    security: settings.filter(s => s.category === 'security'),
    updates: settings.filter(s => s.category === 'updates'),
    marketing: settings.filter(s => s.category === 'marketing'),
  };

  const renderSettingItem = (setting: NotificationSetting) => {
    const IconComponent = setting.icon;
    return (
      <View key={setting.id} style={styles.settingItem}>
        <LinearGradient
          colors={[Colors.cardBackground, '#2A2A2A']}
          style={styles.settingGradient}
        >
          <View style={styles.settingContent}>
            <View style={[styles.settingIcon, { backgroundColor: Colors.accentAlpha }]}>
              <IconComponent size={20} color={Colors.accent} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDescription}>{setting.description}</Text>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => handleToggle(setting.id)}
              trackColor={{ false: Colors.cardBorder, true: Colors.primaryAlpha }}
              thumbColor={setting.enabled ? Colors.primary : Colors.textMuted}
              ios_backgroundColor={Colors.cardBorder}
            />
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundStart },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={isLoading}
              style={[styles.headerButton, { opacity: isLoading ? 0.6 : 1 }]}
            >
              <Save size={24} color={Colors.primary} />
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
          {/* Header Info */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.headerCard}
            >
              <View style={[styles.headerIcon, { backgroundColor: Colors.primaryAlpha }]}>
                <Bell size={32} color={Colors.primary} />
              </View>
              <Text style={styles.headerTitle}>Notification Preferences</Text>
              <Text style={styles.headerDescription}>
                Customize how and when you receive notifications to stay informed about important updates.
              </Text>
            </LinearGradient>
          </View>

          {/* Security Notifications */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Security & Safety</Text>
            <Text style={styles.categoryDescription}>
              Critical notifications for your account security
            </Text>
            {groupedSettings.security.map(renderSettingItem)}
          </View>

          {/* System Updates */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>System Updates</Text>
            <Text style={styles.categoryDescription}>
              Stay informed about system changes and your account activity
            </Text>
            {groupedSettings.updates.map(renderSettingItem)}
          </View>

          {/* Marketing */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>Marketing & Features</Text>
            <Text style={styles.categoryDescription}>
              Optional notifications about new features and promotions
            </Text>
            {groupedSettings.marketing.map(renderSettingItem)}
          </View>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryAlpha]}
                style={styles.saveGradient}
              >
                <Save size={20} color={Colors.textPrimary} />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
  headerSection: {
    marginBottom: 32,
  },
  headerCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 12,
  },
  settingGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  saveSection: {
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});