import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../theme';
import { trackOrder } from '../../api/orders.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function TrackOrderScreen({ route, navigation }) {
  const { orderId } = route?.params || {};
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = useCallback(async () => {
    setLoading(true);
    let mockTracking = null;

    // 1. Fetch from AsyncStorage to see if the order status was cancelled
    try {
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const matched = list.find((o) => o.id === orderId);
        if (matched && matched.status === 'Cancelled') {
          mockTracking = {
            orderId,
            status: 'Cancelled',
            eta: 'N/A',
            courierName: 'N/A',
            courierPhone: 'N/A',
            checkpoint: 0
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load local order status for tracking', e);
    }

    // 2. Query tracking API
    if (!mockTracking) {
      try {
        const res = await withTimeout(trackOrder(orderId), 2000);
        if (res.data) mockTracking = res.data;
      } catch (e) {
        console.warn('Failed to fetch live tracking from API. Utilizing mock tracker.', e.message);
        // Default mock tracking timeline
        mockTracking = {
          orderId,
          status: 'In-Transit',
          eta: 'Today, 4:30 PM',
          courierName: 'Charles O.',
          courierPhone: '+234 803 999 8888',
          checkpoint: 3 // 1: Confirmed, 2: Processing, 3: Shipped/In-Transit, 4: Out for Delivery, 5: Delivered
        };
      }
    }

    setTracking(mockTracking);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  const handleCallCourier = () => {
    if (tracking?.courierPhone && tracking.courierPhone !== 'N/A') {
      Linking.openURL(`tel:${tracking.courierPhone}`).catch(() => {
        Alert.alert('Phone Call', `Calling ${tracking.courierName} at ${tracking.courierPhone}`);
      });
    } else {
      Alert.alert('No Courier', 'No delivery courier has been assigned to this order yet.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navy} />
      </SafeAreaView>
    );
  }

  if (!tracking) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>No tracking information found.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const checkpoint = tracking.checkpoint || 0;

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Track Order</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Status & ETA */}
        <View style={styles.etaCard}>
          <View style={styles.etaRow}>
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaValue}>{tracking.eta}</Text>
            </View>
            <View style={styles.badgeWrapper}>
              <View style={[styles.statusBadge, tracking.status === 'Cancelled' && styles.statusBadgeCancelled]}>
                <Text style={styles.statusBadgeText}>{tracking.status}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.orderIdLabel}>Order ID: {tracking.orderId}</Text>
        </View>

        {tracking.status === 'Cancelled' ? (
          <View style={styles.cancelledCard}>
            <Text style={styles.cancelledText}>🚫 This order was cancelled and cannot be tracked.</Text>
          </View>
        ) : (
          <>
            {/* Visual Delivery Stepper Progress Bar */}
            <View style={styles.stepperCard}>
              <View style={styles.stepperHeader}>
                <Text style={styles.sectionTitle}>Delivery Progress</Text>
                <Text style={styles.stepIndicator}>{checkpoint} of 5 Steps</Text>
              </View>

              <View style={styles.stepperContainer}>
                {/* Visual Line */}
                <View style={styles.stepperVerticalLine} />
                <View style={[styles.stepperVerticalLineActive, { height: `${(checkpoint - 1) * 25}%` }]} />

                {/* Steps */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, checkpoint >= 1 && styles.stepCircleActive]} />
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, checkpoint >= 1 && styles.stepTitleActive]}>Order Placed</Text>
                    <Text style={styles.stepSub}>We have received your order request.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, checkpoint >= 2 && styles.stepCircleActive]} />
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, checkpoint >= 2 && styles.stepTitleActive]}>Order Confirmed</Text>
                    <Text style={styles.stepSub}>Seller has confirmed and packed the items.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, checkpoint >= 3 && styles.stepCircleActive]} />
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, checkpoint >= 3 && styles.stepTitleActive]}>In-Transit</Text>
                    <Text style={styles.stepSub}>Courier has picked up your package.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, checkpoint >= 4 && styles.stepCircleActive]} />
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, checkpoint >= 4 && styles.stepTitleActive]}>Out for Delivery</Text>
                    <Text style={styles.stepSub}>Courier is arriving in your neighborhood.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepCircle, checkpoint >= 5 && styles.stepCircleActive]} />
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, checkpoint >= 5 && styles.stepTitleActive]}>Delivered</Text>
                    <Text style={styles.stepSub}>Package dropped off at the specified address.</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Mock Vector Map Route */}
            <View style={styles.mapCard}>
              <Text style={styles.sectionTitle}>Route Map</Text>
              <View style={styles.mapContainer}>
                {/* SVG Mock Map */}
                <Svg width="100%" height="150" viewBox="0 0 300 150">
                  {/* Grid lines to look like map */}
                  <Rect x="0" y="0" width="300" height="150" fill={colors.surface} rx="8" />
                  <Line x1="40" y1="0" x2="40" y2="150" stroke={colors.border} strokeWidth="1" />
                  <Line x1="120" y1="0" x2="120" y2="150" stroke={colors.border} strokeWidth="1" />
                  <Line x1="200" y1="0" x2="200" y2="150" stroke={colors.border} strokeWidth="1" />
                  
                  <Line x1="0" y1="40" x2="300" y2="40" stroke={colors.border} strokeWidth="1" />
                  <Line x1="0" y1="100" x2="300" y2="100" stroke={colors.border} strokeWidth="1" />

                  {/* Route Road (Thick Gray) */}
                  <Path
                    d="M 30 110 L 120 110 L 120 50 L 250 50"
                    fill="none"
                    stroke="#D2D6DC"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  
                  {/* Active Route Progress (Gold/Blue) */}
                  <Path
                    d="M 30 110 L 120 110 L 120 50 L 250 50"
                    fill="none"
                    stroke={colors.navyLight}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={checkpoint === 3 ? "120, 100" : checkpoint === 4 ? "200, 50" : checkpoint >= 5 ? "300, 0" : "40, 200"}
                  />

                  {/* Seller Warehouse Pin */}
                  <Circle cx="30" cy="110" r="8" fill={colors.navy} />
                  
                  {/* Delivery target Pin */}
                  <Circle cx="250" cy="50" r="8" fill={colors.gold} />

                  {/* Courier Van placement */}
                  <Circle
                    cx={checkpoint === 3 ? "120" : checkpoint === 4 ? "180" : checkpoint >= 5 ? "250" : "50"}
                    cy={checkpoint === 3 ? "80" : "50"}
                    r="12"
                    fill="#FFFFFF"
                    stroke={colors.navy}
                    strokeWidth="2"
                  />
                </Svg>
                <Text style={styles.mapTruckLabel}>
                  {checkpoint === 3 ? '🚚 Delivery Van in-transit on Route 4' : checkpoint === 4 ? '🚚 Courier arriving shortly' : '📦 Package delivered!'}
                </Text>
              </View>
            </View>

            {/* Courier Profile */}
            {tracking.courierName !== 'N/A' && (
              <View style={styles.courierCard}>
                <View style={styles.courierInfo}>
                  <View style={styles.courierAvatar}>
                    <Text style={styles.courierEmoji}>👨‍✈️</Text>
                  </View>
                  <View style={styles.courierTextCol}>
                    <Text style={styles.courierSub}>Your Delivery Courier</Text>
                    <Text style={styles.courierName}>{tracking.courierName}</Text>
                    <Text style={styles.courierVehicle}>White Toyota Van • 4.9★ Rating</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.callCourierBtn}
                  onPress={handleCallCourier}
                  activeOpacity={0.8}
                >
                  <Text style={styles.callIconText}>📞 Call Courier</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  btn: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  btnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  etaCard: {
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  etaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaLabel: {
    ...typography.caption,
    color: colors.goldLight,
    fontWeight: '600',
  },
  etaValue: {
    ...typography.h1,
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 4,
  },
  badgeWrapper: {
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  statusBadgeCancelled: {
    backgroundColor: colors.error,
  },
  statusBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderIdLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: spacing.md,
    fontSize: 11,
  },
  cancelledCard: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  cancelledText: {
    ...typography.bodyBold,
    color: colors.error,
    fontSize: 14,
  },
  stepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepIndicator: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  stepperContainer: {
    position: 'relative',
    paddingLeft: spacing.lg * 1.5,
  },
  stepperVerticalLine: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 2,
    height: '92%',
    backgroundColor: colors.border,
  },
  stepperVerticalLineActive: {
    position: 'absolute',
    left: 8,
    top: 10,
    width: 2,
    backgroundColor: colors.success,
  },
  stepItem: {
    marginBottom: spacing.lg,
    position: 'relative',
    justifyContent: 'center',
  },
  stepCircle: {
    position: 'absolute',
    left: -spacing.lg * 1.5 - 2, // Centered on vertical line
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepCircleActive: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  stepContent: {
    paddingLeft: 6,
  },
  stepTitle: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  stepTitleActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mapContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  mapTruckLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.sm,
    fontSize: 11,
  },
  courierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.xl * 2,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  courierEmoji: {
    fontSize: 24,
  },
  courierTextCol: {
    flex: 1,
    marginLeft: spacing.md,
  },
  courierSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  courierName: {
    ...typography.bodyBold,
    color: colors.navy,
    fontSize: 15,
    marginTop: 1,
  },
  courierVehicle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  callCourierBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  callIconText: {
    ...typography.button,
    color: colors.navy,
    fontWeight: '700',
    fontSize: 13,
  },
});
