import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Calendar, AlertTriangle, MapPin, Clock, CheckCircle, Ticket, User, Send, Paperclip } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';
import { useTickets } from '@/providers/tickets-provider';

interface TicketMessage {
  id: string;
  sender: string;
  senderType: 'client' | 'tech';
  message: string;
  timestamp: string;
  attachments?: string[];
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { getTicketById, updateTicketStatus } = useTickets();
  const insets = useSafeAreaInsets();
  const [newMessage, setNewMessage] = useState('');
  const isBusinessAccount = user?.planType === 'business';
  
  const ticket = getTicketById(id as string);

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

  // Mock messages for demo - in real app, these would come from the ticket
  const mockMessages: TicketMessage[] = ticket ? [
    {
      id: '1',
      sender: user?.name || 'Demo Client',
      senderType: 'client',
      message: ticket.description,
      timestamp: ticket.createdAt
    },
    {
      id: '2',
      sender: ticket.assignedTo || 'Support Tech',
      senderType: 'tech',
      message: 'Hello! I\'ve received your ticket and will start working on this issue. I\'ll keep you updated on the progress.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
    }
  ] : [];

  if (!ticket) {
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
          <Text style={styles.headerTitle}>Ticket Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ticket not found</Text>
        </View>
      </LinearGradient>
    );
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return Ticket;
      case 'pending': return Clock;
      case 'closed': return CheckCircle;
      default: return Ticket;
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      Alert.alert('Message Sent', 'Your message has been sent to the support team.');
      setNewMessage('');
    }
  };

  const handleStatusChange = () => {
    Alert.alert(
      'Change Status',
      'What would you like to do with this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark as Resolved', 
          onPress: async () => {
            try {
              await updateTicketStatus(ticket.id, 'closed');
              Alert.alert('Success', 'Ticket marked as resolved');
            } catch (error) {
              Alert.alert('Error', 'Failed to update ticket status');
            }
          }
        },
        { text: 'Request Update', onPress: () => Alert.alert('Success', 'Update requested from support team') }
      ]
    );
  };

  const StatusIcon = getStatusIcon(ticket.status);

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
        <Text style={styles.headerTitle}>Ticket #{ticket.id}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleStatusChange}
        >
          <Text style={styles.actionButtonText}>Actions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Ticket Info Card */}
        <View style={styles.ticketInfoCard}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.cardGradient}
          >
            <View style={styles.ticketHeader}>
              <View style={styles.ticketTitleRow}>
                <Text style={styles.ticketTitle}>{ticket.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                  <StatusIcon size={12} color={getStatusColor(ticket.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                    {ticket.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.categoryRow}>
                <View style={[styles.categoryBadge, { backgroundColor: ticket.supportType === 'it' ? Colors.accentAlpha : Colors.primaryAlpha }]}>
                  <Text style={[styles.categoryText, { color: ticket.supportType === 'it' ? Colors.accent : Colors.primary }]}>
                    {getCategoryName(ticket.supportType)}
                  </Text>
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
                  <AlertTriangle size={12} color={getPriorityColor(ticket.priority)} />
                  <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                    {ticket.priority.toUpperCase()} Priority
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.ticketDescription}>{ticket.description}</Text>
            
            <View style={styles.ticketMeta}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>Created {formatTimeAgo(ticket.createdAt)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.textMuted} />
                  <Text style={styles.metaText}>Updated {formatTimeAgo(ticket.updatedAt)}</Text>
                </View>
              </View>
              
              <View style={styles.metaRow}>
                {isBusinessAccount && (
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={Colors.textMuted} />
                    <Text style={styles.metaText}>IP: 192.168.1.{Math.floor(Math.random() * 255)}</Text>
                  </View>
                )}
                {ticket.assignedTo && (
                  <View style={styles.metaItem}>
                    <User size={14} color={Colors.accent} />
                    <Text style={[styles.metaText, { color: Colors.accent }]}>Assigned to {ticket.assignedTo}</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Messages */}
        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          
          {mockMessages.map((message) => (
            <View key={message.id} style={[
              styles.messageCard,
              message.senderType === 'client' ? styles.clientMessage : styles.techMessage
            ]}>
              <LinearGradient
                colors={message.senderType === 'client' 
                  ? [Colors.primaryAlpha, Colors.cardBackground]
                  : [Colors.cardBackground, '#2A2A2A']
                }
                style={styles.messageGradient}
              >
                <View style={styles.messageHeader}>
                  <View style={styles.senderInfo}>
                    <View style={[
                      styles.senderIcon,
                      { backgroundColor: message.senderType === 'client' ? Colors.primaryAlpha : Colors.accentAlpha }
                    ]}>
                      <User size={16} color={message.senderType === 'client' ? Colors.primary : Colors.accent} />
                    </View>
                    <Text style={styles.senderName}>{message.sender}</Text>
                    <View style={[
                      styles.senderTypeBadge,
                      { backgroundColor: message.senderType === 'client' ? Colors.primaryAlpha : Colors.accentAlpha }
                    ]}>
                      <Text style={[
                        styles.senderTypeText,
                        { color: message.senderType === 'client' ? Colors.primary : Colors.accent }
                      ]}>
                        {message.senderType === 'client' ? 'Client' : 'Tech'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.messageTime}>{formatTimeAgo(message.timestamp)}</Text>
                </View>
                <Text style={styles.messageText}>{message.message}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Message Input */}
      <View style={[styles.messageInput, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor={Colors.textMuted}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: newMessage.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.accentAlpha,
    borderRadius: 8,
  },
  actionButtonText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  ticketInfoCard: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  ticketTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 16,
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  ticketDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  ticketMeta: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  messagesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  messageCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clientMessage: {
    marginLeft: 20,
  },
  techMessage: {
    marginRight: 20,
  },
  messageGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  senderTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  senderTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  messageInput: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.backgroundStart,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  attachButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
});