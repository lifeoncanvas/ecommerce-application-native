import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { createExchangeRequest } from '../../api/exchange.api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocalNotification } from '../../utils/notificationManager';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function ReturnScreen({ route, navigation }) {
  const { orderId, items = [] } = route?.params || {};
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [issue, setIssue] = useState('Defective Product');
  const [returnType, setReturnType] = useState('refund'); // 'refund' or 'exchange'
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const ISSUES = [
    'Defective Product',
    'Wrong Item Received',
    'Incorrect Size',
    'Item Not as Described',
    'Changed My Mind'
  ];

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'No products available for return.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please describe the issue in detail.');
      return;
    }

    setLoading(true);
    const targetItem = items[selectedItemIndex];
    const subtextVal = returnType === 'refund' 
      ? 'Refund will be processed in 7 business days' 
      : 'Replacement arriving in 7 business days';

    const payload = {
      orderId,
      itemId: targetItem.productId || targetItem.id,
      itemName: targetItem.name,
      reason: issue,
      description: `[${returnType.toUpperCase()}] ${comment}`,
      type: returnType,
    };

    try {
      await withTimeout(createExchangeRequest(payload), 2000);
      
      // Update local storage status
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((o) =>
          o.id === orderId ? { ...o, status: returnType === 'refund' ? 'Refund Pending' : 'Exchange Pending', statusSubtext: subtextVal } : o
        );
        await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
      }

      // Save return/exchange item locally for the history list
      try {
        const localExchangeReq = {
          id: `ex_${Math.floor(Math.random() * 9000 + 1000)}`,
          orderId: orderId,
          itemName: targetItem.name,
          reason: issue,
          description: `[${returnType.toUpperCase()}] ${comment}`,
          status: 'Pending',
          date: 'Just Now'
        };
        const storedEx = await AsyncStorage.getItem('@local_exchanges');
        let currentEx = [];
        if (storedEx) currentEx = JSON.parse(storedEx);
        currentEx = [localExchangeReq, ...currentEx];
        await AsyncStorage.setItem('@local_exchanges', JSON.stringify(currentEx));
      } catch (err) {
        console.warn('Failed to save exchange request locally', err);
      }

      sendLocalNotification(
        returnType === 'refund' ? 'Refund Initiated 💵' : 'Exchange Initiated 🔄',
        returnType === 'refund'
          ? 'You will receive your refund in 7 business days.'
          : 'You will receive your replacement item in 7 business days.'
      );

      Alert.alert(
        'Request Placed',
        returnType === 'refund'
          ? 'Your refund request has been initiated. You will get the refund in 7 business days.'
          : 'Your exchange request has been initiated. You will get the exchange in 7 business days.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
      );
    } catch (e) {
      console.warn('Return/Exchange submission failed. Executing offline.', e.message);
      
      // Offline fallback
      const stored = await AsyncStorage.getItem('@local_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((o) =>
          o.id === orderId ? { ...o, status: returnType === 'refund' ? 'Refund Pending' : 'Exchange Pending', statusSubtext: subtextVal } : o
        );
        await AsyncStorage.setItem('@local_orders', JSON.stringify(updated));
      }

      // Save return/exchange item locally for the history list (Offline Fallback)
      try {
        const localExchangeReq = {
          id: `ex_${Math.floor(Math.random() * 9000 + 1000)}`,
          orderId: orderId,
          itemName: targetItem.name,
          reason: issue,
          description: `[${returnType.toUpperCase()}] ${comment}`,
          status: 'Pending',
          date: 'Just Now'
        };
        const storedEx = await AsyncStorage.getItem('@local_exchanges');
        let currentEx = [];
        if (storedEx) currentEx = JSON.parse(storedEx);
        currentEx = [localExchangeReq, ...currentEx];
        await AsyncStorage.setItem('@local_exchanges', JSON.stringify(currentEx));
      } catch (err) {
        console.warn('Failed to save exchange request locally offline', err);
      }

      sendLocalNotification(
        returnType === 'refund' ? 'Refund Initiated (Offline) 💵' : 'Exchange Initiated (Offline) 🔄',
        returnType === 'refund'
          ? 'You will receive your refund in 7 business days.'
          : 'You will receive your replacement item in 7 business days.'
      );

      Alert.alert(
        'Request Placed',
        returnType === 'refund'
          ? 'Your refund request has been registered (Offline Mode). You will get the refund in 7 business days.'
          : 'Your exchange request has been registered (Offline Mode). You will get the exchange in 7 business days.',
        [{ text: 'OK', onPress: () => navigation.navigate('MyOrders') }]
      );
    } finally {
      setLoading(false);
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
        <Text style={styles.headerTitle}>Return / Exchange</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Step 1: Select Item */}
          <Text style={styles.sectionTitle}>Select Item to Return</Text>
          <View style={styles.card}>
            {items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.itemRow, selectedItemIndex === idx && styles.itemRowActive]}
                onPress={() => setSelectedItemIndex(idx)}
                activeOpacity={0.8}
              >
                <View style={styles.radio}>
                  {selectedItemIndex === idx && <View style={styles.radioDot} />}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Qty: {item.quantity || 1} • ${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Step 2: Select Issue */}
          <Text style={styles.sectionTitle}>What is the issue with this product?</Text>
          <View style={styles.issuesList}>
            {ISSUES.map((iss) => (
              <TouchableOpacity
                key={iss}
                style={[styles.issueBtn, issue === iss && styles.issueBtnActive]}
                onPress={() => setIssue(iss)}
              >
                <Text style={[styles.issueBtnText, issue === iss && styles.issueBtnTextActive]}>{iss}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Step 3: Choose Refund or Exchange */}
          <Text style={styles.sectionTitle}>Select Preferred Action</Text>
          <View style={styles.actionOptionsRow}>
            <TouchableOpacity
              style={[styles.optionCard, returnType === 'refund' && styles.optionCardActive]}
              onPress={() => setReturnType('refund')}
              activeOpacity={0.85}
            >
              <Text style={styles.optionEmoji}>💵</Text>
              <Text style={styles.optionTitle}>Refund</Text>
              <Text style={styles.optionDesc}>Money returned to your original payment gateway</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, returnType === 'exchange' && styles.optionCardActive]}
              onPress={() => setReturnType('exchange')}
              activeOpacity={0.85}
            >
              <Text style={styles.optionEmoji}>🔄</Text>
              <Text style={styles.optionTitle}>Exchange</Text>
              <Text style={styles.optionDesc}>Replace item with an identical item or size</Text>
            </TouchableOpacity>
          </View>

          {/* Step 4: Comments */}
          <Text style={styles.sectionTitle}>Describe the issue in detail</Text>
          <TextInput
            style={styles.textarea}
            value={comment}
            onChangeText={setComment}
            placeholder="Describe the issue, size mismatch details, or defect description..."
            placeholderTextColor={colors.textSecondary}
            multiline={true}
            numberOfLines={4}
          />

          <View style={styles.btnWrapper}>
            <Button title="Submit Request" onPress={handleSubmit} />
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderColor: colors.border,
  },
  itemRowActive: {
    backgroundColor: colors.gold + '05',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  issuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  issueBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  issueBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  issueBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  issueBtnTextActive: {
    color: '#FFFFFF',
  },
  actionOptionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '05',
  },
  optionEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  optionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  optionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
  btnWrapper: {
    marginBottom: spacing.xl,
  },
});
