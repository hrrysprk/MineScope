import { useState, useEffect, useRef } from 'react';

const LAYERS = [
  { id: 'elevation', label: 'Elevation', unit: 'm' },
  { id: 'slope', label: 'Slope', unit: '°' },
  { id: 'pH', label: 'pH', unit: '' },
  { id: 'fe_mg_l', label: 'Iron (Fe)', unit: 'mg/L' },
  { id: 'as_mg_l', label: 'Arsenic (As)', unit: 'mg/L' },
  { id: 'cu_mg_l', label: 'Copper (Cu)', unit: 'mg/L' },
  { id: 'zn_mg_l', label: 'Zinc (Zn)', unit: 'mg/L' },
  { id: 'sulfate_mg_l', label: 'Sulfate', unit: 'mg/L' },
  { id: 'moisture_pct', label: 'Moisture', unit: '%' },
  { id: 'functional_richness', label: 'Functional Richness', unit: '' },
];

const STORY_STEPS = [
  { layer: 'elevation', caption: 'Physical drainage channel drives water flow downhill' },
  { layer: 'slope', caption: 'Steep slopes shed water into the channel' },
  { layer: 'pH', caption: 'Acidity concentrates along the drainage path' },
  { layer: 'fe_mg_l', caption: 'Iron peaks where pH is lowest — classic AMD signature' },
  { layer: 'sulfate_mg_l', caption: 'Sulfate follows iron — sulphur oxidation drives acid generation' },
  { layer: 'functional_richness', caption: 'Microbial activity peaks in the most chemically extreme zones' },
];

export default function LayerControls({ activeLayer, onLayerChange }) {
  const [storyActive, setStoryActive] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const [caption, setCaption] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (storyActive) {
      setStoryStep(0);
      onLayerChange(STORY_STEPS[0].layer);
      setCaption(STORY_STEPS[0].caption);

      intervalRef.current = setInterval(() => {
        setStoryStep((prev) => {
          const next = prev + 1;
          if (next >= STORY_STEPS.length) {
            setStoryActive(false);
            setCaption('');
            clearInterval(intervalRef.current);
            return prev;
          }
          onLayerChange(STORY_STEPS[next].layer);
          setCaption(STORY_STEPS[next].caption);
          return next;
        });
      }, 3500);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [storyActive, onLayerChange]);

  const handleStoryToggle = () => {
    if (storyActive) {
      setStoryActive(false);
      setCaption('');
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setStoryActive(true);
    }
  };

  return (
    <div className="layer-controls">
      <h3>Data Layers</h3>

      <button
        className={`story-button ${storyActive ? 'active' : ''}`}
        onClick={handleStoryToggle}
      >
        {storyActive ? '⏹ Stop Story' : '▶ Story Mode'}
      </button>

      {caption && <div className="story-caption">{caption}</div>}

      {LAYERS.map((layer) => (
        <label key={layer.id} className={`layer-option ${activeLayer === layer.id ? 'active' : ''}`}>
          <input
            type="radio"
            name="layer"
            value={layer.id}
            checked={activeLayer === layer.id}
            onChange={() => {
              setStoryActive(false);
              setCaption('');
              onLayerChange(layer.id);
            }}
          />
          <span className="layer-name">{layer.label}</span>
          {layer.unit && <span className="layer-unit">{layer.unit}</span>}
        </label>
      ))}
    </div>
  );
}

export { LAYERS };
