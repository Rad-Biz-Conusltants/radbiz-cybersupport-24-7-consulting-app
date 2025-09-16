import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Monitor, Zap, Send, Paperclip, User, Star, Clock, CheckCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSupport, QueueItem } from '@/providers/support-provider';
import ChatInterface from '@/components/ChatInterface';
import QueueStatus from '@/components/QueueStatus';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { 
    agents, 
    startChat, 
    setCurrentSession,
    getSupportStats,
    isConnecting 
  } = useSupport();
  
  const [message, setMessage] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [currentQueueItem, setCurrentQueueItem] = useState<QueueItem | null>(null);

  const stats = getSupportStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return Colors.success;
      case 'busy': return Colors.warning;
      case 'offline': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  const handleFindNextAvailable = async () => {
    try {
      const result = await startChat('general');
      
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setShowChatModal(true);
      } else if (result.queueItem) {
        setCurrentQueueItem(result.queueItem);
        setShowQueueModal(true);
        Alert.alert(
          'Added to Queue',
          `All agents are currently busy. You're position ${result.queueItem.priority} in queue with an estimated wait time of ${result.queueItem.estimatedWaitTime} minutes.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to support. Please try again.');
      console.error('Failed to start chat:', error);
    }
  };

  const handleRemoteAssistance = async () => {
    try {
      const result = await startChat('remote-assistance');
      
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setShowChatModal(true);
      } else if (result.queueItem) {
        setCurrentQueueItem(result.queueItem);
        setShowQueueModal(true);
        Alert.alert(
          'Added to Queue',
          `All remote assistance specialists are currently busy. You're in queue with an estimated wait time of ${result.queueItem.estimatedWaitTime} minutes.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request remote assistance. Please try again.');
      console.error('Failed to start remote assistance:', error);
    }
  };

  const handleUrgentConnection = async () => {
    try {
      const result = await startChat('urgent');
      
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setShowChatModal(true);
      } else if (result.queueItem) {
        setCurrentQueueItem(result.queueItem);
        setShowQueueModal(true);
        Alert.alert(
          'Priority Queue',
          `You've been added to our priority queue. Estimated wait time: ${result.queueItem.estimatedWaitTime} minutes.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to urgent support. Please try again.');
      console.error('Failed to start urgent chat:', error);
    }
  };

  const handleSendQuickMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Empty Message', 'Please enter a message before sending.');
      return;
    }

    try {
      const result = await startChat('general', message.trim());
      
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setShowChatModal(true);
        setMessage('');
      } else if (result.queueItem) {
        setCurrentQueueItem(result.queueItem);
        setShowQueueModal(true);
        setMessage('');
        Alert.alert(
          'Message Queued',
          `Your message has been queued. You'll be connected to an agent in approximately ${result.queueItem.estimatedWaitTime} minutes.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      console.error('Failed to send quick message:', error);
    }
  };

  const handleStartDirectChat = async (agentId: string) => {
    try {
      const result = await startChat('general');
      
      if (result.success && result.session) {
        setCurrentSession(result.session);
        setShowChatModal(true);
      } else if (result.queueItem) {
        setCurrentQueueItem(result.queueItem);
        setShowQueueModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat. Please try again.');
      console.error('Failed to start direct chat:', error);
    }
  };

  const handleCloseChatModal = () => {
    setShowChatModal(false);
    setCurrentSession(null);
  };

  const handleCloseQueueModal = () => {
    setShowQueueModal(false);
    setCurrentQueueItem(null);
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
          <Text style={styles.headerTitle}>Live Support</Text>
          <Text style={styles.headerSubtitle}>
            Get instant help from our expert support team
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleFindNextAvailable}
              disabled={isConnecting}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.actionGradient}
              >
                <MessageCircle size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Find Next Available Support</Text>
                <Text style={styles.actionSubtext}>Opens chat instantly</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleRemoteAssistance}
              disabled={isConnecting}
            >
              <LinearGradient
                colors={[Colors.accent, Colors.accentDark]}
                style={styles.actionGradient}
              >
                <Monitor size={24} color={Colors.textPrimary} />
                <Text style={styles.actionText}>Request Remote Assistance</Text>
                <Text style={styles.actionSubtext}>Chat + TeamViewer access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Agents */}
        <View style={styles.agentsSection}>
          <Text style={styles.sectionTitle}>Available Support Agents</Text>
          
          {agents.map((agent) => (
            <View key={agent.id} style={styles.agentCard}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.cardGradient}
              >
                <View style={styles.agentHeader}>
                  <View style={styles.agentInfo}>
                    <View style={[styles.agentAvatar, { backgroundColor: Colors.primaryAlpha }]}>
                      <User size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.agentDetails}>
                      <View style={styles.agentNameRow}>
                        <Text style={styles.agentName}>{agent.name}</Text>
                        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(agent.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(agent.status) }]}>
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Text>
                      </View>
                      <Text style={styles.agentRole}>{agent.role}</Text>
                      <View style={styles.ratingRow}>
                        <Star size={12} color={Colors.warning} fill={Colors.warning} />
                        <Text style={styles.ratingText}>{agent.rating}</Text>
                        {agent.responseTime && (
                          <Text style={styles.responseTime}> • {agent.responseTime}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {agent.status === 'online' && agent.currentChats < agent.maxChats && (
                    <TouchableOpacity 
                      style={styles.chatButton}
                      onPress={() => handleStartDirectChat(agent.id)}
                      disabled={isConnecting}
                    >
                      <MessageCircle size={16} color={Colors.primary} />
                      <Text style={styles.chatButtonText}>Chat</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.specialties}>
                  <Text style={styles.specialtiesLabel}>Specialties:</Text>
                  <View style={styles.specialtyTags}>
                    {agent.specialties.map((specialty) => (
                      <View key={specialty} style={styles.specialtyTag}>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Agent Load Indicator */}
                <View style={styles.loadIndicator}>
                  <Text style={styles.loadText}>
                    {agent.currentChats}/{agent.maxChats} active chats
                  </Text>
                  <View style={styles.loadBar}>
                    <View 
                      style={[
                        styles.loadFill, 
                        { 
                          width: `${(agent.currentChats / agent.maxChats) * 100}%`,
                          backgroundColor: agent.currentChats >= agent.maxChats ? Colors.error : Colors.success
                        }
                      ]} 
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Support Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Support Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.successAlpha }]}>
                <Clock size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{stats.averageWaitTime}m</Text>
              <Text style={styles.statLabel}>Avg Wait Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primaryAlpha }]}>
                <CheckCircle size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.resolutionRate}%</Text>
              <Text style={styles.statLabel}>Resolution Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accentAlpha }]}>
                <User size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statValue}>{stats.onlineAgents}/{stats.totalAgents}</Text>
              <Text style={styles.statLabel}>Agents Online</Text>
            </View>
          </View>
        </View>

        {/* Urgent Connection */}
        <View style={styles.contactSection}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.contactGradient}
          >
            <Text style={styles.contactTitle}>Urgent Connection Request</Text>
            <Text style={styles.contactText}>
              For critical security incidents or system outages, get instant connection to our best support agent:
            </Text>
            <TouchableOpacity 
              style={styles.emergencyButton} 
              onPress={handleUrgentConnection}
              disabled={isConnecting}
            >
              <Zap size={16} color={Colors.error} />
              <Text style={styles.emergencyText}>Connect to Best Agent</Text>
            </TouchableOpacity>
            <Text style={styles.contactNote}>
              Sends message and connects instantly
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Quick Message Input */}
      <View style={[styles.messageInput, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Send a quick message to support..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            editable={!isConnecting}
          />
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: message.trim() && !isConnecting ? 1 : 0.5 }]}
            onPress={handleSendQuickMessage}
            disabled={!message.trim() || isConnecting}
          >
            <Send size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Interface Modal */}
      <ChatInterface
        visible={showChatModal}
        onClose={handleCloseChatModal}
      />

      {/* Queue Status Modal */}
      <QueueStatus
        visible={showQueueModal}
        onClose={handleCloseQueueModal}
        queueItem={currentQueueItem}
      />
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
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    color: Colors.textPrimary,
    fontSize: 12,
    opacity: 0.8,
  },
  agentsSection: {
    marginBottom: 32,
  },
  agentCard: {
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
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  agentDetails: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  agentRole: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  responseTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryAlpha,
    borderRadius: 8,
  },
  chatButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  specialties: {
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 16,
    marginBottom: 12,
  },
  specialtiesLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.accentAlpha,
    borderRadius: 6,
  },
  specialtyText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '600',
  },
  loadIndicator: {
    marginTop: 8,
  },
  loadText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  loadBar: {
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  contactSection: {
    marginBottom: 20,
  },
  contactGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.errorAlpha,
    borderRadius: 8,
    marginBottom: 8,
  },
  emergencyText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  contactNote: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
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
});