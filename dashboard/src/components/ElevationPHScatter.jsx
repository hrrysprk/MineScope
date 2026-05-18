import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const METAL_OPTIONS = [
  { key: 'fe_mg_l', label: 'Iron (Fe)' },
  { key: 'as_mg_l', label: 'Arsenic (As)' },
  { key: 'cu_mg_l', label: 'Copper (Cu)' },
  { key: 'zn_mg_l', label: 'Zinc (Zn)' },
  { key: 'sulfate_mg_l', label: 'Sulfate' },
];

export default function ElevationPHScatter({ data }) {
  const svgRef = useRef(null);
  const [selectedMetal, setSelectedMetal] = useState('fe_mg_l');
  const chemData = data.filter((d) => d.pH !== null && d[selectedMetal] !== null);

  useEffect(() => {
    if (!svgRef.current || chemData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 45, left: 55 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const metalExtent = d3.extent(chemData, (d) => d[selectedMetal]);
    const xScale = d3.scaleLinear().domain(metalExtent).range([0, w]).nice();
    const yScale = d3.scaleLinear().domain(d3.extent(chemData, (d) => d.elevation)).range([h, 0]).nice();
    const sizeScale = d3.scaleLinear().domain([1, 5]).range([3, 12]);
    const colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([1, 5]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(6).tickFormat(d3.format('.0f')))
      .attr('color', '#555');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#555');

    // Axis labels
    const metalLabel = METAL_OPTIONS.find((m) => m.key === selectedMetal)?.label || selectedMetal;
    g.append('text')
      .attr('x', w / 2).attr('y', h + 38)
      .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', '11px')
      .text(`${metalLabel} (mg/L)`);

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', '11px')
      .text('Elevation (m)');

    // Points: size = pH, color = pH
    g.selectAll('circle')
      .data(chemData.sort((a, b) => b.pH - a.pH))
      .join('circle')
      .attr('cx', (d) => xScale(d[selectedMetal]))
      .attr('cy', (d) => yScale(d.elevation))
      .attr('r', (d) => sizeScale(d.pH))
      .attr('fill', (d) => colorScale(d.pH))
      .attr('opacity', 0.75)
      .attr('stroke', '#00000033')
      .attr('stroke-width', 0.5);

    // Title
    g.append('text')
      .attr('x', w / 2).attr('y', -6)
      .attr('text-anchor', 'middle').attr('fill', '#aaa')
      .attr('font-size', '11px').attr('font-weight', '600')
      .text(`Elevation vs ${metalLabel} — Size & Color = pH`);
  }, [chemData, selectedMetal]);

  return (
    <div className="chart-inner">
      <div className="chart-dropdown">
        <select value={selectedMetal} onChange={(e) => setSelectedMetal(e.target.value)}>
          {METAL_OPTIONS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
