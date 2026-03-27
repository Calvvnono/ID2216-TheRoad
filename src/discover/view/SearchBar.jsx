import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../shared/theme/colors';

/**
 * Pure view — discover search input.
 */
export function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search destination or country"
        placeholderTextColor={Colors.textTertiary}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
});

