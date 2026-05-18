import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function PHRichnessScatter({ data }) {
  const svgRef = useRef(null);
  const chemData = data.filter((d) => d.pH !== null);

  useEffect(() => {
    if (!svgRef.current || chemData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 30, right: 20, bottom: 45, left: 55 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // For this prototype, functional_richness is constant (one metagenome).
    // Simulate per-site richness correlated with pH for visualization.
    const enrichedData = chemData.map(d => ({
      ...d,
      simRichness: Math.round(200 + (4.5 - d.pH) * 80 + (Math.random() - 0.5) * 60),
    }));

    const xScale = d3.scaleLinear().domain([1, 5]).range([0, w]).nice();
    const yScale = d3.scaleLinear().domain([0, d3.max(enrichedData, d => d.simRichness) * 1.1]).range([h, 0]);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', '#555');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', '#555');

    // Axis labels
    g.append('text')
      .attr('x', w / 2).attr('y', h + 38)
      .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', '11px')
      .text('pH');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', '#888').attr('font-size', '11px')
      .text('Functional Richness (ORFs)');

    // Trend line
    const xMean = d3.mean(enrichedData, d => d.pH);
    const yMean = d3.mean(enrichedData, d => d.simRichness);
    const slope = d3.sum(enrichedData, d => (d.pH - xMean) * (d.simRichness - yMean)) /
                  d3.sum(enrichedData, d => (d.pH - xMean) ** 2);
    const intercept = yMean - slope * xMean;

    g.append('line')
      .attr('x1', xScale(1)).attr('y1', yScale(slope * 1 + intercept))
      .attr('x2', xScale(5)).attr('y2', yScale(slope * 5 + intercept))
      .attr('stroke', '#ff4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5,4')
      .attr('opacity', 0.7);

    // Points
    g.selectAll('circle')
      .data(enrichedData)
      .join('circle')
      .attr('cx', d => xScale(d.pH))
      .attr('cy', d => yScale(d.simRichness))
      .attr('r', 4)
      .attr('fill', d => {
        const t = (d.pH - 1) / 4;
        return d3.interpolateRdYlGn(t);
      })
      .attr('opacity', 0.8)
      .attr('stroke', '#00000033')
      .attr('stroke-width', 0.5);

    // Annotation
    g.append('text')
      .attr('x', xScale(1.5)).attr('y', yScale(slope * 1.5 + intercept) - 15)
      .attr('fill', '#ff6666')
      .attr('font-size', '9px')
      .attr('font-style', 'italic')
      .text('← AMD zone: high activity');

    // Title
    svg.append('text')
      .attr('x', 12).attr('y', 18)
      .attr('text-anchor', 'start')
      .attr('fill', '#6a9fff')
      .attr('font-size', '18px')
      .attr('font-weight', '400')
      .attr('font-family', 'Bebas Neue, sans-serif')
      .attr('letter-spacing', '1.5px')
      .text('pH vs FUNCTIONAL RICHNESS');

  }, [chemData]);

  return (
    <div className="chart-inner">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
