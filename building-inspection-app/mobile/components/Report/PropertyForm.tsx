import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PropertyInfo } from '../../types';
import { Colors, Radius, Spacing } from '../../utils/theme';

interface Props {
  propertyInfo: PropertyInfo;
  onChange: (field: string, value: string) => void;
}

interface FieldDef {
  key: keyof PropertyInfo;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

interface Section {
  title: string;
  icon: string;
  fields: FieldDef[];
}

const SECTIONS: Section[] = [
  {
    title: 'Kohteen tiedot',
    icon: 'business-outline',
    fields: [
      { key: 'address', label: 'Osoite', placeholder: 'Kadunnimi 1' },
      { key: 'postalCode', label: 'Postinumero', placeholder: '00100', keyboardType: 'numeric' },
      { key: 'city', label: 'Kaupunki', placeholder: 'Helsinki' },
      { key: 'propertyId', label: 'Kiinteistötunnus', placeholder: '091-123-4-5' },
      { key: 'buildYear', label: 'Rakennusvuosi', placeholder: '1975', keyboardType: 'numeric' },
      { key: 'buildingType', label: 'Rakennustyyppi', placeholder: 'Omakotitalo' },
      { key: 'floorArea', label: 'Pinta-ala (m²)', placeholder: '120', keyboardType: 'numeric' },
      { key: 'floors', label: 'Kerroksia', placeholder: '2', keyboardType: 'numeric' },
      { key: 'energyClass', label: 'Energialuokka', placeholder: 'C' },
    ],
  },
  {
    title: 'Osapuolet',
    icon: 'people-outline',
    fields: [
      { key: 'owner', label: 'Omistaja' },
      { key: 'ownerPhone', label: 'Omistajan puhelin', keyboardType: 'phone-pad' },
      { key: 'realEstateAgent', label: 'Kiinteistönvälittäjä' },
      { key: 'inspector', label: 'Tarkastaja' },
      { key: 'inspectorTitle', label: 'Titteli', placeholder: 'Rakennustarkastaja' },
      { key: 'inspectorQualification', label: 'Pätevyys', placeholder: 'PKA, AKK' },
      { key: 'clientName', label: 'Tilaajan nimi' },
      { key: 'clientPhone', label: 'Tilaajan puhelin', keyboardType: 'phone-pad' },
      { key: 'clientEmail', label: 'Tilaajan sähköposti', keyboardType: 'email-address' },
    ],
  },
  {
    title: 'Tarkastusolosuhteet',
    icon: 'thermometer-outline',
    fields: [
      { key: 'inspectionDate', label: 'Tarkastuspäivä', placeholder: 'pp.kk.vvvv' },
      { key: 'weatherConditions', label: 'Sääolosuhteet', placeholder: 'Pilvinen, kuiva' },
      { key: 'outdoorTemp', label: 'Ulkolämpötila (°C)', keyboardType: 'numeric' },
      { key: 'outdoorHumidity', label: 'Ulkoilman kosteus (%)', keyboardType: 'numeric' },
      { key: 'indoorTemp', label: 'Sisälämpötila (°C)', keyboardType: 'numeric' },
      { key: 'indoorHumidity', label: 'Sisäilman kosteus (%)', keyboardType: 'numeric' },
      { key: 'devicesUsed', label: 'Käytetyt laitteet', multiline: true, placeholder: 'Gann Hydromette RTU 600, kalibroitu 2024-01' },
    ],
  },
  {
    title: 'Rakennetyypit',
    icon: 'construct-outline',
    fields: [
      { key: 'foundationType', label: 'Perustus', placeholder: 'Maanvarainen betonilaatta' },
      { key: 'wallType', label: 'Ulkoseinät', placeholder: 'Puurunko + tiili' },
      { key: 'roofType', label: 'Vesikatto', placeholder: 'Harjakatto, tiililaatta' },
      { key: 'heatingSystem', label: 'Lämmitysjärjestelmä', placeholder: 'Öljylämmitys' },
      { key: 'heatingDistribution', label: 'Lämmönjako', placeholder: 'Patterit' },
      { key: 'ventilationType', label: 'Ilmanvaihto', placeholder: 'Painovoimainen' },
      { key: 'waterPipeType', label: 'Käyttövesiputket', placeholder: 'Kupari' },
      { key: 'drainagePipeType', label: 'Viemärit', placeholder: 'Muovi' },
    ],
  },
  {
    title: 'Dokumentit ja rajaukset',
    icon: 'document-text-outline',
    fields: [
      { key: 'availableDocuments', label: 'Saatavilla olevat asiakirjat', multiline: true },
      { key: 'accessLimitations', label: 'Pääsyrajoitukset', multiline: true },
      { key: 'ownerDefects', label: 'Omistajan ilmoittamat puutteet', multiline: true },
      { key: 'additionalInfo', label: 'Lisätiedot', multiline: true },
    ],
  },
];

export const PropertyForm: React.FC<Props> = ({ propertyInfo, onChange }) => {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      {SECTIONS.map((section, i) => (
        <View key={i} style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggle(i)}
            activeOpacity={0.8}
          >
            <View style={styles.sectionIconBox}>
              <Ionicons name={section.icon as any} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Ionicons
              name={openSections.has(i) ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {openSections.has(i) && (
            <View style={styles.fields}>
              {section.fields.map(field => (
                <View key={field.key as string} style={styles.fieldRow}>
                  <Text style={styles.label}>{field.label}</Text>
                  <TextInput
                    style={[styles.input, field.multiline && styles.multilineInput]}
                    value={(propertyInfo[field.key] as string) || ''}
                    onChangeText={(v) => onChange(field.key as string, v)}
                    placeholder={field.placeholder ?? ''}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.keyboardType ?? 'default'}
                    multiline={field.multiline}
                    textAlignVertical={field.multiline ? 'top' : 'center'}
                    autoCorrect={false}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text },
  fields: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  fieldRow: { gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
});
