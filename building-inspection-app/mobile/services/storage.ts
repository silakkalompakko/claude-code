import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionReport, PropertyInfo, INSPECTION_CATEGORIES } from '../types';
import { generateId } from '../utils/id';

const REPORTS_KEY = 'reports';

function emptyPropertyInfo(): PropertyInfo {
  return {
    address: '', postalCode: '', city: '', propertyId: '', buildYear: '',
    buildingType: '', floorArea: '', floors: '', energyClass: '',
    owner: '', ownerPhone: '', realEstateAgent: '',
    inspector: '', inspectorTitle: '', inspectorQualification: '',
    inspectionDate: new Date().toISOString().slice(0, 10),
    weatherConditions: '', outdoorTemp: '', outdoorHumidity: '',
    indoorTemp: '', indoorHumidity: '', devicesUsed: '',
    heatingSystem: '', heatingDistribution: '', foundationType: '',
    wallType: '', roofType: '', ventilationType: '',
    drainagePipeType: '', waterPipeType: '', accessLimitations: '',
    availableDocuments: '', ownerDefects: '', repairHistory: [],
    clientName: '', clientPhone: '', clientEmail: '', additionalInfo: '',
  };
}

export async function getReports(): Promise<InspectionReport[]> {
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InspectionReport[];
  } catch {
    return [];
  }
}

export async function getReport(id: string): Promise<InspectionReport | null> {
  const reports = await getReports();
  return reports.find(r => r.id === id) ?? null;
}

export async function createReport(): Promise<InspectionReport> {
  const now = new Date().toISOString();
  const report: InspectionReport = {
    id: generateId(),
    status: 'draft',
    propertyInfo: emptyPropertyInfo(),
    categories: INSPECTION_CATEGORIES.map(cat => ({
      ...cat,
      observations: [],
      notes: '',
    })),
    summary: null,
    createdAt: now,
    updatedAt: now,
  };
  await saveReport(report);
  return report;
}

export async function saveReport(report: InspectionReport): Promise<void> {
  const reports = await getReports();
  const index = reports.findIndex(r => r.id === report.id);
  const updated = { ...report, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    reports[index] = updated;
  } else {
    reports.unshift(updated);
  }
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export async function deleteReport(id: string): Promise<void> {
  const reports = await getReports();
  const filtered = reports.filter(r => r.id !== id);
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
}
