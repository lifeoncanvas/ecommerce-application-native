import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import { getLoyaltyStatus, redeemLoyaltyPoints } from '../../api/loyalty.api';
import { sendLocalNotification } from '../../utils/notificationManager';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function LoyaltyScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(250);
  const [history, setHistory] = useState([]);

  const REWARDS = [
    { id: 'rew_1', title: '$5 Voucher Code', cost: 100, code: 'LOYAL5', description: 'Redeem for flat $5 off coupon in cart', value: 5 },
    { id: 'rew_2', title: '$10 Voucher Code', cost: 180, code: 'LOYAL10', description: 'Redeem for premium $10 off coupon in cart', value: 10 },
    { id: 'rew_3', title: 'Free Delivery Code', cost: 50, code: 'LOYALFREE', description: 'Redeem for free shipping on your next order', value: 5.99 }
  ];

  // Fetch Loyalty Status
  const loadLoyalty = useCallback(async () => {
    setLoading(true);
    try {
      const res = await withTimeout(getLoyaltyStatus(), 2000);
      if (res.data) {
        setPoints(res.data.points || 250);
        setHistory(res.data.history || []);
      }
    } catch (e) {
      console.warn('GET /api/loyalty failed. Seeding offline defaults.', e.message);
      // Offline mock data
      setPoints(250);
      setHistory([
        { id: 'h_1', action: 'Order checkout reward', points: '+35 pts', date: 'Jan 22, 2026' },
        { id: 'h_2', action: 'Redeemed Free Shipping Coupon', points: '-50 pts', date: 'Jan 15, 2026' },
        { id: 'h_3', action: 'Welcome Loyalty Bonus', points: '+265 pts', date: 'Jan 01, 2026' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLoyalty();
  }, [loadLoyalty]);

  // Redeem points action
  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      Alert.alert('Insufficient Balance', 'You need more loyalty points to redeem this reward.');
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Redeem ${reward.cost} points for "${reward.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            setLoading(true);
            try {
              await withTimeout(redeemLoyaltyPoints(reward.id), 2000);
              await saveCouponAndDeduct(reward);
            } catch (e) {
              console.warn('Redemption API failed. Processing locally.', e.message);
              await saveCouponAndDeduct(reward);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const saveCouponAndDeduct = async (reward) => {
    // 1. Deduct points locally
    const newBalance = points - reward.cost;
    setPoints(newBalance);

    // 2. Add to points history
    setHistory((prev) => [
      { id: `h_new_${Date.now()}`, action: `Redeemed ${reward.title}`, points: `-${reward.cost} pts`, date: 'Just Now' },
      ...prev
    ]);

    // 3. Save redeemed coupon into local coupons database so it shows up in Cart Modal!
    try {
      const stored = await AsyncStorage.getItem('@local_coupons');
      let localCoupons = [];
      if (stored) localCoupons = JSON.parse(stored);
      
      const newCoupon = {
        code: reward.code,
        description: reward.description,
        value: reward.value
      };
      localCoupons = [newCoupon, ...localCoupons];
      await AsyncStorage.setItem('@local_coupons', JSON.stringify(localCoupons));
    } catch (err) {
      console.warn('Failed to save coupon to local database', err);
    }

    // 4. Send notification
    sendLocalNotification(
      'Reward Redeemed! 🎉',
      `Redeemed "${reward.code}". Coupon added to your available cart list.`
    );

    Alert.alert(
      'Redemption Successful! 🎉',
      `Points deducted. Code "${reward.code}" is now available in your cart checkout page.`
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
        <Text style={styles.headerTitle}>Loyalty Rewards</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Gold Balance Display Card */}
          <View style={styles.goldCard}>
            <Text style={styles.goldCardLabel}>Loyalty Balance</Text>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsVal}>{points}</Text>
              <Text style={styles.pointsUnit}>PTS</Text>
            </View>
            <Text style={styles.goldCardDesc}>Earn 1 point for every $1 spent. Redeem for discount coupons.</Text>
          </View>

          {/* Redeemable Rewards list */}
          <Text style={styles.sectionTitle}>Redeemable Vouchers</Text>
          <View style={styles.rewardsList}>
            {REWARDS.map((rew) => (
              <View key={rew.id} style={styles.rewardItem}>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{rew.title}</Text>
                  <Text style={styles.rewardDesc}>{rew.description}</Text>
                  <Text style={styles.rewardCostText}>{rew.cost} Points</Text>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, points < rew.cost && styles.redeemBtnDisabled]}
                  onPress={() => handleRedeem(rew)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.redeemBtnText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Points History */}
          <Text style={styles.sectionTitle}>Points Ledger History</Text>
          <View style={styles.historyList}>
            {history.map((hist) => (
              <View key={hist.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyAction}>{hist.action}</Text>
                  <Text style={styles.historyDate}>{hist.date}</Text>
                </View>
                <Text
                  style={[
                    styles.historyPoints,
                    { color: hist.points.startsWith('+') ? colors.success : colors.error }
                  ]}
                >
                  {hist.points}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  goldCard: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  goldCardLabel: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: spacing.xs,
  },
  pointsVal: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pointsUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 4,
    marginBottom: 6,
  },
  goldCardDesc: {
    ...typography.caption,
    color: '#FFFFFF',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.9,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  rewardsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  rewardItem: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  rewardDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  rewardCostText: {
    ...typography.bodyBold,
    color: colors.gold,
    fontSize: 12,
    marginTop: 4,
  },
  redeemBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  redeemBtnDisabled: {
    backgroundColor: colors.border,
  },
  redeemBtnText: {
    ...typography.button,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  historyList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
  },
  historyAction: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  historyDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  historyPoints: {
    ...typography.bodyBold,
    fontSize: 13,
  },
});
