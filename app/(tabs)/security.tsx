import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, AlertTriangle, CheckCircle, Eye, EyeOff, Lock, Unlock, Wifi, Server, Database, Globe } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';

interface SecurityMetric {
  id: string;
  title: string;
  value: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  icon: any;
}

interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

export default function SecurityScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const securityMetrics: SecurityMetric[] = [
    {
      id: 'firewall',
      title: 'Firewall Status',
      value: 'Active',
      status: 'secure',
      description: 'All network traffic is being monitored and filtered',
      icon: Shield
    },
    {
      id: 'antivirus',
      title: 'Antivirus Protection',
      value: 'Updated',
      status: 'secure',
      description: 'Latest virus definitions installed 2 hours ago',
      icon: CheckCircle
    },
    {
      id: 'vpn',
      title: 'VPN Connection',
      value: 'Connected',
      status: 'secure',
      description: 'Secure tunnel established to company network',
      icon: Lock
    },
    {
      id: 'updates',
      title: 'System Updates',
      value: '3 Pending',
      status: 'warning',
      description: 'Critical security updates available for installation',
      icon: AlertTriangle
    }
  ];

  const recentThreats: SecurityThreat[] = [
    {
      id: '1',
      type: 'Malware Attempt',
      severity: 'high',
      description: 'Suspicious file download blocked from external source',
      timestamp: '2 hours ago',
      resolved: true
    },
    {
      id: '2',
      type: 'Phishing Email',
      severity: 'medium',
      description: 'Fraudulent email detected and quarantined',
      timestamp: '5 hours ago',
      resolved: true
    },
    {
      id: '3',
      type: 'Unauthorized Access',
      severity: 'critical',
      description: 'Failed login attempts from unknown IP address',
      timestamp: '1 day ago',
      resolved: false
    },
    {
      id: '4',
      type: 'Port Scan',
      severity: 'low',
      description: 'Network port scanning activity detected and blocked',
      timestamp: '2 days ago',
      resolved: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return Colors.success;
      case 'warning': return Colors.warning;
      case 'critical': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return Colors.success;
      case 'medium': return Colors.warning;
      case 'high': return Colors.error;
      case 'critical': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const handleRunScan = () => {
    Alert.alert(
      'Security Scan',
      'Starting comprehensive security scan. This may take several minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Scan', onPress: () => Alert.alert('Scan Started', 'Security scan is now running in the background.') }
      ]
    );
  };

  const handleUpdateSecurity = () => {
    Alert.alert(
      'Security Updates',
      'Install all pending security updates now?',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Install Now', onPress: () => Alert.alert('Updates Started', 'Security updates are being installed.') }
      ]
    );
  };

  const handleThreatDetails = (threatId: string) => {
    const threat = recentThreats.find(t => t.id === threatId);
    if (threat) {
      Alert.alert(
        `${threat.type} Details`,
        `Severity: ${threat.severity.toUpperCase()}\n\nDescription: ${threat.description}\n\nTime: ${threat.timestamp}\n\nStatus: ${threat.resolved ? 'Resolved' : 'Active'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Security Center</Text>
          <Text style={styles.headerSubtitle}>
            Monitor and manage your cybersecurity status
          </Text>
        </View>

        {/* Security Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewHeader}>
                <View style={[styles.overviewIcon, { backgroundColor: Colors.successAlpha }]}>
                  <Shield size={32} color={Colors.success} />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewTitle}>Security Status</Text>
                  <Text style={styles.overviewStatus}>Protected</Text>
                  <Text style={styles.overviewDescription}>
                    Your system is secure with active monitoring
                  </Text>
                </View>
              </View>
              
              <View style={styles.overviewActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleRunScan}
                >
                  <Text style={styles.actionButtonText}>Run Full Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleUpdateSecurity}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Update Security</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Security Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Security Metrics</Text>
          <View style={styles.metricsGrid}>
            {securityMetrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <TouchableOpacity
                  key={metric.id}
                  style={styles.metricCard}
                  onPress={() => setShowDetails(showDetails === metric.id ? null : metric.id)}
                >
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.metricGradient}
                  >
                    <View style={styles.metricHeader}>
                      <View style={[styles.metricIcon, { backgroundColor: getStatusColor(metric.status) + '20' }]}>
                        <IconComponent size={20} color={getStatusColor(metric.status)} />
                      </View>
                      <View style={styles.metricInfo}>
                        <Text style={styles.metricTitle}>{metric.title}</Text>
                        <Text style={[styles.metricValue, { color: getStatusColor(metric.status) }]}>
                          {metric.value}
                        </Text>
                      </View>
                    </View>
                    
                    {showDetails === metric.id && (
                      <View style={styles.metricDetails}>
                        <Text style={styles.metricDescription}>{metric.description}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Threats */}
        <View style={styles.threatsSection}>
          <Text style={styles.sectionTitle}>Recent Security Events</Text>
          
          {recentThreats.map((threat) => (
            <TouchableOpacity
              key={threat.id}
              style={styles.threatCard}
              onPress={() => handleThreatDetails(threat.id)}
            >
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.threatGradient}
              >
                <View style={styles.threatHeader}>
                  <View style={styles.threatInfo}>
                    <View style={styles.threatTitleRow}>
                      <Text style={styles.threatType}>{threat.type}</Text>
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(threat.severity) + '20' }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(threat.severity) }]}>
                          {threat.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.threatDescription}>{threat.description}</Text>
                    <Text style={styles.threatTimestamp}>{threat.timestamp}</Text>
                  </View>
                  
                  <View style={styles.threatStatus}>
                    {threat.resolved ? (
                      <View style={[styles.statusIndicator, { backgroundColor: Colors.successAlpha }]}>
                        <CheckCircle size={16} color={Colors.success} />
                        <Text style={[styles.statusText, { color: Colors.success }]}>Resolved</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusIndicator, { backgroundColor: Colors.errorAlpha }]}>
                        <AlertTriangle size={16} color={Colors.error} />
                        <Text style={[styles.statusText, { color: Colors.error }]}>Active</Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Network Security */}
        <View style={styles.networkSection}>
          <Text style={styles.sectionTitle}>Network Security</Text>
          <View style={styles.networkGrid}>
            <View style={styles.networkCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: Colors.primaryAlpha }]}>
                  <Wifi size={24} color={Colors.primary} />
                </View>
                <Text style={styles.networkTitle}>WiFi Security</Text>
                <Text style={styles.networkStatus}>WPA3 Encrypted</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.networkCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: Colors.accentAlpha }]}>
                  <Server size={24} color={Colors.accent} />
                </View>
                <Text style={styles.networkTitle}>Server Status</Text>
                <Text style={styles.networkStatus}>Secure & Online</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.networkCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: Colors.successAlpha }]}>
                  <Database size={24} color={Colors.success} />
                </View>
                <Text style={styles.networkTitle}>Data Backup</Text>
                <Text style={styles.networkStatus}>Last: 2 hours ago</Text>
              </LinearGradient>
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
  overviewSection: {
    marginBottom: 32,
  },
  overviewCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  overviewGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  overviewInfo: {
    flex: 1,
  },
  overviewTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overviewStatus: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 4,
  },
  overviewDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  overviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: Colors.cardBorder,
    marginRight: 0,
    marginLeft: 8,
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
  },
  metricsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metricInfo: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  metricDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  threatsSection: {
    marginBottom: 32,
  },
  threatCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  threatGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  threatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  threatInfo: {
    flex: 1,
    marginRight: 16,
  },
  threatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  threatType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  threatDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  threatTimestamp: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  threatStatus: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  networkSection: {
    marginBottom: 20,
  },
  networkGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  networkCard: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  networkGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  networkIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  networkTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  networkStatus: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
});