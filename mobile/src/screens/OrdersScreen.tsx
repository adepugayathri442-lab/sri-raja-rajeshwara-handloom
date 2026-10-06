import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { colors } from '../config/colors';
import { getCustomerOrders, MobileOrder } from '../services/orders';
import { useAuth } from '../context/AuthContext';

export function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getCustomerOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
      case 'Packed':
        return 'primary';
      case 'Processing':
      case 'Confirmed':
        return 'accent';
      case 'Cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Header />
        <EmptyState
          icon="lock-closed-outline"
          title="Sign In to View Orders"
          description="Log in with your registered merchant account to view order history and track consignments."
          actionTitle="Sign In"
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.titleBox}>
          <Text style={styles.subTitle}>MERCHANT ORDERS & DISPATCHES</Text>
          <Text style={styles.title}>My Wholesale Orders</Text>
          <Text style={styles.desc}>
            Track parcel consignments, lorry receipts (LR), and delivery statuses directly from our Nizamabad godown.
          </Text>
        </View>

        {loading ? (
          <LoadingSpinner message="Fetching real order records..." />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Orders Placed Yet"
            description="You haven't placed any wholesale textile orders yet. Browse our catalogue to get started."
            actionTitle="Browse Wholesale Catalogue"
            onAction={() => navigation.navigate('ProductsTab')}
          />
        ) : (
          <View style={styles.orderList}>
            {orders.map((order) => {
              const dateStr = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('OrderDetail', { orderId: order.id })
                  }
                >
                  <View style={styles.orderTop}>
                    <View>
                      <Text style={styles.orderNumber}>{order.order_number}</Text>
                      <Text style={styles.orderDate}>{dateStr}</Text>
                    </View>
                    <Badge
                      label={order.order_status}
                      variant={getStatusVariant(order.order_status) as any}
                      size="sm"
                    />
                  </View>

                  {/* Consignment tracking badge if shipped */}
                  {order.lr_number || order.tracking_number ? (
                    <View style={styles.trackingBanner}>
                      <Ionicons name="airplane-outline" size={14} color={colors.primary} />
                      <Text style={styles.trackingText}>
                        LR / Tracking: {order.lr_number || order.tracking_number}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.orderBottom}>
                    <View>
                      <Text style={styles.amountLabel}>Order Amount</Text>
                      <Text style={styles.orderAmount}>₹{order.grand_total}</Text>
                    </View>

                    <View style={styles.viewRow}>
                      <Text style={styles.viewText}>Track Consignment</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
    paddingBottom: 36,
  },
  titleBox: {
    padding: 18,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentHover,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  orderList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  trackingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySubtle,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  trackingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  amountLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentHover,
  },
});
