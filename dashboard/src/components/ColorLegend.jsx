import { getLegendStops, RANGES } from '../utils/colorScales';

export default function ColorLegend({ activeLayer }) {
  const stops = getLegendStops(activeLayer, 6);
  const [min, max] = RANGES[activeLayer];

  const LABELS = {
    elevation: 'Elevation (m)',
    slope: 'Slope (°)',
    pH: 'pH',
    fe_mg_l: 'Iron (mg/L)',
    as_mg_l: 'Arsenic (mg/L)',
    cu_mg_l: 'Copper (mg/L)',
    zn_mg_l: 'Zinc (mg/L)',
    sulfate_mg_l: 'Sulfate (mg/L)',
    moisture_pct: 'Moisture (%)',
    functional_richness: 'Functional Richness',
  };

  return (
    <div className="color-legend">
      <div className="legend-title">{LABELS[activeLayer]}</div>
      <div className="legend-bar">
        <div
          className="legend-gradient"
          style={{
            background: `linear-gradient(to right, ${stops.map((s) => s.color).join(', ')})`,
          }}
        />
        <div className="legend-labels">
          <span>{min.toFixed(1)}</span>
          <span>{max.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
