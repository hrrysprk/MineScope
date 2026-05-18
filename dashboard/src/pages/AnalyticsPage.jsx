import { useState } from 'react';
import RadarChart from '../components/RadarChart';
import ElevationPHScatter from '../components/ElevationPHScatter';
import HeatmapGrid from '../components/HeatmapGrid';
import RichnessBar from '../components/RichnessBar';

export default function AnalyticsPage({ data }) {
  const [selectedSites, setSelectedSites] = useState([]);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <span className="subtitle">Spatial chemistry and terrain correlations • Shift+click to compare sites</span>
      </div>
      <div className="analytics-grid">
        <div className="chart-card">
          <RadarChart data={data} selectedSites={selectedSites} />
        </div>
        <div className="chart-card">
          <ElevationPHScatter data={data} />
        </div>
        <div className="chart-card">
          <HeatmapGrid data={data} selectedSites={selectedSites} onSiteSelect={setSelectedSites} />
        </div>
        <div className="chart-card">
          <RichnessBar data={data} />
        </div>
      </div>
    </div>
  );
}
