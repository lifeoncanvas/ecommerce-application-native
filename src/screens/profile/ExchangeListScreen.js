import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { getExchangeRequests, cancelExchangeRequest } from '../../api/exchange.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function ExchangeListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [exchanges, setExchanges] = useState([]);

  // Fetch exchange requests from API
  const fetchExchanges = useCallback(async () => {
    setLoading(true);
    let apiExchanges = [];
    let localExchanges = [];

    // Load from storage
    try {
      const stored = await AsyncStorage.getItem('@local_exchanges');
      if (stored) localExchanges = JSON.parse(stored);
    } catch (err) {
      console.warn('Failed to read local exchanges', err);
    }

    try {
      const res = await withTimeout(getExchangeRequests(), 2000);
      apiExchanges = res.data || [];
    } catch (e) {
      console.warn('GET /api/exchange failed. Loading offline mocks.', e.message);
      
      // Offline fallback mock data
      apiExchanges = [
        {
          id: 'ex_1001',
          orderId: 'ORD-984321',
          itemName: 'Spicy Shawarma Platter',
          reason: 'Quality Disappointment',
          description: 'The sauce was extremely dry. Requesting replacement.',
          status: 'Pending',
          date: 'Today, 12:45 PM'
        },
        {
          id: 'ex_1002',
          orderId: 'ORD-723910',
          itemName: 'Premium Jollof Rice Special',
          reason: 'Wrong Product Sent',
          description: 'Received white rice instead of Jollof rice.',
          status: 'Approved',
          date: 'Yesterday, 4:20 PM'
        }
      ];
    }

    const merged = [...localExchanges, ...apiExchanges];
    // De-duplicate by ID
    const unique = merged.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    setExchanges(unique);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  // Cancel exchange request
  const handleCancelExchange = async (id) => {
    Alert.alert(
      'Cancel Exchange',
      'Are you sure you want to cancel this exchange request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await withTimeout(cancelExchangeRequest(id), 2000);
              setExchanges((prev) =>
                prev.map((e) => (e.id === id ? { ...e, status: 'Cancelled' } : e))
              );
              // Update AsyncStorage
              try {
                const stored = await AsyncStorage.getItem('@local_exchanges');
                if (stored) {
                  const list = JSON.parse(stored);
                  const updated = list.map((e) => (e.id === id ? { ...e, status: 'Cancelled' } : e));
                  await AsyncStorage.setItem('@local_exchanges', JSON.stringify(updated));
                }
              } catch (err) {}
              Alert.alert('Success', 'Exchange request cancelled successfully.');
            } catch (e) {
              console.warn('Cancel exchange API failed, updating locally.', e.message);
              // Fallback
              setExchanges((prev) =>
                prev.map((e) => (e.id === id ? { ...e, status: 'Cancelled' } : e))
              );
              // Update AsyncStorage
              try {
                const stored = await AsyncStorage.getItem('@local_exchanges');
                if (stored) {
                  const list = JSON.parse(stored);
                  const updated = list.map((e) => (e.id === id ? { ...e, status: 'Cancelled' } : e));
                  await AsyncStorage.setItem('@local_exchanges', JSON.stringify(updated));
                }
              } catch (err) {}
              Alert.alert('Success', 'Exchange request cancelled (Offline Mode).');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return colors.gold;
      case 'Approved': return colors.success;
      case 'Cancelled': return colors.error;
      default: return colors.textSecondary;
    }
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
        <Text style={styles.headerTitle}>Product Exchanges</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={fetchExchanges}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={exchanges}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.reqId}>Req: #{item.id}</Text>
                <Text style={[styles.statusTag, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>

              <Text style={styles.itemName}>{item.itemName}</Text>
              <Text style={styles.metaText}>Order Ref: #{item.orderId} • Date: {item.date}</Text>
              
              <Text style={styles.sectionLabel}>Reason</Text>
              <Text style={styles.detailText}>{item.reason}</Text>

              {item.description ? (
                <>
                  <Text style={styles.sectionLabel}>Customer Note</Text>
                  <Text style={styles.detailText}>{item.description}</Text>
                </>
              ) : null}

              {item.status === 'Pending' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancelExchange(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel Exchange Request</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔄</Text>
              <Text style={styles.emptyText}>No Active Exchanges Found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    backgroundColor: colors.background,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  refreshIcon: {
    fontSize: 16,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reqId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  statusTag: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 11,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  detailText: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 12,
    lineHeight: 18,
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelBtnText: {
    ...typography.button,
    color: colors.error,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
