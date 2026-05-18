import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TerrainPage from './pages/TerrainPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataPage from './pages/DataPage';
import PipelinePage from './pages/PipelinePage';
import './App.css';

export default function App() {
  const [data, setData] = useState([]);
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['terrain', 'analytics', 'data', 'pipeline'].includes(hash) ? hash : 'terrain';
  });

  const handlePageChange = (page) => {
    setActivePage(page);
    window.location.hash = page;
  };
  const [activeLayer, setActiveLayer] = useState('elevation');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/gold_layer.json')
      .then((res) => res.json())
      .then((records) => {
        setData(records);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading MineScope...</h2>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <div className="page-content">
        {activePage === 'terrain' && (
          <TerrainPage
            data={data}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
          />
        )}
        {activePage === 'analytics' && (
          <AnalyticsPage data={data} />
        )}
        {activePage === 'data' && (
          <DataPage data={data} />
        )}
        {activePage === 'pipeline' && (
          <PipelinePage />
        )}
      </div>
    </div>
  );
}
