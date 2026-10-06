import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../config/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  required = false,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      <TextInput
        placeholderTextColor="#9CA3AF"
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.multilineInput : null,
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
  },
  required: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.charcoal,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
});
