// PipelineDiagram.jsx
// MineScope — nf-core metro-map style pipeline diagram

const COLORS = {
  bg: '#161617',
  bgAlt: '#181819',
  bgAlt2: '#191918',
  divider: '#2d2d2d',
  sectionLabel: '#4a4a4a',
  text: '#cccccc',
  textMuted: '#888',
  textDim: '#555',
  blue: '#6a9fff',
  green: '#82dc82',
  orange: '#ffb432',
  gold: '#ffd700',
  pink: '#dc8282',
  activeGreen: '#82dc82',
  docker: '#0db7ed',
  polars: '#cd8d2f',
  parquet: '#50fa7b',
  pydantic: '#e06c75',
};

const STATS = {
  reads: 'FASTQ',
  readsSize: '',
  contigs: '',
  orfs: '',
  blastHits: '',
  proteins: '',
  lidarCells: '50×50m grid',
  chemSamples: 'GPS-tagged',
  goldCells: 'Spatial join · Parquet',
};

export default function PipelinePage() {
  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <h1>Pipeline</h1>
        <span className="subtitle">End-to-end data flow: sequencing → spatial intelligence</span>
      </div>
      <div className="pipeline-flow">
        <svg
          viewBox="0 0 1480 650"
          xmlns="http://www.w3.org/2000/svg"
          fontFamily="'Inter','Segoe UI',Arial,sans-serif"
          style={{ width: '100%', height: '100%' }}
          role="img"
          aria-label="MineScope integrated pipeline diagram"
        >
          {/* ===== BACKGROUND ===== */}
          <rect width="1480" height="650" fill={COLORS.bg} />
          <rect x="0" y="0" width="190" height="560" fill={COLORS.bgAlt} />
          <rect x="695" y="0" width="375" height="560" fill={COLORS.bgAlt2} />

          {/* ===== SECTION DIVIDERS ===== */}
          <line x1="190" y1="15" x2="190" y2="520" stroke={COLORS.divider} strokeWidth="1" strokeDasharray="5,4" />
          <line x1="695" y1="15" x2="695" y2="520" stroke={COLORS.divider} strokeWidth="1" strokeDasharray="5,4" />
          <line x1="1070" y1="15" x2="1070" y2="520" stroke={COLORS.divider} strokeWidth="1" strokeDasharray="5,4" />

          {/* ===== SECTION LABELS ===== */}
          <text x="95" y="500" textAnchor="middle" fill={COLORS.sectionLabel} fontSize="10" fontWeight="600" letterSpacing="1">DATA ACQUISITION</text>
          <text x="440" y="500" textAnchor="middle" fill={COLORS.sectionLabel} fontSize="10" fontWeight="600" letterSpacing="1">BIOINFORMATICS</text>
          <text x="882" y="500" textAnchor="middle" fill={COLORS.sectionLabel} fontSize="10" fontWeight="600" letterSpacing="1">MEDALLION LAYERS</text>
          <text x="1275" y="500" textAnchor="middle" fill={COLORS.sectionLabel} fontSize="10" fontWeight="600" letterSpacing="1">VISUALIZATION</text>

          {/* ===== DATABASE BRANCH ===== */}
          <line x1="560" y1="152" x2="560" y2="68" stroke={COLORS.blue} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.55" />
          <line x1="452" y1="68" x2="668" y2="68" stroke={COLORS.blue} strokeWidth="1.5" opacity="0.4" />
          {[464, 528, 596, 662].map(x => (
            <line key={x} x1={x} y1="68" x2={x} y2="50" stroke={COLORS.blue} strokeWidth="1.5" opacity={x === 528 ? 0.55 : 0.45} />
          ))}

          {/* MetaCyc (inactive) */}
          <circle cx="464" cy="42" r="8" fill="#1a1a2e" stroke={COLORS.blue} strokeWidth="1.5" opacity="0.45" />
          <text x="464" y="30" textAnchor="middle" fill={COLORS.blue} fontSize="9" opacity="0.45">MetaCyc</text>
          <text x="464" y="19" textAnchor="middle" fill="#666" fontSize="8" opacity="0.5" fontStyle="italic">pending lic.</text>

          {/* SwissProt (active) */}
          <circle cx="528" cy="42" r="9" fill="#1a2035" stroke={COLORS.blue} strokeWidth="2" />
          <text x="528" y="30" textAnchor="middle" fill={COLORS.blue} fontSize="9" fontWeight="700">SwissProt</text>
          <text x="528" y="19" textAnchor="middle" fill={COLORS.activeGreen} fontSize="8">● active</text>

          <circle cx="596" cy="42" r="8" fill="#1a1a2e" stroke={COLORS.blue} strokeWidth="1.5" opacity="0.6" />
          <text x="596" y="30" textAnchor="middle" fill={COLORS.blue} fontSize="9" opacity="0.6">SILVA rRNA</text>

          <circle cx="662" cy="42" r="8" fill="#1a1a2e" stroke={COLORS.blue} strokeWidth="1.5" opacity="0.6" />
          <text x="662" y="30" textAnchor="middle" fill={COLORS.blue} fontSize="9" opacity="0.6">NCBI Tax</text>

          {/* ===== BLUE LINE — METAGENOMICS ===== */}
          <line x1="75" y1="152" x2="190" y2="152" stroke={COLORS.blue} strokeWidth="5" strokeLinecap="round" />
          <path d="M 190,152 C 210,82 238,82 265,82 L 388,82 C 415,82 450,82 450,152" fill="none" stroke={COLORS.blue} strokeWidth="5" strokeLinecap="round" />
          <path d="M 190,152 L 450,152" fill="none" stroke={COLORS.blue} strokeWidth="3" strokeDasharray="8,5" opacity="0.5" />
          <line x1="450" y1="152" x2="742" y2="152" stroke={COLORS.blue} strokeWidth="5" strokeLinecap="round" />
          <line x1="742" y1="152" x2="898" y2="152" stroke={COLORS.blue} strokeWidth="5" strokeLinecap="round" />
          <path d="M 898,152 L 965,152 C 1040,152 1040,215 1040,302" fill="none" stroke={COLORS.blue} strokeWidth="5" strokeLinecap="round" />

          {/* ===== GREEN LINE — LIDAR ===== */}
          <line x1="75" y1="302" x2="210" y2="302" stroke={COLORS.green} strokeWidth="5" strokeLinecap="round" />
          <line x1="210" y1="302" x2="742" y2="302" stroke={COLORS.green} strokeWidth="5" strokeLinecap="round" />
          <line x1="742" y1="302" x2="898" y2="302" stroke={COLORS.green} strokeWidth="5" strokeLinecap="round" />
          <line x1="898" y1="302" x2="1040" y2="302" stroke={COLORS.green} strokeWidth="5" strokeLinecap="round" />

          {/* ===== ORANGE LINE — SOIL CHEMISTRY ===== */}
          <line x1="75" y1="418" x2="210" y2="418" stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" />
          <line x1="210" y1="418" x2="742" y2="418" stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" />
          <line x1="742" y1="418" x2="898" y2="418" stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" />
          <path d="M 898,418 L 962,418 C 1040,418 1040,362 1040,302" fill="none" stroke={COLORS.orange} strokeWidth="5" strokeLinecap="round" />

          {/* ===== GOLD + OUTPUT LINE ===== */}
          <line x1="1040" y1="302" x2="1180" y2="302" stroke={COLORS.gold} strokeWidth="5" strokeLinecap="round" />
          <line x1="1180" y1="302" x2="1355" y2="302" stroke={COLORS.pink} strokeWidth="5" strokeLinecap="round" />
          <line x1="1390" y1="302" x2="1418" y2="302" stroke={COLORS.pink} strokeWidth="5" strokeLinecap="round" />
          <line x1="1418" y1="292" x2="1418" y2="312" stroke={COLORS.pink} strokeWidth="4" />

          {/* ===== STATION NODES ===== */}
          {/* Nextflow pipeline box */}
          <rect x="45" y="8" width="650" height="195" rx="10" fill="none" stroke={COLORS.green} strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4" />
          <text x="65" y="198" fill={COLORS.green} fontSize="9" opacity="0.6" fontWeight="600">Nextflow 26 + Wave Containers</text>

          <circle cx="75" cy="152" r="16" fill="#2e2e2e" stroke={COLORS.blue} strokeWidth="2.5" />
          <text x="75" y="156" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="700">FASTQ</text>
          <circle cx="190" cy="152" r="5" fill={COLORS.blue} />
          <circle cx="328" cy="82" r="15" fill="#161a2e" stroke={COLORS.blue} strokeWidth="2.5" />
          <circle cx="450" cy="152" r="13" fill="#1a1e30" stroke={COLORS.blue} strokeWidth="2.5" />
          <circle cx="560" cy="152" r="18" fill="#0e1428" stroke={COLORS.blue} strokeWidth="3" />
          <circle cx="742" cy="152" r="13" fill="#161a2e" stroke={COLORS.blue} strokeWidth="2.5" />
          <circle cx="898" cy="152" r="13" fill="#161a2e" stroke={COLORS.blue} strokeWidth="2.5" />

          {/* LiDAR input */}
          <circle cx="75" cy="302" r="16" fill="#2e2e2e" stroke={COLORS.green} strokeWidth="2.5" />
          <text x="75" y="306" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="700">LiDAR</text>
          <circle cx="210" cy="302" r="12" fill="#161e16" stroke={COLORS.green} strokeWidth="2.5" />
          <circle cx="742" cy="302" r="13" fill="#161e16" stroke={COLORS.green} strokeWidth="2.5" />
          <circle cx="898" cy="302" r="13" fill="#161e16" stroke={COLORS.green} strokeWidth="2.5" />

          {/* Chemistry input */}
          <circle cx="75" cy="418" r="16" fill="#2e2e2e" stroke={COLORS.orange} strokeWidth="2.5" />
          <text x="75" y="422" textAnchor="middle" fill="#aaa" fontSize="9" fontWeight="700">CSV</text>
          <circle cx="210" cy="418" r="12" fill="#1e1a10" stroke={COLORS.orange} strokeWidth="2.5" />
          <circle cx="742" cy="418" r="13" fill="#1e1a10" stroke={COLORS.orange} strokeWidth="2.5" />
          <circle cx="898" cy="418" r="13" fill="#1e1a10" stroke={COLORS.orange} strokeWidth="2.5" />

          {/* Gold merge */}
          <circle cx="1040" cy="302" r="24" fill="#191400" stroke={COLORS.gold} strokeWidth="3.5" />
          <text x="1040" y="296" textAnchor="middle" fill={COLORS.gold} fontSize="9" fontWeight="700">SPATIAL</text>
          <text x="1040" y="310" textAnchor="middle" fill={COLORS.gold} fontSize="9">MERGE</text>

          {/* JSON */}
          <circle cx="1180" cy="302" r="12" fill="#191400" stroke={COLORS.gold} strokeWidth="2.5" />

          {/* Dashboard end */}
          <rect x="1355" y="288" width="35" height="28" rx="4" fill="#1e1018" stroke={COLORS.pink} strokeWidth="2.5" />
          <text x="1372" y="306" textAnchor="middle" fill={COLORS.pink} fontSize="8.5" fontWeight="700">DASH</text>

          {/* ===== TEXT LABELS ===== */}
          <text x="75" y="178" textAnchor="middle" fill={COLORS.blue} fontSize="10">{STATS.reads}</text>
          <text x="75" y="191" textAnchor="middle" fill={COLORS.textDim} fontSize="9">{STATS.readsSize}</text>
          <text x="240" y="72" textAnchor="middle" fill={COLORS.blue} fontSize="9" fontWeight="600">FASTQ path</text>
          <text x="328" y="56" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">MEGAHIT</text>
          <text x="328" y="43" textAnchor="middle" fill={COLORS.blue} fontSize="10">Assembly</text>
          <text x="328" y="108" textAnchor="middle" fill={COLORS.textDim} fontSize="9">{STATS.contigs}</text>
          <text x="312" y="146" textAnchor="middle" fill={COLORS.blue} fontSize="9" opacity="0.6" fontStyle="italic">— FASTA bypass (skip assembly) —</text>
          <text x="450" y="175" textAnchor="middle" fill={COLORS.text} fontSize="10" fontWeight="600">FASTA</text>
          <text x="450" y="188" textAnchor="middle" fill={COLORS.textMuted} fontSize="9">contigs</text>
          <text x="560" y="120" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">MetaPathways</text>
          <text x="560" y="107" textAnchor="middle" fill={COLORS.textMuted} fontSize="10">v3.5</text>
          <text x="560" y="182" textAnchor="middle" fill={COLORS.blue} fontSize="10">{STATS.orfs}</text>
          <text x="560" y="195" textAnchor="middle" fill={COLORS.textDim} fontSize="9">BLAST · SwissProt</text>
          <text x="742" y="134" textAnchor="middle" fill={COLORS.blue} fontSize="10">Metagenomics</text>
          <text x="742" y="178" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Bronze</text>
          <text x="742" y="191" textAnchor="middle" fill={COLORS.textDim} fontSize="9">{STATS.blastHits}</text>
          <text x="898" y="134" textAnchor="middle" fill={COLORS.blue} fontSize="10">Metagenomics</text>
          <text x="898" y="178" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Silver</text>
          <text x="898" y="191" textAnchor="middle" fill={COLORS.textDim} fontSize="9">CLR normalized</text>
          <text x="898" y="203" textAnchor="middle" fill={COLORS.textDim} fontSize="9">{STATS.proteins}</text>
          <text x="75" y="276" textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="700">Drone LiDAR</text>
          <text x="75" y="330" textAnchor="middle" fill={COLORS.green} fontSize="10">{STATS.lidarCells}</text>
          <text x="75" y="343" textAnchor="middle" fill={COLORS.textDim} fontSize="9">50×50m grid</text>
          <text x="210" y="276" textAnchor="middle" fill={COLORS.textMuted} fontSize="9">Validation</text>
          <text x="210" y="328" textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="700">Pydantic</text>
          <text x="742" y="276" textAnchor="middle" fill={COLORS.green} fontSize="10">LiDAR</text>
          <text x="742" y="328" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Bronze</text>
          <text x="742" y="341" textAnchor="middle" fill={COLORS.textDim} fontSize="9">CSV → Parquet</text>
          <text x="898" y="276" textAnchor="middle" fill={COLORS.green} fontSize="10">LiDAR</text>
          <text x="898" y="328" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Silver</text>
          <text x="898" y="341" textAnchor="middle" fill={COLORS.textDim} fontSize="9">validated · Parquet</text>
          <text x="75" y="392" textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="700">Soil Chemistry</text>
          <text x="75" y="446" textAnchor="middle" fill={COLORS.orange} fontSize="10">{STATS.chemSamples}</text>
          <text x="75" y="459" textAnchor="middle" fill={COLORS.textDim} fontSize="9">GPS-tagged · CSV</text>
          <text x="210" y="392" textAnchor="middle" fill={COLORS.textMuted} fontSize="9">Validation</text>
          <text x="210" y="444" textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="700">Pydantic</text>
          <text x="210" y="457" textAnchor="middle" fill={COLORS.textDim} fontSize="9">schema check</text>
          <text x="742" y="392" textAnchor="middle" fill={COLORS.orange} fontSize="10">Chemistry</text>
          <text x="742" y="444" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Bronze</text>
          <text x="742" y="457" textAnchor="middle" fill={COLORS.textDim} fontSize="9">CSV → Parquet</text>
          <text x="898" y="392" textAnchor="middle" fill={COLORS.orange} fontSize="10">Chemistry</text>
          <text x="898" y="444" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">Silver</text>
          <text x="898" y="457" textAnchor="middle" fill={COLORS.textDim} fontSize="9">normalized · Parquet</text>
          <text x="1015" y="268" textAnchor="end" fill={COLORS.gold} fontSize="12" fontWeight="700">Gold Layer</text>
          <text x="1015" y="282" textAnchor="end" fill={COLORS.textMuted} fontSize="9">{STATS.goldCells}</text>

          {/* Downstream analysis branch — parallel to JSON/Dashboard line */}
          <path d="M 1040,326 C 1040,360 1040,370 1080,390 L 1180,390" fill="none" stroke={COLORS.gold} strokeWidth="5" strokeLinecap="round" />
          <line x1="1180" y1="390" x2="1355" y2="390" stroke="#a855f7" strokeWidth="5" strokeLinecap="round" />
          <circle cx="1180" cy="390" r="12" fill="#191400" stroke={COLORS.gold} strokeWidth="2.5" />
          <text x="1180" y="414" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">CSV</text>
          <text x="1180" y="427" textAnchor="middle" fill={COLORS.textMuted} fontSize="9">Parquet</text>
          <rect x="1335" y="378" width="75" height="24" rx="5" fill="#1a1028" stroke="#a855f7" strokeWidth="2.5" />
          <text x="1372" y="394" textAnchor="middle" fill="#a855f7" fontSize="8.5" fontWeight="700">Downstream</text>
          <text x="1180" y="280" textAnchor="middle" fill={COLORS.textMuted} fontSize="10">Export</text>
          <text x="1180" y="326" textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="700">JSON</text>
          <text x="1180" y="339" textAnchor="middle" fill={COLORS.textDim} fontSize="9">static · ~500KB</text>
          <text x="1372" y="266" textAnchor="middle" fill={COLORS.pink} fontSize="9">Interactive</text>
          <text x="1372" y="328" textAnchor="middle" fill={COLORS.text} fontSize="11" fontWeight="700">Dashboard</text>
          <text x="1372" y="341" textAnchor="middle" fill={COLORS.pink} fontSize="9">React · JavaScript</text>

          {/* ===== TOOL BADGES ===== */}
          {/* Below Bioinformatics section label */}
          <rect x="390" y="510" width="62" height="17" rx="4" fill="#0d1a0d" stroke={COLORS.green} strokeWidth="1" />
          <text x="421" y="522" textAnchor="middle" fill={COLORS.green} fontSize="9" fontWeight="600">Nextflow</text>
          <rect x="460" y="510" width="50" height="17" rx="4" fill="#0d1020" stroke={COLORS.blue} strokeWidth="1" />
          <text x="485" y="522" textAnchor="middle" fill={COLORS.blue} fontSize="9" fontWeight="600">Wave</text>
          <rect x="518" y="510" width="50" height="17" rx="4" fill="#001525" stroke={COLORS.docker} strokeWidth="1" />
          <text x="543" y="522" textAnchor="middle" fill={COLORS.docker} fontSize="9" fontWeight="600">Docker</text>

          {/* Below Medallion Layers section label */}
          <rect x="832" y="510" width="46" height="17" rx="4" fill="#1a1500" stroke={COLORS.polars} strokeWidth="1" />
          <text x="855" y="522" textAnchor="middle" fill={COLORS.polars} fontSize="9" fontWeight="600">Polars</text>
          <rect x="886" y="510" width="52" height="17" rx="4" fill="#001a08" stroke={COLORS.parquet} strokeWidth="1" />
          <text x="912" y="522" textAnchor="middle" fill={COLORS.parquet} fontSize="9" fontWeight="600">Parquet</text>
          <rect x="946" y="510" width="54" height="17" rx="4" fill="#1a0808" stroke={COLORS.pydantic} strokeWidth="1" />
          <text x="973" y="522" textAnchor="middle" fill={COLORS.pydantic} fontSize="9" fontWeight="600">Pydantic</text>

          {/* Below Visualization section label */}
          <rect x="1225" y="510" width="46" height="17" rx="4" fill="#1a0d1a" stroke={COLORS.pink} strokeWidth="1" />
          <text x="1248" y="522" textAnchor="middle" fill={COLORS.pink} fontSize="9" fontWeight="600">React</text>
          <rect x="1279" y="510" width="56" height="17" rx="4" fill="#0d1a1a" stroke="#50fa7b" strokeWidth="1" />
          <text x="1307" y="522" textAnchor="middle" fill="#50fa7b" fontSize="9" fontWeight="600">Three.js</text>
          <rect x="1343" y="510" width="32" height="17" rx="4" fill="#1a1a0d" stroke="#ffb432" strokeWidth="1" />
          <text x="1359" y="522" textAnchor="middle" fill="#ffb432" fontSize="9" fontWeight="600">D3</text>

          {/* ===== LEGEND ===== */}
          <rect x="15" y="590" width="1000" height="42" rx="5" fill="#1c1c1c" stroke={COLORS.divider} strokeWidth="1" />
          <text x="26" y="615" fill="#4a4a4a" fontSize="8.5" fontWeight="700" letterSpacing="0.5">LEGEND</text>
          {[
            { x: 70, color: COLORS.blue, label: 'Metagenomics', lx: 106 },
            { x: 195, color: COLORS.green, label: 'LiDAR', lx: 231 },
            { x: 275, color: COLORS.orange, label: 'Soil chemistry', lx: 311 },
            { x: 405, color: COLORS.gold, label: 'Gold layer', lx: 441 },
            { x: 510, color: COLORS.pink, label: 'Visualization', lx: 546 },
          ].map(({ x, color, label, lx }) => (
            <g key={label}>
              <line x1={x} y1="615" x2={x + 25} y2="615" stroke={color} strokeWidth="3" strokeLinecap="round" />
              <text x={lx} y="619" fill="#999" fontSize="9">{label}</text>
            </g>
          ))}
          <line x1="640" y1="615" x2="670" y2="615" stroke={COLORS.blue} strokeWidth="2.5" strokeDasharray="5,4" strokeLinecap="round" opacity="0.6" />
          <text x="676" y="619" fill="#999" fontSize="9">FASTA bypass</text>
          <circle cx="770" cy="615" r="5" fill="#2e2e2e" stroke="#777" strokeWidth="1.5" />
          <text x="780" y="619" fill={COLORS.textDim} fontSize="8.5">File input</text>
          <circle cx="840" cy="615" r="5" fill={COLORS.bg} stroke={COLORS.blue} strokeWidth="2" />
          <text x="850" y="619" fill={COLORS.textDim} fontSize="8.5">Process node</text>
          <circle cx="930" cy="615" r="6" fill="#191400" stroke={COLORS.gold} strokeWidth="2" />
          <text x="940" y="619" fill={COLORS.textDim} fontSize="8.5">Gold merge</text>
        </svg>
      </div>
    </div>
  );
}
