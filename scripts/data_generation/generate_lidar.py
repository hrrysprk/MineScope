"""This script generates synthetic data for drone LiDAR."""

import numpy as np
import pandas as pd
from pathlib import Path
from scipy.ndimage import gaussian_filter

# creating a x*x grid // represents one meter sq boxes
grid_size = 50
x = np.arange(0, grid_size)
y = np.arange(0, grid_size)
xx, yy = np.meshgrid(x, y)

np.random.seed(42)

# Base terrain: slope from NW corner (high) to SE corner (low)
base_elevation = 105 - (yy * 0.4) - (xx * 0.25)

# Primary drainage channel: runs diagonally NW to SE
channel1_dist = np.abs((xx - 25) - (yy - 25) * 0.3)
channel1_depth = 6 * np.exp(-(channel1_dist**2) / 30)

# Secondary drainage: branches off the main channel
channel2_center = (xx - 35) + (yy - 20) * 0.5
channel2_depth = 3 * np.exp(-(channel2_center**2) / 20) * (yy > 15).astype(float)

# Ridge line running along the NE side
ridge_dist = np.abs(xx - 40 + yy * 0.2)
ridge_height = 4 * np.exp(-(ridge_dist**2) / 25)

# Tailings mound (waste pile near center-south)
mound_dist = np.sqrt((xx - 30) ** 2 + (yy - 38) ** 2)
mound_height = 5 * np.exp(-(mound_dist**2) / 40)

# Pit/depression (excavation area)
pit_dist = np.sqrt((xx - 12) ** 2 + (yy - 12) ** 2)
pit_depth = 3 * np.exp(-(pit_dist**2) / 20)

# Multi-scale noise for natural roughness
noise_large = 1.5 * np.random.normal(0, 1, (grid_size, grid_size))
# Smooth the large noise for rolling hills
noise_large = gaussian_filter(noise_large, sigma=3)
noise_fine = np.random.normal(0, 0.2, (grid_size, grid_size))

# Combine all features
elevation = (
    base_elevation
    - channel1_depth
    - channel2_depth
    + ridge_height
    + mound_height
    - pit_depth
    + noise_large
    + noise_fine
)

# Compute gradients (rate of elevation change in x and y directions)
dy, dx = np.gradient(elevation)

# Slope: steepness in degrees
slope = np.degrees(np.arctan(np.sqrt(dx**2 + dy**2)))

# Aspect: direction the slope faces (0=North, 90=East, 180=South, 270=West)
aspect = np.degrees(np.arctan2(-dx, dy)) % 360


# Flow direction: encoded as D8 (1=E, 2=SE, 4=S, 8=SW, 16=W, 32=NW, 64=N, 128=NE)
def aspect_to_d8(a):
    boundaries = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5]
    codes = [64, 128, 1, 2, 4, 8, 16, 32]
    for i, b in enumerate(boundaries):
        if a < b:
            return codes[i]
    return 64


flow_direction = np.vectorize(aspect_to_d8)(aspect)

# Flatten 2D arrays into columns and build DataFrame
df = pd.DataFrame(
    {
        "x": xx.ravel(),
        "y": yy.ravel(),
        "elevation": elevation.ravel(),
        "slope": slope.ravel(),
        "aspect": aspect.ravel(),
        "flow_direction": flow_direction.ravel(),
    }
)

# Save to bronze layer
output_path = (
    Path(__file__).parent.parent.parent / "data" / "bronze" / "lidar" / "lidar_grid.csv"
)
output_path.parent.mkdir(parents=True, exist_ok=True)
df.to_csv(output_path, index=False)

print(f"Generated {len(df)} LiDAR points -> {output_path}")
