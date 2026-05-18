import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getColor, getColorCSS } from '../utils/colorScales';

const GRID_SIZE = 50;
const ELEV_SCALE = 0.25;

function SampleSpheres({ data, activeLayer, grid, onHover, hoveredCell }) {
  const chemPoints = useMemo(() => data.filter((d) => d.pH !== null), [data]);
  const isChemLayer = ['pH', 'fe_mg_l', 'as_mg_l', 'cu_mg_l', 'zn_mg_l', 'sulfate_mg_l', 'moisture_pct'].includes(activeLayer);

  if (!isChemLayer) return null;

  return (
    <>
      {chemPoints.map((point, idx) => {
        const gx = (point.x / (GRID_SIZE - 1)) * 50 - 25;
        const gz = (point.y / (GRID_SIZE - 1)) * 50 - 25;
        const gy = (point.elevation - 65) * ELEV_SCALE + 0.4;
        const rgba = getColor(point[activeLayer], activeLayer);
        const color = new THREE.Color(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255);
        const isHovered = hoveredCell && hoveredCell.x === point.x && hoveredCell.y === point.y;

        return (
          <mesh
            key={idx}
            position={[gx, gy, gz]}
            onPointerEnter={(e) => { e.stopPropagation(); onHover(point); }}
            onPointerLeave={() => onHover(null)}
          >
            <sphereGeometry args={[isHovered ? 0.5 : 0.35, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isHovered ? 0.6 : 0.3}
              roughness={0.3}
            />
          </mesh>
        );
      })}
    </>
  );
}

function Tooltip({ hoveredCell, activeLayer }) {
  return null; // Replaced by screen-space tooltip
}

function TerrainMesh({ data, activeLayer, onHover, grid }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(50, 50, GRID_SIZE - 1, GRID_SIZE - 1);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position.array;
    const colors = new Float32Array(positions.length);

    const isChemLayer = ['pH', 'fe_mg_l', 'as_mg_l', 'cu_mg_l', 'zn_mg_l', 'sulfate_mg_l', 'moisture_pct'].includes(activeLayer);

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const vertexIndex = i * GRID_SIZE + j;
        const point = grid[i][j];

        const elevation = point ? (point.elevation - 65) * ELEV_SCALE : 0;
        positions[vertexIndex * 3 + 1] = elevation;

        let rgba;
        if (isChemLayer) {
          // Dark neutral terrain when showing chemistry (spheres show the data)
          const elNorm = point ? (point.elevation - 67) / 33 : 0;
          rgba = [28 + elNorm * 18, 30 + elNorm * 15, 38 + elNorm * 12, 255];
        } else {
          const value = point ? point[activeLayer] : null;
          rgba = getColor(value, activeLayer);
        }

        colors[vertexIndex * 3] = rgba[0] / 255;
        colors[vertexIndex * 3 + 1] = rgba[1] / 255;
        colors[vertexIndex * 3 + 2] = rgba[2] / 255;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    return geo;
  }, [grid, activeLayer]);

  const handlePointerMove = (e) => {
    e.stopPropagation();
    const point = e.point;
    let minDist = Infinity;
    let nearest = null;
    const px = point.x;
    const pz = point.z;

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!grid[i][j]) continue;
        const gx = (j / (GRID_SIZE - 1)) * 50 - 25;
        const gz = (i / (GRID_SIZE - 1)) * 50 - 25;
        const dist = (px - gx) ** 2 + (pz - gz) ** 2;
        if (dist < minDist) {
          minDist = dist;
          nearest = grid[i][j];
        }
      }
    }

    if (nearest && minDist < 4) {
      onHover(nearest);
    }
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onHover(null)}
    >
      <meshPhysicalMaterial
        vertexColors
        side={THREE.DoubleSide}
        roughness={0.75}
        metalness={0.0}
        clearcoat={0.1}
        clearcoatRoughness={0.4}
        flatShading={false}
      />
    </mesh>
  );
}

