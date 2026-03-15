import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { Colors } from '../utils/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Dashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
