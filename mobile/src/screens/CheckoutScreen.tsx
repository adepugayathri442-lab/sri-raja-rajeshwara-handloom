import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../config/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { calculateDeliveryCharge, COMMON_INDIAN_STATES, DeliveryCalculationResult } from '../services/delivery';
import { createWholesaleOrder } from '../services/orders';

export function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { items, subtotal, totalPieces, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Form Fields
  const [name, setName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp_manual' | 'online_payment'>('whatsapp_manual');

  // Delivery Charge
  const [deliveryResult, setDeliveryResult] = useState<DeliveryCalculationResult | null>(null);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate delivery charge whenever state or piece count changes
  useEffect(() => {
    setCalculatingDelivery(true);
    calculateDeliveryCharge(state, totalPieces)
      .then((res) => setDeliveryResult(res))
      .finally(() => setCalculatingDelivery(false));
  }, [state, totalPieces]);

  const deliveryCharge = deliveryResult?.hasActiveRule ? deliveryResult.charge : 0;
  const grandTotal = subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please provide contact/consignee name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Missing Field', 'Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!addressLine1.trim()) {
      Alert.alert('Missing Field', 'Please provide delivery address line 1.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Missing Field', 'Please provide city / town.');
      return;
    }
    if (!pincode.trim()) {
      Alert.alert('Missing Field', 'Please provide postal pincode.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'You must be signed in to place an order.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await createWholesaleOrder({
        userId: user.id,
        customerName: name.trim(),
        phone: phone.trim(),
        businessName: businessName.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        paymentMethod,
        customerNotes: customerNotes.trim() || undefined,
        deliveryCharge,
        items: items.map((i) => ({
          productId: i.productId,
          productCode: i.productCode,
          name: i.name,
          pricePerPiece: i.pricePerPiece,
          quantity: i.quantity,
        })),
      });

      if (!res.success || !res.orderNumber) {
        Alert.alert('Order Placement Error', res.error || 'Failed to record wholesale order.');
        return;
      }

      // Success: clear cart and navigate to OrderSuccessScreen
      clearCart();
      navigation.replace('OrderSuccess', {
        orderId: res.orderId,
        orderNumber: res.orderNumber,
        grandTotal,
        totalPieces,
        state,
        paymentMethod,
      });
    } catch (err: unknown) {
      Alert.alert('Order Error', err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Back row */}
        <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.backText}>Return to Cart</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Wholesale Order Checkout</Text>
        <Text style={styles.pageSubtitle}>
          Complete your merchant delivery address and transport consignment details.
        </Text>

        {/* Delivery Address Section */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>1. Consignee Delivery Address</Text>

          <Input
            label="Consignee / Merchant Name"
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChangeText={setName}
            required
          />

          <Input
            label="Contact Mobile (for Transport/LR updates)"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            required
          />

          <Input
            label="Shop / Business Name (Optional)"
            placeholder="e.g. Sri Balaji Cloth Stores"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Input
            label="Address Line 1"
            placeholder="Door / Shop No., Building, Street"
            value={addressLine1}
            onChangeText={setAddressLine1}
            required
          />

          <Input
            label="Address Line 2 (Optional)"
            placeholder="Landmark, Area, Colony"
            value={addressLine2}
            onChangeText={setAddressLine2}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City / Town"
                placeholder="e.g. Nizamabad"
                value={city}
                onChangeText={setCity}
                required
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Pincode"
                placeholder="6-digit PIN"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
                required
              />
            </View>
          </View>

          {/* Destination State Picker */}
          <Text style={styles.stateLabel}>Destination State *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stateScroll}>
            {COMMON_INDIAN_STATES.map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.stateChip,
                  state === st && styles.stateChipActive,
                ]}
                onPress={() => setState(st)}
              >
                <Text
                  style={[
                    styles.stateChipText,
                    state === st && styles.stateChipTextActive,
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transport & Freight Rule Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>2. Freight & Logistics</Text>

          <View style={styles.freightBox}>
            <View style={styles.freightRow}>
              <Text style={styles.freightKey}>Destination State:</Text>
              <Text style={styles.freightVal}>{state}</Text>
            </View>
            <View style={styles.freightRow}>
              <Text style={styles.freightKey}>Tariff Rule:</Text>
              <Text style={styles.freightVal}>
                {calculatingDelivery ? 'Computing...' : deliveryResult?.ruleApplied || 'Standard'}
              </Text>
            </View>
            <View style={styles.freightRow}>
              <Text style={styles.freightKey}>Delivery Freight:</Text>
              <Text style={styles.freightValHighlight}>
                {deliveryCharge > 0 ? `₹${deliveryCharge}` : 'To Pay / Transport Freight'}
              </Text>
            </View>
          </View>

          <Input
            label="Transport Preference / Instructions (Optional)"
            placeholder="e.g. Navata Road Transport, VRL, Kranti, or Godown Pickup"
            value={customerNotes}
            onChangeText={setCustomerNotes}
            multiline
          />
        </View>

        {/* Payment Method Card */}
        <View style={styles.formCard}>
          <Text style={styles.cardHeader}>3. Wholesale Payment Settlement</Text>

          <TouchableOpacity
            style={[
              styles.methodOption,
              paymentMethod === 'whatsapp_manual' && styles.methodOptionActive,
            ]}
            onPress={() => setPaymentMethod('whatsapp_manual')}
          >
            <Ionicons
              name={paymentMethod === 'whatsapp_manual' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={colors.primary}
            />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>WhatsApp / Direct Bank Transfer</Text>
              <Text style={styles.methodDesc}>
                Instant merchant order booking. Pay via NEFT/RTGS, UPI, or Bank Transfer upon confirmation with our godown.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodOption,
              paymentMethod === 'online_payment' && styles.methodOptionActive,
            ]}
            onPress={() => setPaymentMethod('online_payment')}
          >
            <Ionicons
              name={paymentMethod === 'online_payment' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={colors.primary}
            />
            <View style={styles.methodInfo}>
              <Text style={styles.methodTitle}>Online Payment (UPI / NetBanking / Cards)</Text>
              <Text style={styles.methodDesc}>
                Direct digital invoice payment confirmation.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Final Price Breakdown Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>Order Financial Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Pieces Ordered</Text>
            <Text style={styles.summaryVal}>{totalPieces} pieces</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Merchandise Subtotal</Text>
            <Text style={styles.summaryVal}>₹{subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transport & Freight</Text>
            <Text style={styles.summaryVal}>
              {deliveryCharge > 0 ? `₹${deliveryCharge}` : '₹0 (Pay on Delivery)'}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
          </View>

          <Button
            title={isSubmitting ? 'Placing Wholesale Order...' : 'Confirm Wholesale Order'}
            icon="shield-checkmark-outline"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            onPress={handlePlaceOrder}
            style={{ marginTop: 14 }}
          />
        </View>
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
    marginBottom: 10,
  },
  backText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  stateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 8,
  },
  stateScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  stateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  stateChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  freightBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12,
  },
  freightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  freightKey: {
    fontSize: 12,
    color: colors.muted,
  },
  freightVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  freightValHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  methodOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  summaryHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 8,
    paddingTop: 10,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  grandTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
});
