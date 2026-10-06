import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../config/colors';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading wholesale catalog...' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
  },
});
