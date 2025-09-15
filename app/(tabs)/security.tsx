import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Lock, Wifi, Database, Key, AlertTriangle, CheckCircle } from 'lucide-react-native';

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = React.useState({
    firewall: true,
    vpn: false,
    twoFactor: true,
    autoScan: true,
    realTimeProtection: true,
    dataEncryption: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const securityChecks = [
    { name: 'Firewall Status', status: 'active', icon: Shield, color: '#10B981' },
    { name: 'Last Security Scan', status: '2 hours ago', icon: CheckCircle, color: '#10B981' },
    { name: 'VPN Connection', status: 'inactive', icon: Wifi, color: '#F59E0B' },
    { name: 'SSL Certificates', status: 'valid', icon: Lock, color: '#10B981' },
    { name: 'Database Backup', status: 'completed', icon: Database, color: '#10B981' },
    { name: 'Access Logs', status: 'monitored', icon: Key, color: '#3B82F6' },
  ];

  const threats = [
    { type: 'Malware', count: 0, trend: 'down' },
    { type: 'Phishing', count: 3, trend: 'up' },
    { type: 'DDoS', count: 0, trend: 'stable' },
    { type: 'Intrusion', count: 1, trend: 'down' },
  ];

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.alertCard}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.alertGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <CheckCircle size={24} color="#FFFFFF" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>System Secure</Text>
              <Text style={styles.alertMessage}>All security systems are operational</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          {Object.entries(settings).map(([key, value]) => (
            <View key={key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Text style={styles.settingStatus}>
                  {value ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={value}
                onValueChange={() => toggleSetting(key as keyof typeof settings)}
                trackColor={{ false: '#334155', true: '#3B82F6' }}
                thumbColor={value ? '#FFFFFF' : '#64748B'}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.checksGrid}>
            {securityChecks.map((check) => (
              <View key={check.name} style={styles.checkCard}>
                <View style={[styles.checkIcon, { backgroundColor: check.color + '20' }]}>
                  <check.icon size={20} color={check.color} />
                </View>
                <Text style={styles.checkName}>{check.name}</Text>
                <Text style={styles.checkStatus}>{check.status}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Threat Detection</Text>
          <View style={styles.threatsContainer}>
            {threats.map((threat) => (
              <View key={threat.type} style={styles.threatCard}>
                <View style={styles.threatHeader}>
                  <Text style={styles.threatType}>{threat.type}</Text>
                  {threat.count > 0 ? (
                    <AlertTriangle size={16} color="#F59E0B" />
                  ) : (
                    <CheckCircle size={16} color="#10B981" />
                  )}
                </View>
                <Text style={styles.threatCount}>{threat.count}</Text>
                <Text style={styles.threatLabel}>
                  {threat.count === 1 ? 'threat' : 'threats'}
                </Text>
                <View style={styles.threatTrend}>
                  <Text style={styles.threatTrendText}>
                    {threat.trend === 'up' ? '↑' : threat.trend === 'down' ? '↓' : '→'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.scanButton}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.scanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Shield size={20} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Run Security Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  alertCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingStatus: {
    fontSize: 12,
    color: '#94A3B8',
  },
  checksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  checkName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  checkStatus: {
    fontSize: 12,
    color: '#94A3B8',
  },
  threatsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  threatCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  threatType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  threatCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  threatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  threatTrend: {
    marginTop: 4,
  },
  threatTrendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  scanButton: {
    marginTop: 8,
  },
  scanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});