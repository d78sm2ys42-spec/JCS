import { describe, expect, it } from 'vitest';
import { computeLayout, resultToCsv } from '../stone-layout';

describe('stone layout planner', () => {
  it('creates halo suggestions', () => {
    const layout = computeLayout(6.5, 'halo');
    expect(layout.suggestions.length).toBeGreaterThan(0);
    expect(layout.suggestions[0].haloDiameter).toBeCloseTo(8.5);
  });

  it('exports csv format', () => {
    const layout = computeLayout(6.5, 'halo');
    const csv = resultToCsv(layout);
    expect(csv.split('\n')[0]).toContain('Layer');
    expect(csv).toContain('Primary');
  });
});
