import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Search, Plus, User, Mail, Shield, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/auth-provider';

interface AuthorizedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastLogin: string;
  ticketsCreated: number;
}

export default function ManageUsersScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'user' as 'admin' | 'user' });

  const authorizedUsers: AuthorizedUser[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@democompany.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2 hours ago',
      ticketsCreated: 15
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@democompany.com',
      role: 'user',
      status: 'active',
      lastLogin: '1 day ago',
      ticketsCreated: 8
    },
    {
      id: '3',
      name: 'Mike Davis',
      email: 'mike.davis@democompany.com',
      role: 'user',
      status: 'inactive',
      lastLogin: '1 week ago',
      ticketsCreated: 3
    },
    {
      id: '4',
      name: 'Emily Wilson',
      email: 'emily.wilson@democompany.com',
      role: 'user',
      status: 'active',
      lastLogin: '3 hours ago',
      ticketsCreated: 12
    }
  ];

  const filteredUsers = authorizedUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!newUserForm.name.trim() || !newUserForm.email.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    Alert.alert(
      'User Added',
      `${newUserForm.name} has been added as an authorized user. They will receive an invitation email.`,
      [{ text: 'OK', onPress: () => {
        setShowAddUser(false);
        setNewUserForm({ name: '', email: '', role: 'user' });
      }}]
    );
  };

  const handleEditUser = (userId: string) => {
    Alert.alert(
      'Edit User',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Change Role', onPress: () => Alert.alert('Success', 'User role updated') },
        { text: 'Reset Password', onPress: () => Alert.alert('Success', 'Password reset email sent') }
      ]
    );
  };

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', `User ${action}d successfully`) }
      ]
    );
  };

  const handleRemoveUser = (userId: string) => {
    Alert.alert(
      'Remove User',
      'Are you sure you want to remove this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => Alert.alert('Success', 'User removed successfully') }
      ]
    );
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
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddUser(true)}
        >
          <Plus size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[Colors.cardBackground, '#2A2A2A']}
          style={styles.statsGradient}
        >
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{authorizedUsers.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{authorizedUsers.filter(u => u.status === 'active').length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{authorizedUsers.filter(u => u.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.usersList}
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.cardGradient}
            >
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={[styles.userAvatar, { backgroundColor: user.status === 'active' ? Colors.primaryAlpha : Colors.errorAlpha }]}>
                    <User size={20} color={user.status === 'active' ? Colors.primary : Colors.error} />
                  </View>
                  <View style={styles.userDetails}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? Colors.accentAlpha : Colors.primaryAlpha }]}>
                        <Text style={[styles.roleText, { color: user.role === 'admin' ? Colors.accent : Colors.primary }]}>
                          {user.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.userEmailRow}>
                      <Mail size={12} color={Colors.textMuted} />
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleToggleStatus(user.id, user.status)}
                  >
                    {user.status === 'active' ? (
                      <CheckCircle size={18} color={Colors.success} />
                    ) : (
                      <XCircle size={18} color={Colors.error} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditUser(user.id)}
                  >
                    <Edit3 size={18} color={Colors.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleRemoveUser(user.id)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.userMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Last Login:</Text>
                  <Text style={styles.metaValue}>{user.lastLogin}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Tickets Created:</Text>
                  <Text style={styles.metaValue}>{user.ticketsCreated}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Status:</Text>
                  <Text style={[styles.metaValue, { color: user.status === 'active' ? Colors.success : Colors.error }]}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
        
        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <User size={48} color={Colors.textMuted} />
            <Text style={styles.emptyStateTitle}>No users found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search terms' : 'No authorized users yet'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add User Modal */}
      {showAddUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[Colors.cardBackground, '#2A2A2A']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Add New User</Text>
              
              <View style={styles.modalForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter full name"
                    placeholderTextColor={Colors.textMuted}
                    value={newUserForm.name}
                    onChangeText={(text) => setNewUserForm({ ...newUserForm, name: text })}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter email address"
                    placeholderTextColor={Colors.textMuted}
                    value={newUserForm.email}
                    onChangeText={(text) => setNewUserForm({ ...newUserForm, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Role</Text>
                  <View style={styles.roleSelector}>
                    <TouchableOpacity 
                      style={[styles.roleOption, newUserForm.role === 'user' && styles.roleOptionActive]}
                      onPress={() => setNewUserForm({ ...newUserForm, role: 'user' })}
                    >
                      <Text style={[styles.roleOptionText, newUserForm.role === 'user' && styles.roleOptionTextActive]}>User</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.roleOption, newUserForm.role === 'admin' && styles.roleOptionActive]}
                      onPress={() => setNewUserForm({ ...newUserForm, role: 'admin' })}
                    >
                      <Text style={[styles.roleOptionText, newUserForm.role === 'admin' && styles.roleOptionTextActive]}>Admin</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowAddUser(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleAddUser}
                >
                  <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Add User</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
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
  addButton: {
    padding: 8,
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
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGradient: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 20,
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 12,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  userEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalForm: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.backgroundStart,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundStart,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleOptionActive: {
    backgroundColor: Colors.primary,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleOptionTextActive: {
    color: Colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 6,
    backgroundColor: Colors.cardBorder,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalButtonTextPrimary: {
    color: Colors.textPrimary,
  },
});