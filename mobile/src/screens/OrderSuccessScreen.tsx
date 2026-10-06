import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { colors } from '../config/colors';

export function OrderSuccessScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderNumber, grandTotal, totalPieces, state } = route.params || {};

  const sendWhatsAppConfirmation = () => {
    const text = encodeURIComponent(
      `*SRI RAJA RAJESHWARA HANDLOOM — Wholesale Order Placed*\n\n` +
      `Order Number: *${orderNumber || 'SRR'}*\n` +
      `Total Pieces: ${totalPieces || 0} pcs\n` +
      `Destination State: ${state || 'India'}\n` +
      `Order Amount: ₹${grandTotal || 0}\n\n` +
      `Namaste! I have placed this wholesale order on the Sri Raja Rajeshwara Handloom mobile app. Please confirm bale packing and dispatch schedule.`
    );
    Linking.openURL(`https://wa.me/919440472939?text=${text}`).catch((err) =>
      console.warn('Could not open WhatsApp:', err)
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successIconBox}>
          <Ionicons name="checkmark-done-circle" size={56} color={colors.success} />
        </View>

        <Text style={styles.title}>Wholesale Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order request has been registered in our Nizamabad dispatch system.
        </Text>

        <View style={styles.orderBox}>
          <View style={styles.row}>
            <Text style={styles.key}>Order Number:</Text>
            <Text style={styles.orderNum}>{orderNumber || 'SRR-Pending'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Total Volume:</Text>
            <Text style={styles.val}>{totalPieces || 0} Pieces</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Grand Total:</Text>
            <Text style={styles.grandVal}>₹{grandTotal || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.key}>Order Status:</Text>
            <Text style={styles.statusVal}>Order Placed / Pending Dispatch</Text>
          </View>
        </View>

        <View style={styles.b2bNotice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.noticeText}>
            Our godown merchant will inspect your consignment and coordinate transport parcel / LR booking.
          </Text>
        </View>

        <Button
          title="Send Confirmation on WhatsApp"
          icon="logo-whatsapp"
          variant="whatsapp"
          size="lg"
          onPress={sendWhatsAppConfirmation}
          style={styles.btn}
        />

        <Button
          title="Track Orders in My Account"
          icon="document-text-outline"
          variant="primary"
          size="md"
          onPress={() => navigation.navigate('OrdersTab')}
          style={styles.btn}
        />

        <Button
          title="Continue Browsing Wholesale Catalog"
          variant="outline"
          size="md"
          onPress={() => navigation.navigate('ProductsTab')}
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 300,
  },
  orderBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  key: {
    fontSize: 13,
    color: colors.muted,
  },
  orderNum: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  val: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  grandVal: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
  },
  statusVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentHover,
  },
  b2bNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySubtle,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 59, 46, 0.15)',
    marginBottom: 20,
    width: '100%',
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 16,
  },
  btn: {
    width: '100%',
    marginBottom: 10,
  },
});
