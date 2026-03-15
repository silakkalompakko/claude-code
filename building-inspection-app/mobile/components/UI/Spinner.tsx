import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/theme';

interface SpinnerProps {
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ label }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color={Colors.primary} />
    {label && <Text style={styles.label}>{label}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  label: { color: Colors.textSecondary, fontSize: 14 },
});