function BaseSkirt({ data }) {
  const grid = useMemo(() => {
    const g = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    for (const point of data) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        g[y][x] = point;
      }
    }
    return g;
  }, [data]);

  const geometry = useMemo(() => {
    const baseY = -2;
    const vertices = [];
    const indices = [];

    vertices.push(-25, baseY, -25);
    vertices.push(25, baseY, -25);
    vertices.push(25, baseY, 25);
    vertices.push(-25, baseY, 25);
    indices.push(0, 1, 2, 0, 2, 3);

    const getElev = (i, j) => {
      const point = grid[i] && grid[i][j];
      return point ? (point.elevation - 65) * ELEV_SCALE : 0;
    };

    let vIdx = 4;

    for (let j = 0; j < GRID_SIZE - 1; j++) {
      const x0 = (j / (GRID_SIZE - 1)) * 50 - 25;
      const x1 = ((j + 1) / (GRID_SIZE - 1)) * 50 - 25;
      const z = -25;
      const y0 = getElev(0, j), y1 = getElev(0, j + 1);
      vertices.push(x0, y0, z, x1, y1, z, x1, baseY, z, x0, baseY, z);
      indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
      vIdx += 4;
    }

    for (let j = 0; j < GRID_SIZE - 1; j++) {
      const x0 = (j / (GRID_SIZE - 1)) * 50 - 25;
      const x1 = ((j + 1) / (GRID_SIZE - 1)) * 50 - 25;
      const z = 25;
      const y0 = getElev(49, j), y1 = getElev(49, j + 1);
      vertices.push(x1, y1, z, x0, y0, z, x0, baseY, z, x1, baseY, z);
      indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
      vIdx += 4;
    }

    for (let i = 0; i < GRID_SIZE - 1; i++) {
      const z0 = (i / (GRID_SIZE - 1)) * 50 - 25;
      const z1 = ((i + 1) / (GRID_SIZE - 1)) * 50 - 25;
      const x = -25;
      const y0 = getElev(i, 0), y1 = getElev(i + 1, 0);
      vertices.push(x, y1, z1, x, y0, z0, x, baseY, z0, x, baseY, z1);
      indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
      vIdx += 4;
    }

    for (let i = 0; i < GRID_SIZE - 1; i++) {
      const z0 = (i / (GRID_SIZE - 1)) * 50 - 25;
      const z1 = ((i + 1) / (GRID_SIZE - 1)) * 50 - 25;
      const x = 25;
      const y0 = getElev(i, 49), y1 = getElev(i + 1, 49);
      vertices.push(x, y0, z0, x, y1, z1, x, baseY, z1, x, baseY, z0);
      indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
      vIdx += 4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    return geo;
  }, [grid]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#201e1c" side={THREE.DoubleSide} />
    </mesh>
  );
}

function WaterPlane({ activeLayer }) {
  // Removed — water visualization is handled through terrain coloring
  return null;
}

function WaterSkirt({ waterLevel }) {
  const geometry = useMemo(() => {
    const baseY = -2; // Same as terrain skirt base
    const vertices = [];
    const indices = [];
    let vIdx = 0;
    const size = 25;
    const steps = 30;

    // Four sides — drop from water level to terrain base
    const sides = [
      { getPos: (t) => [t, -size] },  // Front
      { getPos: (t) => [t, size] },   // Back
      { getPos: (t) => [-size, t] },  // Left
      { getPos: (t) => [size, t] },   // Right
    ];

    for (const side of sides) {
      for (let i = 0; i < steps; i++) {
        const t0 = (i / steps) * 50 - 25;
        const t1 = ((i + 1) / steps) * 50 - 25;
        const [x0, z0] = side.getPos(t0);
        const [x1, z1] = side.getPos(t1);

        vertices.push(
          x0, waterLevel, z0,
          x1, waterLevel, z1,
          x1, baseY, z1,
          x0, baseY, z0
        );
        indices.push(vIdx, vIdx + 1, vIdx + 2, vIdx, vIdx + 2, vIdx + 3);
        vIdx += 4;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    return geo;
  }, [waterLevel]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial color="#0d2a3a" transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function TerrainViewer({ data, activeLayer, onHover }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredFromSphere, setHoveredFromSphere] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const grid = useMemo(() => {
    const g = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    for (const point of data) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
        g[y][x] = point;
      }
    }
    return g;
  }, [data]);

  const handleHover = (cell) => {
    setHoveredCell(cell);
    setHoveredFromSphere(false);
    onHover(cell);
  };

  const handleSphereHover = (cell) => {
    setHoveredCell(cell);
    setHoveredFromSphere(true);
    onHover(cell);
  };

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="terrain-viewer" onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [65, 35, 70], fov: 38, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ background: '#161617' }}
      >
        <color attach="background" args={['#161617']} />
        <fog attach="fog" args={['#161617', 80, 180]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[35, 45, 25]} intensity={1.8} color="#fff5e6" />
        <directionalLight position={[-25, 20, -35]} intensity={0.4} color="#4488ff" />
        <pointLight position={[0, 30, 0]} intensity={0.3} color="#ffffff" />

        <TerrainMesh data={data} activeLayer={activeLayer} onHover={handleHover} grid={grid} />
        <SampleSpheres data={data} activeLayer={activeLayer} grid={grid} onHover={handleSphereHover} hoveredCell={hoveredCell} />
        <WaterPlane activeLayer={activeLayer} />
        <BaseSkirt data={data} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={30}
          maxDistance={130}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 3, 0]}
          autoRotate={false}
          zoomSpeed={0.4}
        />
      </Canvas>

      {hoveredFromSphere && hoveredCell && (
        <div
          className="terrain-tooltip"
          style={{
            position: 'fixed',
            left: mousePos.x + 16,
            top: mousePos.y - 10,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        >
          <div className="tt-header">({hoveredCell.x}, {hoveredCell.y})</div>
          <div className="tt-row"><span>Elevation (m)</span><span>{hoveredCell.elevation?.toFixed(1)}</span></div>
          <div className="tt-row"><span>pH</span><span>{hoveredCell.pH?.toFixed(2) ?? '—'}</span></div>
          <div className="tt-row"><span>Iron (mg/L)</span><span>{hoveredCell.fe_mg_l?.toFixed(0) ?? '—'}</span></div>
          <div className="tt-row"><span>Arsenic (mg/L)</span><span>{hoveredCell.as_mg_l?.toFixed(0) ?? '—'}</span></div>
          <div className="tt-row"><span>Sulfate (mg/L)</span><span>{hoveredCell.sulfate_mg_l?.toFixed(0) ?? '—'}</span></div>
        </div>
      )}
    </div>
  );
}
