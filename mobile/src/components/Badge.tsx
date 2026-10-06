import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../config/colors';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'primary', size = 'sm' }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primarySubtle, text: colors.primary, border: colors.primaryLight };
      case 'accent':
        return { bg: colors.accentSubtle, text: colors.accentHover, border: colors.accent };
      case 'success':
        return { bg: colors.successBg, text: colors.success, border: '#86EFAC' };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warning, border: '#FDE68A' };
      case 'danger':
        return { bg: colors.dangerBg, text: colors.danger, border: '#FECACA' };
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, border: colors.border };
    }
  };

  const { bg, text, border } = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
      ]}
    >
      <Text style={[styles.text, { color: text, fontSize: isSm ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
