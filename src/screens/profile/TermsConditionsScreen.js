import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { typography, spacing, radius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { getTermsAndConditions } from '../../api/content.api';

const withTimeout = (promise, ms = 2000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

export default function TermsConditionsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadTerms = async () => {
      setLoading(true);
      try {
        const res = await withTimeout(getTermsAndConditions(), 2000);
        setContent(res.data?.text || '');
      } catch (e) {
        console.warn('GET /api/content/terms failed. Using fallback terms.', e.message);
        setContent(
          'TERMS AND CONDITIONS\nLicht Marketing – Multi-Vendor Marketplace\n\n1. Introduction and Acceptance of Terms\nThese Platform Terms and Conditions ("Terms") govern your access to and use of the Licht Marketing website and mobile application (the "Platform"), operated by LICHT MARKETING COMMUNICATIONS LIMITED ("we", "us", "our", or the "Company").\n\nThe Platform is a marketplace that enables independent third-party stores ("Sellers") to list and sell products directly to end users ("Buyers", "you", or "User"). By creating an account, browsing, or placing an order on the Platform, you agree to be bound by these Terms.\n\nIf you do not agree to these Terms, you must not access or use the Platform.\n\n2. Definitions\n"Buyer" means any individual who purchases or attempts to purchase products through the Platform.\n"Seller" means any individual or business entity approved to list and sell products through the Platform, subject to a separate Seller Agreement.\n"Listing" means any product, description, price, image, or other content a Seller posts on the Platform.\n"Order" means a confirmed purchase transaction between a Buyer and a Seller facilitated through the Platform.\n"User Content" means reviews, images, messages, or other content submitted by Users.\n"Platform Fees" means any fees charged by the Company to Buyers or Sellers for use of the Platform.\n\n3. Eligibility\nYou must be at least 18 years old and have the legal capacity to enter into a binding contract in your country of residence.\n\n4. Accounts and Registration\nYou must provide accurate, current, and complete information when creating an account and keep it updated. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.\n\nWe reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or are used for fraudulent or unlawful activity.\n\n5. Nature of the Marketplace – We Are a Facilitator, Not the Seller\nLicht Marketing operates as an online marketplace connecting independent Sellers with Buyers. Except where a product is expressly listed as sold directly by LICHT MARKETING COMMUNICATIONS LIMITED, each Seller is the seller of record for its Listings.\n\nSellers are solely responsible for the accuracy of their Listings, product quality, safety, legality, and compliance with applicable consumer protection, labelling, and safety laws.\n\nThe Company does not manufacture, inspect, warehouse (unless using a fulfilment service we expressly operate), or take title to products sold by Sellers.\n\nContracts of sale for each Order are formed directly between the Buyer and the relevant Seller. The Company is not a party to that contract but facilitates payment, order management, and dispute support.\n\n6. Orders, Pricing, and Payments\nBy placing an Order, you authorise the Company or its payment processor to charge your selected payment method for the total Order amount.\n\nThe Company may act as a limited payment collection agent for Sellers, meaning your payment obligation to the Seller is satisfied upon successful payment to the Company, which then remits proceeds to the Seller subject to the Seller Agreement.\n\n7. Shipping and Delivery\nShipping is arranged and fulfilled by the Seller unless the Platform expressly operates a fulfilment service. Estimated delivery times shown at checkout are provided by Sellers and are not guaranteed by the Company.\n\n8. Returns, Refunds, and Cancellations\nThe Platform sets the following minimum standards, which apply to all Sellers regardless of their individual store policies.\n\n9. Prohibited Items and Conduct\nThe following are strictly prohibited on the Platform: counterfeit or replica goods; stolen property; weapons, ammunition, and explosives; illegal drugs.\n\n10. Intellectual Property\nThe Platform, including its software, design, trademarks, and logos, is owned by LICHT MARKETING COMMUNICATIONS LIMITED or its licensors.\n\n11. Contact Information\nFor questions about these Terms, contact us at support@lichtmarketing.com.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadTerms();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Svg width="22" height="22" viewBox="0 0 24 24">
            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={colors.navy} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerBtn} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.navy} />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Terms of Service Agreement</Text>
            <Text style={styles.termsText}>{content}</Text>
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 20,
  },
});
