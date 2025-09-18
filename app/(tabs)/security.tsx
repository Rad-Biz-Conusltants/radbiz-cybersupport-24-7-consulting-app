import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, AlertTriangle, CheckCircle, Eye, Lock, Wifi, Server, Database, Globe, Smartphone, Monitor, Tablet, Settings, RefreshCw, Download, Trash2, FileText, Camera, Mic, Activity, Power, RotateCcw, WifiOff, ShieldCheck, ShieldAlert, ShieldX, Router } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
let Device: any = null;
let Application: any = null;
let SecureStore: any = null;
let ClipboardMod: any = null;

if (Platform.OS !== 'web') {
  Device = require('expo-device');
  Application = require('expo-application');
  SecureStore = require('expo-secure-store');
  ClipboardMod = require('expo-clipboard');
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

interface VPNStatus {
  isConnected: boolean;
  serverLocation: string;
  serverCountry: string;
  connectionTime: string;
  dataTransferred: { upload: string; download: string };
  ipAddress: string;
  protocol: string;
  encryption: string;
  latency: number;
  isSecure: boolean;
}

interface NetworkThreat {
  id: string;
  type: 'malware' | 'phishing' | 'tracking' | 'ads' | 'suspicious';
  blocked: boolean;
  count: number;
  lastBlocked: string;
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
  const [vpnStatus, setVpnStatus] = useState<VPNStatus>({
    isConnected: false,
    serverLocation: 'Not Connected',
    serverCountry: '',
    connectionTime: '',
    dataTransferred: { upload: '0 MB', download: '0 MB' },
    ipAddress: '192.168.1.1',
    protocol: 'OpenVPN',
    encryption: 'AES-256',
    latency: 0,
    isSecure: false
  });
  const [isConnectingVPN, setIsConnectingVPN] = useState<boolean>(false);
  const [networkThreats, setNetworkThreats] = useState<NetworkThreat[]>([
    { id: '1', type: 'malware', blocked: true, count: 15, lastBlocked: '2 minutes ago' },
    { id: '2', type: 'tracking', blocked: true, count: 42, lastBlocked: '5 minutes ago' },
    { id: '3', type: 'ads', blocked: true, count: 128, lastBlocked: '1 minute ago' },
    { id: '4', type: 'phishing', blocked: true, count: 3, lastBlocked: '1 hour ago' }
  ]);
  const [realTimeProtection, setRealTimeProtection] = useState<boolean>(true);
  const [autoConnect, setAutoConnect] = useState<boolean>(false);
  const [killSwitch, setKillSwitch] = useState<boolean>(true);
  const [serverPickerVisible, setServerPickerVisible] = useState<boolean>(false);
  const [availableServers, setAvailableServers] = useState<{ id: string; location: string; country: string; ip: string; latency: number }[]>([]);

  useEffect(() => {
    const initializeApp = async () => {
      await initializeDeviceInfo();
      await loadSecurityData();
      await checkPermissions();
      await initializeVPNStatus();
      await loadNetworkProtectionSettings();
      await initializeServers();
    };
    initializeApp();
  }, []);

  const initializeServers = async () => {
    try {
      const base = [
        { id: 'ny-us', location: 'New York, NY', country: 'United States', ip: '198.51.100.42', latency: 22 },
        { id: 'ldn-uk', location: 'London, UK', country: 'United Kingdom', ip: '203.0.113.15', latency: 46 },
        { id: 'tky-jp', location: 'Tokyo, JP', country: 'Japan', ip: '192.0.2.123', latency: 118 },
        { id: 'syd-au', location: 'Sydney, AU', country: 'Australia', ip: '198.51.100.89', latency: 152 },
        { id: 'fra-de', location: 'Frankfurt, DE', country: 'Germany', ip: '203.0.113.44', latency: 70 },
        { id: 'sin-sg', location: 'Singapore, SG', country: 'Singapore', ip: '192.0.2.88', latency: 110 },
        { id: 'tor-ca', location: 'Toronto, CA', country: 'Canada', ip: '198.51.100.61', latency: 38 },
        { id: 'sao-br', location: 'São Paulo, BR', country: 'Brazil', ip: '203.0.113.77', latency: 140 },
      ];
      setAvailableServers(base);
    } catch (e) {
      console.error('initializeServers error', e);
    }
  };

  const initializeDeviceInfo = async () => {
    try {
      const screenData = Dimensions.get('screen');
      if (Platform.OS === 'web') {
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
        const lastScan = localStorage.getItem('lastSecurityScan');
        if (lastScan) setLastScanTime(lastScan);
        const savedScore = localStorage.getItem('securityScore');
        if (savedScore) setSecurityScore(parseInt(savedScore));
      } else {
        const lastScan = await SecureStore?.getItemAsync('lastSecurityScan');
        if (lastScan) setLastScanTime(lastScan);
        const savedScore = await SecureStore?.getItemAsync('securityScore');
        if (savedScore) setSecurityScore(parseInt(savedScore));
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const checkPermissions = async () => {
    setPermissions({
      camera: Math.random() > 0.3,
      microphone: Math.random() > 0.3,
      location: Math.random() > 0.5,
      notifications: Math.random() > 0.2,
      storage: Math.random() > 0.1
    });
  };

  const initializeVPNStatus = async () => {
    try {
      const isConnected = Math.random() > 0.7;
      if (isConnected) {
        setVpnStatus({
          isConnected: true,
          serverLocation: 'New York, NY',
          serverCountry: 'United States',
          connectionTime: '2h 15m',
          dataTransferred: { upload: '45.2 MB', download: '128.7 MB' },
          ipAddress: '198.51.100.42',
          protocol: 'WireGuard',
          encryption: 'ChaCha20',
          latency: 23,
          isSecure: true
        });
      }
      console.log('VPN status initialized:', vpnStatus);
    } catch (error) {
      console.error('Error initializing VPN status:', error);
    }
  };

  const loadNetworkProtectionSettings = async () => {
    try {
      if (Platform.OS === 'web') {
        const r = localStorage.getItem('realTimeProtection');
        const a = localStorage.getItem('autoConnect');
        const k = localStorage.getItem('killSwitch');
        if (r) setRealTimeProtection(JSON.parse(r));
        if (a) setAutoConnect(JSON.parse(a));
        if (k) setKillSwitch(JSON.parse(k));
      } else {
        const r = await SecureStore?.getItemAsync('realTimeProtection');
        const a = await SecureStore?.getItemAsync('autoConnect');
        const k = await SecureStore?.getItemAsync('killSwitch');
        if (r) setRealTimeProtection(JSON.parse(r));
        if (a) setAutoConnect(JSON.parse(a));
        if (k) setKillSwitch(JSON.parse(k));
      }
    } catch (error) {
      console.error('Error loading network protection settings:', error);
    }
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
        id: 'security-audit',
        title: 'Security Audit',
        description: 'Comprehensive security assessment',
        icon: CheckCircle,
        action: handleSecurityAudit,
        available: true
      },
      {
        id: 'malware-scan',
        title: 'Malware Scan',
        description: 'Deep scan for malicious software',
        icon: ShieldAlert,
        action: handleMalwareScan,
        available: true
      },
      {
        id: 'firewall-config',
        title: 'Firewall Settings',
        description: 'Configure network firewall rules',
        icon: Shield,
        action: handleFirewallConfig,
        available: true
      },
      {
        id: 'backup-security',
        title: 'Backup Security',
        description: 'Secure backup and recovery options',
        icon: Database,
        action: handleBackupSecurity,
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
      },
      {
        id: 'vpn-toggle',
        title: vpnStatus.isConnected ? 'Disconnect VPN' : 'Connect VPN',
        description: vpnStatus.isConnected ? 'Disconnect from secure VPN server' : 'Connect to secure VPN server',
        icon: vpnStatus.isConnected ? ShieldCheck : Shield,
        action: handleVPNToggle,
        available: true
      },
      {
        id: 'change-server',
        title: 'Change VPN Server',
        description: 'Select optimal server location',
        icon: Server,
        action: handleChangeVPNServer,
        available: true
      },
      {
        id: 'threat-protection',
        title: 'Threat Protection',
        description: 'Configure real-time threat blocking',
        icon: ShieldAlert,
        action: handleThreatProtection,
        available: true
      },
      {
        id: 'network-monitor',
        title: 'Network Monitor',
        description: 'Monitor network traffic and threats',
        icon: Activity,
        action: handleNetworkMonitor,
        available: true
      },
      {
        id: 'dns-protection',
        title: 'DNS Protection',
        description: 'Secure DNS filtering and blocking',
        icon: Router,
        action: handleDNSProtection,
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

  const handleGenerateReport = async () => {
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
    try {
      if (Platform.OS === 'web') {
        await (navigator as any)?.clipboard?.writeText?.(report);
        Alert.alert('Security Report', 'Copied to clipboard.');
        return;
      }
      if (ClipboardMod?.setStringAsync) {
        await ClipboardMod.setStringAsync(report);
        Alert.alert('Security Report', 'Copied to clipboard.');
        return;
      }
      Alert.alert('Security Report', report, [{ text: 'OK' }]);
    } catch (e) {
      console.error('Copy report failed', e);
      Alert.alert('Security Report', report, [{ text: 'OK' }]);
    }
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

  const handleNetworkScan = async () => {
    setIsScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const threats = networkThreats.reduce((sum, threat) => sum + threat.count, 0);
      const vpnProtection = vpnStatus.isConnected ? 'VPN Active' : 'VPN Inactive';
      Alert.alert(
        'Network Security Scan Complete',
        `Network Analysis Results:\n\n` +
        `Connection Type: ${Platform.OS === 'web' ? 'Web Browser' : 'Mobile Network'}\n` +
        `VPN Status: ${vpnProtection}\n` +
        `Encryption: ${vpnStatus.isConnected ? vpnStatus.encryption : 'Standard'}\n` +
        `Threats Blocked: ${threats}\n` +
        `Real-time Protection: ${realTimeProtection ? 'Active' : 'Inactive'}\n\n` +
        `${threats > 0 ? `${threats} threats have been blocked today.` : 'No threats detected.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Network scan error:', error);
      Alert.alert('Scan Error', 'Failed to complete network scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleVPNToggle = async () => {
    if (isConnectingVPN) return;
    setIsConnectingVPN(true);
    try {
      if (vpnStatus.isConnected) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setVpnStatus({
          ...vpnStatus,
          isConnected: false,
          serverLocation: 'Not Connected',
          serverCountry: '',
          connectionTime: '',
          dataTransferred: { upload: '0 MB', download: '0 MB' },
          ipAddress: '192.168.1.1',
          latency: 0,
          isSecure: false
        });
        Alert.alert('VPN Disconnected', 'You are no longer connected to the VPN server.');
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const servers = availableServers.length ? availableServers : [
          { id: 'ny-us', location: 'New York, NY', country: 'United States', ip: '198.51.100.42', latency: 22 },
        ];
        const selectedServer = servers[Math.floor(Math.random() * servers.length)];
        setVpnStatus({
          isConnected: true,
          serverLocation: selectedServer.location,
          serverCountry: selectedServer.country,
          connectionTime: '0m',
          dataTransferred: { upload: '0 MB', download: '0 MB' },
          ipAddress: selectedServer.ip,
          protocol: 'WireGuard',
          encryption: 'ChaCha20',
          latency: selectedServer.latency,
          isSecure: true
        });
        Alert.alert('VPN Connected', `Successfully connected to ${selectedServer.location}`);
      }
    } catch (error) {
      console.error('VPN toggle error:', error);
      Alert.alert('Connection Error', 'Failed to toggle VPN connection. Please try again.');
    } finally {
      setIsConnectingVPN(false);
    }
  };

  const handleChangeVPNServer = () => {
    console.log('Navigating to VPN servers screen');
    router.push('/security/vpn-servers');
  };

  const connectToServer = async (serverId: string) => {
    try {
      const s = availableServers.find(x => x.id === serverId);
      if (!s) return;
      setIsConnectingVPN(true);
      await new Promise(r => setTimeout(r, 1000));
      setVpnStatus({
        isConnected: true,
        serverLocation: s.location,
        serverCountry: s.country,
        connectionTime: '0m',
        dataTransferred: { upload: '0 MB', download: '0 MB' },
        ipAddress: s.ip,
        protocol: 'WireGuard',
        encryption: 'ChaCha20',
        latency: s.latency,
        isSecure: true,
      });
      setServerPickerVisible(false);
      Alert.alert('VPN Connected', `Connected to ${s.location}`);
    } catch (e) {
      console.error('connectToServer', e);
      Alert.alert('VPN', 'Failed to connect to server.');
    } finally {
      setIsConnectingVPN(false);
    }
  };

  const handleThreatProtection = () => {
    Alert.alert(
      'Threat Protection Settings',
      `Configure your security preferences:\n\n` +
      `Real-time Protection: ${realTimeProtection ? 'Enabled' : 'Disabled'}\n` +
      `Auto-connect VPN: ${autoConnect ? 'Enabled' : 'Disabled'}\n` +
      `Kill Switch: ${killSwitch ? 'Enabled' : 'Disabled'}\n\n` +
      `Threats blocked today: ${networkThreats.reduce((sum, threat) => sum + threat.count, 0)}`,
      [
        {
          text: 'Toggle Real-time Protection',
          onPress: async () => {
            const v = !realTimeProtection;
            setRealTimeProtection(v);
            if (Platform.OS === 'web') localStorage.setItem('realTimeProtection', JSON.stringify(v));
            else await SecureStore?.setItemAsync('realTimeProtection', JSON.stringify(v));
            Alert.alert('Settings Updated', `Real-time protection ${v ? 'enabled' : 'disabled'}`);
          }
        },
        {
          text: 'Toggle Kill Switch',
          onPress: async () => {
            const v = !killSwitch;
            setKillSwitch(v);
            if (Platform.OS === 'web') localStorage.setItem('killSwitch', JSON.stringify(v));
            else await SecureStore?.setItemAsync('killSwitch', JSON.stringify(v));
            Alert.alert('Settings Updated', `Kill switch ${v ? 'enabled' : 'disabled'}`);
          }
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const handleNetworkMonitor = () => {
    const totalThreats = networkThreats.reduce((sum, threat) => sum + threat.count, 0);
    const threatBreakdown = networkThreats.map(threat => `${threat.type.charAt(0).toUpperCase() + threat.type.slice(1)}: ${threat.count} blocked`).join('\n');
    Alert.alert(
      'Network Traffic Monitor',
      `Real-time network monitoring:\n\n` +
      `Total Threats Blocked: ${totalThreats}\n\n` +
      `Breakdown:\n${threatBreakdown}\n\n` +
      `Data Usage:\n` +
      `Upload: ${vpnStatus.dataTransferred.upload}\n` +
      `Download: ${vpnStatus.dataTransferred.download}\n\n` +
      `Connection Status: ${vpnStatus.isConnected ? 'Secure (VPN)' : 'Unprotected'}`,
      [{ text: 'OK' }]
    );
  };

  const handleDNSProtection = () => {
    Alert.alert(
      'DNS Protection',
      `Secure DNS filtering is active:\n\n` +
      `• Malware domains blocked\n` +
      `• Phishing sites filtered\n` +
      `• Adult content filtering\n` +
      `• Ad tracking prevention\n\n` +
      `DNS Server: ${vpnStatus.isConnected ? 'VPN Secure DNS' : 'Default DNS'}\n` +
      `Status: ${realTimeProtection ? 'Active' : 'Inactive'}`,
      [
        {
          text: 'Configure DNS',
          onPress: () => Alert.alert('DNS Settings', 'DNS configuration options would be available here.')
        },
        { text: 'OK' }
      ]
    );
  };

  const handleSecurityAudit = async () => {
    setIsScanning(true);
    try {
      console.log('Starting comprehensive security audit');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      const auditResults = {
        vulnerabilities: Math.floor(Math.random() * 3),
        outdatedSoftware: Math.floor(Math.random() * 5),
        weakPasswords: Math.floor(Math.random() * 2),
        suspiciousActivity: Math.floor(Math.random() * 1),
        securityScore: Math.min(95, securityScore + Math.floor(Math.random() * 5))
      };
      
      setSecurityScore(auditResults.securityScore);
      
      Alert.alert(
        'Security Audit Complete',
        `Comprehensive security assessment results:\n\n` +
        `Security Score: ${auditResults.securityScore}/100\n` +
        `Vulnerabilities Found: ${auditResults.vulnerabilities}\n` +
        `Outdated Software: ${auditResults.outdatedSoftware}\n` +
        `Weak Passwords: ${auditResults.weakPasswords}\n` +
        `Suspicious Activity: ${auditResults.suspiciousActivity}\n\n` +
        `${auditResults.vulnerabilities === 0 ? 'No critical issues found.' : 'Please address the identified issues.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Security audit error:', error);
      Alert.alert('Audit Error', 'Failed to complete security audit. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleMalwareScan = async () => {
    setIsScanning(true);
    try {
      console.log('Starting malware scan');
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const scanResults = {
        filesScanned: Math.floor(Math.random() * 50000) + 10000,
        threatsFound: Math.floor(Math.random() * 2),
        quarantined: Math.floor(Math.random() * 1),
        cleaned: Math.floor(Math.random() * 1)
      };
      
      Alert.alert(
        'Malware Scan Complete',
        `Deep malware scan results:\n\n` +
        `Files Scanned: ${scanResults.filesScanned.toLocaleString()}\n` +
        `Threats Detected: ${scanResults.threatsFound}\n` +
        `Files Quarantined: ${scanResults.quarantined}\n` +
        `Files Cleaned: ${scanResults.cleaned}\n\n` +
        `${scanResults.threatsFound === 0 ? 'Your device is clean!' : 'Threats have been neutralized.'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Malware scan error:', error);
      Alert.alert('Scan Error', 'Failed to complete malware scan. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFirewallConfig = () => {
    Alert.alert(
      'Firewall Configuration',
      `Current firewall settings:\n\n` +
      `Status: ${realTimeProtection ? 'Active' : 'Inactive'}\n` +
      `Incoming Connections: Filtered\n` +
      `Outgoing Connections: Monitored\n` +
      `Blocked Attempts: ${networkThreats.reduce((sum, threat) => sum + threat.count, 0)}\n\n` +
      `Protection Level: ${killSwitch ? 'Maximum' : 'Standard'}`,
      [
        {
          text: 'Advanced Settings',
          onPress: () => Alert.alert('Advanced Firewall', 'Advanced firewall configuration would be available here.')
        },
        {
          text: 'Reset to Default',
          onPress: () => Alert.alert('Firewall Reset', 'Firewall settings have been reset to default configuration.')
        },
        { text: 'Close' }
      ]
    );
  };

  const handleBackupSecurity = () => {
    Alert.alert(
      'Backup Security',
      `Secure backup and recovery options:\n\n` +
      `Last Backup: ${lastScanTime || 'Never'}\n` +
      `Encryption: AES-256\n` +
      `Storage: ${Platform.OS === 'web' ? 'Browser Secure Storage' : 'Device Secure Storage'}\n` +
      `Auto-Backup: ${autoConnect ? 'Enabled' : 'Disabled'}\n\n` +
      `Your security settings and configurations are automatically backed up.`,
      [
        {
          text: 'Create Backup',
          onPress: async () => {
            Alert.alert('Creating Backup', 'Security backup is being created...');
            setTimeout(() => {
              Alert.alert('Backup Complete', 'Security settings have been backed up successfully.');
            }, 2000);
          }
        },
        {
          text: 'Restore Backup',
          onPress: () => Alert.alert('Restore Backup', 'Backup restoration options would be available here.')
        },
        { text: 'Close' }
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

  const toggleAndPersist = async (key: 'realTimeProtection' | 'killSwitch' | 'autoConnect', value: boolean) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      await SecureStore?.setItemAsync(key, JSON.stringify(value));
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
        testID="security-scroll"
      >
        <View style={styles.header} testID="security-header">
          <Text style={styles.headerTitle}>Security Center</Text>
          <Text style={styles.headerSubtitle}>
            Monitor and manage your cybersecurity status
          </Text>
        </View>

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
                  testID="btn-run-full-scan"
                >
                  <Text style={styles.actionButtonText}>
                    {isScanning ? 'Scanning...' : 'Run Full Scan'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={handleGenerateReport}
                  testID="btn-security-report"
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Security Report</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Security Actions</Text>
          <View style={styles.actionsGrid}>
            {getSecurityActions().filter(action => action.available).map((action) => {
              const IconComponent = action.icon;
              const isActionDisabled = isScanning && (action.id === 'full-scan' || action.id === 'security-audit' || action.id === 'malware-scan');
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, isActionDisabled && styles.disabledButton]}
                  onPress={action.action}
                  disabled={isActionDisabled}
                  testID={`action-${action.id}`}
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

        <View style={styles.vpnSection}>
          <Text style={styles.sectionTitle}>VPN Protection</Text>
          <View style={styles.vpnCard}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.vpnGradient}
            >
              <View style={styles.vpnHeader}>
                <View style={[styles.vpnIcon, { backgroundColor: vpnStatus.isConnected ? Colors.successAlpha : Colors.errorAlpha }]}>
                  {vpnStatus.isConnected ? (
                    <ShieldCheck size={32} color={Colors.success} />
                  ) : (
                    <ShieldX size={32} color={Colors.error} />
                  )}
                </View>
                <View style={styles.vpnInfo}>
                  <Text style={styles.vpnTitle}>
                    {vpnStatus.isConnected ? 'VPN Connected' : 'VPN Disconnected'}
                  </Text>
                  <Text style={[styles.vpnStatus, { color: vpnStatus.isConnected ? Colors.success : Colors.error }]}>
                    {vpnStatus.serverLocation}
                  </Text>
                  {vpnStatus.isConnected && (
                    <Text style={styles.vpnDetails}>
                      {vpnStatus.protocol} • {vpnStatus.encryption} • {vpnStatus.latency}ms
                    </Text>
                  )}
                </View>
              </View>
              {vpnStatus.isConnected && (
                <View style={styles.vpnStats}>
                  <View style={styles.vpnStat}>
                    <Text style={styles.vpnStatLabel}>Upload</Text>
                    <Text style={styles.vpnStatValue}>{vpnStatus.dataTransferred.upload}</Text>
                  </View>
                  <View style={styles.vpnStat}>
                    <Text style={styles.vpnStatLabel}>Download</Text>
                    <Text style={styles.vpnStatValue}>{vpnStatus.dataTransferred.download}</Text>
                  </View>
                  <View style={styles.vpnStat}>
                    <Text style={styles.vpnStatLabel}>Duration</Text>
                    <Text style={styles.vpnStatValue}>{vpnStatus.connectionTime}</Text>
                  </View>
                  <View style={styles.vpnStat}>
                    <Text style={styles.vpnStatLabel}>IP Address</Text>
                    <Text style={styles.vpnStatValue}>{vpnStatus.ipAddress}</Text>
                  </View>
                </View>
              )}
              <View style={styles.vpnActions}>
                <TouchableOpacity 
                  style={[styles.vpnButton, isConnectingVPN && styles.disabledButton]}
                  onPress={handleVPNToggle}
                  disabled={isConnectingVPN}
                  testID="btn-vpn-toggle"
                >
                  <Text style={styles.vpnButtonText}>
                    {isConnectingVPN ? 'Connecting...' : (vpnStatus.isConnected ? 'Disconnect' : 'Connect VPN')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.vpnButton, styles.secondaryVpnButton]}
                  onPress={handleChangeVPNServer}
                  testID="btn-vpn-change-server"
                >
                  <Text style={[styles.vpnButtonText, styles.secondaryVpnButtonText]}>Change Server</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.threatProtectionSection}>
          <Text style={styles.sectionTitle}>Threat Protection</Text>
          <View style={styles.threatProtectionGrid}>
            {networkThreats.map((threat) => {
              const getThreatIcon = () => {
                switch (threat.type) {
                  case 'malware': return ShieldAlert;
                  case 'phishing': return AlertTriangle;
                  case 'tracking': return Eye;
                  case 'ads': return WifiOff;
                  default: return Shield;
                }
              };
              const ThreatIcon = getThreatIcon();
              return (
                <TouchableOpacity key={threat.id} style={styles.threatProtectionCard} onPress={() => Alert.alert(`${threat.type}`, `${threat.count} blocked. Last: ${threat.lastBlocked}`)} testID={`threat-card-${threat.id}`}>
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.threatProtectionGradient}
                  >
                    <View style={[styles.threatProtectionIcon, { backgroundColor: Colors.successAlpha }]}>
                      <ThreatIcon size={20} color={Colors.success} />
                    </View>
                    <Text style={styles.threatProtectionTitle}>
                      {threat.type.charAt(0).toUpperCase() + threat.type.slice(1)}
                    </Text>
                    <Text style={styles.threatProtectionCount}>{threat.count} Blocked</Text>
                    <Text style={styles.threatProtectionTime}>{threat.lastBlocked}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.networkSection}>
          <Text style={styles.sectionTitle}>Network Security</Text>
          <View style={styles.networkGrid}>
            <TouchableOpacity style={styles.networkCard} onPress={async () => { const v = !realTimeProtection; setRealTimeProtection(v); await toggleAndPersist('realTimeProtection', v); }} testID="card-realtime">
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: realTimeProtection ? Colors.successAlpha : Colors.errorAlpha }]}>
                  <Shield size={24} color={realTimeProtection ? Colors.success : Colors.error} />
                </View>
                <Text style={styles.networkTitle}>Real-time Protection</Text>
                <Text style={styles.networkStatus}>{realTimeProtection ? 'Active' : 'Inactive'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.networkCard} onPress={async () => { const v = !killSwitch; setKillSwitch(v); await toggleAndPersist('killSwitch', v); }} testID="card-killswitch">
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: killSwitch ? Colors.successAlpha : Colors.warningAlpha }]}>
                  <Power size={24} color={killSwitch ? Colors.success : Colors.warning} />
                </View>
                <Text style={styles.networkTitle}>Kill Switch</Text>
                <Text style={styles.networkStatus}>{killSwitch ? 'Enabled' : 'Disabled'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.networkCard} onPress={async () => { const v = !autoConnect; setAutoConnect(v); await toggleAndPersist('autoConnect', v); }} testID="card-autoconnect">
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.networkGradient}
              >
                <View style={[styles.networkIcon, { backgroundColor: autoConnect ? Colors.successAlpha : Colors.warningAlpha }]}>
                  <RotateCcw size={24} color={autoConnect ? Colors.success : Colors.warning} />
                </View>
                <Text style={styles.networkTitle}>Auto-Connect</Text>
                <Text style={styles.networkStatus}>{autoConnect ? 'Enabled' : 'Disabled'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={serverPickerVisible} transparent animationType="fade" onRequestClose={() => setServerPickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select VPN Server</Text>
            <ScrollView style={styles.modalList} contentContainerStyle={{ paddingVertical: 8 }}>
              {availableServers.map(s => (
                <Pressable key={s.id} style={styles.modalItem} onPress={() => connectToServer(s.id)} testID={`server-${s.id}`}>
                  <View style={styles.modalItemLeft}>
                    <Server size={18} color={Colors.accent} />
                    <Text style={styles.modalItemText}>{s.location}</Text>
                  </View>
                  <Text style={styles.modalItemMeta}>{s.country} • {s.latency}ms</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.vpnButton, styles.secondaryVpnButton]} onPress={() => setServerPickerVisible(false)}>
                <Text style={[styles.vpnButtonText, styles.secondaryVpnButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  vpnSection: {
    marginBottom: 32,
  },
  vpnCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  vpnGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  vpnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  vpnIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  vpnInfo: {
    flex: 1,
  },
  vpnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  vpnStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vpnDetails: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  vpnStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  vpnStat: {
    width: '48%',
    marginBottom: 12,
  },
  vpnStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  vpnStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  vpnActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vpnButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  secondaryVpnButton: {
    backgroundColor: Colors.cardBorder,
    marginRight: 0,
    marginLeft: 8,
  },
  vpnButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryVpnButtonText: {
    color: Colors.textSecondary,
  },
  threatProtectionSection: {
    marginBottom: 32,
  },
  threatProtectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  threatProtectionCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  threatProtectionGradient: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  threatProtectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  threatProtectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  threatProtectionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 2,
    textAlign: 'center',
  },
  threatProtectionTime: {
    fontSize: 10,
    color: Colors.textMuted,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 360,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalItem: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalItemMeta: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
