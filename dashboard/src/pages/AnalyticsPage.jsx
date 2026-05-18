import { useState } from 'react';
import RadarChart from '../components/RadarChart';
import HeatmapGrid from '../components/HeatmapGrid';
import PathwayBar from '../components/PathwayBar';
import PHRichnessScatter from '../components/PHRichnessScatter';

export default function AnalyticsPage({ data }) {
  const [selectedSites, setSelectedSites] = useState([]);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <span className="subtitle">Spatial chemistry, terrain correlations, and functional profiling • Shift+click to compare sites</span>
      </div>
      <div className="analytics-grid">
        <div className="chart-card">
          <RadarChart data={data} selectedSites={selectedSites} />
        </div>
        <div className="chart-card">
          <PathwayBar />
        </div>
        <div className="chart-card">
          <HeatmapGrid data={data} selectedSites={selectedSites} onSiteSelect={setSelectedSites} />
        </div>
        <div className="chart-card">
          <PHRichnessScatter data={data} />
        </div>
      </div>
    </div>
  );
}
