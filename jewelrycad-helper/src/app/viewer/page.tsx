'use client';

import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as THREE from 'three';
import { toast } from 'sonner';
import { MeshViewer } from '@/components/viewer/mesh-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TRIANGLE_LIMIT = 200_000;

type MeshMetrics = {
  fileName: string;
  fileSize: number;
  triangleCount: number;
  vertexCount: number;
  dimensions: [number, number, number];
};

type IntegrityReport = {
  manifold: boolean;
  boundaryEdgeCount: number;
  triangleCount: number;
};

export default function ViewerPage() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [metrics, setMetrics] = useState<MeshMetrics | null>(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<Array<[number, number, number]>>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    try {
      const loadedGeometry = await loadGeometryFromFile(file);
      loadedGeometry.computeVertexNormals();
      loadedGeometry.computeBoundingBox();
      loadedGeometry.center();

      const positionAttribute = loadedGeometry.getAttribute('position');
      if (!positionAttribute) {
        throw new Error('Model is missing positional data.');
      }
      const vertexCount = positionAttribute.count;
      const triangleCount = (loadedGeometry.index?.count ?? vertexCount) / 3;
      const bbox = loadedGeometry.boundingBox ?? new THREE.Box3().setFromBufferAttribute(positionAttribute);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      setGeometry(loadedGeometry);
      setMetrics({
        fileName: file.name,
        fileSize: file.size,
        triangleCount,
        vertexCount,
        dimensions: [size.x, size.y, size.z]
      });
      setMeasurementPoints([]);
      setMeasurementMode(false);
      toast.success(`Loaded ${file.name}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Unable to read file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'application/octet-stream': ['.stl', '.obj']
    },
    multiple: false
  });

  const measurementDistance = useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    const [a, b] = measurementPoints;
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, [measurementPoints]);

  const handleMeasurePoint = useCallback(
    (point: [number, number, number]) => {
      if (!measurementMode) return;
      setMeasurementPoints((current) => {
        const next = [...current, point].slice(-2);
        if (next.length === 2) {
          toast.info('Two points captured. Distance shown below.');
        }
        return next;
      });
    },
    [measurementMode]
  );

  const handleIntegrityCheck = () => {
    if (!geometry) return;
    const report = analyzeGeometry(geometry);
    if (report.manifold && report.triangleCount <= TRIANGLE_LIMIT) {
      toast.success('Mesh looks healthy and within triangle limits.');
    } else {
      const issues = [];
      if (!report.manifold) {
        issues.push(`${report.boundaryEdgeCount} open edge(s)`);
      }
      if (report.triangleCount > TRIANGLE_LIMIT) {
        issues.push(`Triangle count ${report.triangleCount.toLocaleString()} exceeds recommended limit`);
      }
      toast.warning(`Potential issues: ${issues.join(' • ')}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload model</CardTitle>
          <CardDescription>Drag in STL or OBJ files to inspect them with orbit controls and live metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
              isDragActive ? 'border-accent bg-accent/10' : 'border-border bg-muted/40'
            } p-6 text-center text-sm text-gray-400 transition`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file to load it.</p>
            ) : (
              <p>
                Drag & drop a file here, or <span className="text-accent">click to browse</span>.
                <br /> Supported formats: STL, OBJ.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <MeshViewer
        geometry={geometry}
        measurementMode={measurementMode}
        measurementPoints={measurementPoints}
        onMeasurePoint={handleMeasurePoint}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mesh details</CardTitle>
            <CardDescription>Key stats update automatically when you load a new file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-300">
            {metrics ? (
              <>
                <InfoRow label="File">{metrics.fileName}</InfoRow>
                <InfoRow label="Size">{formatBytes(metrics.fileSize)}</InfoRow>
                <InfoRow label="Triangles">{metrics.triangleCount.toLocaleString()}</InfoRow>
                <InfoRow label="Vertices">{metrics.vertexCount.toLocaleString()}</InfoRow>
                <InfoRow label="Dimensions (XYZ)">
                  {metrics.dimensions.map((value) => value.toFixed(2)).join(' × ')}
                </InfoRow>
                <InfoRow label="Triangle limit">
                  {TRIANGLE_LIMIT.toLocaleString()} (recommended maximum)
                </InfoRow>
              </>
            ) : (
              <p className="text-sm text-gray-500">Load a mesh to see statistics.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tools</CardTitle>
            <CardDescription>Validate geometry and capture quick measurements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div className="space-y-2">
              <Button type="button" onClick={handleIntegrityCheck} disabled={!geometry} className="w-full">
                Check mesh integrity
              </Button>
              <p className="text-xs text-gray-500">
                Validates for closed manifolds and ensures triangle counts stay under the recommended {TRIANGLE_LIMIT.toLocaleString()}
                .
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span>Measurement mode</span>
                <Button
                  type="button"
                  variant={measurementMode ? 'default' : 'outline'}
                  onClick={() => setMeasurementMode((mode) => !mode)}
                  disabled={!geometry}
                >
                  {measurementMode ? 'Tap two points' : 'Activate'}
                </Button>
              </div>
              {measurementPoints.length > 0 && (
                <Button type="button" variant="outline" className="w-full" onClick={() => setMeasurementPoints([])}>
                  Reset measurement points
                </Button>
              )}
              <p className="text-xs text-gray-500">
                With measurement mode on, click anywhere on the mesh to capture two reference points. The straight-line distance appears
                below.
              </p>
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                {measurementDistance ? (
                  <>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Point-to-point distance</p>
                    <p className="text-lg font-semibold text-foreground">{measurementDistance.toFixed(2)} mm</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500">Select two points on the mesh to measure between them.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(1)} ${units[index]}`;
}

async function loadGeometryFromFile(file: File) {
  const extension = file.name.toLowerCase().split('.').pop();
  if (extension === 'stl') {
    const arrayBuffer = await file.arrayBuffer();
    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
    const loader = new STLLoader();
    return loader.parse(arrayBuffer);
  }

  if (extension === 'obj') {
    const text = await file.text();
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
    const object = new OBJLoader().parse(text);
    const geometries: THREE.BufferGeometry[] = [];
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if ((mesh as unknown as { isMesh?: boolean }).isMesh && mesh.geometry) {
        geometries.push(mesh.geometry.clone());
      }
    });
    if (!geometries.length) {
      throw new Error('No mesh data found in OBJ file.');
    }
    if (geometries.length === 1) {
      return geometries[0];
    }
    const { mergeGeometries } = await import('three/examples/jsm/utils/BufferGeometryUtils.js');
    const merged = mergeGeometries(geometries, true);
    if (!merged) {
      throw new Error('Unable to merge OBJ meshes into a single geometry.');
    }
    return merged as THREE.BufferGeometry;
  }

  throw new Error('Unsupported file type. Please upload STL or OBJ.');
}

function analyzeGeometry(geometry: THREE.BufferGeometry): IntegrityReport {
  const index = geometry.getIndex();
  const position = geometry.getAttribute('position');
  const triangles = (index?.count ?? position.count) / 3;
  const edgeUses = new Map<string, number>();

  const getIndex = (i: number) => (index ? index.getX(i) : i);

  for (let face = 0; face < triangles; face++) {
    const a = getIndex(face * 3);
    const b = getIndex(face * 3 + 1);
    const c = getIndex(face * 3 + 2);
    addEdge(edgeUses, a, b);
    addEdge(edgeUses, b, c);
    addEdge(edgeUses, c, a);
  }

  let manifold = true;
  let boundaryEdgeCount = 0;
  edgeUses.forEach((count) => {
    if (count !== 2) {
      manifold = false;
      if (count === 1) {
        boundaryEdgeCount += 1;
      }
    }
  });

  return { manifold, boundaryEdgeCount, triangleCount: triangles };
}

function addEdge(map: Map<string, number>, i: number, j: number) {
  const key = i < j ? `${i}-${j}` : `${j}-${i}`;
  map.set(key, (map.get(key) ?? 0) + 1);
}

type InfoRowProps = {
  label: string;
  children: ReactNode;
};

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-muted/40 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}
