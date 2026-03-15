import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { InspectionReport } from '../../types';
import { getReport } from '../../services/storage';
import { useReport } from '../../hooks/useReport';
import { PropertyForm } from '../../components/Report/PropertyForm';
import { CategorySection } from '../../components/Inspection/CategorySection';
import { ReportSummaryView } from '../../components/Report/ReportSummaryView';
import { Colors, Radius, Spacing } from '../../utils/theme';
import { detectRiskStructures } from '../../utils/riskDetector';

type Tab = 'property' | 'inspection' | 'summary';

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<InspectionReport | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    getReport(id).then(r => {
      if (!r) setNotFound(true);
      else setInitial(r);
    });
  }, [id]);

  if (notFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Raporttia ei löydy</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Takaisin</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!initial) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return <ReportContent initial={initial} />;
}

function ReportContent({ initial }: { initial: InspectionReport }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('property');
  const {
    report, updatePropertyInfo, addObservation, updateObservation, deleteObservation,
    addPhoto, updatePhoto, deletePhoto, updateCategoryNotes, updateSummary,
  } = useReport(initial);

  const totalObs = report.categories.reduce((n, c) => n + c.observations.length, 0);
  const filledCats = report.categories.filter(c => c.observations.length > 0).length;

  const TABS: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'property',   label: 'Kohde',      icon: 'business-outline' },
    { id: 'inspection', label: 'Havainnot',  icon: 'list-outline', badge: totalObs || undefined },
    { id: 'summary',    label: 'Yhteenveto', icon: 'sparkles-outline' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.topBarTitle}>
          <Text style={styles.topBarAddress} numberOfLines={1}>
            {report.propertyInfo.address || 'Uusi tarkastus'}
          </Text>
          <Text style={styles.topBarMeta}>
            {filledCats} kategoriaa · {totalObs} havaintoa
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(100, (filledCats / report.categories.length) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {filledCats}/{report.categories.length}
        </Text>
      </View>

      {/* Tab content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {activeTab === 'property' && (
          <View style={styles.tabContent}>
            {report.propertyInfo.buildYear ? (
              (() => {
                const risks = detectRiskStructures(report.propertyInfo);
                return risks.length > 0 ? (
                  <View style={styles.riskBox}>
                    <View style={styles.riskHeader}>
                      <Ionicons name="warning-outline" size={16} color={Colors.warning} />
                      <Text style={styles.riskTitle}>
                        Rakennusvuosiriskejä ({risks.length})
                      </Text>
                    </View>
                    {risks.map((r, i) => (
                      <View key={i} style={styles.riskItem}>
                        <Text style={[styles.riskName, { color: r.severity === 'high' ? Colors.danger : Colors.warning }]}>
                          {r.name}
                        </Text>
                        <Text style={styles.riskDesc}>{r.description}</Text>
                        <Text style={styles.riskRec}>→ {r.recommendation}</Text>
                      </View>
                    ))}
                  </View>
                ) : null;
              })()
            ) : null}
            <PropertyForm
              propertyInfo={report.propertyInfo}
              onChange={updatePropertyInfo}
            />
          </View>
        )}

        {activeTab === 'inspection' && (
          <View style={styles.tabContent}>
            {report.categories.map(cat => (
              <CategorySection
                key={cat.id}
                category={cat}
                onAddObservation={(text) => addObservation(cat.id, text)}
                onUpdateObservation={(obsId, changes) => updateObservation(cat.id, obsId, changes)}
                onDeleteObservation={(obsId) => deleteObservation(cat.id, obsId)}
                onAddPhoto={(obsId, photo) => addPhoto(cat.id, obsId, photo)}
                onUpdatePhoto={(obsId, photoId, changes) => updatePhoto(cat.id, obsId, photoId, changes)}
                onDeletePhoto={(obsId, photoId) => deletePhoto(cat.id, obsId, photoId)}
                onUpdateNotes={(notes) => updateCategoryNotes(cat.id, notes)}
              />
            ))}
          </View>
        )}

        {activeTab === 'summary' && (
          <View style={styles.tabContent}>
            <ReportSummaryView
              report={report}
              onSummaryGenerated={updateSummary}
            />
          </View>
        )}
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.75}
          >
            <View style={styles.tabIconBox}>
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={activeTab === tab.id ? Colors.primary : Colors.textMuted}
              />
              {tab.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.id && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: 16, color: Colors.text },
  backLink: { fontSize: 15, color: Colors.primary },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { flex: 1 },
  topBarAddress: { fontSize: 15, fontWeight: '700', color: Colors.text },
  topBarMeta: { fontSize: 12, color: Colors.textSecondary },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  progressBg: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 2 },
  progressText: { fontSize: 11, color: Colors.textSecondary, minWidth: 28 },

  content: { flex: 1 },
  contentInner: { padding: Spacing.lg, paddingBottom: 30 },
  tabContent: { gap: Spacing.sm },

  riskBox: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning + '60',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  riskTitle: { fontSize: 13, fontWeight: '700', color: Colors.warning },
  riskItem: { gap: 2, paddingLeft: Spacing.md },
  riskName: { fontSize: 13, fontWeight: '700' },
  riskDesc: { fontSize: 12, color: Colors.text },
  riskRec: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
    gap: 2,
  },
  tabIconBox: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },
  tabLabel: { fontSize: 11, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary, fontWeight: '600' },
});
