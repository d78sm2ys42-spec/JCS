# JewelryCAD Helper

JewelryCAD Helper is a lightweight planning companion for jewelers. It streamlines sizing conversions, stone layout exploration, and mesh validation so you can confirm design intent before opening a full CAD suite.

## ✨ Features

- **Ring Size Calculator** – Convert between US, EU, JP sizes, as well as diameter and circumference with clipboard-ready summaries.
- **Stone Layout Planner** – Generate halo and pavé recommendations, shank width ranges, and export the data as CSV for quoting or production notes.
- **3D Model Viewer** – Drag-and-drop STL or OBJ files, orbit around them in the browser, inspect triangle counts, run manifold checks, and measure straight-line distances between two points.

The interface keeps a dark graphite aesthetic with subtle gold accents to mimic the bench environment while staying focused and distraction-free.

## 🧱 Tech Stack

- [Next.js 14](https://nextjs.org/) with the App Router and TypeScript
- Tailwind CSS + shadcn/ui-inspired components for rapid UI work
- Three.js with @react-three/fiber for real-time mesh previews
- Vitest with Testing Library for unit tests
- ESLint + Prettier for consistent formatting
- GitHub Actions workflow covering linting and tests

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to use the tools.

3. **Run tests and lint checks**

   ```bash
   npm run test
   npm run lint
   ```

## 📁 Project Structure

```
src/
  app/              # App Router routes for each tool
  components/       # Reusable UI and viewer components
  data/             # JSON presets for sizing and stone suggestions
  lib/              # Core calculation utilities
```

## 🧪 Testing Strategy

The Vitest configuration targets jsdom for component-friendly testing. Coverage currently focuses on numeric utilities powering conversions and layout planning, making the calculations easy to trust and extend.

## 🛠️ Mesh Integrity Checks

The viewer flags two common blockers before production:

- **Manifold verification** – highlights open edges that could cause printing or casting failures.
- **Triangle limit** – warns when a mesh exceeds a configurable triangle threshold (default 200k) to keep workstation performance healthy.

Activate measurement mode to select two points directly on the mesh and receive a straight-line distance readout, perfect for confirming seat spacing or gallery heights.

## 📦 Deployment Notes

The included GitHub Action runs `npm run lint` and `npm run test` on pushes and pull requests targeting `main`, helping keep shared branches stable.

---

Crafted to help jewelers move from concept to CAD with confidence.
