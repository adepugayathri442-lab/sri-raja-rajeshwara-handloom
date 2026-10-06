import React from 'react';
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
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../config/colors';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, totalPieces, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  // If user is not logged in, prompt authentication to access wholesale cart
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.authLockCard}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={36} color={colors.primary} />
          </View>
          <Text style={styles.lockTitle}>Merchant Login Required</Text>
          <Text style={styles.lockSubtitle}>
            Wholesale piece carts and B2B pricing reservations are strictly accessible to registered merchants, cloth stores, and resellers.
          </Text>
          <Button
            title="Sign In to Your Account"
            icon="log-in-outline"
            variant="primary"
            onPress={() => navigation.navigate('Login', { returnTo: 'CartTab' })}
            style={{ width: '100%', marginBottom: 10 }}
          />
          <Button
            title="Create Merchant Account"
            icon="person-add-outline"
            variant="outline"
            onPress={() => navigation.navigate('Register', { returnTo: 'CartTab' })}
            style={{ width: '100%' }}
          />
        </View>
      </View>
    );
  }

  const confirmClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your wholesale order cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header />

      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your Wholesale Cart is Empty"
          description="Browse our authentic handloom towel, lungi, dhoti, and shawl collections to start your order."
          actionTitle="Explore Wholesale Catalogue"
          onAction={() => navigation.navigate('ProductsTab')}
        />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Header Bar */}
          <View style={styles.summaryBar}>
            <View>
              <Text style={styles.summaryTitle}>Wholesale Order Cart</Text>
              <Text style={styles.summarySub}>
                {totalPieces} Pieces • {items.length} Products
              </Text>
            </View>
            <TouchableOpacity onPress={confirmClearCart}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {/* Cart Item Cards */}
          <View style={styles.itemsList}>
            {items.map((item) => (
              <View key={item.productId} style={styles.cartCard}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemCategory}>{item.categoryName}</Text>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCode}>{item.productCode}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeItem(item.productId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {/* Price and Stepper Row */}
                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.rateLabel}>Rate / Piece</Text>
                    <Text style={styles.rateValue}>₹{item.pricePerPiece}</Text>
                  </View>

                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="remove" size={16} color={colors.charcoal} />
                    </TouchableOpacity>
                    <Text style={styles.stepValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={styles.stepBtn}
                    >
                      <Ionicons name="add" size={16} color={colors.charcoal} />
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.rateLabel}>Item Total</Text>
                    <Text style={styles.itemTotal}>
                      ₹{item.pricePerPiece * item.quantity}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Order Summary Box */}
          <View style={styles.orderSummaryCard}>
            <Text style={styles.summaryHeading}>Wholesale Price Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Total Piece Count</Text>
              <Text style={styles.summaryVal}>{totalPieces} pieces</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Subtotal</Text>
              <Text style={styles.summaryVal}>₹{subtotal}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryKey}>Transport & Delivery</Text>
              <Text style={styles.deliveryNote}>Calculated at checkout</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalKey}>Order Total</Text>
              <Text style={styles.totalVal}>₹{subtotal}</Text>
            </View>

            <Button
              title="Proceed to B2B Checkout"
              icon="arrow-forward"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('Checkout')}
              style={{ marginTop: 14 }}
            />
          </View>
        </ScrollView>
      )}
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
    paddingBottom: 36,
  },
  authLockCard: {
    margin: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  lockIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  summarySub: {
    fontSize: 12,
    color: colors.accentHover,
    fontWeight: '700',
  },
  clearText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  cartCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentHover,
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
    marginTop: 2,
  },
  itemCode: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  rateLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    backgroundColor: colors.surfaceSubtle,
  },
  stepBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.charcoal,
    minWidth: 28,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  orderSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  summaryHeading: {
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
  summaryKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  deliveryNote: {
    fontSize: 12,
    color: colors.accentHover,
    fontStyle: 'italic',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 8,
    paddingTop: 10,
  },
  totalKey: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
});
