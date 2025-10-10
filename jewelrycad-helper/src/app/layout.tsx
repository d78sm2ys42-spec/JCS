import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'JewelryCAD Helper',
  description:
    'Plan ring sizes, stone layouts, and inspect CAD meshes before committing to full modeling.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8">
          <header className="mb-12 flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              JewelryCAD Helper
            </h1>
            <p className="text-sm text-gray-400">
              A lightweight toolkit for jewelers to validate ideas before heading into full CAD.
            </p>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-gray-500">
            Crafted for precision-minded jewelers • {new Date().getFullYear()}
          </footer>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
