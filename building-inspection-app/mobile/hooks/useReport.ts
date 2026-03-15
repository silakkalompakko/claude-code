import { useState, useCallback } from 'react';
import { InspectionReport, Observation, Photo, UrgencyLevel } from '../types';
import { saveReport } from '../services/storage';
import { generateId } from '../utils/id';

export function useReport(initialReport: InspectionReport) {
  const [report, setReport] = useState<InspectionReport>(initialReport);

  const persist = useCallback((updated: InspectionReport) => {
    saveReport(updated);
    setReport(updated);
  }, []);

  const updatePropertyInfo = useCallback(
    (field: string, value: unknown) => {
      persist({ ...report, propertyInfo: { ...report.propertyInfo, [field]: value } });
    },
    [report, persist]
  );

  const addObservation = useCallback(
    (categoryId: string, rawText: string): Observation => {
      const now = new Date().toISOString();
      const obs: Observation = {
        id: generateId(),
        rawText,
        processedText: rawText,
        withTheory: '',
        photos: [],
        urgency: 'seurattava',
        moistureReading: '',
        createdAt: now,
        updatedAt: now,
      };
      persist({
        ...report,
        status: 'in_progress',
        categories: report.categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, observations: [...cat.observations, obs] }
            : cat
        ),
      });
      return obs;
    },
    [report, persist]
  );

  const updateObservation = useCallback(
    (categoryId: string, observationId: string, changes: Partial<Observation>) => {
      persist({
        ...report,
        categories: report.categories.map(cat =>
          cat.id === categoryId
            ? {
                ...cat,
                observations: cat.observations.map(obs =>
                  obs.id === observationId
                    ? { ...obs, ...changes, updatedAt: new Date().toISOString() }
                    : obs
                ),
              }
            : cat
        ),
      });
    },
    [report, persist]
  );

  const deleteObservation = useCallback(
    (categoryId: string, observationId: string) => {
      persist({
        ...report,
        categories: report.categories.map(cat =>
          cat.id === categoryId
            ? { ...cat, observations: cat.observations.filter(o => o.id !== observationId) }
            : cat
        ),
      });
    },
    [report, persist]
  );

  const addPhoto = useCallback(
    (categoryId: string, observationId: string, photo: Photo) => {
      const cat = report.categories.find(c => c.id === categoryId);
      const obs = cat?.observations.find(o => o.id === observationId);
      if (!obs) return;
      updateObservation(categoryId, observationId, { photos: [...obs.photos, photo] });
    },
    [report, updateObservation]
  );

  const updatePhoto = useCallback(
    (categoryId: string, observationId: string, photoId: string, changes: Partial<Photo>) => {
      const cat = report.categories.find(c => c.id === categoryId);
      const obs = cat?.observations.find(o => o.id === observationId);
      if (!obs) return;
      updateObservation(categoryId, observationId, {
        photos: obs.photos.map(p => (p.id === photoId ? { ...p, ...changes } : p)),
      });
    },
    [report, updateObservation]
  );

  const deletePhoto = useCallback(
    (categoryId: string, observationId: string, photoId: string) => {
      const cat = report.categories.find(c => c.id === categoryId);
      const obs = cat?.observations.find(o => o.id === observationId);
      if (!obs) return;
      updateObservation(categoryId, observationId, {
        photos: obs.photos.filter(p => p.id !== photoId),
      });
    },
    [report, updateObservation]
  );

  const updateCategoryNotes = useCallback(
    (categoryId: string, notes: string) => {
      persist({
        ...report,
        categories: report.categories.map(cat =>
          cat.id === categoryId ? { ...cat, notes } : cat
        ),
      });
    },
    [report, persist]
  );

  const updateSummary = useCallback(
    (findingsSummary: string, finalSummary: string) => {
      persist({
        ...report,
        status: 'completed',
        summary: { findingsSummary, finalSummary, generatedAt: new Date().toISOString() },
      });
    },
    [report, persist]
  );

  return {
    report,
    updatePropertyInfo,
    addObservation,
    updateObservation,
    deleteObservation,
    addPhoto,
    updatePhoto,
    deletePhoto,
    updateCategoryNotes,
    updateSummary,
  };
}
