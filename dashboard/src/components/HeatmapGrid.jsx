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
  const svgRef = useRef(null);
  const [selectedLayer, setSelectedLayer] = useState('pH');
  const [tooltip, setTooltip] = useState(null);

  const COLORS = ['#ff8c32', '#32ff8c', '#ff32a8', '#32d4ff', '#ffff32', '#a832ff'];

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const size = Math.min(container.clientWidth - 10, container.clientHeight - 40);
    const margin = 10;
    const w = size - margin * 2;

    svg.attr('width', size).attr('height', size);

    const g = svg.append('g').attr('transform', `translate(${margin},${margin})`);

    const xScale = d3.scaleLinear().domain([0, 49]).range([0, w]);
    const yScale = d3.scaleLinear().domain([0, 49]).range([0, w]);

    // Build elevation grid for contours
    const gridSize = 50;
    const values = new Array(gridSize * gridSize);
    for (const point of data) {
      const x = Math.round(point.x);
      const y = Math.round(point.y);
      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        values[y * gridSize + x] = point.elevation;
      }
    }

    // Generate contours
    const elevExtent = d3.extent(data, (d) => d.elevation);
    const thresholds = d3.range(elevExtent[0], elevExtent[1], (elevExtent[1] - elevExtent[0]) / 12);
    const contours = d3.contours()
      .size([gridSize, gridSize])
      .thresholds(thresholds)(values);

    const elevColorScale = d3.scaleSequential((t) => {
      // Very muted dark tones so sample points pop
      const grey = Math.round(18 + t * 20);
      return `rgb(${grey},${grey + 2},${grey + 5})`;
    }).domain([elevExtent[1], elevExtent[0]]);

    // Draw filled contours
    const pathGen = d3.geoPath().projection(
      d3.geoTransform({
        point: function (x, y) {
          this.stream.point(xScale(x), yScale(y));
        },
      })
    );

    g.selectAll('path.contour-fill')
      .data(contours)
      .join('path')
      .attr('class', 'contour-fill')
      .attr('d', pathGen)
      .attr('fill', (d) => elevColorScale(d.value))
      .attr('stroke', 'none')
      .attr('opacity', 0.8);

    // Draw contour lines
    g.selectAll('path.contour-line')
      .data(contours)
      .join('path')
      .attr('class', 'contour-line')
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#2a2a30')
      .attr('stroke-width', 0.4);

    // Overlay chemistry sample points
    const chemPoints = data.filter((d) => d[selectedLayer] !== null && d[selectedLayer] !== undefined);
    const layerConfig = LAYER_OPTIONS.find((l) => l.key === selectedLayer);
    const valueExtent = d3.extent(chemPoints, (d) => d[selectedLayer]);
    const colorScale = d3.scaleSequential(layerConfig.interpolator).domain(valueExtent);

    g.selectAll('circle.sample')
      .data(chemPoints)
      .join('circle')
      .attr('class', 'sample')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', (d) => {
        const selIdx = selectedSites.findIndex((s) => s.x === d.x && s.y === d.y);
        return selIdx >= 0 ? 6 : 3.5;
      })
      .attr('fill', (d) => {
        const selIdx = selectedSites.findIndex((s) => s.x === d.x && s.y === d.y);
        return selIdx >= 0 ? COLORS[selIdx % COLORS.length] : colorScale(d[selectedLayer]);
      })
      .attr('stroke', (d) => {
        const selIdx = selectedSites.findIndex((s) => s.x === d.x && s.y === d.y);
        return selIdx >= 0 ? '#fff' : 'none';
      })
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9)
      .style('cursor', 'pointer');

  }, [data, selectedLayer, selectedSites]);

  const handleClick = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const container = svg.parentElement;
    const size = Math.min(container.clientWidth - 10, container.clientHeight - 40);
    const margin = 10;
    const w = size - margin * 2;

    const mx = e.clientX - rect.left - margin;
    const my = e.clientY - rect.top - margin;
    const gridX = Math.round((mx / w) * 49);
    const gridY = Math.round((my / w) * 49);

    const chemPoints = data.filter((d) => d.pH !== null);
    const clicked = chemPoints.find((d) => {
      const dx = d.x - gridX;
      const dy = d.y - gridY;
      return Math.sqrt(dx * dx + dy * dy) < 2;
    });

    if (clicked) {
      if (e.shiftKey) {
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

  const handleMouseMove = (e) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const container = svg.parentElement;
    const size = Math.min(container.clientWidth - 10, container.clientHeight - 40);
    const margin = 10;
    const w = size - margin * 2;

    const mx = e.clientX - rect.left - margin;
    const my = e.clientY - rect.top - margin;
    const gridX = Math.round((mx / w) * 49);
    const gridY = Math.round((my / w) * 49);

    const chemPoints = data.filter((d) => d.pH !== null);
    const hovered = chemPoints.find((d) => {
      const dx = d.x - gridX;
      const dy = d.y - gridY;
      return Math.sqrt(dx * dx + dy * dy) < 2;
    });

    if (hovered) {
      setTooltip({ x: hovered.x, y: hovered.y, mouseX: e.clientX, mouseY: e.clientY });
    } else {
      setTooltip(null);
    }
  };

  // Legend
  const layerConfig = LAYER_OPTIONS.find((l) => l.key === selectedLayer);
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
      <svg ref={svgRef} onClick={handleClick} onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)} style={{ cursor: 'crosshair' }} />
      {tooltip && (
        <div
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
