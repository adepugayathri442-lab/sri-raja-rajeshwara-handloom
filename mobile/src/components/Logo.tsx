import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../config/colors';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  light?: boolean;
}

export function LoomEmblem({ size = 36 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/sri_raja_rajeshwara_shiva_parvathi_logo.png')}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="contain"
    />
  );
}

export function Logo({ size = 'md', showSubtitle = true, light = false }: LogoProps) {
  const emblemSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const titleSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const subtitleSize = size === 'sm' ? 8 : size === 'lg' ? 10 : 9;

  return (
    <View style={styles.container}>
      <View style={[styles.emblemContainer, light && styles.emblemContainerLight]}>
        <LoomEmblem size={emblemSize} />
      </View>
      <View style={styles.textContainer}>
        {showSubtitle && (
          <Text style={[styles.merchantTag, { fontSize: subtitleSize }]}>
            WHOLESALE CLOTH MERCHANT
          </Text>
        )}
        <Text
          style={[
            styles.title,
            { fontSize: titleSize, color: light ? colors.white : colors.primary },
          ]}
        >
          SRI RAJA RAJESHWARA
        </Text>
        <Text style={[styles.handloom, { color: light ? colors.accentLight : colors.charcoal }]}>
          HANDLOOM
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emblemContainer: {
    padding: 2,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
  },
  emblemContainerLight: {
    backgroundColor: colors.surface,
    borderColor: colors.accent,
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  merchantTag: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  handloom: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
