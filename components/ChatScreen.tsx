import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, X, Phone, Video, Paperclip, Clock, Users, Image, FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useSupport, ChatMessage, ChatSession } from '@/providers/support-provider';

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

export default function ChatScreen({ visible, onClose, session }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const { sendMessage, endChatSession, isConnecting, queue } = useSupport();
  const [message, setMessage] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (session?.messages.length && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [session?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;
    
    const messageText = message.trim();
    setMessage('');
    
    try {
      await sendMessage(session.id, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const handleEndChat = () => {
    if (!session) return;
    
    Alert.alert(
      'End Chat Session',
      'Are you sure you want to end this chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Chat', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await endChatSession(session.id);
              onClose();
            } catch (error) {
              console.error('Failed to end chat:', error);
            }
          }
        }
      ]
    );
  };

  const handleVoiceCall = () => {
    if (!session) {
      Alert.alert('Error', 'No active session found.');
      return;
    }
    
    if (session.status !== 'active') {
      Alert.alert('Call Unavailable', 'Voice calls are only available during active chat sessions. Please wait to be connected to an agent.');
      return;
    }
    
    Alert.alert(
      'Voice Call Request',
      `Request a voice call with ${session.agentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Call', 
          onPress: async () => {
            try {
              await sendMessage(session.id, '📞 Voice call requested - Please call me at your earliest convenience.');
              Alert.alert('Call Requested', `${session.agentName} has been notified of your call request and will contact you shortly.`);
            } catch (error) {
              console.error('Failed to request call:', error);
              Alert.alert('Error', 'Failed to request call. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleVideoCall = () => {
    if (!session) {
      Alert.alert('Error', 'No active session found.');
      return;
    }
    
    if (session.status !== 'active') {
      Alert.alert('Video Call Unavailable', 'Video calls are only available during active chat sessions. Please wait to be connected to an agent.');
      return;
    }
    
    Alert.alert(
      'Video Call Request',
      `Request a video call with ${session.agentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Video Call', 
          onPress: async () => {
            try {
              await sendMessage(session.id, '📹 Video call requested - Please start a video session when convenient.');
              Alert.alert('Video Call Requested', `${session.agentName} has been notified and will start a video call shortly.`);
            } catch (error) {
              console.error('Failed to request video call:', error);
              Alert.alert('Error', 'Failed to request video call. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAttachmentPress = () => {
    if (!session) {
      Alert.alert('Error', 'No active session found.');
      return;
    }
    
    if (session.status !== 'active') {
      Alert.alert('Attachment Unavailable', 'File attachments are only available during active chat sessions. Please wait to be connected to an agent.');
      return;
    }
    
    setShowAttachmentOptions(true);
  };

  const handleImagePicker = async () => {
    setShowAttachmentOptions(false);
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to share images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0] && session) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'image.jpg';
        await sendMessage(session.id, `📷 Image shared: ${fileName} - Please let me know if you can see the image clearly.`);
        Alert.alert('Image Shared', `Your image "${fileName}" has been sent to ${session.agentName}.`);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
    }
  };

  const handleDocumentPicker = async () => {
    setShowAttachmentOptions(false);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0] && session) {
        const asset = result.assets[0];
        await sendMessage(session.id, `📎 File shared: ${asset.name} - File size: ${(asset.size || 0 / 1024).toFixed(1)}KB`);
        Alert.alert('File Shared', `Your file "${asset.name}" has been sent to ${session.agentName}.`);
      }
    } catch (error) {
      console.error('Failed to pick document:', error);
      Alert.alert('Error', 'Failed to share file. Please try again.');
    }
  };

  const renderAttachmentOptions = () => {
    if (!showAttachmentOptions) return null;
    
    return (
      <Modal
        visible={showAttachmentOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAttachmentOptions(false)}
      >
        <TouchableOpacity 
          style={styles.attachmentModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentOptions(false)}
        >
          <View style={styles.attachmentOptionsContainer}>
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={handleImagePicker}
            >
              <Image size={24} color={Colors.primary} />
              <Text style={styles.attachmentOptionText}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.attachmentOption}
              onPress={handleDocumentPicker}
            >
              <FileText size={24} color={Colors.primary} />
              <Text style={styles.attachmentOptionText}>Document</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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

  const renderQueueStatus = () => {
    if (!session || session.status !== 'queued') return null;
    
    const queuePosition = session.queuePosition || 0;
    const estimatedWaitTime = session.estimatedWaitTime || 0;
    
    return (
      <View style={styles.queueStatus}>
        <LinearGradient
          colors={[Colors.warning + '20', Colors.warning + '10']}
          style={styles.queueStatusGradient}
        >
          <View style={styles.queueStatusHeader}>
            <Clock size={16} color={Colors.warning} />
            <Text style={styles.queueStatusTitle}>In Queue</Text>
          </View>
          <Text style={styles.queueStatusText}>
            Position: {queuePosition} • Est. wait: {estimatedWaitTime} min
          </Text>
          <View style={styles.queueStatsRow}>
            <View style={styles.queueStat}>
              <Users size={12} color={Colors.textMuted} />
              <Text style={styles.queueStatText}>{queue.length} in queue</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderConnectingStatus = () => {
    if (!isConnecting) return null;
    
    return (
      <View style={styles.connectingContainer}>
        <Text style={styles.connectingText}>Connecting to agent...</Text>
        <Text style={styles.connectingSubtext}>Please wait while we connect you</Text>
      </View>
    );
  };

  if (!session) return null;

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
                <Text style={styles.avatarText}>
                  {session.agentName ? session.agentName.charAt(0) : '?'}
                </Text>
              </View>
              <View style={styles.chatAgentDetails}>
                <Text style={styles.chatAgentName}>
                  {session.agentName || 'Support Agent'}
                </Text>
                <View style={styles.chatStatusRow}>
                  <View style={[styles.chatStatusDot, { 
                    backgroundColor: session.status === 'active' ? Colors.success : 
                                   session.status === 'connecting' ? Colors.warning : Colors.textMuted
                  }]} />
                  <Text style={styles.chatStatusText}>
                    {session.status === 'active' ? 'Online' : 
                     session.status === 'connecting' ? 'Connecting...' : 
                     session.status === 'queued' ? 'In Queue' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.chatHeaderActions}>
              <TouchableOpacity 
                style={[styles.chatActionButton, {
                  opacity: session.status === 'active' ? 1 : 0.5
                }]}
                onPress={handleVoiceCall}
                disabled={session.status !== 'active'}
              >
                <Phone size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chatActionButton, {
                  opacity: session.status === 'active' ? 1 : 0.5
                }]}
                onPress={handleVideoCall}
                disabled={session.status !== 'active'}
              >
                <Video size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.chatCloseButton}
                onPress={session.status === 'active' ? handleEndChat : onClose}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Queue Status */}
          {renderQueueStatus()}

          {/* Chat Messages */}
          <View style={styles.chatMessagesContainer}>
            {isConnecting ? renderConnectingStatus() : (
              <FlatList
                ref={flatListRef}
                data={session.messages}
                renderItem={renderMessage}
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
              <TouchableOpacity 
                style={[styles.attachButton, {
                  opacity: session.status === 'active' ? 1 : 0.3
                }]}
                onPress={handleAttachmentPress}
                disabled={session.status !== 'active'}
              >
                <Paperclip size={18} color={session.status === 'active' ? Colors.primary : Colors.textMuted} />
              </TouchableOpacity>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Type your message..."
                placeholderTextColor={Colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                editable={session.status === 'active'}
                maxLength={1000}
              />
              <TouchableOpacity 
                style={[styles.chatSendButton, { 
                  opacity: message.trim() && session.status === 'active' ? 1 : 0.5 
                }]}
                onPress={handleSendMessage}
                disabled={!message.trim() || session.status !== 'active'}
              >
                <Send size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Attachment Options Modal */}
          {renderAttachmentOptions()}
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
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
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
  queueStatus: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  queueStatusGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: 12,
  },
  queueStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginLeft: 8,
  },
  queueStatusText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  queueStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueStatText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
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
    borderColor: Colors.accent + '30',
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
  attachmentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 100,
  },
  attachmentOptionsContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  attachmentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  attachmentOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 16,
    fontWeight: '500',
  },
});