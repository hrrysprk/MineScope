import * as d3 from 'd3';

// Data ranges from gold layer
const RANGES = {
  elevation: [67.59, 100.47],
  slope: [1.22, 58.21],
  pH: [1.25, 4.75],
  fe_mg_l: [351.8, 6164.1],
  as_mg_l: [0, 848.9],
  cu_mg_l: [0.88, 28.64],
  zn_mg_l: [26.8, 211.0],
  sulfate_mg_l: [335.1, 4737.8],
  moisture_pct: [8.8, 53.5],
  functional_richness: [0, 221],
};

// Color interpolators per layer
const INTERPOLATORS = {
  elevation: (t) => {
    // Custom earth tones with vivid blue in drainage zones
    if (t < 0.25) {
      // Water/drainage zone: rich blue-teal
      const ratio = t / 0.25;
      const r = 15 + ratio * 20;
      const g = 50 + ratio * 40;
      const b = 90 + ratio * (-10);
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
    }
    // Earth tones: green → olive → brown → tan → cream
    const stops = [
      [0.25, [40, 95, 60]],
      [0.4, [70, 110, 55]],
      [0.55, [130, 115, 60]],
      [0.7, [170, 145, 80]],
      [0.85, [205, 185, 145]],
      [1.0, [240, 235, 225]],
    ];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i][0] && t <= stops[i + 1][0]) {
        const ratio = (t - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
        const r = stops[i][1][0] + ratio * (stops[i + 1][1][0] - stops[i][1][0]);
        const g = stops[i][1][1] + ratio * (stops[i + 1][1][1] - stops[i][1][1]);
        const b = stops[i][1][2] + ratio * (stops[i + 1][1][2] - stops[i][1][2]);
        return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      }
    }
    return 'rgb(240,235,225)';
  },
  slope: d3.interpolateInferno,
  pH: (t) => d3.interpolateRdYlGn(1 - t), // reversed: red = low pH (acid)
  fe_mg_l: d3.interpolatePlasma,
  as_mg_l: d3.interpolateMagma,
  cu_mg_l: d3.interpolateOranges,
  zn_mg_l: d3.interpolatePurples,
  sulfate_mg_l: d3.interpolateYlOrRd,
  moisture_pct: d3.interpolateBlues,
  functional_richness: d3.interpolateCool,
};

// Returns [r, g, b, a] array for deck.gl
export function getColor(value, layer) {
  if (value === null || value === undefined) return [30, 30, 40, 80];

  const [min, max] = RANGES[layer];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const color = d3.color(INTERPOLATORS[layer](t));
  return [color.r, color.g, color.b, 230];
}

// Returns CSS color string for legends
export function getColorCSS(value, layer) {
  if (value === null || value === undefined) return 'rgba(30,30,40,0.3)';

  const [min, max] = RANGES[layer];
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return INTERPOLATORS[layer](t);
}

// Generate legend stops
export function getLegendStops(layer, steps = 5) {
  const [min, max] = RANGES[layer];
  const stops = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const value = min + t * (max - min);
    stops.push({ value, color: INTERPOLATORS[layer](t) });
  }
  return stops;
}

export { RANGES, INTERPOLATORS };
