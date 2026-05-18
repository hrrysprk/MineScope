export default function CellDetail({ cell }) {
  if (!cell) {
    return (
      <div className="cell-detail">
        <h3>Cell Detail</h3>
        <p className="cell-hint">Hover over terrain to inspect</p>
      </div>
    );
  }

  const fields = [
    { label: 'Position', value: `(${cell.x}, ${cell.y})` },
    { label: 'Elevation (m)', value: cell.elevation?.toFixed(1) ?? '—' },
    { label: 'Slope (°)', value: cell.slope?.toFixed(1) ?? '—' },
    { label: 'pH', value: cell.pH?.toFixed(2) ?? '—' },
    { label: 'Iron (mg/L)', value: cell.fe_mg_l?.toFixed(0) ?? '—' },
    { label: 'Arsenic (mg/L)', value: cell.as_mg_l?.toFixed(0) ?? '—' },
    { label: 'Copper (mg/L)', value: cell.cu_mg_l?.toFixed(1) ?? '—' },
    { label: 'Zinc (mg/L)', value: cell.zn_mg_l?.toFixed(0) ?? '—' },
    { label: 'Sulfate (mg/L)', value: cell.sulfate_mg_l?.toFixed(0) ?? '—' },
    { label: 'Moisture (%)', value: cell.moisture_pct?.toFixed(1) ?? '—' },
    { label: 'Functions', value: cell.functional_richness ?? '—' },
  ];

  return (
    <div className="cell-detail">
      <h3>Cell Detail</h3>
      <div className="cell-fields">
        {fields.map((f) => (
          <div key={f.label} className="cell-field">
            <span className="field-label">{f.label}</span>
            <span className="field-value">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
