import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, AlertCircle, CheckCircle, Clock, TrendingUp, Activity, Zap, Lock } from 'lucide-react-native';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/providers/subscription-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const insets = useSafeAreaInsets();

  const securityScore = 92;
  const threats = {
    blocked: 147,
    resolved: 23,
    monitoring: 5,
  };

  const recentActivity = [
    { id: 1, type: 'success', message: 'Security scan completed', time: '2 min ago', icon: CheckCircle },
    { id: 2, type: 'warning', message: 'Unusual login attempt blocked', time: '1 hour ago', icon: AlertCircle },
    { id: 3, type: 'info', message: 'Firewall rules updated', time: '3 hours ago', icon: Shield },
    { id: 4, type: 'success', message: 'Backup completed successfully', time: '5 hours ago', icon: CheckCircle },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#64748B';
    }
  };

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || 'User'}</Text>
          <Text style={styles.planText}>
            {subscription?.plan === 'business' ? 'Small Business' : 'Individual'} Plan • {subscription?.status || 'Active'}
          </Text>
        </View>

        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.scoreGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.scoreHeader}>
              <Shield size={24} color="#FFFFFF" />
              <Text style={styles.scoreTitle}>Security Score</Text>
            </View>
            <Text style={styles.scoreValue}>{securityScore}%</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreProgress, { width: `${securityScore}%` }]} />
            </View>
            <Text style={styles.scoreStatus}>Excellent Protection</Text>
          </LinearGradient>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#EF444420' }]}>
              <AlertCircle size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{threats.blocked}</Text>
            <Text style={styles.statLabel}>Threats Blocked</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <CheckCircle size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{threats.resolved}</Text>
            <Text style={styles.statLabel}>Issues Resolved</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Activity size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{threats.monitoring}</Text>
            <Text style={styles.statLabel}>Active Monitors</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
                <Zap size={24} color="#3B82F6" />
              </View>
              <Text style={styles.actionText}>Quick Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
                <Lock size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.actionText}>Security Audit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
                <Shield size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Update Rules</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
                <TrendingUp size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentActivity.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIconContainer, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                <activity.icon size={20} color={getActivityColor(activity.type)} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityMessage}>{activity.message}</Text>
                <View style={styles.activityTime}>
                  <Clock size={12} color="#64748B" />
                  <Text style={styles.activityTimeText}>{activity.time}</Text>
                </View>
              </View>
            </View>
          ))}
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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  scoreCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scoreGradient: {
    padding: 24,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#FFFFFF30',
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  scoreStatus: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activitySection: {
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityTimeText: {
    fontSize: 12,
    color: '#64748B',
  },
});