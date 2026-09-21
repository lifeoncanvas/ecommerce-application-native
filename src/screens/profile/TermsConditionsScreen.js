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

export const TERMS_TEXT_FULL = `TERMS AND CONDITIONS
Litch Marketing — Multi-Vendor Marketplace

1. Introduction and Acceptance of Terms
These Platform Terms and Conditions ("Terms") govern your access to and use of the Litch Marketing website and mobile application (the "Platform"), operated by LICHT MARKETING COMMUNICATIONS LIMITED ("we", "us", "our", or the "Company").
The Platform is a marketplace that enables independent third-party stores ("Sellers") to list and sell products directly to end users ("Buyers", "you", or "User"). By creating an account, browsing, or placing an order on the Platform, you agree to be bound by these Terms.
If you do not agree to these Terms, you must not access or use the Platform.

2. Definitions
● "Buyer" means any individual who purchases or attempts to purchase products through the Platform.
● "Seller" means any individual or business entity approved to list and sell products through the Platform, subject to a separate Seller Agreement.
● "Listing" means any product, description, price, image, or other content a Seller posts on the Platform.
● "Order" means a confirmed purchase transaction between a Buyer and a Seller facilitated through the Platform.
● "User Content" means reviews, images, messages, or other content submitted by Users.
● "Platform Fees" means any fees charged by the Company to Buyers or Sellers for use of the Platform.

3. Eligibility
You must be at least 18 for consent to online services. By using the Platform, you represent that you have the legal capacity to enter into a binding contract in your country of residence.

4. Accounts and Registration
You must provide accurate, current, and complete information when creating an account and keep it updated. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.
We reserve the right to suspend or terminate accounts that provide false information, violate these Terms, or are used for fraudulent or unlawful activity.

5. Nature of the Marketplace — We Are a Facilitator, Not the Seller
Litch Marketing operates as an online marketplace connecting independent Sellers with Buyers. Except where a product is expressly listed as sold directly by LICHT MARKETING COMMUNICATIONS LIMITED, each Seller is the seller of record for its Listings.
● Sellers are solely responsible for the accuracy of their Listings, product quality, safety, legality, and compliance with applicable consumer protection, labelling, and safety laws in the UK, US, and Nigeria as relevant to where they sell.
● The Company does not manufacture, inspect, warehouse (unless using a fulfilment service we expressly operate), or take title to products sold by Sellers.
● Contracts of sale for each Order are formed directly between the Buyer and the relevant Seller. The Company is not a party to that contract but facilitates payment, order management, and dispute support as described in these Terms.

6. Platform Fees and Monetisation
Sellers agree to pay Platform Fees in accordance with the Seller Agreement. The Company reserves the right to introduce or modify buyer service fees with prior notice.

7. Orders, Pricing, and Payments
By placing an Order, you authorise the Company or its payment processor to charge your selected payment method for the total Order amount.
The Company may act as a limited payment collection agent for Sellers, meaning your payment obligation to the Seller is satisfied upon successful payment to the Company, which then remits proceeds to the Seller subject to the Seller Agreement.

8. Shipping and Delivery
Shipping is arranged and fulfilled by the Seller unless the Platform expressly operates a fulfilment service. Estimated delivery times shown at checkout are provided by Sellers and are not guaranteed by the Company.
Cross-border orders may be subject to import duties, customs delays, and additional charges payable by the Buyer, which will be disclosed where possible prior to purchase.

9. Returns, Refunds, and Cancellations
The Platform sets the following minimum standards, which apply to all Sellers regardless of their individual store policies. Sellers may offer more generous terms but not less:
Platform-wide minimum: all Sellers must accept returns for items that are defective, not as described, or damaged in transit within 30 days of delivery, and must process approved refunds within 10 business days of receiving the returned item.
Where a Seller fails to honour a valid return or refund, the Company may, at its discretion, refund the Buyer directly and recover the amount from the Seller under the Seller Agreement.

10. Prohibited Items and Conduct
The following are strictly prohibited on the Platform: counterfeit or replica goods; stolen property; weapons, ammunition, and explosives; illegal drugs and drug paraphernalia; hazardous materials; items infringing intellectual property rights; adult content involving minors in any form; items that violate the export/import laws of the UK, US, or Nigeria.
Users must not use the Platform to harass others, submit fraudulent chargebacks, scrape data, or attempt to circumvent Platform fees by conducting transactions off-platform after being introduced through it.

11. Intellectual Property
The Platform, including its software, design, trademarks, and logos, is owned by the Company or its licensors. Sellers retain ownership of their own brand assets and Listing content but grant the Company a non-exclusive, royalty-free licence to display, reproduce, and promote that content in connection with operating and marketing the Platform.

12. User Content and Reviews
Users may submit reviews, ratings, photos, and other content. You represent that you own or have rights to any content you submit and grant the Company a licence to use it as described above. The Company may remove content that is false, defamatory, abusive, or violates these Terms.

13. Disclaimers
THE PLATFORM AND ALL LISTINGS ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND EXCEPT AS EXPRESSLY STATED HERE OR AS REQUIRED BY APPLICABLE LAW. THE COMPANY DOES NOT WARRANT THE QUALITY, SAFETY, LEGALITY, OR ACCURACY OF SELLER LISTINGS. NOTHING IN THESE TERMS EXCLUDES LIABILITY THAT CANNOT BE EXCLUDED UNDER LAW, INCLUDING FOR DEATH, PERSONAL INJURY CAUSED BY NEGLIGENCE, OR FRAUD.

14. Limitation of Liability
To the maximum extent permitted by applicable law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.

15. Indemnification
You agree to indemnify and hold harmless the Company, its officers, employees, and agents from any claims, damages, or expenses (including reasonable legal fees) arising from your breach of these Terms, your Listings (if a Seller), or your violation of any law or third-party right.

16. Dispute Resolution
Buyer-Seller disputes regarding an Order should first be raised through the Platform's resolution centre. The Company may mediate but is not obligated to resolve disputes on the merits between Buyers and Sellers.
Disputes between you and the Company shall first be attempted to be resolved informally.

17. Governing Law and Jurisdiction
These Terms shall be governed by and construed in accordance with the laws applicable in your jurisdiction of registration, without regard to conflict of law principles.

18. Suspension and Termination
We may suspend or terminate your account at any time for violation of these Terms, suspected fraud, or as required by law, with or without notice depending on severity. You may close your account at any time, subject to completion of any pending Orders.

19. Changes to These Terms
We may update these Terms from time to time. Material changes will be notified via the Platform or email at least 14 days before taking effect. Continued use after changes take effect constitutes acceptance.

20. Contact Information
For questions about these Terms, contact us at support@litchmarketing.com.`;

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
        setContent(res.data?.text || TERMS_TEXT_FULL);
      } catch (e) {
        console.warn('GET /api/content/terms failed. Using updated fallback terms.', e.message);
        setContent(TERMS_TEXT_FULL);
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
            <Text style={styles.subSubtitle}>Litch Marketing — Multi-Vendor Marketplace</Text>
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
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  subSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  termsText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 22,
  },
});

