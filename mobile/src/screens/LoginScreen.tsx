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
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { returnTo } = route.params || {};

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your registered email address.');
      return;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter your account password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);

      if (res.error) {
        Alert.alert('Sign In Failed', res.error);
        return;
      }

      // Return to original requested screen or go back
      if (returnTo) {
        navigation.navigate(returnTo);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('HomeTab');
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Close / Back button */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.charcoal} />
        </TouchableOpacity>

        {/* Emblem & Branding */}
        <View style={styles.brandHeader}>
          <View style={styles.emblemBox}>
            <LoomEmblem size={48} />
          </View>
          <Text style={styles.merchantSubtitle}>WHOLESALE CLOTH MERCHANT</Text>
          <Text style={styles.brandTitle}>SRI RAJA RAJESHWARA</Text>
          <Text style={styles.brandSub}>HANDLOOM</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Merchant Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Access wholesale piece pricing, reserved order carts, and consignment tracking.
          </Text>

          <Input
            label="Email Address"
            placeholder="merchant@clothstores.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            required
          />

          <Input
            label="Password"
            placeholder="Enter your account password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            required
          />

          <Button
            title={loading ? 'Signing In...' : 'Sign In'}
            icon="log-in-outline"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: 8 }}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have a merchant account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register', { returnTo })}>
              <Text style={styles.switchLink}>Register Here</Text>
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
    marginBottom: 24,
  },
  emblemBox: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
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
    marginBottom: 20,
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
