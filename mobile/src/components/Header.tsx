import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Logo } from './Logo';
import { colors } from '../config/colors';
import { businessConfig } from '../config/business';
import { useCart } from '../context/CartContext';

export function Header() {
  const navigation = useNavigation<any>();
  const { totalPieces } = useCart();

  const handleWhatsApp = () => {
    Linking.openURL(businessConfig.contact.whatsappLink).catch((err) =>
      console.warn('Could not open WhatsApp:', err)
    );
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('HomeTab')}
        style={styles.logoBtn}
      >
        <Logo size="sm" showSubtitle={false} light={true} />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleWhatsApp}
          style={styles.whatsappBtn}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CartTab')}
          style={styles.cartBtn}
        >
          <Ionicons name="bag-handle-outline" size={20} color={colors.white} />
          {totalPieces > 0 && (
            <View style={styles.badge}>
              <Ionicons name="ellipse" size={0} color="transparent" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  logoBtn: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  whatsappBtn: {
    backgroundColor: colors.whatsapp,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
