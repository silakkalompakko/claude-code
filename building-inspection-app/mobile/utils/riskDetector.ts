import { PropertyInfo, RiskStructure } from '../types';

export function detectRiskStructures(info: PropertyInfo): RiskStructure[] {
  const year = parseInt(info.buildYear || '0', 10);
  if (!year) return [];

  const risks: RiskStructure[] = [];

  if (year >= 1960 && year <= 1995) {
    risks.push({
      name: 'Asbestiriski',
      description: `Rakennus vuodelta ${year}. Asbesti oli yleisessä käytössä 1960–1992.`,
      severity: 'high',
      recommendation: 'Suorita asbestikartoitus ennen korjaustöitä.',
    });
  }

  if (year >= 1960 && year <= 1980) {
    risks.push({
      name: 'Lyijyputket',
      description: 'Vanhemmissa rakennuksissa voi olla lyijyä vesiputkissa.',
      severity: 'medium',
      recommendation: 'Tarkista käyttövesiputkien materiaali.',
    });
  }

  if (year >= 1960 && year <= 1990) {
    risks.push({
      name: 'PCB ja PAH -aineet',
      description: 'Saumausmassat ja ikkunatiivisteet saattavat sisältää PCB:tä tai PAH-yhdisteitä.',
      severity: 'medium',
      recommendation: 'Teetä haitta-ainetutkimus ennen korjauksia.',
    });
  }

  if (year >= 1970 && year <= 1995) {
    risks.push({
      name: 'Riskialtis alapohjarakenne',
      description: 'Maanvastainen betonilaatta ilman kunnollista kapillaarikatkoaineista on yleinen riski.',
      severity: 'high',
      recommendation: 'Tarkista alapohjan kosteuseristys ja tuuletus.',
    });
  }

  return risks;
}
