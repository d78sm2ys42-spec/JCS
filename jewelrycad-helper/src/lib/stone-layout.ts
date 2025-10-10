import presets from '@/data/stone-presets.json';

export type LayoutStyle = keyof typeof presets;

export type LayoutSuggestion = {
  haloDiameter: number;
  meleeStoneSize: number;
  estimatedCount: number;
  spacing: number;
};

export type LayoutResult = {
  style: LayoutStyle;
  centerStone: number;
  suggestions: LayoutSuggestion[];
  shankWidthRange: [number, number];
};

const CIRCLE_CONSTANT = Math.PI;

export function computeLayout(centerStone: number, style: LayoutStyle): LayoutResult {
  const preset = presets[style];
  const baseDiameter = centerStone;

  const suggestions: LayoutSuggestion[] = (preset.haloOffsets.length > 0 ? preset.haloOffsets : [0]).map((offset, index) => {
    const haloDiameter = baseDiameter + offset * 2;
    const meleeStoneSize = preset.melee[index] ?? preset.melee[preset.melee.length - 1] ?? centerStone * 0.35;
    const circumference = CIRCLE_CONSTANT * haloDiameter;
    const estimatedCount = Math.max(1, Math.round(circumference / meleeStoneSize));
    const spacing = Number((circumference / estimatedCount - meleeStoneSize).toFixed(2));
    return {
      haloDiameter: Number(haloDiameter.toFixed(2)),
      meleeStoneSize: Number(meleeStoneSize.toFixed(2)),
      estimatedCount,
      spacing
    };
  });

  return {
    style,
    centerStone,
    suggestions,
    shankWidthRange: [preset.shankWidth[0], preset.shankWidth[1]]
  };
}

export function resultToCsv(result: LayoutResult) {
  const header = 'Layer,Halo Diameter (mm),Melee Size (mm),Estimated Count,Spacing (mm)';
  const rows = result.suggestions.map((suggestion, index) =>
    [
      index === 0 ? 'Primary' : `Halo ${index + 1}`,
      suggestion.haloDiameter,
      suggestion.meleeStoneSize,
      suggestion.estimatedCount,
      suggestion.spacing
    ].join(',')
  );
  rows.unshift(header);
  return rows.join('\n');
}
