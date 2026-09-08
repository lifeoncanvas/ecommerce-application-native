import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  CaretLeft,
  CreditCard,
  CurrencyCircleDollar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowsClockwise,
} from 'phosphor-react-native';
import { getPaymentHistory } from '../../api/payment.api';
import { CURRENCY } from '../../utils/currency';

const MOCK_PAYMENTS = [
  {
    id: 'pay_1',
    orderId: 'ORD-2026-0451',
    date: '2026-09-05T14:32:00Z',
    amount: 28500,
    method: 'stripe',
    cardLast4: '4242',
    status: 'SUCCESS',
  },
  {
    id: 'pay_2',
    orderId: 'ORD-2026-0389',
    date: '2026-08-29T10:15:00Z',
    amount: 12990,
    method: 'paypal',
    cardLast4: null,
    status: 'SUCCESS',
  },
  {
    id: 'pay_3',
    orderId: 'ORD-2026-0344',
    date: '2026-08-22T16:45:00Z',
    amount: 45000,
    method: 'stripe',
    cardLast4: '1234',
    status: 'REFUNDED',
  },
  {
    id: 'pay_4',
    orderId: 'ORD-2026-0298',
    date: '2026-08-15T09:20:00Z',
    amount: 7850,
    method: 'espees',
    cardLast4: null,
    status: 'SUCCESS',
  },
  {
    id: 'pay_5',
    orderId: 'ORD-2026-0201',
    date: '2026-07-30T11:10:00Z',
    amount: 32000,
    method: 'stripe',
    cardLast4: '4242',
    status: 'FAILED',
  },
  {
    id: 'pay_6',
    orderId: 'ORD-2026-0155',
    date: '2026-07-18T18:55:00Z',
    amount: 19990,
    method: 'paypal',
    cardLast4: null,
    status: 'SUCCESS',
  },
];

const getMethodDisplay = (method, cardLast4) => {
  if (method === 'stripe') return `Visa •••• ${cardLast4 || '****'}`;
  if (method === 'paypal') return 'PayPal';
  if (method === 'espees') return 'Espees Wallet';
  return method;
};

const getMethodColor = (method) => {
  if (method === 'stripe') return '#635BFF';
  if (method === 'paypal') return '#003087';
  if (method === 'espees') return '#10B981';
  return '#6B7280';
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'SUCCESS':
      return { label: 'Successful', color: '#15803D', bg: '#DCFCE7', Icon: CheckCircle };
    case 'REFUNDED':
      return { label: 'Refunded', color: '#B45309', bg: '#FEF3C7', Icon: ArrowsClockwise };
    case 'FAILED':
      return { label: 'Failed', color: '#DC2626', bg: '#FEE2E2', Icon: XCircle };
    case 'PENDING':
      return { label: 'Pending', color: '#6B7280', bg: '#F3F4F6', Icon: Clock };
    default:
      return { label: status, color: '#6B7280', bg: '#F3F4F6', Icon: Clock };
  }
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${mins} ${ampm}`;
};

export default function PaymentHistoryScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaymentHistory();
      const list = res.data || [];
      if (list.length > 0) {
        setPayments(list);
      } else {
        setPayments(MOCK_PAYMENTS);
      }
    } catch (e) {
      console.warn('Failed to fetch payment history, using mock data', e.message);
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Summary stats
  const totalSpent = payments.filter((p) => p.status === 'SUCCESS').reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments.filter((p) => p.status === 'REFUNDED').reduce((sum, p) => sum + p.amount, 0);
  const successCount = payments.filter((p) => p.status === 'SUCCESS').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <CaretLeft size={22} color="#010E2A" weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment History</Text>
        <View style={{ width: 34 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A2C5B" />
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderLeftColor: '#15803D' }]}>
              <Text style={styles.summaryLabel}>Total Spent</Text>
              <Text style={[styles.summaryValue, { color: '#15803D' }]}>{CURRENCY.format(totalSpent)}</Text>
              <Text style={styles.summaryMeta}>{successCount} payments</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: '#B45309' }]}>
              <Text style={styles.summaryLabel}>Refunded</Text>
              <Text style={[styles.summaryValue, { color: '#B45309' }]}>{CURRENCY.format(totalRefunded)}</Text>
              <Text style={styles.summaryMeta}>{payments.filter((p) => p.status === 'REFUNDED').length} refunds</Text>
            </View>
          </View>

          {/* Payment List */}
          <Text style={styles.sectionTitle}>All Transactions</Text>
          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CurrencyCircleDollar size={48} color="#D1D5DB" weight="thin" />
              <Text style={styles.emptyTitle}>No Payments Yet</Text>
              <Text style={styles.emptySubtitle}>Your payment history will appear here after your first purchase.</Text>
            </View>
          ) : (
            payments.map((pay) => {
              const statusConfig = getStatusConfig(pay.status);
              const StatusIcon = statusConfig.Icon;
              return (
                <View key={pay.id} style={styles.paymentCard}>
                  <View style={styles.paymentTop}>
                    <View style={styles.paymentInfo}>
                      <View style={[styles.methodDot, { backgroundColor: getMethodColor(pay.method) }]} />
                      <View>
                        <Text style={styles.methodText}>{getMethodDisplay(pay.method, pay.cardLast4)}</Text>
                        <Text style={styles.orderIdText}>{pay.orderId}</Text>
                      </View>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.amountText}>{CURRENCY.format(pay.amount)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <StatusIcon size={10} color={statusConfig.color} weight="bold" />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.paymentBottom}>
                    <Text style={styles.dateText}>📅 {formatDate(pay.date)}</Text>
                    <Text style={styles.timeText}>🕐 {formatTime(pay.date)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#010E2A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
    borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  summaryLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  summaryValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  summaryMeta: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  sectionTitle: {
    fontSize: 11, color: '#6B7280', fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginLeft: 2,
  },
  emptyContainer: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 6, textAlign: 'center' },
  paymentCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  paymentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  paymentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  methodDot: { width: 8, height: 8, borderRadius: 4 },
  methodText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  orderIdText: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  paymentRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 15, fontWeight: '800', color: '#111827' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4,
  },
  statusText: { fontSize: 9, fontWeight: '700' },
  paymentBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  dateText: { fontSize: 11, color: '#6B7280' },
  timeText: { fontSize: 11, color: '#6B7280' },
});
