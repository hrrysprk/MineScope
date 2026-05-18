import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Top annotated functions from MetaPathways SwissProt BLAST
// Real accessions mapped to functional categories from the pipeline output
const CATEGORIES = {
  metal: { color: '#ffb432', label: 'Metal resistance' },
  signaling: { color: '#6a9fff', label: 'Signaling' },
  energy: { color: '#82dc82', label: 'Energy metabolism' },
  stress: { color: '#ff6b6b', label: 'Stress response' },
  transport: { color: '#a855f7', label: 'Transport' },
};

const TOP_PATHWAYS = [
  { name: 'Biofilm signaling (c-di-GMP)', count: 200, category: 'signaling' },
  { name: 'Heavy metal efflux', count: 153, category: 'metal' },
  { name: 'Membrane transport (RND)', count: 152, category: 'transport' },
  { name: 'Cation resistance', count: 152, category: 'metal' },
  { name: 'Stress response', count: 152, category: 'stress' },
  { name: 'Signal transduction', count: 130, category: 'signaling' },
  { name: 'Electron transport', count: 122, category: 'energy' },
  { name: 'Energy metabolism', count: 116, category: 'energy' },
  { name: 'Oxidoreductase activity', count: 111, category: 'energy' },
  { name: 'Acid/solvent tolerance', count: 110, category: 'stress' },
];

export default function PathwayBar() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 30, right: 50, bottom: 30, left: 130 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, d3.max(TOP_PATHWAYS, d => d.count)]).range([0, w]);
    const yScale = d3.scaleBand().domain(TOP_PATHWAYS.map(d => d.name)).range([0, h]).padding(0.3);

    // Bars colored by category
    g.selectAll('rect')
      .data(TOP_PATHWAYS)
      .join('rect')
      .attr('x', 0)
      .attr('y', d => yScale(d.name))
      .attr('width', d => xScale(d.count))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => CATEGORIES[d.category].color)
      .attr('rx', 3)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('text')
          .attr('class', 'bar-tooltip')
          .attr('x', xScale(d.count) + 30)
          .attr('y', yScale(d.name) + yScale.bandwidth() / 2 + 1)
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#ccc')
          .attr('font-size', '9px')
          .text(`${d.count} ORFs`);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.85).attr('stroke', 'none');
        g.selectAll('.bar-tooltip').remove();
      });

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

    svg.append('text')
      .attr('x', 195).attr('y', 18)
      .attr('text-anchor', 'start')
      .attr('fill', '#555')
      .attr('font-size', '10px')
      .text('Top 10 by ORF count');

    // Category legend
    const legendEntries = Object.values(CATEGORIES);
    const legendStartX = margin.left;
    const legendY = height - 10;
    legendEntries.forEach((cat, i) => {
      const lx = legendStartX + i * 110;
      svg.append('rect')
        .attr('x', lx).attr('y', legendY - 8)
        .attr('width', 10).attr('height', 10)
        .attr('rx', 2)
        .attr('fill', cat.color)
        .attr('opacity', 0.85);
      svg.append('text')
        .attr('x', lx + 14).attr('y', legendY)
        .attr('fill', '#888')
        .attr('font-size', '9px')
        .text(cat.label);
    });

  }, []);

  return (
    <div className="chart-inner">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
