import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useSupport, QueueItem } from '@/providers/support-provider';

interface QueueStatusProps {
  visible: boolean;
  onClose: () => void;
  queueItem: QueueItem | null;
}

export default function QueueStatus({ visible, onClose, queueItem }: QueueStatusProps) {
  const insets = useSafeAreaInsets();
  const { getQueuePosition, getSupportStats, removeFromQueue } = useSupport();
  const [position, setPosition] = React.useState(0);
  const [stats, setStats] = React.useState(getSupportStats());

  React.useEffect(() => {
    if (!queueItem) return;

    const interval = setInterval(() => {
      const newPosition = getQueuePosition(queueItem.id);
      const newStats = getSupportStats();
      setPosition(newPosition);
      setStats(newStats);

      // If position is 0, user is no longer in queue (connected or removed)
      if (newPosition === 0) {
        onClose();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [queueItem, getQueuePosition, getSupportStats, onClose]);

  const handleCancelQueue = () => {
    if (queueItem) {
      removeFromQueue(queueItem.id);
      onClose();
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urgent': return 'Urgent Support';
      case 'remote-assistance': return 'Remote Assistance';
      default: return 'General Support';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return Colors.error;
      case 'remote-assistance': return Colors.accent;
      default: return Colors.primary;
    }
  };

  if (!queueItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <LinearGradient
            colors={[Colors.cardBackground, '#2A2A2A']}
            style={styles.content}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(queueItem.type) }]} />
                <Text style={styles.title}>In Queue</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Queue Info */}
            <View style={styles.queueInfo}>
              <Text style={styles.typeLabel}>{getTypeLabel(queueItem.type)}</Text>
              <Text style={styles.subtitle}>
                We&apos;re connecting you with the best available agent
              </Text>
            </View>

            {/* Position Card */}
            <View style={styles.positionCard}>
              <LinearGradient
                colors={[Colors.primaryAlpha, Colors.primary + '20']}
                style={styles.positionGradient}
              >
                <View style={styles.positionIcon}>
                  <Users size={24} color={Colors.primary} />
                </View>
                <Text style={styles.positionNumber}>{position}</Text>
                <Text style={styles.positionLabel}>
                  {position === 1 ? 'You&apos;re next!' : 'Position in queue'}
                </Text>
              </LinearGradient>
            </View>

            {/* Wait Time */}
            <View style={styles.waitTimeCard}>
              <View style={styles.waitTimeIcon}>
                <Clock size={20} color={Colors.accent} />
              </View>
              <View style={styles.waitTimeInfo}>
                <Text style={styles.waitTimeValue}>
                  ~{queueItem.estimatedWaitTime} min
                </Text>
                <Text style={styles.waitTimeLabel}>Estimated wait time</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.onlineAgents}</Text>
                <Text style={styles.statLabel}>Agents Online</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.queueLength}</Text>
                <Text style={styles.statLabel}>In Queue</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averageResponseTime}m</Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>
            </View>

            {/* Initial Message Preview */}
            {queueItem.initialMessage && (
              <View style={styles.messagePreview}>
                <Text style={styles.messagePreviewLabel}>Your message:</Text>
                <Text style={styles.messagePreviewText} numberOfLines={3}>
                  {queueItem.initialMessage}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelQueue}
              >
                <Text style={styles.cancelButtonText}>Cancel & Leave Queue</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              You&apos;ll be automatically connected when an agent becomes available
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  queueInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  positionCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  positionGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  positionIcon: {
    marginBottom: 8,
  },
  positionNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  positionLabel: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  waitTimeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentAlpha,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  waitTimeIcon: {
    marginRight: 12,
  },
  waitTimeInfo: {
    flex: 1,
  },
  waitTimeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
    marginBottom: 2,
  },
  waitTimeLabel: {
    fontSize: 12,
    color: Colors.accent,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundStart,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 16,
  },
  messagePreview: {
    backgroundColor: Colors.backgroundStart,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  messagePreviewLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },
  messagePreviewText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  actions: {
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: Colors.errorAlpha,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});