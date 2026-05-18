import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ChemScatter({ data, hoveredCell }) {
  const svgRef = useRef(null);
  const chemData = data.filter((d) => d.pH !== null && d.fe_mg_l !== null);

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

    const xScale = d3.scaleLinear().domain([1, 5]).range([0, w]);
    const yScale = d3.scaleLinear().domain([0, 6500]).range([h, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#555');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.0s')))
      .attr('color', '#555');

    // Axis labels
    g.append('text')
      .attr('x', w / 2)
      .attr('y', h + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '11px')
      .text('pH');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2)
      .attr('y', -38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '11px')
      .text('Iron (mg/L)');

    // Points
    g.selectAll('circle')
      .data(chemData)
      .join('circle')
      .attr('cx', (d) => xScale(d.pH))
      .attr('cy', (d) => yScale(d.fe_mg_l))
      .attr('r', (d) =>
        hoveredCell && d.x === hoveredCell.x && d.y === hoveredCell.y ? 6 : 3.5
      )
      .attr('fill', (d) => {
        const t = (d.pH - 1) / 4;
        return d3.interpolateRdYlGn(t);
      })
      .attr('opacity', 0.8)
      .attr('stroke', (d) =>
        hoveredCell && d.x === hoveredCell.x && d.y === hoveredCell.y
          ? '#fff'
          : 'none'
      )
      .attr('stroke-width', 2);

    // Title
    g.append('text')
      .attr('x', w / 2)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#aaa')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .text('pH vs Iron — AMD Correlation');
  }, [chemData, hoveredCell]);

  return (
    <div className="chart-container">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
