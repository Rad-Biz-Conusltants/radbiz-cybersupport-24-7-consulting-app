import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Monitor, Shield, AlertTriangle, ChevronDown, Paperclip, Send, X, FileText, Image as ImageIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';

type SupportType = 'it' | 'cybersecurity';
type Priority = 'low' | 'medium' | 'high';

interface AttachmentFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

interface TicketForm {
  supportType: SupportType;
  title: string;
  description: string;
  priority: Priority;
  urgency: string;
  attachments: AttachmentFile[];
}

export default function NewTicketScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<TicketForm>({
    supportType: 'it',
    title: '',
    description: '',
    priority: 'medium',
    urgency: 'normal',
    attachments: []
  });
  const [showSupportTypeDropdown, setShowSupportTypeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportTypes = [
    { id: 'it', label: 'IT Support', icon: Monitor, description: 'Technical assistance & infrastructure' },
    { id: 'cybersecurity', label: 'Cybersecurity Support', icon: Shield, description: 'Security monitoring & threat protection' }
  ];

  const priorities = [
    { id: 'low', label: 'Low Priority', color: Colors.success, description: 'Non-urgent, can wait' },
    { id: 'medium', label: 'Medium Priority', color: Colors.warning, description: 'Important, needs attention' },
    { id: 'high', label: 'High Priority', color: Colors.error, description: 'Urgent, immediate attention' }
  ];

  const generateTicketId = () => {
    return 'TKT-' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
  };

  const assignTechSupport = (supportType: SupportType) => {
    const itTechs = ['Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emily Davis'];
    const cyberTechs = ['David Kim', 'Lisa Wang', 'James Wilson', 'Maria Garcia'];
    
    const techs = supportType === 'it' ? itTechs : cyberTechs;
    return techs[Math.floor(Math.random() * techs.length)];
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const ticketId = generateTicketId();
      const assignedTech = assignTechSupport(form.supportType);
      
      // Simulate API call with ticket creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Ticket created:', {
        id: ticketId,
        ...form,
        assignedTo: assignedTech,
        status: 'open',
        createdAt: new Date().toISOString(),
        userId: user?.id
      });
      
      setIsSubmitting(false);
      
      Alert.alert(
        '✅ Ticket Created Successfully!',
        `Ticket ID: ${ticketId}\n\nAssigned to: ${assignedTech}\n\nYou will receive updates via email and can track progress in your dashboard.`,
        [
          {
            text: 'View Dashboard',
            onPress: () => {
              router.dismissAll();
              router.replace('/(tabs)/home');
            }
          },
          {
            text: 'Create Another',
            style: 'cancel',
            onPress: () => {
              setForm({
                supportType: 'it',
                title: '',
                description: '',
                priority: 'medium',
                urgency: 'normal',
                attachments: []
              });
            }
          }
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
        multiple: true
      });

      if (!result.canceled && result.assets) {
        const newAttachments: AttachmentFile[] = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          size: asset.size || 0,
          mimeType: asset.mimeType || 'application/octet-stream'
        }));

        // Check file size limit (10MB)
        const oversizedFiles = newAttachments.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          Alert.alert('File Too Large', `Some files exceed the 10MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
          return;
        }

        setForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments]
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const removeAttachment = (index: number) => {
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return ImageIcon;
    }
    return FileText;
  };

  const selectedSupportType = supportTypes.find(type => type.id === form.supportType);
  const selectedPriority = priorities.find(priority => priority.id === form.priority);

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
        <Text style={styles.headerTitle}>New Support Ticket</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Support Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Type *</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowSupportTypeDropdown(!showSupportTypeDropdown)}
          >
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.dropdownGradient}
            >
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownLeft}>
                  {selectedSupportType && (
                    <View style={[styles.dropdownIcon, { backgroundColor: form.supportType === 'it' ? Colors.accentAlpha : Colors.primaryAlpha }]}>
                      <selectedSupportType.icon size={20} color={form.supportType === 'it' ? Colors.accent : Colors.primary} />
                    </View>
                  )}
                  <View>
                    <Text style={styles.dropdownLabel}>{selectedSupportType?.label}</Text>
                    <Text style={styles.dropdownDescription}>{selectedSupportType?.description}</Text>
                  </View>
                </View>
                <ChevronDown size={20} color={Colors.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {showSupportTypeDropdown && (
            <View style={styles.dropdownOptions}>
              {supportTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setForm({ ...form, supportType: type.id as SupportType });
                    setShowSupportTypeDropdown(false);
                  }}
                >
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.optionGradient}
                  >
                    <View style={[styles.dropdownIcon, { backgroundColor: type.id === 'it' ? Colors.accentAlpha : Colors.primaryAlpha }]}>
                      <type.icon size={20} color={type.id === 'it' ? Colors.accent : Colors.primary} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{type.label}</Text>
                      <Text style={styles.optionDescription}>{type.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Issue Title *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Brief description of your issue"
              placeholderTextColor={Colors.textMuted}
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              maxLength={100}
            />
          </View>
          <Text style={styles.characterCount}>{form.title.length}/100</Text>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Level *</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
          >
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.dropdownGradient}
            >
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownLeft}>
                  <View style={[styles.priorityIndicator, { backgroundColor: selectedPriority?.color + '20' }]}>
                    <AlertTriangle size={16} color={selectedPriority?.color} />
                  </View>
                  <View>
                    <Text style={styles.dropdownLabel}>{selectedPriority?.label}</Text>
                    <Text style={styles.dropdownDescription}>{selectedPriority?.description}</Text>
                  </View>
                </View>
                <ChevronDown size={20} color={Colors.textMuted} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {showPriorityDropdown && (
            <View style={styles.dropdownOptions}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setForm({ ...form, priority: priority.id as Priority });
                    setShowPriorityDropdown(false);
                  }}
                >
                  <LinearGradient
                    colors={[Colors.cardBackground, '#2A2A2A']}
                    style={styles.optionGradient}
                  >
                    <View style={[styles.priorityIndicator, { backgroundColor: priority.color + '20' }]}>
                      <AlertTriangle size={16} color={priority.color} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={styles.optionLabel}>{priority.label}</Text>
                      <Text style={styles.optionDescription}>{priority.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Please provide as much detail as possible about your issue. Include any error messages, steps you've already tried, and when the problem started."
              placeholderTextColor={Colors.textMuted}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
          </View>
          <Text style={styles.characterCount}>{form.description.length}/1000</Text>
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments (Optional)</Text>
          <TouchableOpacity style={styles.attachmentButton} onPress={handlePickDocument}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.attachmentGradient}
            >
              <Paperclip size={20} color={Colors.textMuted} />
              <Text style={styles.attachmentText}>Add screenshots or files</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.attachmentNote}>
            Supported formats: JPG, PNG, PDF, DOC, TXT (Max 10MB)
          </Text>
          
          {/* Display selected attachments */}
          {form.attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {form.attachments.map((attachment, index) => {
                const FileIcon = getFileIcon(attachment.mimeType);
                return (
                  <View key={index} style={styles.attachmentItem}>
                    <LinearGradient
                      colors={[Colors.cardBackground, '#2A2A2A']}
                      style={styles.attachmentItemGradient}
                    >
                      <View style={styles.attachmentInfo}>
                        <View style={styles.attachmentIcon}>
                          <FileIcon size={16} color={Colors.primary} />
                        </View>
                        <View style={styles.attachmentDetails}>
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {attachment.name}
                          </Text>
                          <Text style={styles.attachmentSize}>
                            {formatFileSize(attachment.size)}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeAttachment}
                        onPress={() => removeAttachment(index)}
                      >
                        <X size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.submitContainer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity 
          style={[styles.submitButton, { opacity: isSubmitting ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Creating Ticket...</Text>
            ) : (
              <>
                <Send size={20} color={Colors.textPrimary} />
                <Text style={styles.submitButtonText}>Create Ticket</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  dropdown: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  dropdownGradient: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  dropdownDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dropdownOptions: {
    marginTop: 8,
  },
  dropdownOption: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  optionGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priorityIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textAreaContainer: {
    minHeight: 120,
  },
  textInput: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  attachmentButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  attachmentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  attachmentText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  attachmentNote: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentItem: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  attachmentItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 8,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.primaryAlpha,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachmentDetails: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeAttachment: {
    padding: 4,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
});