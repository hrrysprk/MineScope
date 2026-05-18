import TerrainViewer from '../components/TerrainViewer';
import LayerControls from '../components/LayerControls';
import ColorLegend from '../components/ColorLegend';
import CellDetail from '../components/CellDetail';

export default function TerrainPage({ data, activeLayer, setActiveLayer, hoveredCell, setHoveredCell }) {
  const stats = {
    gridCells: data.length,
    chemSamples: data.filter((d) => d.pH !== null).length,
    functionalRichness: data[0]?.functional_richness || 0,
    contigs: '224,654',
    orfs: '134,831',
    peakFe: Math.max(...data.filter(d => d.fe_mg_l).map(d => d.fe_mg_l)).toFixed(0),
  };

  return (
    <div className="terrain-page">
      <div className="terrain-header">
        <div className="terrain-title">
          <h1>MineScope</h1>
          <span className="subtitle">Komsomolskaya Gold Mine Tailings • Kuzbass, Russia</span>
        </div>
        <div className="terrain-stats">
          <div className="stat-pill"><strong>{stats.gridCells.toLocaleString()}</strong><span className="stat-label">Grid Cells</span></div>
          <div className="stat-pill"><strong>{stats.contigs}</strong><span className="stat-label">Contigs</span></div>
          <div className="stat-pill"><strong>{stats.orfs}</strong><span className="stat-label">ORFs</span></div>
          <div className="stat-pill"><strong>{stats.functionalRichness.toLocaleString()}</strong><span className="stat-label">Functions</span></div>
        </div>
      </div>
      <div className="terrain-body">
        <div className="terrain-viewer-wrap">
          <TerrainViewer data={data} activeLayer={activeLayer} onHover={setHoveredCell} />
          <ColorLegend activeLayer={activeLayer} />
        </div>
        <div className="terrain-sidebar">
          <LayerControls activeLayer={activeLayer} onLayerChange={setActiveLayer} />
          <CellDetail cell={hoveredCell} />
        </div>
      </div>
    </div>
  );
}
