import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { InspectionReport } from '../../types';
import { getReports, createReport, deleteReport } from '../../services/storage';
import { Colors, Radius, Spacing } from '../../utils/theme';

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  draft:       { label: 'Luonnos',      color: Colors.textSecondary, bg: Colors.background },
  in_progress: { label: 'Kesken',       color: Colors.warning,       bg: Colors.warningLight },
  review:      { label: 'Tarkistus',    color: Colors.info,          bg: Colors.infoLight },
  completed:   { label: 'Valmis',       color: Colors.success,       bg: Colors.successLight },
};

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const [reports, setReports] = useState<InspectionReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const data = await getReports();
    setReports(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    setCreating(true);
    const report = await createReport();
    setCreating(false);
    router.push(`/report/${report.id}`);
  };

  const handleDelete = (id: string, address: string) => {
    Alert.alert(
      'Poista raportti',
      `Haluatko poistaa raportin "${address || 'Nimetön'}"? Tätä ei voi peruuttaa.`,
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            await deleteReport(id);
            load();
          },
        },
      ]
    );
  };

  const renderReport = ({ item }: { item: InspectionReport }) => {
    const s = statusLabels[item.status] ?? statusLabels.draft;
    const obs = item.categories.reduce((n, c) => n + c.observations.length, 0);
    const cats = item.categories.filter(c => c.observations.length > 0).length;
    const date = new Date(item.createdAt).toLocaleDateString('fi-FI');

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => router.push(`/report/${item.id}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardIcon}>
            <Ionicons name="business-outline" size={22} color={Colors.primary} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardAddress} numberOfLines={1}>
            {item.propertyInfo.address || 'Nimetön kohde'}
          </Text>
          <Text style={styles.cardMeta}>
            {item.propertyInfo.city || '—'} · {date}
          </Text>
          <Text style={styles.cardStats}>
            {cats} kategoriaa · {obs} havaintoa
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusTag, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id, item.propertyInfo.address)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={r => r.id}
        renderItem={renderReport}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Kuntotarkastukset</Text>
              <Text style={styles.subtitle}>
                {reports.length} raportti{reports.length !== 1 ? 'a' : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={52} color={Colors.border} />
            <Text style={styles.emptyTitle}>Ei raportteja</Text>
            <Text style={styles.emptyDesc}>
              Aloita uusi kuntotarkastus painamalla + -painiketta
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, creating && { opacity: 0.7 }]}
        onPress={handleNew}
        disabled={creating}
        activeOpacity={0.85}
      >
        {creating ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <Ionicons name="add" size={28} color={Colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  cardLeft: {},
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardAddress: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: 12, color: Colors.textSecondary },
  cardStats: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: Spacing.sm },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  deleteBtn: { padding: 2 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
