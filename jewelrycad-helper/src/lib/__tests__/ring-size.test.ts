import { describe, expect, it } from 'vitest';
import { convertAll, findBySystem, findClosestByDiameter, inchesToMm, mmToInches } from '../ring-size';

describe('ring size conversions', () => {
  it('finds sizes by system', () => {
    expect(findBySystem('us', '7')?.eu).toBe('54.4');
    expect(findBySystem('eu', '62.1')?.us).toBe('10');
  });

  it('finds closest ring by diameter', () => {
    const record = findClosestByDiameter(17.25);
    expect(record.us).toBe('7');
  });

  it('converts diameter to all systems', () => {
    const result = convertAll(18.1);
    expect(result.us).toBe('8');
    expect(result.eu).toBe('57.0');
    expect(result.jp).toBe('16');
  });

  it('converts between units', () => {
    expect(mmToInches(25.4)).toBeCloseTo(1);
    expect(inchesToMm(0.5)).toBeCloseTo(12.7);
  });
});
