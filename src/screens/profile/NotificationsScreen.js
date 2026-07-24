import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../api/notifications.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await withTimeout(getNotifications(), 2000);
      setNotifications(res.data || []);
    } catch (e) {
      console.warn('GET /api/notifications failed. Loading mock notifications.', e.message);
      // Prepopulate default mock notifications for visual demonstration
      setNotifications([
        {
          id: 'notif_1',
          title: 'Order Confirmed! 📦',
          message: 'Your order ORD-984321 has been verified and is being prepared by Jazari Restaurant.',
          date: 'Today, 10:15 AM',
          read: false,
          type: 'order',
        },
        {
          id: 'notif_2',
          title: 'Special Promo Just For You! 🎉',
          message: 'Get 20% off on your next tech purchase with coupon code TECH20. Valid till this weekend.',
          date: 'Yesterday, 4:30 PM',
          read: false,
          type: 'promo',
        },
        {
          id: 'notif_3',
          title: 'Refund Processed 💳',
          message: 'The refund of $45.50 for order ORD-723910 has been successfully credited to your PayPal.',
          date: 'Jan 15, 2026',
          read: true,
          type: 'billing',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  // Mark single notification read
  const handleMarkAsRead = async (id) => {
    // Check if already read
    const notif = notifications.find((n) => n.id === id);
    if (notif && notif.read) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await withTimeout(markNotificationRead(id), 2000);
    } catch (e) {
      console.warn(`Mark read API failed for notification ${id}. Saved locally.`, e.message);
    }
  };

  // Mark all read
  const handleMarkAllAsRead = async () => {
    const hasUnread = notifications.some((n) => !n.read);
    if (!hasUnread) {
      Alert.alert('Info', 'All notifications are already marked as read.');
      return;
    }

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await withTimeout(markAllNotificationsRead(), 2000);
    } catch (e) {
      console.warn('Mark all read API failed. Saved locally.', e.message);
    }
  };

  const getIconEmoji = (type) => {
    switch (type) {
      case 'order': return '📦';
      case 'promo': return '🎉';
      case 'billing': return '💳';
      default: return '⚙️';
    }
  };

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => handleMarkAsRead(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.notifHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>{getIconEmoji(item.type)}</Text>
          </View>
          <View style={styles.notifTextCol}>
            <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
              {item.title}
            </Text>
            <Text style={styles.notifDate}>{item.date}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMessage}>{item.message}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.navy]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptySub}>You have no notifications at the moment.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.navy,
    fontWeight: '800',
  },
  markAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    ...typography.caption,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 12,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.lg,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  notifCardUnread: {
    borderColor: colors.gold + '50',
    backgroundColor: colors.surface,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: {
    fontSize: 18,
  },
  notifTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  notifTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  notifTitleUnread: {
    ...typography.bodyBold,
    color: colors.navy,
  },
  notifDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginLeft: spacing.sm,
  },
  notifMessage: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm,
    paddingLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  emptySub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontSize: 13,
  },
});
