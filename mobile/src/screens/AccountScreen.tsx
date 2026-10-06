import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { colors } from '../config/colors';
import { businessConfig } from '../config/business';
import { useAuth } from '../context/AuthContext';

export function AccountScreen() {
  const navigation = useNavigation<any>();
  const { user, profile, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from your merchant account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const openWhatsApp = () => {
    Linking.openURL(businessConfig.contact.whatsappLink).catch(console.warn);
  };

  const callGodown = () => {
    Linking.openURL(`tel:${businessConfig.contact.phone}`).catch(console.warn);
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isAuthenticated && profile ? (
          <>
            {/* Authenticated Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarCircle}>
                <Ionicons name="business" size={32} color={colors.accent} />
              </View>

              <Text style={styles.userName}>{profile.fullName || 'Merchant Account'}</Text>
              {profile.businessName ? (
                <Text style={styles.userShop}>{profile.businessName}</Text>
              ) : null}

              <View style={styles.badgeRow}>
                <Badge label={profile.customerType || 'Retail Shop'} variant="accent" size="sm" />
                <Badge label="Verified Wholesale" variant="primary" size="sm" />
              </View>

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color={colors.muted} />
                  <Text style={styles.detailText}>{profile.email || user?.email}</Text>
                </View>
                {profile.phone ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="call-outline" size={16} color={colors.muted} />
                    <Text style={styles.detailText}>{profile.phone}</Text>
                  </View>
                ) : null}
                {profile.gstNumber ? (
                  <View style={styles.detailRow}>
                    <Ionicons name="receipt-outline" size={16} color={colors.muted} />
                    <Text style={styles.detailText}>GSTIN: {profile.gstNumber}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Wholesale Account Management</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('OrdersTab')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>My Wholesale Orders</Text>
                  <Text style={styles.menuSub}>Track consignments, LR & dispatch status</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.accent} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('EnquiryTab')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>Wholesale Bulk Enquiry</Text>
                  <Text style={styles.menuSub}>Request bale rates & bulk discounts</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.accent} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('CartTab')}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name="cart-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>Wholesale Cart</Text>
                  <Text style={styles.menuSub}>Review pieces reserved for checkout</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* Guest View */
          <View style={styles.guestCard}>
            <View style={styles.guestIcon}>
              <Ionicons name="person-circle-outline" size={64} color={colors.accent} />
            </View>
            <Text style={styles.guestTitle}>Merchant Account Login</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to manage your wholesale piece orders, track transport consignments, and enjoy instant checkout.
            </Text>

            <Button
              title="Sign In to Your Account"
              icon="log-in-outline"
              variant="primary"
              size="lg"
              onPress={() => navigation.navigate('Login')}
              style={{ width: '100%', marginBottom: 12 }}
            />

            <Button
              title="Register New Merchant Profile"
              icon="person-add-outline"
              variant="outline"
              size="lg"
              onPress={() => navigation.navigate('Register')}
              style={{ width: '100%' }}
            />
          </View>
        )}

        {/* Merchant Support & Godown Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Merchant Assistance & Godown Support</Text>

          <TouchableOpacity style={styles.menuItem} onPress={openWhatsApp}>
            <View style={[styles.menuIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="logo-whatsapp" size={20} color={colors.whatsapp} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>WhatsApp Godown Line</Text>
              <Text style={styles.menuSub}>+91 94404 72939 (Direct Merchant Contact)</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={callGodown}>
            <View style={styles.menuIcon}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>Call Dispatch Godown</Text>
              <Text style={styles.menuSub}>Nizamabad, Telangana: 9440472939</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button if signed in */}
        {isAuthenticated && (
          <Button
            title="Sign Out of Merchant Account"
            icon="log-out-outline"
            variant="danger"
            size="md"
            onPress={handleLogout}
            style={{ marginHorizontal: 16, marginTop: 16 }}
          />
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
    paddingBottom: 40,
  },
  profileCard: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  userShop: {
    fontSize: 13,
    color: colors.charcoal,
    fontWeight: '600',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  detailsList: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  guestCard: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
  },
  guestIcon: {
    marginBottom: 8,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  guestSubtitle: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.charcoal,
  },
  menuSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
});
