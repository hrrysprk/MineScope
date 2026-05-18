import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LAYER_OPTIONS = [
  { key: 'pH', label: 'pH', interpolator: (t) => d3.interpolateRdYlGn(1 - t) },
  { key: 'fe_mg_l', label: 'Iron (Fe)', interpolator: d3.interpolatePlasma },
  { key: 'as_mg_l', label: 'Arsenic (As)', interpolator: d3.interpolateMagma },
  { key: 'cu_mg_l', label: 'Copper (Cu)', interpolator: d3.interpolateOranges },
  { key: 'zn_mg_l', label: 'Zinc (Zn)', interpolator: d3.interpolatePurples },
  { key: 'sulfate_mg_l', label: 'Sulfate', interpolator: d3.interpolateYlOrRd },
];

export default function HeatmapGrid({ data, selectedSites, onSiteSelect }) {
  const canvasRef = useRef(null);
  const [selectedLayer, setSelectedLayer] = useState('pH');
  const [tooltip, setTooltip] = useState(null);

  const COLORS = ['#ff8c32', '#32ff8c', '#ff32a8', '#32d4ff', '#ffff32', '#a832ff'];

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth - 10, container.clientHeight - 50);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const cellSize = size / 50;
    const layerConfig = LAYER_OPTIONS.find((l) => l.key === selectedLayer);

    // Draw terrain background
    const elevExtent = d3.extent(data, (d) => d.elevation);
    const elevScale = d3.scaleLinear().domain(elevExtent).range([0, 1]);

    for (const point of data) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      const t = elevScale(point.elevation);
      const grey = Math.round(18 + t * 22);
      ctx.fillStyle = `rgb(${grey},${grey + 2},${grey + 4})`;
      ctx.fillRect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
    }

    // Overlay sample points
    const chemPoints = data.filter((d) => d[selectedLayer] !== null && d[selectedLayer] !== undefined);
    if (chemPoints.length === 0) return;

    const valueExtent = d3.extent(chemPoints, (d) => d[selectedLayer]);
    const colorScale = d3.scaleSequential(layerConfig.interpolator).domain(valueExtent);

    for (const point of chemPoints) {
      const selIdx = selectedSites.findIndex((s) => s.x === point.x && s.y === point.y);
      const isSelected = selIdx >= 0;

      ctx.beginPath();
      ctx.arc(
        point.x * cellSize + cellSize / 2,
        point.y * cellSize + cellSize / 2,
        isSelected ? cellSize * 1.0 : cellSize * 0.55,
        0, Math.PI * 2
      );
      ctx.fillStyle = isSelected ? COLORS[selIdx % COLORS.length] : colorScale(point[selectedLayer]);
      ctx.globalAlpha = isSelected ? 1 : 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }, [data, selectedLayer, selectedSites]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = canvas.width / 50;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    const chemPoints = data.filter((d) => d.pH !== null);
    const clicked = chemPoints.find((d) => {
      const dx = d.x - gridX;
      const dy = d.y - gridY;
      return Math.sqrt(dx * dx + dy * dy) < 2;
    });

    if (clicked) {
      if (e.shiftKey) {
        // Multi-select with shift
        const alreadySelected = selectedSites.findIndex((s) => s.x === clicked.x && s.y === clicked.y);
        if (alreadySelected >= 0) {
          onSiteSelect(selectedSites.filter((_, i) => i !== alreadySelected));
        } else {
          onSiteSelect([...selectedSites, clicked]);
        }
      } else {
        onSiteSelect([clicked]);
      }
    } else {
      onSiteSelect([]);
    }
  };

  // Legend
  const layerConfig = LAYER_OPTIONS.find((l) => l.key === selectedLayer);

  const handleCanvasHover = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellSize = canvas.width / 50;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    const chemPoints = data.filter((d) => d.pH !== null);
    const hovered = chemPoints.find((d) => {
      const dx = d.x - gridX;
      const dy = d.y - gridY;
      return Math.sqrt(dx * dx + dy * dy) < 2;
    });

    if (hovered) {
      setTooltip({ x: hovered.x, y: hovered.y, pH: hovered.pH, fe: hovered.fe_mg_l, mouseX: e.clientX, mouseY: e.clientY });
    } else {
      setTooltip(null);
    }
  };
  const chemPoints = data.filter((d) => d[selectedLayer] !== null);
  const valueExtent = chemPoints.length ? d3.extent(chemPoints, (d) => d[selectedLayer]) : [0, 1];

  return (
    <div className="chart-inner heatmap-container">
      <div className="chart-dropdown">
        <select value={selectedLayer} onChange={(e) => setSelectedLayer(e.target.value)}>
          {LAYER_OPTIONS.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
      </div>
      <div className="chart-title heatmap-title" style={{ color: '#6a9fff', fontFamily: 'Bebas Neue, sans-serif', fontSize: '18px', letterSpacing: '1.5px', textAlign: 'left', padding: '8px 12px 4px' }}>SPATIAL VIEW</div>
      <canvas ref={canvasRef} onClick={handleCanvasClick} onMouseMove={handleCanvasHover} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'crosshair' }} />
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.mouseX + 12,
            top: tooltip.mouseY - 30,
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'rgba(22, 22, 23, 0.75)',
            backdropFilter: 'blur(4px)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            color: '#ccc',
          }}
        >
          ({tooltip.x}, {tooltip.y})
        </div>
      )}
      <div className="heatmap-legend-corner">
        <div className="legend-title">{LAYER_OPTIONS.find(l => l.key === selectedLayer)?.label}</div>
        <div className="legend-gradient" style={{
          background: `linear-gradient(to right, ${layerConfig.interpolator(0)}, ${layerConfig.interpolator(0.25)}, ${layerConfig.interpolator(0.5)}, ${layerConfig.interpolator(0.75)}, ${layerConfig.interpolator(1)})`,
        }} />
        <div className="legend-labels">
          <span>{valueExtent[0]?.toFixed(1)}</span>
          <span>{valueExtent[1]?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
