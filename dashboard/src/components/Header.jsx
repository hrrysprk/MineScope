export default function Header({ data }) {
  const stats = {
    gridCells: data.length,
    chemSamples: data.filter((d) => d.pH !== null).length,
    elevRange: `${Math.min(...data.map((d) => d.elevation)).toFixed(0)}–${Math.max(...data.map((d) => d.elevation)).toFixed(0)}m`,
    phRange: (() => {
      const phs = data.filter((d) => d.pH !== null).map((d) => d.pH);
      return phs.length ? `${Math.min(...phs).toFixed(1)}–${Math.max(...phs).toFixed(1)}` : 'N/A';
    })(),
    peakFe: (() => {
      const fes = data.filter((d) => d.fe_mg_l !== null).map((d) => d.fe_mg_l);
      return fes.length ? `${Math.max(...fes).toFixed(0)} mg/L` : 'N/A';
    })(),
    functionalRichness: data[0]?.functional_richness || 0,
  };

  return (
    <header className="header">
      <div className="header-title">
        <h1>MineScope</h1>
        <span className="header-subtitle">Komsomolskaya Gold Mine Tailings • Kuzbass, Russia</span>
      </div>
      <div className="header-stats">
        <StatCard label="Grid Cells" value={stats.gridCells} />
        <StatCard label="Chem Samples" value={stats.chemSamples} />
        <StatCard label="Elevation" value={stats.elevRange} />
        <StatCard label="pH Range" value={stats.phRange} />
        <StatCard label="Peak Fe" value={stats.peakFe} />
        <StatCard label="Functions" value={stats.functionalRichness} />
      </div>
    </header>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
