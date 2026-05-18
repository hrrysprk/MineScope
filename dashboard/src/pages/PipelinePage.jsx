export default function PipelinePage() {
  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <h1>Pipeline Architecture</h1>
        <span className="subtitle">End-to-end data flow: sequencing → spatial intelligence</span>
      </div>
      <div className="pipeline-flow">
        <svg viewBox="0 0 1100 520" xmlns="http://www.w3.org/2000/svg" className="pipeline-svg">
          {/* Background sections */}
          <rect x="30" y="20" width="380" height="130" rx="12" fill="none" stroke="#2a2a3e" strokeWidth="1" />
          <rect x="440" y="20" width="280" height="130" rx="12" fill="none" stroke="#2a2a3e" strokeWidth="1" />
          <rect x="750" y="20" width="320" height="130" rx="12" fill="none" stroke="#2a2a3e" strokeWidth="1" />
          <rect x="30" y="180" width="1040" height="130" rx="12" fill="none" stroke="#2a2a3e" strokeWidth="1" />
          <rect x="30" y="340" width="1040" height="150" rx="12" fill="none" stroke="#2a2a3e" strokeWidth="1" />

          {/* Section labels */}
          <text x="45" y="40" fill="#6a9fff" fontSize="11" fontWeight="700">❶ Data Acquisition</text>
          <text x="455" y="40" fill="#82dc82" fontSize="11" fontWeight="700">❷ Assembly & Annotation</text>
          <text x="765" y="40" fill="#ffb432" fontSize="11" fontWeight="700">❸ Medallion Layers</text>
          <text x="45" y="200" fill="#c882dc" fontSize="11" fontWeight="700">❹ Data Integration Pipeline (Python + Polars)</text>
          <text x="45" y="360" fill="#dc8282" fontSize="11" fontWeight="700">❺ Visualization & Delivery</text>

          {/* === LINE 1: Metagenomics (blue) === */}
          <path d="M 80,85 L 180,85 L 280,85 L 380,85 L 500,85 L 620,85 L 780,85 L 900,85 L 1000,85"
            fill="none" stroke="#6a9fff" strokeWidth="4" strokeLinecap="round" />
          
          {/* Stations - Line 1 */}
          <circle cx="80" cy="85" r="8" fill="#161617" stroke="#6a9fff" strokeWidth="3" />
          <circle cx="180" cy="85" r="6" fill="#6a9fff" />
          <circle cx="280" cy="85" r="6" fill="#6a9fff" />
          <circle cx="500" cy="85" r="8" fill="#161617" stroke="#82dc82" strokeWidth="3" />
          <circle cx="620" cy="85" r="8" fill="#161617" stroke="#82dc82" strokeWidth="3" />
          <circle cx="780" cy="85" r="6" fill="#cd7f32" />
          <circle cx="900" cy="85" r="6" fill="#c0c0c0" />
          <circle cx="1000" cy="85" r="8" fill="#161617" stroke="#ffd700" strokeWidth="3" />

          {/* Labels - Line 1 */}
          <text x="80" y="115" fill="#ccc" fontSize="9" textAnchor="middle">FASTQ</text>
          <text x="80" y="126" fill="#666" fontSize="8" textAnchor="middle">SRR6189722</text>
          <text x="180" y="115" fill="#ccc" fontSize="9" textAnchor="middle">QC</text>
          <text x="180" y="126" fill="#666" fontSize="8" textAnchor="middle">438K reads</text>
          <text x="280" y="115" fill="#ccc" fontSize="9" textAnchor="middle">Single-end</text>
          <text x="280" y="126" fill="#666" fontSize="8" textAnchor="middle">454 GS FLX</text>
          <text x="500" y="115" fill="#ccc" fontSize="9" textAnchor="middle">MEGAHIT</text>
          <text x="500" y="126" fill="#666" fontSize="8" textAnchor="middle">224K contigs</text>
          <text x="620" y="115" fill="#ccc" fontSize="9" textAnchor="middle">MetaPathways</text>
          <text x="620" y="126" fill="#666" fontSize="8" textAnchor="middle">v3.5 + SwissProt</text>
          <text x="780" y="115" fill="#ccc" fontSize="9" textAnchor="middle">Bronze</text>
          <text x="780" y="126" fill="#666" fontSize="8" textAnchor="middle">BLAST output</text>
          <text x="900" y="115" fill="#ccc" fontSize="9" textAnchor="middle">Silver</text>
          <text x="900" y="126" fill="#666" fontSize="8" textAnchor="middle">CLR + counts</text>
          <text x="1000" y="115" fill="#ccc" fontSize="9" textAnchor="middle">Gold</text>
          <text x="1000" y="126" fill="#666" fontSize="8" textAnchor="middle">20K proteins</text>

          {/* === LINE 2: LiDAR (green) === */}
          <path d="M 80,240 L 250,240 L 450,240 L 650,240 L 850,240 L 1000,240 C 1020,240 1040,260 1040,280 L 1040,400"
            fill="none" stroke="#82dc82" strokeWidth="4" strokeLinecap="round" />
          
          <circle cx="80" cy="240" r="8" fill="#161617" stroke="#82dc82" strokeWidth="3" />
          <circle cx="250" cy="240" r="6" fill="#82dc82" />
          <circle cx="450" cy="240" r="6" fill="#cd7f32" />
          <circle cx="650" cy="240" r="6" fill="#c0c0c0" />
          <circle cx="850" cy="240" r="8" fill="#161617" stroke="#ffd700" strokeWidth="3" />

          <text x="80" y="265" fill="#ccc" fontSize="9" textAnchor="middle">LiDAR</text>
          <text x="80" y="276" fill="#666" fontSize="8" textAnchor="middle">50×50m grid</text>
          <text x="250" y="265" fill="#ccc" fontSize="9" textAnchor="middle">Pydantic</text>
          <text x="250" y="276" fill="#666" fontSize="8" textAnchor="middle">validation</text>
          <text x="450" y="265" fill="#ccc" fontSize="9" textAnchor="middle">Bronze</text>
          <text x="450" y="276" fill="#666" fontSize="8" textAnchor="middle">CSV → Parquet</text>
          <text x="650" y="265" fill="#ccc" fontSize="9" textAnchor="middle">Silver</text>
          <text x="650" y="276" fill="#666" fontSize="8" textAnchor="middle">validated grid</text>
          <text x="850" y="265" fill="#ccc" fontSize="9" textAnchor="middle">Gold</text>
          <text x="850" y="276" fill="#666" fontSize="8" textAnchor="middle">spatial merge</text>

          {/* === LINE 3: Chemistry (orange) === */}
          <path d="M 80,290 L 250,290 L 450,290 L 650,290 L 850,290"
            fill="none" stroke="#ffb432" strokeWidth="4" strokeLinecap="round" />
          
          <circle cx="80" cy="290" r="8" fill="#161617" stroke="#ffb432" strokeWidth="3" />
          <circle cx="250" cy="290" r="6" fill="#ffb432" />
          <circle cx="450" cy="290" r="6" fill="#cd7f32" />
          <circle cx="650" cy="290" r="6" fill="#c0c0c0" />
          <circle cx="850" cy="290" r="8" fill="#161617" stroke="#ffd700" strokeWidth="3" />

          <text x="80" y="278" fill="#ccc" fontSize="9" textAnchor="middle">Chemistry</text>
          <text x="80" y="315" fill="#666" fontSize="8" textAnchor="middle">150 samples</text>
          <text x="250" y="315" fill="#ccc" fontSize="9" textAnchor="middle">Pydantic</text>
          <text x="450" y="315" fill="#ccc" fontSize="9" textAnchor="middle">Bronze</text>
          <text x="650" y="315" fill="#ccc" fontSize="9" textAnchor="middle">Silver</text>
          <text x="850" y="315" fill="#ccc" fontSize="9" textAnchor="middle">Gold</text>

          {/* Merge indicator at Gold */}
          <path d="M 1000,85 C 1020,85 1040,105 1040,125 L 1040,240 C 1040,250 1035,260 1025,260"
            fill="none" stroke="#6a9fff" strokeWidth="2" strokeDasharray="4,4" />
          <path d="M 850,240 L 850,290" fill="none" stroke="#ffd700" strokeWidth="2" strokeDasharray="4,4" />

          {/* === OUTPUT LINE (red/pink) === */}
          <path d="M 1040,400 L 900,400 L 700,400 L 500,400 L 300,400 L 150,400"
            fill="none" stroke="#dc8282" strokeWidth="4" strokeLinecap="round" />

          <circle cx="1040" cy="400" r="8" fill="#161617" stroke="#ffd700" strokeWidth="3" />
          <circle cx="900" cy="400" r="6" fill="#dc8282" />
          <circle cx="700" cy="400" r="6" fill="#dc8282" />
          <circle cx="500" cy="400" r="6" fill="#dc8282" />
          <circle cx="300" cy="400" r="6" fill="#dc8282" />
          <circle cx="150" cy="400" r="8" fill="#161617" stroke="#dc8282" strokeWidth="3" />

          <text x="1040" y="425" fill="#ccc" fontSize="9" textAnchor="middle">JSON</text>
          <text x="1040" y="436" fill="#666" fontSize="8" textAnchor="middle">export</text>
          <text x="900" y="425" fill="#ccc" fontSize="9" textAnchor="middle">Three.js</text>
          <text x="900" y="436" fill="#666" fontSize="8" textAnchor="middle">3D terrain</text>
          <text x="700" y="425" fill="#ccc" fontSize="9" textAnchor="middle">D3.js</text>
          <text x="700" y="436" fill="#666" fontSize="8" textAnchor="middle">charts</text>
          <text x="500" y="425" fill="#ccc" fontSize="9" textAnchor="middle">React</text>
          <text x="500" y="436" fill="#666" fontSize="8" textAnchor="middle">components</text>
          <text x="300" y="425" fill="#ccc" fontSize="9" textAnchor="middle">Interactive</text>
          <text x="300" y="436" fill="#666" fontSize="8" textAnchor="middle">story mode</text>
          <text x="150" y="425" fill="#ccc" fontSize="9" textAnchor="middle">Dashboard</text>
          <text x="150" y="436" fill="#666" fontSize="8" textAnchor="middle">MineScope</text>

          {/* Legend */}
          <g transform="translate(50, 470)">
            <line x1="0" y1="0" x2="30" y2="0" stroke="#6a9fff" strokeWidth="3" />
            <text x="35" y="4" fill="#aaa" fontSize="9">Metagenomics</text>
            <line x1="130" y1="0" x2="160" y2="0" stroke="#82dc82" strokeWidth="3" />
            <text x="165" y="4" fill="#aaa" fontSize="9">LiDAR</text>
            <line x1="230" y1="0" x2="260" y2="0" stroke="#ffb432" strokeWidth="3" />
            <text x="265" y="4" fill="#aaa" fontSize="9">Soil Chemistry</text>
            <line x1="380" y1="0" x2="410" y2="0" stroke="#dc8282" strokeWidth="3" />
            <text x="415" y="4" fill="#aaa" fontSize="9">Visualization</text>
            <circle cx="500" cy="0" r="5" fill="#161617" stroke="#ffd700" strokeWidth="2" />
            <text x="510" y="4" fill="#aaa" fontSize="9">Key output</text>
            <circle cx="600" cy="0" r="4" fill="#c0c0c0" />
            <text x="610" y="4" fill="#aaa" fontSize="9">Processing step</text>
          </g>

          {/* Tool badges */}
          <rect x="470" y="55" width="60" height="16" rx="8" fill="rgba(130,220,130,0.15)" stroke="rgba(130,220,130,0.3)" strokeWidth="0.5" />
          <text x="500" y="66" fill="#82dc82" fontSize="8" textAnchor="middle">Nextflow</text>
          <rect x="590" y="55" width="60" height="16" rx="8" fill="rgba(130,220,130,0.15)" stroke="rgba(130,220,130,0.3)" strokeWidth="0.5" />
          <text x="620" y="66" fill="#82dc82" fontSize="8" textAnchor="middle">Docker</text>
          <rect x="200" y="218" width="50" height="16" rx="8" fill="rgba(106,159,255,0.15)" stroke="rgba(106,159,255,0.3)" strokeWidth="0.5" />
          <text x="225" y="229" fill="#6a9fff" fontSize="8" textAnchor="middle">Polars</text>
          <rect x="380" y="218" width="50" height="16" rx="8" fill="rgba(106,159,255,0.15)" stroke="rgba(106,159,255,0.3)" strokeWidth="0.5" />
          <text x="405" y="229" fill="#6a9fff" fontSize="8" textAnchor="middle">Parquet</text>
          <rect x="750" y="218" width="80" height="16" rx="8" fill="rgba(255,215,0,0.15)" stroke="rgba(255,215,0,0.3)" strokeWidth="0.5" />
          <text x="790" y="229" fill="#ffd700" fontSize="8" textAnchor="middle">Spatial Merge</text>
        </svg>
      </div>
    </div>
  );
}
