import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Path, Circle } from 'react-native-svg';
import { colors } from '../config/colors';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  light?: boolean;
}

export function LoomEmblem({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {/* Outer Diamond Frame */}
      <Rect
        x={24}
        y={4}
        width={28}
        height={28}
        rx={4}
        transform="rotate(45 24 4)"
        fill={colors.primary}
        stroke={colors.accent}
        strokeWidth={2}
      />
      {/* Inner Inset */}
      <Rect
        x={24}
        y={9}
        width={21}
        height={21}
        rx={2}
        transform="rotate(45 24 9)"
        stroke={colors.accent}
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.75}
      />
      {/* Warp / Weft Lines */}
      <Line x1={24} y1={12} x2={24} y2={36} stroke={colors.accent} strokeWidth={1.5} />
      <Line x1={18} y1={16} x2={18} y2={32} stroke="#FAF8F5" strokeWidth={1.2} opacity={0.9} />
      <Line x1={30} y1={16} x2={30} y2={32} stroke="#FAF8F5" strokeWidth={1.2} opacity={0.9} />
      {/* Shuttle */}
      <Path
        d="M12 24 C16 20, 32 20, 36 24 C32 28, 16 28, 12 24 Z"
        fill={colors.accent}
        stroke="#FAF8F5"
        strokeWidth={0.8}
      />
      {/* Center Core */}
      <Circle cx={24} cy={24} r={2.5} fill={colors.primary} stroke="#FAF8F5" strokeWidth={1} />
    </Svg>
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
    padding: 3,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
  },
  emblemContainerLight: {
    backgroundColor: colors.primaryHover,
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
