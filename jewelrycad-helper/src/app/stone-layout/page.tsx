'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { computeLayout, LayoutResult, LayoutStyle, resultToCsv } from '@/lib/stone-layout';
import { toast } from 'sonner';

const styles: { label: string; value: LayoutStyle }[] = [
  { label: 'Solitaire', value: 'solitaire' },
  { label: 'Halo', value: 'halo' },
  { label: 'Pavé', value: 'pave' }
];

export default function StoneLayoutPage() {
  const [centerStone, setCenterStone] = useState('6.5');
  const [style, setStyle] = useState<LayoutStyle>('halo');

  const layout = useMemo<LayoutResult | null>(() => {
    const size = Number.parseFloat(centerStone);
    if (!Number.isFinite(size) || size <= 0) {
      return null;
    }
    return computeLayout(size, style);
  }, [centerStone, style]);

  const handleExport = () => {
    if (!layout) return;
    const csv = resultToCsv(layout);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `stone-layout-${layout.style}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('CSV exported. Check your downloads.');
  };

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
          <CardDescription>Adjust the center stone and layout style to preview recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="center">Center stone diameter (mm)</Label>
            <Input
              id="center"
              inputMode="decimal"
              value={centerStone}
              onChange={(event) => setCenterStone(event.target.value)}
              placeholder="e.g. 6.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={(next) => setStyle(next as LayoutStyle)}>
              <SelectTrigger id="style">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent>
                {styles.map((entry) => (
                  <SelectItem key={entry.value} value={entry.value}>
                    {entry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="button" onClick={handleExport} disabled={!layout} className="w-full">
            Export suggested layout as CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Use these as a starting point and adjust for aesthetics and structural needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {layout ? (
            <>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-gray-300">
                <p>Center stone: {layout.centerStone.toFixed(2)} mm</p>
                <p>
                  Recommended shank width: {layout.shankWidthRange[0].toFixed(1)} – {layout.shankWidthRange[1].toFixed(1)} mm
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40 text-gray-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Layer</th>
                      <th className="px-3 py-2 text-left font-medium">Halo diameter (mm)</th>
                      <th className="px-3 py-2 text-left font-medium">Melee size (mm)</th>
                      <th className="px-3 py-2 text-left font-medium">Estimated count</th>
                      <th className="px-3 py-2 text-left font-medium">Spacing (mm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-gray-300">
                    {layout.suggestions.map((suggestion, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-medium">
                          {index === 0 ? 'Primary' : `Halo ${index + 1}`}
                        </td>
                        <td className="px-3 py-2">{suggestion.haloDiameter.toFixed(2)}</td>
                        <td className="px-3 py-2">{suggestion.meleeStoneSize.toFixed(2)}</td>
                        <td className="px-3 py-2">{suggestion.estimatedCount}</td>
                        <td className="px-3 py-2">{suggestion.spacing.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Enter a valid center stone size to see layout suggestions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
