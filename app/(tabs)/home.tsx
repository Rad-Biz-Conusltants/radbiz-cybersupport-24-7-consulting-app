import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Monitor, ArrowRight, CheckCircle, Clock, Users, Ticket, AlertTriangle, DollarSign, Plus, Eye, MapPin, Calendar } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { useTickets } from '@/providers/tickets-provider';

function ClientDashboard() {
  const { user } = useAuth();
  const { ticketStats, accountBalance, tickets, isLoading } = useTickets();
  const insets = useSafeAreaInsets();
  const isBusinessAccount = user?.planType === 'business';

  const businessStats = {
    ticketBalance: accountBalance.ticketBalance,
    usedTickets: accountBalance.usedTickets,
    totalTickets: accountBalance.totalTickets,
    authorizedUsers: 8,
    maxUsers: 25
  };

  // Get recent tickets (last 5)
  const recentTickets = tickets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(ticket => ({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      created: formatTimeAgo(ticket.createdAt),
      ip: '192.168.1.' + Math.floor(Math.random() * 255) // Mock IP for business accounts
    }));

  function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return Colors.error;
      case 'pending': return Colors.warning;
      case 'closed': return Colors.success;
      default: return Colors.textMuted;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      case 'low': return Colors.success;
      default: return Colors.textMuted;
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
        <View style={styles.dashboardHeader}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/adaptive-icon.png')}
              style={styles.dashboardLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
            <View style={styles.accountTypeContainer}>
              <View style={[styles.accountTypeBadge, { backgroundColor: isBusinessAccount ? Colors.primaryAlpha : Colors.accentAlpha }]}>
                <Text style={[styles.accountTypeText, { color: isBusinessAccount ? Colors.primary : Colors.accent }]}>
                  {isBusinessAccount ? 'Business Account' : 'Personal Account'}
                </Text>
              </View>
            </View>
            {user?.company && (
              <Text style={styles.companyName}>{user.company}</Text>
            )}
          </View>

        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/tickets?filter=open')}
          >
            <View style={[styles.statIcon, { backgroundColor: Colors.errorAlpha }]}>
              <Ticket size={20} color={Colors.error} />
            </View>
            <Text style={styles.statValue}>{ticketStats.open}</Text>
            <Text style={styles.statLabel}>Open Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/tickets?filter=closed')}
          >
            <View style={[styles.statIcon, { backgroundColor: Colors.successAlpha }]}>
              <CheckCircle size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{ticketStats.closed}</Text>
            <Text style={styles.statLabel}>Closed Tickets</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/tickets?filter=pending')}
          >
            <View style={[styles.statIcon, { backgroundColor: Colors.warningAlpha }]}>
              <Clock size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{ticketStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/tickets')}
          >
            <View style={[styles.statIcon, { backgroundColor: Colors.accentAlpha }]}>
              <AlertTriangle size={20} color={Colors.accent} />
            </View>
            <Text style={styles.statValue}>{ticketStats.monthlyTotal}</Text>
            <Text style={styles.statLabel}>Monthly Total {new Date().getFullYear()}</Text>
          </TouchableOpacity>
        </View>

        {/* Business Account Advanced Features */}
        {isBusinessAccount && (
          <View style={styles.businessSection}>
            <Text style={styles.sectionTitle}>Business Dashboard</Text>
            
            {/* Account Ticket Balance */}
            <View style={styles.businessCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.cardGradient}
              >
                <View style={styles.businessHeader}>
                  <View style={[styles.businessIcon, { backgroundColor: Colors.primaryAlpha }]}>
                    <Ticket size={24} color={Colors.primary} />
                  </View>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessTitle}>Account Ticket Balance</Text>
                    <Text style={styles.businessValue}>{businessStats.ticketBalance}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.addCreditsButton}
                    onPress={() => router.push('/credits/add')}
                  >
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.addCreditsText}>Add Credits</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.usageBar}>
                  <View style={styles.usageBarBackground}>
                    <View 
                      style={[
                        styles.usageBarFill, 
                        { 
                          width: `${(businessStats.usedTickets / businessStats.totalTickets) * 100}%`,
                          backgroundColor: Colors.primary
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.usageText}>
                    {businessStats.usedTickets}/{businessStats.totalTickets} tickets used this month
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Authorized Users */}
            <View style={styles.businessCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.cardGradient}
              >
                <View style={styles.businessHeader}>
                  <View style={[styles.businessIcon, { backgroundColor: Colors.accentAlpha }]}>
                    <Users size={24} color={Colors.accent} />
                  </View>
                  <View style={styles.businessInfo}>
                    <Text style={styles.businessTitle}>Authorized Users</Text>
                    <Text style={styles.businessValue}>{businessStats.authorizedUsers}/{businessStats.maxUsers}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.manageButton}
                    onPress={() => router.push('/users/manage')}
                  >
                    <Text style={styles.manageButtonText}>Manage</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Recent Tickets */}
        <View style={styles.ticketsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/tickets')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color={Colors.accent} />
            </TouchableOpacity>
          </View>
          
          {recentTickets.map((ticket) => (
            <TouchableOpacity 
              key={ticket.id} 
              style={styles.ticketCard}
              onPress={() => router.push(`/tickets/${ticket.id}`)}
            >
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.cardGradient}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketId}>#{ticket.id}</Text>
                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
                  </View>
                  <View style={styles.ticketMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetailItem}>
                    <Calendar size={14} color={Colors.textMuted} />
                    <Text style={styles.ticketDetailText}>{ticket.created}</Text>
                  </View>
                  <View style={styles.ticketDetailItem}>
                    <AlertTriangle size={14} color={getPriorityColor(ticket.priority)} />
                    <Text style={[styles.ticketDetailText, { color: getPriorityColor(ticket.priority) }]}>
                      {ticket.priority.toUpperCase()}
                    </Text>
                  </View>
                  {isBusinessAccount && (
                    <View style={styles.ticketDetailItem}>
                      <MapPin size={14} color={Colors.textMuted} />
                      <Text style={styles.ticketDetailText}>{ticket.ip}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/tickets/new')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.actionGradient}
              >
                <Plus size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>New Ticket</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/support')}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark]}
                style={styles.actionGradient}
              >
                <Eye size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Get Live Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

export default function SupportSelectionScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  if (user) {
    return <ClientDashboard />;
  }

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
              <Text style={styles.landingStatValue}>{stat.value}</Text>
              <Text style={styles.landingStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.supportOptions}>
          <Text style={styles.landingSectionTitle}>Which support do you need?</Text>
          
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
  landingStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  landingStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  supportOptions: {
    marginBottom: 40,
  },
  landingSectionTitle: {
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
  // Dashboard Styles
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  dashboardLogo: {
    width: 50,
    height: 50,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  accountTypeContainer: {
    marginBottom: 4,
  },
  accountTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  accountTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  companyName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addCreditsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: 8,
  },
  addCreditsText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  businessSection: {
    marginBottom: 32,
  },
  businessCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  businessValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  manageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.accentAlpha,
    borderRadius: 8,
  },
  manageButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  usageBar: {
    marginTop: 8,
  },
  usageBarBackground: {
    height: 8,
    backgroundColor: Colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ticketsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.accent,
    marginRight: 4,
    fontWeight: '600',
  },
  ticketCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketId: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ticketDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  ticketDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketDetailText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  actionsSection: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
});