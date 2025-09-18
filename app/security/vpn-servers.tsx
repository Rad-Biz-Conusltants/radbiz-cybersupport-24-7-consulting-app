import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wifi, Shield, ArrowLeft, CheckCircle, Clock, Signal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/colors';

interface VPNServer {
  id: string;
  location: string;
  country: string;
  ip: string;
  latency: number;
  load: number;
  isRecommended?: boolean;
  isPremium?: boolean;
}

export default function VPNServersScreen() {
  const insets = useSafeAreaInsets();
  const [servers, setServers] = useState<VPNServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [currentServer, setCurrentServer] = useState<string | null>(null);

  useEffect(() => {
    initializeServers();
    loadCurrentServer();
  }, []);

  const initializeServers = async () => {
    try {
      const serverList: VPNServer[] = [
        { id: 'ny-us', location: 'New York, NY', country: 'United States', ip: '198.51.100.42', latency: 22, load: 45, isRecommended: true },
        { id: 'la-us', location: 'Los Angeles, CA', country: 'United States', ip: '198.51.100.43', latency: 28, load: 62 },
        { id: 'chi-us', location: 'Chicago, IL', country: 'United States', ip: '198.51.100.44', latency: 35, load: 38 },
        { id: 'mia-us', location: 'Miami, FL', country: 'United States', ip: '198.51.100.45', latency: 41, load: 55 },
        { id: 'ldn-uk', location: 'London, UK', country: 'United Kingdom', ip: '203.0.113.15', latency: 46, load: 72 },
        { id: 'man-uk', location: 'Manchester, UK', country: 'United Kingdom', ip: '203.0.113.16', latency: 52, load: 41 },
        { id: 'fra-de', location: 'Frankfurt, DE', country: 'Germany', ip: '203.0.113.44', latency: 70, load: 33, isPremium: true },
        { id: 'ber-de', location: 'Berlin, DE', country: 'Germany', ip: '203.0.113.45', latency: 75, load: 58 },
        { id: 'par-fr', location: 'Paris, FR', country: 'France', ip: '203.0.113.46', latency: 68, load: 49 },
        { id: 'ams-nl', location: 'Amsterdam, NL', country: 'Netherlands', ip: '203.0.113.47', latency: 65, load: 44 },
        { id: 'zur-ch', location: 'Zurich, CH', country: 'Switzerland', ip: '203.0.113.48', latency: 78, load: 29, isPremium: true },
        { id: 'tky-jp', location: 'Tokyo, JP', country: 'Japan', ip: '192.0.2.123', latency: 118, load: 67 },
        { id: 'osa-jp', location: 'Osaka, JP', country: 'Japan', ip: '192.0.2.124', latency: 125, load: 52 },
        { id: 'syd-au', location: 'Sydney, AU', country: 'Australia', ip: '198.51.100.89', latency: 152, load: 41 },
        { id: 'mel-au', location: 'Melbourne, AU', country: 'Australia', ip: '198.51.100.90', latency: 158, load: 36 },
        { id: 'sin-sg', location: 'Singapore, SG', country: 'Singapore', ip: '192.0.2.88', latency: 110, load: 73 },
        { id: 'hk-hk', location: 'Hong Kong, HK', country: 'Hong Kong', ip: '192.0.2.89', latency: 105, load: 81 },
        { id: 'tor-ca', location: 'Toronto, CA', country: 'Canada', ip: '198.51.100.61', latency: 38, load: 47 },
        { id: 'van-ca', location: 'Vancouver, CA', country: 'Canada', ip: '198.51.100.62', latency: 42, load: 39 },
        { id: 'sao-br', location: 'São Paulo, BR', country: 'Brazil', ip: '203.0.113.77', latency: 140, load: 56 },
        { id: 'rio-br', location: 'Rio de Janeiro, BR', country: 'Brazil', ip: '203.0.113.78', latency: 145, load: 63 },
        { id: 'mum-in', location: 'Mumbai, IN', country: 'India', ip: '192.0.2.90', latency: 165, load: 78 },
        { id: 'del-in', location: 'New Delhi, IN', country: 'India', ip: '192.0.2.91', latency: 172, load: 69 },
        { id: 'seo-kr', location: 'Seoul, KR', country: 'South Korea', ip: '192.0.2.92', latency: 135, load: 54 },
        { id: 'ist-tr', location: 'Istanbul, TR', country: 'Turkey', ip: '203.0.113.79', latency: 95, load: 61 },
        { id: 'dub-ae', location: 'Dubai, AE', country: 'UAE', ip: '203.0.113.80', latency: 125, load: 48, isPremium: true },
        { id: 'joh-za', location: 'Johannesburg, ZA', country: 'South Africa', ip: '203.0.113.81', latency: 180, load: 34 },
      ];
      setServers(serverList);
    } catch (error) {
      console.error('Error initializing servers:', error);
    }
  };

  const loadCurrentServer = async () => {
    try {
      if (Platform.OS === 'web') {
        const current = localStorage.getItem('currentVPNServer');
        if (current) setCurrentServer(current);
      } else {
        // For mobile, we'd use SecureStore here
        setCurrentServer('ny-us'); // Default for demo
      }
    } catch (error) {
      console.error('Error loading current server:', error);
    }
  };

  const connectToServer = async (serverId: string) => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setSelectedServer(serverId);
    
    try {
      const server = servers.find(s => s.id === serverId);
      if (!server) throw new Error('Server not found');
      
      console.log(`Connecting to VPN server: ${server.location}`);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save current server
      if (Platform.OS === 'web') {
        localStorage.setItem('currentVPNServer', serverId);
      } else {
        // For mobile, we'd use SecureStore here
      }
      
      setCurrentServer(serverId);
      
      Alert.alert(
        'VPN Connected',
        `Successfully connected to ${server.location}\n\nIP: ${server.ip}\nLatency: ${server.latency}ms\nLoad: ${server.load}%`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('VPN connection error:', error);
      Alert.alert(
        'Connection Failed',
        `Failed to connect to VPN server. Please try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsConnecting(false);
      setSelectedServer(null);
    }
  };

  const getServerStatusColor = (latency: number, load: number) => {
    if (latency < 50 && load < 50) return Colors.success;
    if (latency < 100 && load < 70) return Colors.warning;
    return Colors.error;
  };

  const getLoadColor = (load: number) => {
    if (load < 50) return Colors.success;
    if (load < 80) return Colors.warning;
    return Colors.error;
  };

  const sortedServers = servers.sort((a, b) => {
    // Recommended servers first
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    
    // Then by latency
    return a.latency - b.latency;
  });

  const groupedServers = sortedServers.reduce((acc, server) => {
    if (!acc[server.country]) {
      acc[server.country] = [];
    }
    acc[server.country].push(server);
    return acc;
  }, {} as Record<string, VPNServer[]>);

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          testID="btn-back"
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VPN Servers</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="servers-scroll"
      >
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.infoGradient}
            >
              <View style={styles.infoHeader}>
                <View style={[styles.infoIcon, { backgroundColor: Colors.primaryAlpha }]}>
                  <Shield size={24} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Choose Your Server</Text>
                  <Text style={styles.infoDescription}>
                    Select the best server location for optimal speed and security
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {Object.entries(groupedServers).map(([country, countryServers]) => (
          <View key={country} style={styles.countrySection}>
            <Text style={styles.countryTitle}>{country}</Text>
            <View style={styles.serversList}>
              {countryServers.map((server) => {
                const isCurrentServer = currentServer === server.id;
                const isServerConnecting = selectedServer === server.id && isConnecting;
                const statusColor = getServerStatusColor(server.latency, server.load);
                
                return (
                  <TouchableOpacity
                    key={server.id}
                    style={[
                      styles.serverCard,
                      isCurrentServer && styles.currentServerCard
                    ]}
                    onPress={() => connectToServer(server.id)}
                    disabled={isConnecting}
                    testID={`server-${server.id}`}
                  >
                    <LinearGradient
                      colors={[
                        isCurrentServer ? Colors.primaryAlpha : Colors.cardBackground,
                        isCurrentServer ? Colors.primary + '20' : '#2A2A2A'
                      ]}
                      style={styles.serverGradient}
                    >
                      <View style={styles.serverHeader}>
                        <View style={styles.serverInfo}>
                          <View style={styles.serverTitleRow}>
                            <Text style={[
                              styles.serverLocation,
                              isCurrentServer && styles.currentServerText
                            ]}>
                              {server.location}
                            </Text>
                            <View style={styles.serverBadges}>
                              {server.isRecommended && (
                                <View style={[styles.badge, styles.recommendedBadge]}>
                                  <Text style={styles.badgeText}>RECOMMENDED</Text>
                                </View>
                              )}
                              {server.isPremium && (
                                <View style={[styles.badge, styles.premiumBadge]}>
                                  <Text style={styles.badgeText}>PREMIUM</Text>
                                </View>
                              )}
                            </View>
                          </View>
                          
                          <View style={styles.serverStats}>
                            <View style={styles.stat}>
                              <Signal size={14} color={statusColor} />
                              <Text style={[styles.statText, { color: statusColor }]}>
                                {server.latency}ms
                              </Text>
                            </View>
                            <View style={styles.stat}>
                              <Wifi size={14} color={getLoadColor(server.load)} />
                              <Text style={[styles.statText, { color: getLoadColor(server.load) }]}>
                                {server.load}% load
                              </Text>
                            </View>
                            <Text style={styles.serverIP}>{server.ip}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.serverActions}>
                          {isServerConnecting ? (
                            <View style={[styles.statusIndicator, styles.connectingIndicator]}>
                              <Clock size={16} color={Colors.warning} />
                              <Text style={[styles.statusText, { color: Colors.warning }]}>Connecting...</Text>
                            </View>
                          ) : isCurrentServer ? (
                            <View style={[styles.statusIndicator, styles.connectedIndicator]}>
                              <CheckCircle size={16} color={Colors.success} />
                              <Text style={[styles.statusText, { color: Colors.success }]}>Connected</Text>
                            </View>
                          ) : (
                            <TouchableOpacity 
                              style={styles.connectButton}
                              onPress={() => connectToServer(server.id)}
                            >
                              <Text style={styles.connectButtonText}>Connect</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  countrySection: {
    marginBottom: 24,
  },
  countryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  serversList: {
    gap: 12,
  },
  serverCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  currentServerCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  serverGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverInfo: {
    flex: 1,
    marginRight: 16,
  },
  serverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serverLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  currentServerText: {
    color: Colors.primary,
  },
  serverBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedBadge: {
    backgroundColor: Colors.successAlpha,
  },
  premiumBadge: {
    backgroundColor: Colors.accentAlpha,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  serverStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serverIP: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  serverActions: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  connectedIndicator: {
    backgroundColor: Colors.successAlpha,
  },
  connectingIndicator: {
    backgroundColor: Colors.warningAlpha,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});