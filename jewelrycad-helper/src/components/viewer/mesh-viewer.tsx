'use client';

import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import type { BufferGeometry } from 'three';
import { Suspense, useCallback } from 'react';

export type MeshViewerProps = {
  geometry: BufferGeometry | null;
  measurementMode: boolean;
  measurementPoints: Array<[number, number, number]>;
  onMeasurePoint: (point: [number, number, number]) => void;
};

export function MeshViewer({ geometry, measurementMode, measurementPoints, onMeasurePoint }: MeshViewerProps) {
  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (!measurementMode || !geometry) return;
      event.stopPropagation();
      const point = event.point;
      onMeasurePoint([point.x, point.y, point.z]);
    },
    [geometry, measurementMode, onMeasurePoint]
  );

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-xl border border-border bg-black/70">
      <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-gray-400">Loading viewer…</div>}>
        <Canvas camera={{ position: [0, 0, 60], fov: 45 }}>
          <color attach="background" args={[0.04, 0.04, 0.04]} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[20, 20, 25]} intensity={0.8} />
          <directionalLight position={[-20, -15, -10]} intensity={0.3} />

          {geometry ? (
            <group>
              <mesh geometry={geometry} onPointerDown={handlePointerDown} castShadow receiveShadow>
                <meshStandardMaterial color="#c8a951" metalness={0.65} roughness={0.35} />
              </mesh>
              {measurementPoints.map((point, index) => (
                <mesh key={`marker-${index}`} position={point}>
                  <sphereGeometry args={[0.6, 24, 24]} />
                  <meshBasicMaterial color={index === 0 ? '#f97316' : '#22d3ee'} />
                </mesh>
              ))}
              {measurementPoints.length === 2 && <MeasurementLine points={measurementPoints as [[number, number, number], [number, number, number]]} />}
            </group>
          ) : (
            <gridHelper args={[50, 10, '#1f1f1f', '#1f1f1f']} />
          )}

          <OrbitControls enableDamping dampingFactor={0.15} />
          <Stats showPanel={0} className="stats" />
        </Canvas>
      </Suspense>
    </div>
  );
}

type MeasurementLineProps = {
  points: [[number, number, number], [number, number, number]];
};

function MeasurementLine({ points }: MeasurementLineProps) {
  const positions = new Float32Array([...points[0], ...points[1]]);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={2} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#fbbf24" linewidth={2} />
    </line>
  );
}
