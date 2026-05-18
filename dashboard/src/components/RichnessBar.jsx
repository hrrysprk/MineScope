import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function RichnessBar({ data }) {
  const svgRef = useRef(null);

  // Create a distribution of elevation vs chemistry presence
  const chemData = data.filter((d) => d.pH !== null);

  useEffect(() => {
    if (!svgRef.current || chemData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Bin chemistry samples by pH range
    const bins = [
      { label: '1.0–1.5', min: 1.0, max: 1.5 },
      { label: '1.5–2.0', min: 1.5, max: 2.0 },
      { label: '2.0–2.5', min: 2.0, max: 2.5 },
      { label: '2.5–3.0', min: 2.5, max: 3.0 },
      { label: '3.0–3.5', min: 3.0, max: 3.5 },
      { label: '3.5–4.0', min: 3.5, max: 4.0 },
      { label: '4.0–5.0', min: 4.0, max: 5.0 },
    ];

    const binCounts = bins.map((bin) => ({
      ...bin,
      count: chemData.filter((d) => d.pH >= bin.min && d.pH < bin.max).length,
      avgFe: (() => {
        const inBin = chemData.filter((d) => d.pH >= bin.min && d.pH < bin.max);
        return inBin.length ? d3.mean(inBin, (d) => d.fe_mg_l) : 0;
      })(),
    }));

    const xScale = d3.scaleBand().domain(bins.map((b) => b.label)).range([0, w]).padding(0.2);
    const yScale = d3.scaleLinear().domain([0, d3.max(binCounts, (d) => d.count)]).range([h, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale))
      .attr('color', '#555')
      .selectAll('text')
      .attr('font-size', '9px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#555');

    // Axis labels
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '11px')
      .text('pH Range');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '11px')
      .text('Sample Count');

    // Bars colored by average Fe in that pH bin
    const feScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, 6000]);

    g.selectAll('rect')
      .data(binCounts)
      .join('rect')
      .attr('x', (d) => xScale(d.label))
      .attr('y', (d) => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => h - yScale(d.count))
      .attr('fill', (d) => feScale(d.avgFe))
      .attr('rx', 2);

    // Title
    g.append('text')
      .attr('x', w / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#aaa')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text('Sample Distribution by pH (colored by avg Fe)');
  }, [chemData]);

  return (
    <div className="chart-container">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
