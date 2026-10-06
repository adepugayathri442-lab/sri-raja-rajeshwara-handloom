import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'whatsapp' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.surfaceSubtle, text: colors.charcoal, border: colors.border };
      case 'accent':
        return { bg: colors.accent, text: colors.charcoal, border: colors.accentHover };
      case 'whatsapp':
        return { bg: colors.whatsapp, text: colors.white, border: colors.whatsappDark };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.primary };
      case 'danger':
        return { bg: colors.danger, text: colors.white, border: colors.danger };
      case 'primary':
      default:
        return { bg: colors.primary, text: colors.white, border: colors.primaryLight };
    }
  };

  const { bg, text, border } = getVariantStyles();

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 52;
      case 'md':
      default:
        return 46;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 13;
      case 'lg':
        return 16;
      case 'md':
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#D1D5DB' : bg,
          borderColor: disabled ? '#9CA3AF' : border,
          height: getHeight(),
          opacity: disabled ? 0.7 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
              color={disabled ? '#6B7280' : text}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: disabled ? '#6B7280' : text,
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
