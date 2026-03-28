import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Building, Phone, MapPin, Save, ArrowLeft } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  address: string;
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Name and email are required fields.');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerStyle: { backgroundColor: Colors.backgroundStart },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={isLoading}
              style={[styles.headerButton, { opacity: isLoading ? 0.6 : 1 }]}
            >
              <Save size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <LinearGradient
        colors={[Colors.backgroundStart, Colors.backgroundEnd]}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.avatarCard}
            >
              <View style={[styles.avatarContainer, { backgroundColor: Colors.primaryAlpha }]}>
                <User size={48} color={Colors.primary} />
              </View>
              <Text style={styles.avatarText}>Profile Picture</Text>
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.fieldGradient}
              >
                <View style={styles.fieldHeader}>
                  <User size={16} color={Colors.accent} />
                  <Text style={styles.fieldLabel}>Full Name *</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </LinearGradient>
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.fieldGradient}
              >
                <View style={styles.fieldHeader}>
                  <Mail size={16} color={Colors.accent} />
                  <Text style={styles.fieldLabel}>Email Address *</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email address"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </LinearGradient>
            </View>

            {/* Company Field */}
            <View style={styles.fieldContainer}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.fieldGradient}
              >
                <View style={styles.fieldHeader}>
                  <Building size={16} color={Colors.accent} />
                  <Text style={styles.fieldLabel}>Company</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.company}
                  onChangeText={(value) => handleInputChange('company', value)}
                  placeholder="Enter your company name"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="words"
                />
              </LinearGradient>
            </View>

            {/* Phone Field */}
            <View style={styles.fieldContainer}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.fieldGradient}
              >
                <View style={styles.fieldHeader}>
                  <Phone size={16} color={Colors.accent} />
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                />
              </LinearGradient>
            </View>

            {/* Address Field */}
            <View style={styles.fieldContainer}>
              <LinearGradient
                colors={[Colors.cardBackground, '#2A2A2A']}
                style={styles.fieldGradient}
              >
                <View style={styles.fieldHeader}>
                  <MapPin size={16} color={Colors.accent} />
                  <Text style={styles.fieldLabel}>Address</Text>
                </View>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Enter your address"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </LinearGradient>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryAlpha]}
                style={styles.saveGradient}
              >
                <Save size={20} color={Colors.textPrimary} />
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>
    </>
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
  headerButton: {
    padding: 8,
  },
  avatarSection: {
    marginBottom: 32,
  },
  avatarCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.accentAlpha,
    borderRadius: 8,
  },
  changePhotoText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  textInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  multilineInput: {
    minHeight: 80,
  },
  saveSection: {
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});