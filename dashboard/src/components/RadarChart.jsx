import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const AXES = [
  { key: 'fe_mg_l', label: 'Iron', max: 6500 },
  { key: 'as_mg_l', label: 'Arsenic', max: 900 },
  { key: 'cu_mg_l', label: 'Copper', max: 30 },
  { key: 'zn_mg_l', label: 'Zinc', max: 220 },
  { key: 'sulfate_mg_l', label: 'Sulfate', max: 5000 },
  { key: 'moisture_pct', label: 'Moisture', max: 55 },
];

export default function RadarChart({ data, selectedSites }) {
  const svgRef = useRef(null);
  const chemData = data.filter((d) => d.pH !== null);

  const COLORS = ['#ff8c32', '#32ff8c', '#ff32a8', '#32d4ff', '#ffff32', '#a832ff'];

  useEffect(() => {
    if (!svgRef.current || chemData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    const angleSlice = (Math.PI * 2) / AXES.length;

    // Draw grid circles
    const levels = 4;
    for (let i = 1; i <= levels; i++) {
      const r = (radius / levels) * i;
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#2a2a3e')
        .attr('stroke-width', 0.5);
    }

    // Draw axes
    AXES.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', x).attr('y2', y)
        .attr('stroke', '#2a2a3e')
        .attr('stroke-width', 0.5);

      const labelX = Math.cos(angle) * (radius + 18);
      const labelY = Math.sin(angle) * (radius + 18);
      g.append('text')
        .attr('x', labelX).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#888')
        .attr('font-size', '10px')
        .text(axis.label);
    });

    // Compute average values
    const avgValues = AXES.map((axis) => {
      const vals = chemData.map((d) => d[axis.key]).filter((v) => v != null);
      return vals.length ? d3.mean(vals) : 0;
    });

    // Always draw average polygon as reference
    const avgPoints = avgValues.map((val, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = (val / AXES[i].max) * radius;
      return [Math.cos(angle) * r, Math.sin(angle) * r];
    });

    g.append('polygon')
      .attr('points', avgPoints.map((p) => p.join(',')).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#ff4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4');

    if (selectedSites.length === 0) {
      // No dots for average — just the dashed line
    }

    // Draw selected site polygons
    selectedSites.forEach((site, sIdx) => {
      const color = COLORS[sIdx % COLORS.length];
      const siteValues = AXES.map((axis) => site[axis.key] ?? 0);
      const sitePoints = siteValues.map((val, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (Math.min(val, AXES[i].max) / AXES[i].max) * radius;
        return [Math.cos(angle) * r, Math.sin(angle) * r];
      });

      g.append('polygon')
        .attr('points', sitePoints.map((p) => p.join(',')).join(' '))
        .attr('fill', `${color}22`)
        .attr('stroke', color)
        .attr('stroke-width', 2);

      sitePoints.forEach((point) => {
        g.append('circle')
          .attr('cx', point[0]).attr('cy', point[1])
          .attr('r', 3)
          .attr('fill', color);
      });
    });

    // Title
    svg.append('text')
      .attr('x', 12).attr('y', 18)
      .attr('text-anchor', 'start')
      .attr('fill', '#6a9fff')
      .attr('font-size', '18px')
      .attr('font-weight', '400')
      .attr('font-family', 'Bebas Neue, sans-serif')
      .attr('letter-spacing', '1.5px')
      .text('METAL PROFILING');

    // pH badges for selected sites
    selectedSites.forEach((site, sIdx) => {
      if (site.pH) {
        const color = COLORS[sIdx % COLORS.length];
        svg.append('text')
          .attr('x', width - 12).attr('y', height - 10 - (selectedSites.length - 1 - sIdx) * 16)
          .attr('text-anchor', 'end')
          .attr('fill', color)
          .attr('font-size', '13px')
          .attr('font-weight', '600')
          .text(`pH ${site.pH.toFixed(2)}`);
      }
    });
  }, [chemData, selectedSites]);

  return (
    <div className="chart-inner">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
