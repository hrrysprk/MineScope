"""This script generates synthetic soil chemistry data correlated with terrain drainage."""
import numpy as np
import pandas as pd
from pathlib import Path

np.random.seed(42)

n_samples = 150  # More samples for better coverage
x = np.random.uniform(0, 50, n_samples)
y = np.random.uniform(0, 50, n_samples)

# Proximity to primary drainage channel (diagonal NW to SE)
channel1_dist = np.abs((x - 25) - (y - 25) * 0.3)
channel1_proximity = np.exp(-(channel1_dist ** 2) / 30)

# Proximity to secondary drainage
channel2_center = (x - 35) + (y - 20) * 0.5
channel2_proximity = np.exp(-(channel2_center ** 2) / 20) * (y > 15).astype(float)

# Combined drainage proximity (max of both channels)
drainage_proximity = np.maximum(channel1_proximity, channel2_proximity * 0.7)

# pH: lower near drainage (AMD zones), higher on ridges
pH = 4.2 - (2.8 * drainage_proximity) + np.random.normal(0, 0.25, n_samples)
pH = np.clip(pH, 1.0, 5.0)

# Iron (mg/L): high near drainage, low on ridges
fe = 800 + (5500 * drainage_proximity) + np.random.normal(0, 250, n_samples)

# Copper (mg/L)
cu = 3 + (25 * drainage_proximity) + np.random.normal(0, 2, n_samples)

# Arsenic (mg/L)
arsenic = 80 + (750 * drainage_proximity) + np.random.normal(0, 60, n_samples)

# Zinc (mg/L)
zn = 40 + (180 * drainage_proximity) + np.random.normal(0, 12, n_samples)

# Moisture (%): wetter near drainage
moisture = 12 + (40 * drainage_proximity) + np.random.normal(0, 3, n_samples)

# Sulfate (mg/L): AMD indicator, high near drainage
sulfate = 400 + (4500 * drainage_proximity) + np.random.normal(0, 150, n_samples)

df = pd.DataFrame({
    "x": x,
    "y": y,
    "pH": np.round(pH, 2),
    "fe_mg_l": np.round(fe, 1),
    "cu_mg_l": np.round(cu, 2),
    "as_mg_l": np.round(arsenic, 1),
    "zn_mg_l": np.round(zn, 1),
    "moisture_pct": np.round(moisture, 1),
    "sulfate_mg_l": np.round(sulfate, 1),
})

output_path = Path(__file__).parent.parent.parent / "data" / "bronze" / "chemistry" / "soil_chemistry.csv"
output_path.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(output_path, index=False)

print(f"Generated {len(df)} chemistry samples → {output_path}")
