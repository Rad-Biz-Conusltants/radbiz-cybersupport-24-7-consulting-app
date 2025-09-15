import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, Calendar, AlertTriangle, MapPin, Clock, CheckCircle, Ticket } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { useTickets } from '@/providers/tickets-provider';



export default function AllTicketsScreen() {
  const { user } = useAuth();
  const { tickets, isLoading } = useTickets();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'pending' | 'closed'>('all');
  const isBusinessAccount = user?.planType === 'business';

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const getCategoryName = (supportType: string) => {
    return supportType === 'it' ? 'IT Support' : 'Cybersecurity';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Ticket;
      case 'pending': return Clock;
      case 'closed': return CheckCircle;
      default: return Ticket;
    }
  };

  const handleTicketPress = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <LinearGradient
      colors={[Colors.backgroundStart, Colors.backgroundEnd]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Tickets</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tickets..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'open', 'pending', 'closed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                filterStatus === status && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus(status as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.ticketsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTickets.map((ticket) => {
          const StatusIcon = getStatusIcon(ticket.status);
          return (
            <TouchableOpacity
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => handleTicketPress(ticket.id)}
            >
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.cardGradient}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketInfo}>
                    <View style={styles.ticketIdRow}>
                      <Text style={styles.ticketId}>#{ticket.id}</Text>
                      <View style={[styles.categoryBadge, { backgroundColor: ticket.supportType === 'it' ? Colors.accentAlpha : Colors.primaryAlpha }]}>
                        <Text style={[styles.categoryText, { color: ticket.supportType === 'it' ? Colors.accent : Colors.primary }]}>
                          {getCategoryName(ticket.supportType)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.ticketTitle}>{ticket.title}</Text>
                    <Text style={styles.ticketDescription} numberOfLines={2}>
                      {ticket.description}
                    </Text>
                  </View>
                  <View style={styles.ticketMeta}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                      <StatusIcon size={12} color={getStatusColor(ticket.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                        {ticket.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketDetailItem}>
                    <Calendar size={14} color={Colors.textMuted} />
                    <Text style={styles.ticketDetailText}>Created {formatTimeAgo(ticket.createdAt)}</Text>
                  </View>
                  <View style={styles.ticketDetailItem}>
                    <Clock size={14} color={Colors.textMuted} />
                    <Text style={styles.ticketDetailText}>Updated {formatTimeAgo(ticket.updatedAt)}</Text>
                  </View>
                  <View style={styles.ticketDetailItem}>
                    <AlertTriangle size={14} color={getPriorityColor(ticket.priority)} />
                    <Text style={[styles.ticketDetailText, { color: getPriorityColor(ticket.priority) }]}>
                      {ticket.priority.toUpperCase()} Priority
                    </Text>
                  </View>
                  {isBusinessAccount && (
                    <View style={styles.ticketDetailItem}>
                      <MapPin size={14} color={Colors.textMuted} />
                      <Text style={styles.ticketDetailText}>192.168.1.{Math.floor(Math.random() * 255)}</Text>
                    </View>
                  )}
                </View>
                
                {ticket.assignedTo && (
                  <View style={styles.assignedContainer}>
                    <Text style={styles.assignedLabel}>Assigned to:</Text>
                    <Text style={styles.assignedName}>{ticket.assignedTo}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Loading tickets...</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ticket size={48} color={Colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No tickets found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search terms' : tickets.length === 0 ? 'No tickets created yet' : 'No tickets match the selected filter'}
            </Text>
          </View>
        ) : null}
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
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryAlpha,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  ticketsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ticketCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  ticketDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  ticketDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
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
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  assignedLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 8,
  },
  assignedName: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});