import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, X, Phone, Video, Paperclip, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSupport, ChatMessage, ChatSession } from '@/providers/support-provider';

interface ChatInterfaceProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatInterface({ visible, onClose }: ChatInterfaceProps) {
  const insets = useSafeAreaInsets();
  const { currentSession, sendMessage, endChat, isConnecting } = useSupport();
  const [message, setMessage] = React.useState('');

  const handleSendMessage = () => {
    if (message.trim() && currentSession) {
      sendMessage(currentSession.id, message.trim());
      setMessage('');
    }
  };

  const handleEndChat = () => {
    if (!currentSession) return;
    
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Chat', 
          style: 'destructive', 
          onPress: () => {
            endChat(currentSession.id);
            onClose();
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    const isSystem = item.type === 'system';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.agentMessage]}>
        <View style={[
          styles.messageBubble, 
          isUser ? styles.userBubble : styles.agentBubble,
          isSystem && styles.systemBubble
        ]}>
          {!isUser && item.agentName && (
            <Text style={styles.agentNameText}>{item.agentName}</Text>
          )}
          <Text style={[
            styles.messageText, 
            isUser ? styles.userMessageText : styles.agentMessageText,
            isSystem && styles.systemMessageText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime, 
            isUser ? styles.userMessageTime : styles.agentMessageTime
          ]}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const getStatusColor = () => {
    if (isConnecting) return Colors.warning;
    return currentSession?.status === 'active' ? Colors.success : Colors.warning;
  };

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...';
    return currentSession?.status === 'active' ? 'Online' : 'Connecting';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
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
                  {currentSession?.agentName || 'Support Agent'}
                </Text>
                <View style={styles.chatStatusRow}>
                  <View style={[styles.chatStatusDot, { backgroundColor: getStatusColor() }]} />
                  <Text style={styles.chatStatusText}>{getStatusText()}</Text>
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
                onPress={handleEndChat}
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
                data={currentSession?.messages || []}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                inverted={false}
              />
            )}
          </View>

          {/* Chat Input */}
          <View style={[styles.chatInputContainer, { paddingBottom: insets.bottom + 10 }]}>
            <View style={styles.chatInputRow}>
              <TouchableOpacity style={styles.attachButton}>
                <Paperclip size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type your message..."
                placeholderTextColor={Colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                editable={currentSession?.status === 'active'}
              />
              <TouchableOpacity 
                style={[styles.chatSendButton, { 
                  opacity: message.trim() && currentSession?.status === 'active' ? 1 : 0.5 
                }]}
                onPress={handleSendMessage}
                disabled={!message.trim() || currentSession?.status !== 'active'}
              >
                <Send size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
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
  systemBubble: {
    backgroundColor: Colors.accentAlpha,
    borderColor: Colors.accent,
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
  systemMessageText: {
    color: Colors.accent,
    fontStyle: 'italic',
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
  attachButton: {
    padding: 8,
    marginRight: 8,
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