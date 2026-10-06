import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoomEmblem } from '../components/Logo';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors } from '../config/colors';
import { useAuth, CustomerType } from '../context/AuthContext';

const CUSTOMER_TYPES: CustomerType[] = [
  'Retail Shop',
  'Reseller',
  'Business',
  'Institution',
  'Bulk Buyer',
  'Other',
];

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnTo } = route.params || {};

  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Retail Shop');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please recheck.');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
        customerType,
        businessName: businessName.trim() || undefined,
        gstNumber: gstNumber.trim() || undefined,
      });

      if (res.error) {
        Alert.alert('Registration Failed', res.error);
        return;
      }

      Alert.alert(
        'Account Created Successfully!',
        'Your merchant profile is now registered for wholesale piece purchases.',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (returnTo) {
                navigation.navigate(returnTo);
              } else {
                navigation.navigate('HomeTab');
              }
            },
          },
        ]
      );
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.charcoal} />
        </TouchableOpacity>

        {/* Brand header */}
        <View style={styles.brandHeader}>
          <View style={styles.emblemBox}>
            <LoomEmblem size={42} />
          </View>
          <Text style={styles.merchantSubtitle}>WHOLESALE CLOTH MERCHANT</Text>
          <Text style={styles.brandTitle}>SRI RAJA RAJESHWARA</Text>
          <Text style={styles.brandSub}>HANDLOOM</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Merchant Profile</Text>
          <Text style={styles.cardSubtitle}>
            Join as a verified cloth store, reseller, or business buyer for transparent wholesale piece rates.
          </Text>

          <Input
            label="Full Name"
            placeholder="e.g. Ramesh Kurapati"
            value={fullName}
            onChangeText={setFullName}
            required
          />

          <Input
            label="Mobile Number (WhatsApp Enabled)"
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            required
          />

          <Input
            label="Email Address"
            placeholder="merchant@clothstores.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            required
          />

          {/* Customer Type Picker */}
          <Text style={styles.typeLabel}>Customer Type *</Text>
          <View style={styles.typeGrid}>
            {CUSTOMER_TYPES.map((type) => {
              const isSelected = customerType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, isSelected && styles.typeChipActive]}
                  onPress={() => setCustomerType(type)}
                >
                  <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Input
            label="Shop / Business Name (Optional)"
            placeholder="e.g. Kurapati Textiles"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Input
            label="GSTIN Number (Optional)"
            placeholder="e.g. 36AAAAA0000A1Z5"
            autoCapitalize="characters"
            value={gstNumber}
            onChangeText={setGstNumber}
          />

          <Input
            label="Password (min. 6 characters)"
            placeholder="Create secure password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            required
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            required
          />

          <Button
            title={loading ? 'Creating Profile...' : 'Complete Registration'}
            icon="checkmark-circle-outline"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleRegister}
            style={{ marginTop: 8 }}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login', { returnTo })}>
              <Text style={styles.switchLink}>Sign In Here</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emblemBox: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  merchantSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
    marginBottom: 18,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 12,
    color: colors.charcoal,
    fontWeight: '600',
  },
  typeTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  switchText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  switchLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentHover,
  },
});
