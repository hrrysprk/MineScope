const TerrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20L8 14L12 18L22 6" />
    <path d="M2 20H22" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="6" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="17" rx="1" />
  </svg>
);

const DataIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6H20M4 12H20M4 18H14" />
    <path d="M18 16L20 18L18 20" />
  </svg>
);

const PipelineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="6" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="19" cy="18" r="2" />
    <path d="M7 6H17M7 6L10 12M14 12L17 6M14 12L17 18" />
  </svg>
);

const ICONS = {
  terrain: TerrainIcon,
  analytics: AnalyticsIcon,
  data: DataIcon,
  pipeline: PipelineIcon,
};

export default function Sidebar({ activePage, onPageChange }) {
  const pages = [
    { id: 'terrain', label: 'Terrain' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'data', label: 'Data' },
    { id: 'pipeline', label: 'Pipeline' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-nav">
        {pages.map((page) => {
          const Icon = ICONS[page.id];
          return (
            <button
              key={page.id}
              className={`sidebar-btn ${activePage === page.id ? 'active' : ''}`}
              onClick={() => onPageChange(page.id)}
              title={page.label}
            >
              <span className="sidebar-icon"><Icon /></span>
              <span className="sidebar-label">{page.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
