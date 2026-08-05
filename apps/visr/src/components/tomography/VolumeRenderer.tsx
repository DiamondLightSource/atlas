import { Canvas, invalidate } from "@react-three/fiber";
// import { useFrame } from '@react-three/fiber' // for revolve
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./VolumeShader";

// ---------------------------------------------------------------------------
// Mesh
// ---------------------------------------------------------------------------

interface VolumeMeshProps {
  volumeData: Uint8Array;
  volumeShape: [number, number, number];
  // revolve: boolean
  steps: number;
  opacityScale: number;
  threshold: number;
}

function VolumeMesh({
  volumeData,
  volumeShape,
  steps,
  opacityScale,
  threshold,
}: VolumeMeshProps) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const texRef = useRef<THREE.Data3DTexture | null>(null);

  const uniforms = useMemo(
    () => ({
      volumeTexture: { value: null as THREE.Data3DTexture | null },
      threshold: { value: threshold },
      opacityScale: { value: opacityScale },
      steps: { value: steps },
    }),
    [],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync scalar uniforms when props change
  useEffect(() => {
    uniforms.threshold.value = threshold;
  }, [threshold, uniforms]);
  useEffect(() => {
    uniforms.opacityScale.value = opacityScale;
  }, [opacityScale, uniforms]);
  useEffect(() => {
    uniforms.steps.value = steps;
  }, [steps, uniforms]);

  // Upload volume data to GPU texture
  useEffect(() => {
    const [depth, height, width] = volumeShape;

    if (
      !texRef.current ||
      texRef.current.image.width !== width ||
      texRef.current.image.height !== height ||
      texRef.current.image.depth !== depth
    ) {
      texRef.current?.dispose();
      const tex = new THREE.Data3DTexture(
        new Uint8Array(width * height * depth),
        width,
        height,
        depth,
      );
      tex.format = THREE.RedFormat;
      tex.type = THREE.UnsignedByteType;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.unpackAlignment = 1;
      tex.needsUpdate = true;
      texRef.current = tex;
      uniforms.volumeTexture.value = tex;
    }

    (texRef.current.image.data as Uint8Array).set(volumeData);
    texRef.current.needsUpdate = true;
    invalidate();
  }, [volumeData, volumeShape, uniforms]);

  //// revolve
  // useFrame((state, delta) => {
  //   if (!revolve || !meshRef.current) return
  //   if (state.clock.elapsedTime - lastFrameRef.current < 1 / 30) return
  //   lastFrameRef.current = state.clock.elapsedTime
  //   meshRef.current.rotation.y += delta * 0.4
  //   invalidate()
  // })

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Canvas
// ---------------------------------------------------------------------------

export interface VolumeRendererProps {
  /** Raw voxel data as a flat C-order uint8 array. */
  volumeData: Uint8Array;
  /** Dimensions of the volume as [depth, height, width]. */
  volumeShape: [number, number, number];
  // revolve?: boolean — NOT IMPLEMENTED. When true, rotates continuously around Y; orbit control disabled while revolving.
  /**
   * Number of ray-march samples taken per pixel through the volume.
   * Higher values improve quality but increase GPU cost.
   * @default 64
   */
  steps?: number;
  /**
   * Global multiplier applied to the opacity of every voxel.
   * Increase above 1.0 for more solid/opaque; decrease below 1.0 for more transparent/ghostly.
   * @default 1.0
   */
  opacityScale?: number;
  /**
   * Normalised density value (0–1) below which voxels are fully transparent.
   * Acts as a noise floor — raise to hide low-density artefacts; lower to show faint detail.
   * @default 0.15
   */
  threshold?: number;
  /**
   * Optional inline styles applied to the Canvas element.
   * The canvas fills its parent container by default (width/height: 100%).
   */
  style?: CSSProperties;
}

/** Three.js raw uint8 volume renderer. Colormap is defined in `VolumeShader.ts`. */
export default function VolumeRenderer({
  volumeData,
  volumeShape,
  // revolve = false,
  steps = 64,
  opacityScale = 1.0,
  threshold = 0.15,
  style,
}: VolumeRendererProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={Math.min(window.devicePixelRatio, 1.5)}
      gl={{ antialias: true }}
      camera={{ position: [1.5, 1.2, 1.8], fov: 45, near: 0.01, far: 100 }}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <ambientLight intensity={0.5} />
      <VolumeMesh
        volumeData={volumeData}
        volumeShape={volumeShape}
        // revolve={revolve}
        steps={steps}
        opacityScale={opacityScale}
        threshold={threshold}
      />
      <OrbitControls makeDefault />
    </Canvas>
  );
}
