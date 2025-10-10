import sizes from '@/data/ring-sizes.json';

export type RingSizeRecord = {
  us: string;
  eu: string;
  jp: string;
  diameterMm: number;
};

type SizeSystem = 'us' | 'eu' | 'jp';

export function findBySystem(system: SizeSystem, value: string): RingSizeRecord | undefined {
  return sizes.find((entry) => entry[system].toLowerCase() === value.toLowerCase());
}

export function findClosestByDiameter(diameter: number): RingSizeRecord {
  return sizes.reduce((closest, entry) => {
    const currentDiff = Math.abs(entry.diameterMm - diameter);
    const bestDiff = Math.abs(closest.diameterMm - diameter);
    return currentDiff < bestDiff ? entry : closest;
  }, sizes[0]);
}

export function diameterToCircumference(diameterMm: number) {
  return Math.PI * diameterMm;
}

export function mmToInches(mm: number) {
  return mm / 25.4;
}

export function inchesToMm(inches: number) {
  return inches * 25.4;
}

export function formatNumber(value: number, fractionDigits = 2) {
  return Number.isFinite(value) ? value.toFixed(fractionDigits) : '—';
}

export function mapFromInput(inputType: 'diameter' | SizeSystem, value: number | string): {
  record: RingSizeRecord;
  diameterMm: number;
} | null {
  if (inputType === 'diameter') {
    const diameterMm = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(diameterMm)) return null;
    return { record: findClosestByDiameter(diameterMm), diameterMm };
  }

  const record = findBySystem(inputType, String(value));
  if (!record) {
    return null;
  }
  return { record, diameterMm: record.diameterMm };
}

export function convertAll(diameterMm: number) {
  const record = findClosestByDiameter(diameterMm);
  return {
    us: record.us,
    eu: record.eu,
    jp: record.jp,
    diameterMm,
    diameterIn: mmToInches(diameterMm),
    circumferenceMm: diameterToCircumference(diameterMm),
    circumferenceIn: mmToInches(diameterToCircumference(diameterMm))
  };
}
