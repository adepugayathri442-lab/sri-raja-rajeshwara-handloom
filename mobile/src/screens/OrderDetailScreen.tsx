import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors } from '../config/colors';
import { getOrderById, MobileOrder } from '../services/orders';

const TRACKING_STEPS = [
  'Order Placed',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
];

export function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};

  const [order, setOrder] = useState<MobileOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId)
        .then((data) => setOrder(data))
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <LoadingSpinner message="Fetching order tracking information..." />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Order details could not be found.</Text>
          <Button
            title="Return to Orders"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    );
  }

  const isCancelled = order.order_status === 'Cancelled';
  const currentStepIndex = isCancelled
    ? -1
    : TRACKING_STEPS.indexOf(order.order_status);

  const openWhatsApp = () => {
    const text = encodeURIComponent(
      `*SRI RAJA RAJESHWARA HANDLOOM — Consignment Status Enquiry*\n\n` +
      `Order: *${order.order_number}*\n` +
      `Current Status: ${order.order_status}\n` +
      (order.lr_number ? `LR Number: ${order.lr_number}\n` : '') +
      `Amount: ₹${order.grand_total}\n\n` +
      `Namaste! Could you please update me on dispatch and parcel transport tracking?`
    );
    Linking.openURL(`https://wa.me/919440472939?text=${text}`).catch(console.warn);
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Back row */}
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.backText}>Back to Orders</Text>
        </TouchableOpacity>

        {/* Status Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.orderLabel}>WHOLESALE ORDER</Text>
              <Text style={styles.orderNumber}>{order.order_number}</Text>
            </View>
            <Badge
              label={order.order_status}
              variant={isCancelled ? 'danger' : 'primary'}
              size="md"
            />
          </View>

          <Text style={styles.dateText}>
            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Consignment Tracking Stepper */}
        <View style={styles.trackingCard}>
          <Text style={styles.cardTitle}>Parcel Consignment Progress</Text>

          {isCancelled ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="alert-circle" size={24} color={colors.danger} />
              <Text style={styles.cancelledText}>This order was cancelled.</Text>
            </View>
          ) : (
            <View style={styles.stepperContainer}>
              {TRACKING_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        {isPassed && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            isPassed && idx < currentStepIndex && styles.stepLinePassed,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.stepTextCol}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isPassed && styles.stepTitlePassed,
                          isCurrent && styles.stepTitleCurrent,
                        ]}
                      >
                        {step}
                      </Text>
                      <Text style={styles.stepSubtitle}>
                        {step === 'Order Placed' && 'Order received at Nizamabad godown'}
                        {step === 'Confirmed' && 'Wholesale prices and order verified'}
                        {step === 'Processing' && 'Bale textiles allocated from inventory'}
                        {step === 'Packed' && 'Bundled securely for commercial dispatch'}
                        {step === 'Shipped' && 'Handed over to transport logistics / parcel'}
                        {step === 'Delivered' && 'Consignment delivered to merchant godown'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Logistics & LR Details */}
        {(order.lr_number || order.tracking_number || order.transporter_name) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Transport Logistics & Consignment Details</Text>
            {order.transporter_name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Transport Agency:</Text>
                <Text style={styles.infoVal}>{order.transporter_name}</Text>
              </View>
            )}
            {order.lr_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Lorry Receipt (LR) No:</Text>
                <Text style={styles.infoValHighlight}>{order.lr_number}</Text>
              </View>
            )}
            {order.tracking_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Consignment Tracking:</Text>
                <Text style={styles.infoValHighlight}>{order.tracking_number}</Text>
              </View>
            )}
          </View>
        )}

        {/* Consignee Address */}
        {order.address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Consignee Delivery Address</Text>
            <Text style={styles.addressName}>{order.address.name}</Text>
            <Text style={styles.addressText}>{order.address.address_line_1}</Text>
            {order.address.address_line_2 ? (
              <Text style={styles.addressText}>{order.address.address_line_2}</Text>
            ) : null}
            <Text style={styles.addressText}>
              {order.address.city}, {order.address.state} – {order.address.pincode}
            </Text>
            <Text style={styles.addressPhone}>Phone: {order.address.phone}</Text>
          </View>
        )}

        {/* Itemized Order Breakdown */}
        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Itemized Merchandise Snapshot</Text>
            {order.order_items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.product_name_snapshot}</Text>
                  <Text style={styles.itemCode}>{item.product_code_snapshot}</Text>
                  <Text style={styles.itemRate}>
                    ₹{item.price_per_piece} × {item.quantity} pieces
                  </Text>
                </View>
                <Text style={styles.itemTotal}>₹{item.line_total}</Text>
              </View>
            ))}

            <View style={styles.pricingBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceKey}>Subtotal</Text>
                <Text style={styles.priceVal}>₹{order.subtotal}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceKey}>Delivery / Freight</Text>
                <Text style={styles.priceVal}>
                  {order.delivery_charge > 0 ? `₹${order.delivery_charge}` : '₹0 (Pay on Delivery)'}
                </Text>
              </View>
              <View style={[styles.priceRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalKey}>Grand Total</Text>
                <Text style={styles.grandTotalVal}>₹{order.grand_total}</Text>
              </View>
            </View>
          </View>
        )}

        {/* WhatsApp Support CTA */}
        <Button
          title="Enquire on WhatsApp (+91 94404 72939)"
          icon="logo-whatsapp"
          variant="whatsapp"
          size="lg"
          onPress={openWhatsApp}
          style={{ marginTop: 8 }}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentHover,
    letterSpacing: 0.8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
  },
  dateText: {
    fontSize: 12,
    color: colors.muted,
  },
  trackingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
  },
  cancelledText: {
    fontSize: 14,
    color: colors.danger,
    fontWeight: '700',
  },
  stepperContainer: {
    paddingLeft: 6,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 52,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotPassed: {
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepLinePassed: {
    backgroundColor: colors.primary,
  },
  stepTextCol: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  stepTitlePassed: {
    color: colors.charcoal,
  },
  stepTitleCurrent: {
    color: colors.primary,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  infoValHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  itemCode: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
  },
  itemRate: {
    fontSize: 11,
    color: colors.accentHover,
    fontWeight: '600',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  pricingBreakdown: {
    marginTop: 12,
    paddingTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  priceVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 6,
    paddingTop: 8,
  },
  grandTotalKey: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  notFound: {
    padding: 36,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 15,
    color: colors.muted,
  },
});
