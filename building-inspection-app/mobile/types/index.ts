export type UrgencyLevel = 'välitön' | '1-2v' | '3-5v' | 'seurattava' | 'ei_toimenpiteitä';

export interface Photo {
  id: string;
  uri: string;           // Local file URI (React Native)
  mediaType: string;     // image/jpeg etc.
  caption: string;
  captionLoading?: boolean;
  timestamp: string;
}

export interface Observation {
  id: string;
  rawText: string;
  processedText: string;
  withTheory: string;
  photos: Photo[];
  urgency: UrgencyLevel;
  moistureReading: string;
  aiProcessing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  observations: Observation[];
  notes: string;
}

export interface RepairHistoryItem {
  id: string;
  year: string;
  description: string;
}

export interface PropertyInfo {
  address: string;
  postalCode: string;
  city: string;
  propertyId: string;
  buildYear: string;
  buildingType: string;
  floorArea: string;
  floors: string;
  energyClass: string;
  owner: string;
  ownerPhone: string;
  realEstateAgent: string;
  inspector: string;
  inspectorTitle: string;
  inspectorQualification: string;
  inspectionDate: string;
  weatherConditions: string;
  outdoorTemp: string;
  outdoorHumidity: string;
  indoorTemp: string;
  indoorHumidity: string;
  devicesUsed: string;
  heatingSystem: string;
  heatingDistribution: string;
  foundationType: string;
  wallType: string;
  roofType: string;
  ventilationType: string;
  drainagePipeType: string;
  waterPipeType: string;
  accessLimitations: string;
  availableDocuments: string;
  ownerDefects: string;
  repairHistory: RepairHistoryItem[];
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  additionalInfo: string;
}

export interface RiskStructure {
  name: string;
  description: string;
  severity: 'high' | 'medium';
  recommendation: string;
}

export interface ReportSummary {
  findingsSummary: string;
  finalSummary: string;
  generatedAt: string;
}

export type ReportStatus = 'draft' | 'in_progress' | 'review' | 'completed';

export interface InspectionReport {
  id: string;
  status: ReportStatus;
  propertyInfo: PropertyInfo;
  categories: InspectionCategory[];
  summary: ReportSummary | null;
  createdAt: string;
  updatedAt: string;
}

export const INSPECTION_CATEGORIES: Omit<InspectionCategory, 'observations' | 'notes'>[] = [
  { id: 'perustukset', name: 'Perustukset ja alapohja', icon: 'layers-outline', description: 'Sokkelit, perustukset, routasuojaus, salaojitus, sadevesijärjestelmä' },
  { id: 'ulkoalueet', name: 'Ulkoalueet ja tontti', icon: 'leaf-outline', description: 'Tontin rajat, maanpinnan kallistukset, vierustat, piha' },
  { id: 'ulkoseinat', name: 'Ulkoseinät ja julkisivu', icon: 'home-outline', description: 'Ulkoverhous, tuuletusraot, ikkunapellit, räystäät, maalaus' },
  { id: 'ikkunat', name: 'Ikkunat ja ulko-ovet', icon: 'scan-outline', description: 'Ikkunat, ulko-ovet, tiivisteet, kunto, toimivuus' },
  { id: 'vesikatto', name: 'Vesikatto ja yläpohja', icon: 'triangle-outline', description: 'Kattorakenne, kate, aluskate, läpiviennit, yläpohjan eristys' },
  { id: 'markatilat', name: 'Märkätilat', icon: 'water-outline', description: 'Kylpyhuone, WC, sauna – vesieristykset, kaivot, pinnat' },
  { id: 'keittiö', name: 'Keittiö', icon: 'restaurant-outline', description: 'Keittiö, kalusteet, kodinkoneet, liesituuletin, altaan tiiveys' },
  { id: 'muut_sisatilat', name: 'Muut sisätilat', icon: 'door-open', description: 'Olohuone, makuuhuoneet, käytävät – pintamateriaalit, kosteus' },
  { id: 'lammitys', name: 'Lämmitysjärjestelmä', icon: 'thermometer-outline', description: 'Lämmityslaitteisto, patterit, lattialämmitys, tulisijat' },
  { id: 'vesi_viemari', name: 'Vesi- ja viemärijärjestelmä', icon: 'git-merge-outline', description: 'Käyttövesiputket, viemärit, vesikalusteet' },
  { id: 'sahko', name: 'Sähköjärjestelmä', icon: 'flash-outline', description: 'Sähkökeskus, johdotukset, pistorasiat, vikavirtasuojat' },
  { id: 'ilmanvaihto', name: 'Ilmanvaihto', icon: 'cloud-outline', description: 'IV-koneisto, kanavat, venttiilit, toiminta, puhtaus' },
  { id: 'turvallisuus', name: 'Paloturvallisuus ja haitta-aineet', icon: 'shield-outline', description: 'Palovaroittimet, asbesti, radon, lyijy' },
];

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
