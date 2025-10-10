import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const tools = [
  {
    title: 'Ring Size Calculator',
    description: 'Convert ring sizes instantly across regions and measure precise diameters.',
    href: '/ring-size'
  },
  {
    title: 'Stone Layout Planner',
    description: 'Visualize halos, pavé runs, and suggested shank widths using curated presets.',
    href: '/stone-layout'
  },
  {
    title: '3D Model Viewer',
    description: 'Inspect STL or OBJ meshes, verify triangle counts, and validate manifold geometry.',
    href: '/viewer'
  }
];

export default function HomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-3">
      {tools.map((tool) => (
        <Link key={tool.title} href={tool.href} className="group">
          <Card className="h-full border border-border bg-muted/60 transition hover:border-accent hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl font-semibold">
                {tool.title}
                <ArrowRight className="h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
              </CardTitle>
              <CardDescription className="text-gray-400">{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-500">
              Open the tool to start planning your next bespoke piece.
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
