import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InspectionReport } from '../../types';
import { Colors, Radius, Spacing } from '../../utils/theme';
import { generateFindingsSummary, generateFinalSummary } from '../../services/api';

interface Props {
  report: InspectionReport;
  onSummaryGenerated: (findings: string, final: string) => void;
}

export const ReportSummaryView: React.FC<Props> = ({ report, onSummaryGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const allObs = report.categories.flatMap(cat =>
    cat.observations.map(obs => ({
      category: cat.name,
      text: obs.withTheory || obs.processedText || obs.rawText,
    }))
  );

  const handleGenerate = async () => {
    if (allObs.length === 0) {
      setError('Lisää ensin havaintoja tarkastuskategorioihin.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const findings = await generateFindingsSummary(allObs);
      const final = await generateFinalSummary({
        propertyInfo: report.propertyInfo as unknown as Record<string, unknown>,
        observations: allObs,
        findingsSummary: findings,
      });
      onSummaryGenerated(findings, final);
    } catch (e: any) {
      setError(e?.message ?? 'Yhteenveto epäonnistui. Tarkista API-yhteys.');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!report.summary) return;
    const text = [
      `KUNTOTARKASTUSRAPORTTI`,
      `Kohde: ${report.propertyInfo.address}, ${report.propertyInfo.city}`,
      `Tarkastaja: ${report.propertyInfo.inspector}`,
      `Päivämäärä: ${report.propertyInfo.inspectionDate}`,
      '',
      '--- HAVAINTOYHTEENVETO ---',
      report.summary.findingsSummary,
      '',
      '--- LOPPUYHTEENVETO ---',
      report.summary.finalSummary,
    ].join('\n');
    await Share.share({ message: text, title: 'Kuntotarkastusraportti' });
  };

  const totalObs = allObs.length;
  const filledCats = report.categories.filter(c => c.observations.length > 0).length;

  return (
    <View style={styles.container}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{filledCats}</Text>
          <Text style={styles.statLabel}>Kategoriaa</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>{totalObs}</Text>
          <Text style={styles.statLabel}>Havaintoa</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statNum}>
            {report.categories.flatMap(c => c.observations).flatMap(o => o.photos).length}
          </Text>
          <Text style={styles.statLabel}>Kuvaa</Text>
        </View>
      </View>

      {/* Generate button */}
      {!report.summary ? (
        <View style={styles.generateBox}>
          <Ionicons name="sparkles" size={32} color={Colors.primary} />
          <Text style={styles.generateTitle}>AI-yhteenveto</Text>
          <Text style={styles.generateDesc}>
            Tekoäly luo kuntotarkastusraporttiin virallisen havaintoyhteenvetotaulukon
            ja loppuyhteenvedon kaikista havainnoista.
          </Text>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.generateBtn, generating && { opacity: 0.6 }]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons name="sparkles" size={16} color={Colors.white} />
            )}
            <Text style={styles.generateBtnText}>
              {generating ? 'Generoidaan...' : 'Generoi yhteenveto'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.summaryBox}>
          {/* Findings summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryHeader}>
              <Ionicons name="list-outline" size={16} color={Colors.primary} />
              <Text style={styles.summaryTitle}>Havaintoyhteenveto</Text>
            </View>
            <ScrollView style={styles.summaryScroll} nestedScrollEnabled>
              <Text style={styles.summaryText}>{report.summary.findingsSummary}</Text>
            </ScrollView>
          </View>

          {/* Final summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryHeader}>
              <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
              <Text style={styles.summaryTitle}>Loppuyhteenveto</Text>
            </View>
            <ScrollView style={styles.summaryScroll} nestedScrollEnabled>
              <Text style={styles.summaryText}>{report.summary.finalSummary}</Text>
            </ScrollView>
          </View>

          {/* Actions */}
          <View style={styles.summaryActions}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={16} color={Colors.primary} />
              <Text style={styles.shareBtnText}>Jaa raportti</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.regenerateBtn}
              onPress={handleGenerate}
              disabled={generating}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.regenerateBtnText}>Generoi uudelleen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  generateBox: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  generateTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  generateDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: { fontSize: 13, color: Colors.danger, textAlign: 'center' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 13,
    paddingHorizontal: 24,
    marginTop: Spacing.sm,
  },
  generateBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  summaryBox: { gap: Spacing.md },
  summarySection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.primaryLight,
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  summaryScroll: { maxHeight: 240 },
  summaryText: {
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  shareBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  regenerateBtnText: { fontSize: 14, color: Colors.textSecondary },
});
