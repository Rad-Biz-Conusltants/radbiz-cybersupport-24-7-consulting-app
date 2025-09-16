import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Clock, CheckCircle, User, Send, Paperclip, Star, Monitor, Zap, X, Phone, Video } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';


interface SupportAgent {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  rating: number;
  specialties: string[];
  responseTime?: string;
  isUrgentSpecialist?: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentName?: string;
}

interface ChatSession {
  id: string;
  agentId: string;
  agentName: string;
  type: 'general' | 'remote-assistance' | 'urgent';
  status: 'connecting' | 'active' | 'ended';
  messages: ChatMessage[];
  startTime: Date;
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Cleanup chat session on unmount
  useEffect(() => {
    return () => {
      if (chatSession) {
        setChatSession(null);
        setShowChatModal(false);
      }
    };
  }, []);

  const supportAgents: SupportAgent[] = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Senior IT Specialist',
      status: 'online',
      rating: 4.9,
      specialties: ['Network Security', 'Server Management', 'Email Systems'],
      responseTime: '< 2 min',
      isUrgentSpecialist: true
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Cybersecurity Expert',
      status: 'online',
      rating: 4.8,
      specialties: ['Threat Analysis', 'Firewall Configuration', 'Security Audits'],
      responseTime: '< 3 min',
      isUrgentSpecialist: true
    },
    {
      id: '3',
      name: 'Mike Davis',
      role: 'IT Support Technician',
      status: 'busy',
      rating: 4.7,
      specialties: ['Hardware Troubleshooting', 'Software Installation', 'User Support'],
      responseTime: '< 5 min'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      role: 'Remote Access Specialist',
      status: 'online',
      rating: 4.9,
      specialties: ['TeamViewer', 'Remote Desktop', 'Screen Sharing'],
      responseTime: '< 1 min'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return Colors.success;
      case 'busy': return Colors.warning;
      case 'offline': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  // Find the best available agent based on criteria
  const findBestAgent = (type: 'general' | 'remote-assistance' | 'urgent'): SupportAgent | null => {
    let availableAgents = supportAgents.filter(agent => agent.status === 'online');
    
    if (type === 'urgent') {
      availableAgents = availableAgents.filter(agent => agent.isUrgentSpecialist);
    } else if (type === 'remote-assistance') {
      availableAgents = availableAgents.filter(agent => 
        agent.specialties.some(specialty => 
          specialty.toLowerCase().includes('remote') || 
          specialty.toLowerCase().includes('teamviewer')
        )
      );
    }
    
    if (availableAgents.length === 0) {
      availableAgents = supportAgents.filter(agent => agent.status === 'online');
    }
    
    // Sort by rating and return the best
    return availableAgents.sort((a, b) => b.rating - a.rating)[0] || null;
  };

  // Create a new chat session
  const createChatSession = (agent: SupportAgent, type: 'general' | 'remote-assistance' | 'urgent'): ChatSession => {
    const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: sessionId,
      agentId: agent.id,
      agentName: agent.name,
      type,
      status: 'connecting',
      messages: [],
      startTime: new Date()
    };
  };

  // Simulate agent connection
  const connectToAgent = async (session: ChatSession) => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update session status
    const updatedSession = {
      ...session,
      status: 'active' as const,
      messages: [
        {
          id: `msg_${Date.now()}`,
          text: `Hello! I'm ${session.agentName}, and I'll be assisting you today. How can I help you?`,
          sender: 'agent' as const,
          timestamp: new Date(),
          agentName: session.agentName
        }
      ]
    };
    
    setChatSession(updatedSession);
    setIsConnecting(false);
    
    // Handle special session types
    if (session.type === 'remote-assistance') {
      setTimeout(() => {
        const remoteMessage = {
          id: `msg_${Date.now() + 1}`,
          text: "I've initiated a TeamViewer session request. You should receive a notification shortly. Please accept it so I can assist you remotely.",
          sender: 'agent' as const,
          timestamp: new Date(),
          agentName: session.agentName
        };
        
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, remoteMessage]
        } : null);
      }, 3000);
    }
  };

  const handleStartChat = async (agentId: string, type: 'general' | 'remote-assistance' | 'urgent' = 'general') => {
    let agent: SupportAgent | null = null;
    
    if (agentId === 'next-available' || agentId === 'quick-message') {
      agent = findBestAgent('general');
    } else if (agentId === 'remote-assistance') {
      agent = findBestAgent('remote-assistance');
    } else if (agentId === 'urgent-support') {
      agent = findBestAgent('urgent');
    } else {
      agent = supportAgents.find(a => a.id === agentId) || null;
    }
    
    if (!agent) {
      Alert.alert('No Agents Available', 'All agents are currently busy. Please try again in a few minutes.');
      return;
    }
    
    setSelectedAgent(agent.id);
    const session = createChatSession(agent, type);
    setChatSession(session);
    setShowChatModal(true);
    
    await connectToAgent(session);
  };

  const handleFindNextAvailable = () => {
    const agent = findBestAgent('general');
    if (!agent) {
      Alert.alert('No Agents Available', 'All agents are currently busy. Please try again in a few minutes.');
      return;
    }
    
    Alert.alert(
      'Connect to Support Agent', 
      `Found ${agent.name} (${agent.role}) - Available now with ${agent.responseTime} response time.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Chat', onPress: () => handleStartChat('next-available', 'general') }
      ]
    );
  };

  const handleRemoteAssistance = () => {
    const agent = findBestAgent('remote-assistance');
    if (!agent) {
      Alert.alert('No Remote Specialists Available', 'All remote assistance specialists are currently busy. Please try again in a few minutes.');
      return;
    }
    
    Alert.alert(
      'Remote Assistance Request', 
      `Found ${agent.name} - Remote access specialist available now. This will start a chat and initiate TeamViewer remote access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request Access', onPress: () => handleStartChat('remote-assistance', 'remote-assistance') }
      ]
    );
  };

  const handleUrgentConnection = () => {
    const agent = findBestAgent('urgent');
    if (!agent) {
      Alert.alert('No Urgent Specialists Available', 'All urgent support specialists are currently busy. Connecting to next best available agent.');
      const fallbackAgent = findBestAgent('general');
      if (!fallbackAgent) {
        Alert.alert('No Agents Available', 'All agents are currently busy. Please try again in a few minutes.');
        return;
      }
    }
    
    const bestAgent = agent || findBestAgent('general');
    if (!bestAgent) return;
    
    Alert.alert(
      'Urgent Connection Request', 
      `Connecting to ${bestAgent.name} - Our best available agent for urgent assistance. Priority support activated.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect Now', onPress: () => handleStartChat('urgent-support', 'urgent') }
      ]
    );
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const agent = findBestAgent('general');
      if (!agent) {
        Alert.alert('No Agents Available', 'All agents are currently busy. Please try again in a few minutes.');
        return;
      }
      
      Alert.alert(
        'Connecting to Live Agent', 
        `Your message will be sent to ${agent.name}. Starting chat now...`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send & Connect', onPress: async () => {
            const initialMessage = message;
            setMessage('');
            
            // Start chat with the initial message
            const session = createChatSession(agent, 'general');
            session.messages.push({
              id: `msg_${Date.now()}`,
              text: initialMessage,
              sender: 'user',
              timestamp: new Date()
            });
            
            setChatSession(session);
            setShowChatModal(true);
            await connectToAgent(session);
          }}
        ]
      );
    }
  };

  // Send message in chat
  const sendChatMessage = () => {
    if (chatMessage.trim() && chatSession) {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: chatMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      
      setChatSession({
        ...chatSession,
        messages: [...chatSession.messages, newMessage]
      });
      
      setChatMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          text: "I understand your concern. Let me help you with that right away.",
          sender: 'agent',
          timestamp: new Date(),
          agentName: chatSession.agentName
        };
        
        setChatSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, agentResponse]
        } : null);
      }, 1500);
    }
  };

  // Close chat session
  const closeChatSession = () => {
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Chat', style: 'destructive', onPress: () => {
          setChatSession(null);
          setShowChatModal(false);
          setSelectedAgent(null);
          setChatMessage('');
        }}
      ]
    );
  };

  // Render chat message
  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.agentMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.agentBubble]}>
          {!isUser && (
            <Text style={styles.agentNameText}>{item.agentName}</Text>
          )}
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.agentMessageText]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.agentMessageTime]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
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
          
          {supportAgents.map((agent) => (
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
                      </View>
                    </View>
                  </View>
                  
                  {agent.status === 'online' && (
                    <TouchableOpacity 
                      style={styles.chatButton}
                      onPress={() => handleStartChat(agent.id, 'general')}
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
              <Text style={styles.statValue}>&lt; 5 min</Text>
              <Text style={styles.statLabel}>Avg Response Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.primaryAlpha }]}>
                <CheckCircle size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>98.5%</Text>
              <Text style={styles.statLabel}>Resolution Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: Colors.accentAlpha }]}>
                <User size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>Availability</Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.contactGradient}
          >
            <Text style={styles.contactTitle}>Urgent Connection Request</Text>
            <Text style={styles.contactText}>
              For critical security incidents or system outages, get instant connection to our best support agent:
            </Text>
            <TouchableOpacity style={styles.emergencyButton} onPress={handleUrgentConnection}>
              <Zap size={16} color={Colors.error} />
              <Text style={styles.emergencyText}>Connect to Best Agent</Text>
            </TouchableOpacity>
            <Text style={styles.contactNote}>
              Sends message and connects instantly
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Quick Message */}
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
          />
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.chatModal}>
          <LinearGradient
            colors={[Colors.backgroundStart, Colors.backgroundEnd]}
            style={styles.chatContainer}
          >
            {/* Chat Header */}
            <View style={[styles.chatHeader, { paddingTop: insets.top + 10 }]}>
              <View style={styles.chatHeaderInfo}>
                <View style={styles.chatAgentAvatar}>
                  <User size={20} color={Colors.primary} />
                </View>
                <View style={styles.chatAgentDetails}>
                  <Text style={styles.chatAgentName}>
                    {chatSession?.agentName || 'Support Agent'}
                  </Text>
                  <View style={styles.chatStatusRow}>
                    <View style={[styles.chatStatusDot, { 
                      backgroundColor: chatSession?.status === 'active' ? Colors.success : Colors.warning 
                    }]} />
                    <Text style={styles.chatStatusText}>
                      {isConnecting ? 'Connecting...' : 
                       chatSession?.status === 'active' ? 'Online' : 'Connecting'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.chatHeaderActions}>
                <TouchableOpacity style={styles.chatActionButton}>
                  <Phone size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.chatActionButton}>
                  <Video size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.chatCloseButton}
                  onPress={closeChatSession}
                >
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat Messages */}
            <View style={styles.chatMessagesContainer}>
              {isConnecting ? (
                <View style={styles.connectingContainer}>
                  <Text style={styles.connectingText}>Connecting to agent...</Text>
                  <Text style={styles.connectingSubtext}>Please wait while we connect you</Text>
                </View>
              ) : (
                <FlatList
                  data={chatSession?.messages || []}
                  renderItem={renderChatMessage}
                  keyExtractor={(item) => item.id}
                  style={styles.messagesList}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>

            {/* Chat Input */}
            <View style={[styles.chatInputContainer, { paddingBottom: insets.bottom + 10 }]}>
              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatTextInput}
                  placeholder="Type your message..."
                  placeholderTextColor={Colors.textMuted}
                  value={chatMessage}
                  onChangeText={setChatMessage}
                  multiline
                  editable={chatSession?.status === 'active'}
                />
                <TouchableOpacity 
                  style={[styles.chatSendButton, { 
                    opacity: chatMessage.trim() && chatSession?.status === 'active' ? 1 : 0.5 
                  }]}
                  onPress={sendChatMessage}
                  disabled={!chatMessage.trim() || chatSession?.status !== 'active'}
                >
                  <Send size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
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
  // Chat Modal Styles
  chatModal: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  chatHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatAgentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chatAgentDetails: {
    flex: 1,
  },
  chatAgentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  chatStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  chatStatusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chatHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatActionButton: {
    padding: 8,
    marginRight: 8,
  },
  chatCloseButton: {
    padding: 8,
  },
  chatMessagesContainer: {
    flex: 1,
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  connectingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  connectingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  agentNameText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: Colors.textPrimary,
  },
  agentMessageText: {
    color: Colors.textPrimary,
  },
  messageTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  userMessageTime: {
    color: Colors.textPrimary,
    opacity: 0.7,
  },
  agentMessageTime: {
    color: Colors.textMuted,
  },
  chatInputContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 8,
    maxHeight: 100,
  },
  chatSendButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginLeft: 12,
  },
});