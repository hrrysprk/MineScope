import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Top annotated functions from MetaPathways SwissProt BLAST
// Real accessions mapped to functional categories from the pipeline output
const TOP_PATHWAYS = [
  { name: 'Biofilm signaling (c-di-GMP)', count: 200 },
  { name: 'Heavy metal efflux', count: 153 },
  { name: 'Membrane transport (RND)', count: 152 },
  { name: 'Cation resistance', count: 152 },
  { name: 'Stress response', count: 152 },
  { name: 'Signal transduction', count: 130 },
  { name: 'Electron transport', count: 122 },
  { name: 'Energy metabolism', count: 116 },
  { name: 'Oxidoreductase activity', count: 111 },
  { name: 'Acid/solvent tolerance', count: 110 },
];

export default function PathwayBar() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 30, right: 20, bottom: 20, left: 130 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, d3.max(TOP_PATHWAYS, d => d.count)]).range([0, w]);
    const yScale = d3.scaleBand().domain(TOP_PATHWAYS.map(d => d.name)).range([0, h]).padding(0.3);

    const colorScale = d3.scaleSequential(d3.interpolatePlasma).domain([0, TOP_PATHWAYS.length]);

    // Bars
    g.selectAll('rect')
      .data(TOP_PATHWAYS)
      .join('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', (d, i) => colorScale(i))
      .attr('rx', 3)
      .attr('opacity', 0.85);

    // Labels
    g.selectAll('text.label')
      .data(TOP_PATHWAYS)
      .join('text')
      .attr('class', 'label')
      .attr('x', -8)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#ccc')
      .attr('font-size', '10px')
      .text(d => d.name);

    // Count values
    g.selectAll('text.count')
      .data(TOP_PATHWAYS)
      .join('text')
      .attr('class', 'count')
      .attr('x', d => xScale(d.count) + 5)
      .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#888')
      .attr('font-size', '9px')
      .text(d => d.count);

    // Title
    svg.append('text')
      .attr('x', 12).attr('y', 18)
      .attr('text-anchor', 'start')
      .attr('fill', '#6a9fff')
      .attr('font-size', '18px')
      .attr('font-weight', '400')
      .attr('font-family', 'Bebas Neue, sans-serif')
      .attr('letter-spacing', '1.5px')
      .text('PATHWAY ENRICHMENT');

  }, []);

  return (
    <div className="chart-inner">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
