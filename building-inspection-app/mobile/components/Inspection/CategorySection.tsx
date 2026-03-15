import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Modal,
  KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InspectionCategory, Observation, Photo } from '../../types';
import { Colors, Radius, Spacing } from '../../utils/theme';
import { ObservationCard } from './ObservationCard';

interface Props {
  category: InspectionCategory;
  onAddObservation: (text: string) => void;
  onUpdateObservation: (obsId: string, changes: Partial<Observation>) => void;
  onDeleteObservation: (obsId: string) => void;
  onAddPhoto: (obsId: string, photo: Photo) => void;
  onUpdatePhoto: (obsId: string, photoId: string, changes: Partial<Photo>) => void;
  onDeletePhoto: (obsId: string, photoId: string) => void;
  onUpdateNotes: (notes: string) => void;
}

export const CategorySection: React.FC<Props> = ({
  category, onAddObservation, onUpdateObservation, onDeleteObservation,
  onAddPhoto, onUpdatePhoto, onDeletePhoto, onUpdateNotes,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newObsText, setNewObsText] = useState('');

  const hasContent = category.observations.length > 0 || category.notes.length > 0;

  const handleAddObs = () => {
    if (!newObsText.trim()) return;
    onAddObservation(newObsText.trim());
    setNewObsText('');
    setModalVisible(false);
    if (!expanded) setExpanded(true);
  };

  return (
    <View style={[styles.section, hasContent && styles.sectionActive]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBox, hasContent && { backgroundColor: Colors.primaryLight }]}>
          <Ionicons
            name={category.icon as any}
            size={18}
            color={hasContent ? Colors.primary : Colors.textMuted}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.catName, hasContent && styles.catNameActive]}>
            {category.name}
          </Text>
          {category.observations.length > 0 && (
            <Text style={styles.catMeta}>
              {category.observations.length} havaintoa
            </Text>
          )}
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="add-circle" size={26} color={Colors.primary} />
          </TouchableOpacity>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.body}>
          {category.observations.length === 0 && !category.notes && (
            <TouchableOpacity
              style={styles.emptyRow}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="mic-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.emptyText}>
                Lisää havainto sanelulla tai kirjoittamalla
              </Text>
            </TouchableOpacity>
          )}

          {category.observations.map(obs => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              categoryName={category.name}
              onUpdate={(changes) => onUpdateObservation(obs.id, changes)}
              onDelete={() => onDeleteObservation(obs.id)}
              onAddPhoto={(photo) => onAddPhoto(obs.id, photo)}
              onUpdatePhoto={(photoId, changes) => onUpdatePhoto(obs.id, photoId, changes)}
              onDeletePhoto={(photoId) => onDeletePhoto(obs.id, photoId)}
            />
          ))}

          {/* Notes field */}
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Kategoriamuistiinpanot:</Text>
            <TextInput
              style={styles.notesInput}
              value={category.notes}
              onChangeText={onUpdateNotes}
              multiline
              placeholder="Vapaamuotoiset muistiinpanot tähän kategoriaan..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>
      )}

      {/* Add observation modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalSheet}
        >
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Lisää havainto</Text>
          <Text style={styles.modalSubtitle}>{category.name}</Text>
          <Text style={styles.dictationHint}>
            💡 Voit saneilla tekstin iOS-näppäimistön mikrofonilla
          </Text>
          <TextInput
            style={styles.modalInput}
            value={newObsText}
            onChangeText={setNewObsText}
            multiline
            autoFocus
            placeholder="Kirjoita tai sanele havainto tähän..."
            placeholderTextColor={Colors.textMuted}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setModalVisible(false); setNewObsText(''); }}
            >
              <Text style={styles.cancelBtnText}>Peruuta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !newObsText.trim() && { opacity: 0.5 }]}
              onPress={handleAddObs}
              disabled={!newObsText.trim()}
            >
              <Ionicons name="checkmark" size={16} color={Colors.white} />
              <Text style={styles.confirmBtnText}>Lisää havainto</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionActive: {
    borderColor: Colors.primary + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  catName: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  catNameActive: { color: Colors.text },
  catMeta: { fontSize: 12, color: Colors.primary, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  addBtn: {},
  body: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  notesBox: { gap: Spacing.xs, marginTop: Spacing.sm },
  notesLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.text,
    minHeight: 70,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: -8 },
  dictationHint: {
    fontSize: 12,
    color: Colors.warning,
    backgroundColor: Colors.warningLight,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    minHeight: 110,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    alignItems: 'center',
  },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelBtnText: { fontSize: 15, color: Colors.textSecondary },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 11,
    paddingHorizontal: 18,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
