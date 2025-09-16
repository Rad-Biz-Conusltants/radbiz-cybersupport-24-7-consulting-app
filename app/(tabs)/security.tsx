import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Wifi, Server, Database, Globe, Smartphone, Monitor, Tablet, Settings, RefreshCw, Download, Trash2, FileText, Camera, Mic } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Platform-specific imports with web compatibility
let Device: any = null;
let Application: any = null;
let SecureStore: any = null;

if (Platform.OS !== 'web') {
  Device = require('expo-device');
  Application = require('expo-application');
  SecureStore = require('expo-secure-store');
}
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

interface DeviceInfo {
  platform: string;
  deviceType: string;
  osVersion: string;
  appVersion: string;
  deviceName: string;
  isPhysicalDevice: boolean;
  screenDimensions: { width: number; height: number };
}

interface SecurityAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  available: boolean;
  platform?: string[];
}

interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  location: boolean;
  notifications: boolean;
  storage: boolean;
}

export default function SecurityScreen() {
  const { user } = useAuth();
  console.log('Security screen loaded for user:', user?.email);
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [permissions, setPermissions] = useState<PermissionStatus>({
    camera: false,
    microphone: false,
    location: false,
    notifications: false,
    storage: false
  });
  const [securityScore, setSecurityScore] = useState<number>(85);

  useEffect(() => {
    const initializeApp = async () => {
      await initializeDeviceInfo();
      await loadSecurityData();
      await checkPermissions();
    };
    
    initializeApp();
  }, []);

  const initializeDeviceInfo = async () => {
    try {
      const screenData = Dimensions.get('screen');
      
      if (Platform.OS === 'web') {
        // Web-specific device info
        const deviceData: DeviceInfo = {
          platform: 'web',
          deviceType: screenData.width > 768 ? 'Desktop' : 'Mobile',
          osVersion: navigator.userAgent.includes('Windows') ? 'Windows' :
                    navigator.userAgent.includes('Mac') ? 'macOS' :
                    navigator.userAgent.includes('Linux') ? 'Linux' : 'Unknown',
          appVersion: '1.0.0',
          deviceName: 'Web Browser',
          isPhysicalDevice: false,
          screenDimensions: { width: screenData.width, height: screenData.height }
        };
        setDeviceInfo(deviceData);
      } else {
        // Native device info
        const deviceData: DeviceInfo = {
          platform: Platform.OS,
          deviceType: Device?.deviceType === Device?.DeviceType?.PHONE ? 'Phone' : 
                     Device?.deviceType === Device?.DeviceType?.TABLET ? 'Tablet' : 'Desktop',
          osVersion: Device?.osVersion || 'Unknown',
          appVersion: Application?.nativeApplicationVersion || '1.0.0',
          deviceName: Device?.deviceName || 'Unknown Device',
          isPhysicalDevice: Device?.isDevice || false,
          screenDimensions: { width: screenData.width, height: screenData.height }
        };
        setDeviceInfo(deviceData);
      }
      
      console.log('Device info initialized:', deviceInfo);
    } catch (error) {
      console.error('Error initializing device info:', error);
    }
  };

  const loadSecurityData = async () => {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage for web
        const lastScan = localStorage.getItem('lastSecurityScan');
        if (lastScan) {
          setLastScanTime(lastScan);
        }
        
        const savedScore = localStorage.getItem('securityScore');
        if (savedScore) {
          setSecurityScore(parseInt(savedScore));
        }
      } else {
        // Use SecureStore for native
        const lastScan = await SecureStore?.getItemAsync('lastSecurityScan');
        if (lastScan) {
          setLastScanTime(lastScan);
        }
        
        const savedScore = await SecureStore?.getItemAsync('securityScore');
        if (savedScore) {
          setSecurityScore(parseInt(savedScore));
        }
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const checkPermissions = async () => {
    // This is a mock implementation - in a real app you'd check actual permissions
    setPermissions({
      camera: Math.random() > 0.3,
      microphone: Math.random() > 0.3,
      location: Math.random() > 0.5,
      notifications: Math.random() > 0.2,
      storage: Math.random() > 0.1
    });
  };

  const getDeviceIcon = () => {
    if (!deviceInfo) return Monitor;
    
    switch (deviceInfo.deviceType) {
      case 'Phone': return Smartphone;
      case 'Tablet': return Tablet;
      default: return Monitor;
    }
  };

  const getSecurityActions = (): SecurityAction[] => {
    return [
      {
        id: 'full-scan',
        title: 'Full Security Scan',
        description: 'Comprehensive system security analysis',
        icon: Shield,
        action: handleFullSecurityScan,
        available: true
      },
      {
        id: 'update-security',
        title: 'Update Security Definitions',
        description: 'Download latest security updates',
        icon: Download,
        action: handleUpdateSecurity,
        available: true
      },
      {
        id: 'clear-cache',
        title: 'Clear Security Cache',
        description: 'Remove temporary security files',
        icon: Trash2,
        action: handleClearCache,
        available: true
      },
      {
        id: 'generate-report',
        title: 'Security Report',
        description: 'Generate detailed security report',
        icon: FileText,
        action: handleGenerateReport,
        available: true
      },
      {
        id: 'privacy-scan',
        title: 'Privacy Audit',
        description: 'Check app permissions and privacy settings',
        icon: Eye,
        action: handlePrivacyScan,
        available: Platform.OS !== 'web',
        platform: ['ios', 'android']
      },
      {
        id: 'network-scan',
        title: 'Network Security Check',
        description: 'Analyze network connections and security',
        icon: Wifi,
        action: handleNetworkScan,
        available: true
      }
    ];
  };

  const getSecurityMetrics = (): SecurityMetric[] => {
    const baseMetrics: SecurityMetric[] = [
      {
        id: 'app-security',
        title: 'App Security',
        value: deviceInfo?.isPhysicalDevice ? 'Secure' : 'Simulator',
        status: deviceInfo?.isPhysicalDevice ? 'secure' : 'warning',
        description: deviceInfo?.isPhysicalDevice ? 
          'Running on physical device with hardware security' : 
          'Running on simulator - limited security features',
        icon: Shield
      },
      {
        id: 'permissions',
        title: 'App Permissions',
        value: `${Object.values(permissions).filter(Boolean).length}/5 Granted`,
        status: Object.values(permissions).filter(Boolean).length >= 3 ? 'secure' : 'warning',
        description: 'Application permissions status and security implications',
        icon: Settings
      },
      {
        id: 'data-encryption',
        title: 'Data Encryption',
        value: Platform.OS !== 'web' ? 'AES-256' : 'Browser Storage',
        status: Platform.OS !== 'web' ? 'secure' : 'warning',
        description: Platform.OS !== 'web' ? 
          'Data encrypted with hardware-backed security' : 
          'Data stored in browser with standard encryption',
        icon: Lock
      },
      {
        id: 'last-scan',
        title: 'Last Security Scan',
        value: lastScanTime || 'Never',
        status: lastScanTime ? 'secure' : 'critical',
        description: lastScanTime ? 
          `Security scan completed on ${lastScanTime}` : 
          'No security scan performed yet',
        icon: RefreshCw
      }
    ];

    // Add platform-specific metrics
    if (Platform.OS === 'ios') {
      baseMetrics.push({
        id: 'ios-security',
        title: 'iOS Security',
        value: 'App Store Verified',
        status: 'secure',
        description: 'App downloaded from official App Store with code signing verification',
        icon: CheckCircle
      });
    } else if (Platform.OS === 'android') {
      baseMetrics.push({
        id: 'android-security',
        title: 'Android Security',
        value: 'Play Protect Active',
        status: 'secure',
        description: 'Google Play Protect scanning enabled for malware detection',
        icon: CheckCircle
      });
    } else {
      baseMetrics.push({
        id: 'web-security',
        title: 'Web Security',
        value: 'HTTPS Enabled',
        status: 'secure',
        description: 'Secure connection with SSL/TLS encryption',
        icon: Globe
      });
    }

    return baseMetrics;
  };

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

  const handleFullSecurityScan = async () => {
    setIsScanning(true);
    
    try {
      // Simulate security scan process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const currentTime = new Date().toLocaleString();
      const newScore = Math.min(95, securityScore + Math.floor(Math.random() * 10));
      
      if (Platform.OS === 'web') {
        localStorage.setItem('lastSecurityScan', currentTime);
        localStorage.setItem('securityScore', newScore.toString());
      } else {
        await SecureStore?.setItemAsync('lastSecurityScan', currentTime);
        await SecureStore?.setItemAsync('securityScore', newScore.toString());
      }
      
      setLastScanTime(currentTime);
      setSecurityScore(newScore);
      
      Alert.alert(
        'Security Scan Complete',
        `Scan completed successfully!\n\nSecurity Score: ${newScore}/100\nThreats Found: 0\nVulnerabilities: ${100 - newScore > 10 ? 'Minor issues detected' : 'None detected'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Security scan error:', error);
      Alert.alert('Scan Error', 'Failed to complete security scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateSecurity = async () => {
    Alert.alert(
      'Security Updates',
      `Update security definitions for ${deviceInfo?.platform.toUpperCase()} ${deviceInfo?.deviceType}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update Now', 
          onPress: async () => {
            // Simulate update process
            Alert.alert('Updates Started', 'Security definitions are being updated...');
            setTimeout(() => {
              Alert.alert('Update Complete', 'Security definitions updated successfully!');
            }, 2000);
          }
        }
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Security Cache',
      'This will remove temporary security files and logs. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Cache', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cache Cleared', 'Security cache has been cleared successfully.');
          }
        }
      ]
    );
  };

  const handleGenerateReport = () => {
    const report = `Security Report - ${new Date().toLocaleDateString()}\n\n` +
      `Device: ${deviceInfo?.deviceName}\n` +
      `Platform: ${deviceInfo?.platform} ${deviceInfo?.osVersion}\n` +
      `App Version: ${deviceInfo?.appVersion}\n` +
      `Security Score: ${securityScore}/100\n` +
      `Last Scan: ${lastScanTime || 'Never'}\n\n` +
      `Permissions Status:\n` +
      `- Camera: ${permissions.camera ? 'Granted' : 'Denied'}\n` +
      `- Microphone: ${permissions.microphone ? 'Granted' : 'Denied'}\n` +
      `- Location: ${permissions.location ? 'Granted' : 'Denied'}\n` +
      `- Notifications: ${permissions.notifications ? 'Granted' : 'Denied'}\n` +
      `- Storage: ${permissions.storage ? 'Granted' : 'Denied'}`;
    
    Alert.alert('Security Report', report, [{ text: 'OK' }]);
  };

  const handlePrivacyScan = () => {
    Alert.alert(
      'Privacy Audit',
      `Analyzing privacy settings for ${deviceInfo?.platform} device...\n\n` +
      `Current Permissions:\n` +
      `• Camera: ${permissions.camera ? '✓ Granted' : '✗ Denied'}\n` +
      `• Microphone: ${permissions.microphone ? '✓ Granted' : '✗ Denied'}\n` +
      `• Location: ${permissions.location ? '✓ Granted' : '✗ Denied'}\n` +
      `• Notifications: ${permissions.notifications ? '✓ Granted' : '✗ Denied'}\n` +
      `• Storage: ${permissions.storage ? '✓ Granted' : '✗ Denied'}`,
      [{ text: 'OK' }]
    );
  };

  const handleNetworkScan = () => {
    Alert.alert(
      'Network Security Check',
      `Analyzing network security...\n\n` +
      `Connection Type: ${Platform.OS === 'web' ? 'Web Browser' : 'Mobile Network'}\n` +
      `Encryption: ${Platform.OS === 'web' ? 'HTTPS/TLS' : 'Cellular/WiFi Encryption'}\n` +
      `Status: Secure Connection Established\n\n` +
      `No suspicious network activity detected.`,
      [{ text: 'OK' }]
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

        {/* Device Information */}
        {deviceInfo && (
          <View style={styles.deviceSection}>
            <View style={styles.deviceCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.deviceGradient}
              >
                <View style={styles.deviceHeader}>
                  <View style={[styles.deviceIcon, { backgroundColor: Colors.primaryAlpha }]}>
                    {React.createElement(getDeviceIcon(), { size: 28, color: Colors.primary })}
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceTitle}>{deviceInfo.deviceName}</Text>
                    <Text style={styles.deviceSubtitle}>
                      {deviceInfo.platform.toUpperCase()} {deviceInfo.osVersion} • {deviceInfo.deviceType}
                    </Text>
                    <Text style={styles.deviceDetails}>
                      App v{deviceInfo.appVersion} • {deviceInfo.isPhysicalDevice ? 'Physical Device' : 'Simulator'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Security Overview */}
        <View style={styles.overviewSection}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewHeader}>
                <View style={[styles.overviewIcon, { backgroundColor: securityScore >= 80 ? Colors.successAlpha : Colors.warningAlpha }]}>
                  <Shield size={32} color={securityScore >= 80 ? Colors.success : Colors.warning} />
                </View>
                <View style={styles.overviewInfo}>
                  <Text style={styles.overviewTitle}>Security Score</Text>
                  <Text style={[styles.overviewStatus, { color: securityScore >= 80 ? Colors.success : Colors.warning }]}>
                    {securityScore}/100
                  </Text>
                  <Text style={styles.overviewDescription}>
                    {securityScore >= 90 ? 'Excellent security posture' :
                     securityScore >= 80 ? 'Good security with minor improvements needed' :
                     securityScore >= 60 ? 'Moderate security - action recommended' :
                     'Poor security - immediate action required'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.overviewActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, isScanning && styles.disabledButton]}
                  onPress={handleFullSecurityScan}
                  disabled={isScanning}
                >
                  <Text style={styles.actionButtonText}>
                    {isScanning ? 'Scanning...' : 'Run Full Scan'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleGenerateReport}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Security Report</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Security Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Security Actions</Text>
          <View style={styles.actionsGrid}>
            {getSecurityActions().filter(action => action.available).map((action) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={action.action}
                >
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.actionGradient}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: Colors.accentAlpha }]}>
                      <IconComponent size={20} color={Colors.accent} />
                    </View>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Security Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Security Metrics</Text>
          <View style={styles.metricsGrid}>
            {getSecurityMetrics().map((metric) => {
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

        {/* Permissions Status */}
        <View style={styles.permissionsSection}>
          <Text style={styles.sectionTitle}>App Permissions</Text>
          <View style={styles.permissionsList}>
            {[
              { key: 'camera', label: 'Camera Access', icon: Camera, description: 'Required for photo capture and video calls' },
              { key: 'microphone', label: 'Microphone Access', icon: Mic, description: 'Required for voice calls and audio recording' },
              { key: 'location', label: 'Location Services', icon: Globe, description: 'Used for location-based features' },
              { key: 'notifications', label: 'Push Notifications', icon: AlertTriangle, description: 'Receive important security alerts' },
              { key: 'storage', label: 'Storage Access', icon: Database, description: 'Store app data and cache files' }
            ].map((permission) => {
              const IconComponent = permission.icon;
              const isGranted = permissions[permission.key as keyof PermissionStatus];
              
              return (
                <View key={permission.key} style={styles.permissionCard}>
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.permissionGradient}
                  >
                    <View style={styles.permissionHeader}>
                      <View style={[styles.permissionIcon, { backgroundColor: isGranted ? Colors.successAlpha : Colors.errorAlpha }]}>
                        <IconComponent size={18} color={isGranted ? Colors.success : Colors.error} />
                      </View>
                      <View style={styles.permissionInfo}>
                        <Text style={styles.permissionLabel}>{permission.label}</Text>
                        <Text style={styles.permissionDescription}>{permission.description}</Text>
                      </View>
                      <View style={[styles.permissionStatus, { backgroundColor: isGranted ? Colors.successAlpha : Colors.errorAlpha }]}>
                        <Text style={[styles.permissionStatusText, { color: isGranted ? Colors.success : Colors.error }]}>
                          {isGranted ? 'Granted' : 'Denied'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
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
  deviceSection: {
    marginBottom: 24,
  },
  deviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  deviceGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  deviceSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  deviceDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  permissionsSection: {
    marginBottom: 32,
  },
  permissionsList: {
    gap: 12,
  },
  permissionCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  permissionGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  permissionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  permissionStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});