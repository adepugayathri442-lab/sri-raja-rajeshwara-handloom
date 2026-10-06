import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 280,
  },
  actionBtn: {
    minWidth: 160,
  },
});
