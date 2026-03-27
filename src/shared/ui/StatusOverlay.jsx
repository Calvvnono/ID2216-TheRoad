import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

/**
 * Wraps children with loading / error overlay based on AsyncStatus.
 * Shared across all features — every async flow must use this.
 *
 * @param {Object} props
 * @param {'idle' | 'loading' | 'success' | 'error'} props.status
 * @param {() => void} [props.onRetry]
 * @param {string} [props.errorMessage]
 * @param {React.ReactNode} props.children
 */
export function StatusOverlay({ status, onRetry, errorMessage, children }) {
  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage ?? 'Something went wrong'}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
});
