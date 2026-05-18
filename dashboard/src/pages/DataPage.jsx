import { useState } from 'react';

const COLUMNS = [
  { key: 'x', label: 'X Position' },
  { key: 'y', label: 'Y Position' },
  { key: 'elevation', label: 'Elevation (m)', format: (v) => v?.toFixed(1) },
  { key: 'slope', label: 'Slope (°)', format: (v) => v?.toFixed(1) },
  { key: 'pH', label: 'pH', format: (v) => v?.toFixed(2) ?? '—' },
  { key: 'fe_mg_l', label: 'Iron (mg/L)', format: (v) => v?.toFixed(0) ?? '—' },
  { key: 'as_mg_l', label: 'Arsenic (mg/L)', format: (v) => v?.toFixed(0) ?? '—' },
  { key: 'cu_mg_l', label: 'Copper (mg/L)', format: (v) => v?.toFixed(1) ?? '—' },
  { key: 'zn_mg_l', label: 'Zinc (mg/L)', format: (v) => v?.toFixed(0) ?? '—' },
  { key: 'sulfate_mg_l', label: 'Sulfate (mg/L)', format: (v) => v?.toFixed(0) ?? '—' },
  { key: 'moisture_pct', label: 'Moisture (%)', format: (v) => v != null ? `${v.toFixed(1)}` : '—' },
  { key: 'functional_richness', label: 'Functional Richness', format: (v) => v ?? '—' },
];

export default function DataPage({ data }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const chemData = data.filter((d) => d.pH !== null);
  const displayData = search
    ? chemData.filter((d) =>
        Object.values(d).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
      )
    : chemData;

  // Sort
  const sorted = sortKey
    ? [...displayData].sort((a, b) => {
        const av = a[sortKey] ?? -Infinity;
        const bv = b[sortKey] ?? -Infinity;
        return sortDir === 'asc' ? av - bv : bv - av;
      })
    : displayData;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleDownloadCSV = () => {
    const headers = COLUMNS.map((c) => c.label).join(',');
    const rows = data.map((row) => COLUMNS.map((c) => row[c.key] ?? '').join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minescope_gold_layer.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'minescope_gold_layer.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-page">
      <div className="data-header">
        <div>
          <h1>Data Explorer</h1>
          <span className="subtitle">Gold layer — {data.length} cells, {chemData.length} with chemistry</span>
        </div>
        <div className="data-actions">
          <button className="download-btn" onClick={handleDownloadCSV}>⬇ CSV</button>
          <button className="download-btn" onClick={handleDownloadJSON}>⬇ JSON</button>
        </div>
      </div>
      <div className="data-search">
        <input
          type="text"
          placeholder="Search data..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
                  {col.label}
                  {sortKey === col.key && (
                    <span className="sort-arrow">{sortDir === 'asc' ? ' ▲' : ' ▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 150).map((row, i) => (
              <tr key={i}>
                {COLUMNS.map((col) => (
                  <td key={col.key}>
                    {col.format ? col.format(row[col.key]) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
