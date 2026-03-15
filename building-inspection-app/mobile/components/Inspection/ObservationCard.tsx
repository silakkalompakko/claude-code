import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Observation, Photo, UrgencyLevel } from '../../types';
import { Colors, Radius, Spacing, urgencyColors } from '../../utils/theme';
import { PhotoCapture } from './PhotoCapture';
import { streamProcessObservation } from '../../services/api';

interface Props {
  observation: Observation;
  categoryName: string;
  onUpdate: (changes: Partial<Observation>) => void;
  onDelete: () => void;
  onAddPhoto: (photo: Photo) => void;
  onUpdatePhoto: (photoId: string, changes: Partial<Photo>) => void;
  onDeletePhoto: (photoId: string) => void;
}

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: 'välitön',          label: 'Välitön' },
  { value: '1-2v',             label: '1–2 v' },
  { value: '3-5v',             label: '3–5 v' },
  { value: 'seurattava',       label: 'Seurattava' },
  { value: 'ei_toimenpiteitä', label: 'Ei toimenpiteitä' },
];

export const ObservationCard: React.FC<Props> = ({
  observation, categoryName, onUpdate, onDelete,
  onAddPhoto, onUpdatePhoto, onDeletePhoto,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(observation.processedText);
  const [processing, setProcessing] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  const uc = urgencyColors[observation.urgency];

  const handleAiProcess = async () => {
    setProcessing(true);
    let accumulated = '';
    await streamProcessObservation(
      observation.rawText,
      categoryName,
      (chunk) => { accumulated += chunk; onUpdate({ processedText: accumulated, aiProcessing: true }); },
      (fullText) => { onUpdate({ processedText: fullText, aiProcessing: false }); setProcessing(false); },
      (_err) => { setProcessing(false); }
    );
  };

  const handleDelete = () => {
    Alert.alert('Poista havainto', 'Haluatko varmasti poistaa tämän havainnon?', [
      { text: 'Peruuta', style: 'cancel' },
      { text: 'Poista', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.card}>
      {/* Header row */}
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={[styles.urgencyTag, { backgroundColor: uc.bg }]}>
          <Text style={[styles.urgencyText, { color: uc.text }]}>{uc.label}</Text>
        </View>
        {observation.moistureReading ? (
          <Text style={styles.moisture}>💧 {observation.moistureReading}</Text>
        ) : null}
        <View style={styles.headerRight}>
          {observation.photos.length > 0 && (
            <View style={styles.photoBadge}>
              <Ionicons name="camera" size={12} color={Colors.textSecondary} />
              <Text style={styles.photoBadgeText}>{observation.photos.length}</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Text preview (always visible) */}
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.85}>
        <Text style={styles.preview} numberOfLines={expanded ? undefined : 2}>
          {observation.processedText || observation.rawText}
        </Text>
      </TouchableOpacity>

      {/* Expanded section */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Urgency selector */}
          <View style={styles.urgencyRow}>
            <Text style={styles.fieldLabel}>Kiireellisyys:</Text>
            <ScrollableUrgency
              current={observation.urgency}
              onChange={(u) => onUpdate({ urgency: u })}
            />
          </View>

          {/* Moisture reading */}
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Kosteuslukema:</Text>
            <TextInput
              style={styles.smallInput}
              value={observation.moistureReading}
              onChangeText={(v) => onUpdate({ moistureReading: v })}
              placeholder="esim. WS 68%"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Edit text */}
          {editing ? (
            <View style={styles.editBox}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                  onPress={() => { onUpdate({ processedText: editText }); setEditing(false); }}
                >
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                  <Text style={styles.actionBtnText}>Tallenna</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Text style={styles.cancelText}>Peruuta</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.primaryLight }]}
              onPress={() => { setEditText(observation.processedText); setEditing(e => !e); }}
            >
              <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Muokkaa</Text>
            </TouchableOpacity>

            {!processing ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#F3E8FF' }]}
                onPress={handleAiProcess}
              >
                <Ionicons name="sparkles" size={14} color="#7C3AED" />
                <Text style={[styles.actionBtnText, { color: '#7C3AED' }]}>AI-muotoilu</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionBtn, { backgroundColor: '#F3E8FF' }]}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={[styles.actionBtnText, { color: '#7C3AED' }]}>Käsittelee...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.dangerLight }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={14} color={Colors.danger} />
              <Text style={[styles.actionBtnText, { color: Colors.danger }]}>Poista</Text>
            </TouchableOpacity>
          </View>

          {/* Photos */}
          <TouchableOpacity
            style={styles.photosToggle}
            onPress={() => setShowPhotos(v => !v)}
          >
            <Ionicons name="camera-outline" size={14} color={Colors.primary} />
            <Text style={styles.photosToggleText}>
              Kuvat ({observation.photos.length})
            </Text>
            <Ionicons
              name={showPhotos ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={Colors.primary}
            />
          </TouchableOpacity>

          {showPhotos && (
            <PhotoCapture
              categoryName={categoryName}
              photos={observation.photos}
              onPhotoAdded={onAddPhoto}
              onPhotoUpdated={onUpdatePhoto}
              onPhotoDeleted={onDeletePhoto}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Horizontal urgency selector
const ScrollableUrgency: React.FC<{
  current: UrgencyLevel;
  onChange: (u: UrgencyLevel) => void;
}> = ({ current, onChange }) => {
  const options: { value: UrgencyLevel; label: string }[] = [
    { value: 'välitön', label: 'Välitön' },
    { value: '1-2v', label: '1–2 v' },
    { value: '3-5v', label: '3–5 v' },
    { value: 'seurattava', label: 'Seurattava' },
    { value: 'ei_toimenpiteitä', label: 'Ei toim.' },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 }}>
      {options.map(o => {
        const uc = urgencyColors[o.value];
        const active = o.value === current;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: active ? uc.bg : Colors.background,
              borderWidth: active ? 1.5 : 1,
              borderColor: active ? uc.text : Colors.border,
            }}
          >
            <Text style={{
              fontSize: 11,
              fontWeight: active ? '700' : '400',
              color: active ? uc.text : Colors.textSecondary,
            }}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  urgencyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  urgencyText: { fontSize: 11, fontWeight: '700' },
  moisture: { fontSize: 12, color: Colors.info, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoBadgeText: { fontSize: 11, color: Colors.textSecondary },
  preview: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  urgencyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  fieldLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', minWidth: 100 },
  smallInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: Colors.text,
  },
  editBox: { gap: Spacing.sm },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: Radius.sm,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  cancelText: { fontSize: 13, color: Colors.textSecondary },
  photosToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  photosToggleText: { fontSize: 13, color: Colors.primary, fontWeight: '600', flex: 1 },
});
