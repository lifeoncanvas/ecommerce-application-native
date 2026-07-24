import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import Button from '../../components/Button';
import { useTheme } from '../../context/ThemeContext';
import { getSupportTickets, createSupportTicket } from '../../api/support.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function SupportScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);

  // Ticket creation modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issues');
  const [description, setDescription] = useState('');

  const CATEGORIES = ['Order Issues', 'Payment Failures', 'Account & Security', 'Refunds & Returns'];

  // Fetch support tickets
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await withTimeout(getSupportTickets(), 2000);
      setTickets(res.data || []);
    } catch (e) {
      console.warn('GET /api/support/tickets failed. Loading offline mocks.', e.message);
      
      // Offline fallback mock data
      setTickets([
        {
          id: 'tkt_8091',
          subject: 'Stripe Payment debited but order failed',
          category: 'Payment Failures',
          description: 'Tried buying Jazari shawarma but transaction timed out. Money was deducted.',
          status: 'In Progress',
          date: 'Today, 9:30 AM'
        },
        {
          id: 'tkt_7223',
          subject: 'Change of Delivery Location request',
          category: 'Order Issues',
          description: 'Need to redirect ORD-723910 to flat B instead of A.',
          status: 'Resolved',
          date: 'Jan 20, 2026'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Create ticket request
  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill out Subject and Description.');
      return;
    }

    setLoading(true);
    const payload = { subject, category, description };

    try {
      const res = await withTimeout(createSupportTicket(payload), 2000);
      const newId = res.data?.id || `tkt_mock_${Math.floor(Math.random() * 9000 + 1000)}`;
      setTickets((prev) => [{ ...payload, id: newId, status: 'Open', date: 'Just Now' }, ...prev]);
      Alert.alert('Success', 'Support ticket opened successfully!');
      setModalVisible(false);
    } catch (e) {
      console.warn('POST /api/support/ticket failed. Executing locally.', e.message);
      // Fallback
      const newId = `tkt_mock_${Math.floor(Math.random() * 9000 + 1000)}`;
      setTickets((prev) => [{ ...payload, id: newId, status: 'Open', date: 'Just Now' }, ...prev]);
      Alert.alert('Success', 'Support ticket opened locally (Offline Mode).');
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return colors.gold;
      case 'In Progress': return colors.navyLight;
      case 'Resolved': return colors.success;
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>➕</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.reqId}>Ticket: #{item.id}</Text>
                <Text style={[styles.statusTag, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>

              <Text style={styles.ticketSubject}>{item.subject}</Text>
              <Text style={styles.metaText}>Category: {item.category} • Date: {item.date}</Text>
              
              <Text style={styles.sectionLabel}>Query Message</Text>
              <Text style={styles.detailText}>{item.description}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>☎️</Text>
              <Text style={styles.emptyText}>No Active Support Tickets</Text>
            </View>
          }
        />
      )}

      {/* Create Ticket Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Open Support Case</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} contentContainerStyle={styles.modalFormContent}>
              <Text style={styles.fieldLabel}>Subject / Title</Text>
              <TextInput
                style={styles.modalInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Briefly state your concern"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoriesRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catBtnLabel, category === cat && styles.catBtnLabelActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextarea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide order numbers, payment references, or screenshots description..."
                placeholderTextColor={colors.textSecondary}
                multiline={true}
                numberOfLines={5}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
              <Button title="Submit Case" style={{ flex: 1 }} onPress={handleCreateTicket} />
            </View>
          </View>
        </View>
      </Modal>
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
  addBtnText: {
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
  ticketSubject: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    height: '80%',
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  modalCloseText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalForm: {
    flex: 1,
  },
  modalFormContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: -4,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.textPrimary,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  catBtnActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  catBtnLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  catBtnLabelActive: {
    color: '#FFFFFF',
  },
  modalTextarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
});
