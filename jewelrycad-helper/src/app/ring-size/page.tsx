'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertAll, formatNumber, inchesToMm, mapFromInput } from '@/lib/ring-size';
import { toast } from 'sonner';

const unitOptions = [
  { label: 'Millimeters', value: 'mm' },
  { label: 'Inches', value: 'in' }
];

type Unit = 'mm' | 'in';

type InputSystem = 'us' | 'eu' | 'jp' | 'diameter';

export default function RingSizePage() {
  const [system, setSystem] = useState<InputSystem>('us');
  const [value, setValue] = useState('6.5');
  const [unit, setUnit] = useState<Unit>('mm');

  const conversion = useMemo(() => {
    if (!value) return null;

    if (system === 'diameter') {
      const numericValue = Number.parseFloat(value);
      if (!Number.isFinite(numericValue)) return null;
      const diameterMm = unit === 'mm' ? numericValue : inchesToMm(numericValue);
      return convertAll(diameterMm);
    }

    const result = mapFromInput(system, value);
    if (!result) return null;
    return convertAll(result.diameterMm);
  }, [system, unit, value]);

  const handleCopy = () => {
    if (!conversion) return;
    const payload = [
      `US: ${conversion.us}`,
      `EU: ${conversion.eu}`,
      `JP: ${conversion.jp}`,
      `Diameter: ${formatNumber(conversion.diameterMm)} mm (${formatNumber(conversion.diameterIn)} in)`,
      `Circumference: ${formatNumber(conversion.circumferenceMm)} mm (${formatNumber(conversion.circumferenceIn)} in)`
    ].join('\n');
    navigator.clipboard
      .writeText(payload)
      .then(() => toast.success('Conversion copied to clipboard.'))
      .catch(() => toast.error('Unable to copy. Please try again.'));
  };

  return (
    <div className="grid gap-8 md:grid-cols-[320px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Select the known measurement to derive the rest.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="system">Measurement</Label>
            <Select value={system} onValueChange={(next) => setSystem(next as InputSystem)}>
              <SelectTrigger id="system">
                <SelectValue placeholder="Select system" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">US Size</SelectItem>
                <SelectItem value="eu">EU Size</SelectItem>
                <SelectItem value="jp">JP Size</SelectItem>
                <SelectItem value="diameter">Inner Diameter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={value}
              type="text"
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter value"
            />
          </div>

          {system === 'diameter' && (
            <div className="space-y-2">
              <Label>Units</Label>
              <div className="flex gap-2">
                {unitOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={unit === option.value ? 'default' : 'outline'}
                    type="button"
                    onClick={() => setUnit(option.value as Unit)}
                    className="flex-1"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Button type="button" onClick={handleCopy} disabled={!conversion} className="w-full">
            Copy conversion summary
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>All units are rounded to two decimal places for bench readability.</CardDescription>
        </CardHeader>
        <CardContent>
          {conversion ? (
            <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
              <ResultItem label="US Size" value={conversion.us} />
              <ResultItem label="EU Size" value={conversion.eu} />
              <ResultItem label="JP Size" value={conversion.jp} />
              <ResultItem label="Diameter" value={`${formatNumber(conversion.diameterMm)} mm / ${formatNumber(conversion.diameterIn)} in`} />
              <ResultItem
                label="Circumference"
                value={`${formatNumber(conversion.circumferenceMm)} mm / ${formatNumber(conversion.circumferenceIn)} in`}
              />
            </dl>
          ) : (
            <p className="text-sm text-gray-500">Provide a valid value to see conversions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <dt className="text-xs uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-base font-medium text-foreground">{value}</dd>
    </div>
  );
}
