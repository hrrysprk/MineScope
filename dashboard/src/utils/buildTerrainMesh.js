/**
 * Builds a triangulated mesh from the 50x50 grid elevation data.
 * Returns positions, indices, normals, and per-vertex colors for deck.gl.
 */
export function buildTerrainMesh(data, gridSize = 50) {
  // Create a 2D lookup: grid[y][x] = data point
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  for (const point of data) {
    const x = Math.round(point.x);
    const y = Math.round(point.y);
    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      grid[y][x] = point;
    }
  }

  // Build vertex positions (x, y, z)
  const positions = new Float32Array(gridSize * gridSize * 3);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = (y * gridSize + x) * 3;
      const point = grid[y][x];
      const elev = point ? point.elevation - 65 : 0;
      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = elev;
    }
  }

  // Build triangle indices (two triangles per grid cell)
  const numQuads = (gridSize - 1) * (gridSize - 1);
  const indices = new Uint32Array(numQuads * 6);
  let triIdx = 0;
  for (let y = 0; y < gridSize - 1; y++) {
    for (let x = 0; x < gridSize - 1; x++) {
      const topLeft = y * gridSize + x;
      const topRight = topLeft + 1;
      const bottomLeft = (y + 1) * gridSize + x;
      const bottomRight = bottomLeft + 1;

      // Triangle 1
      indices[triIdx++] = topLeft;
      indices[triIdx++] = bottomLeft;
      indices[triIdx++] = topRight;

      // Triangle 2
      indices[triIdx++] = topRight;
      indices[triIdx++] = bottomLeft;
      indices[triIdx++] = bottomRight;
    }
  }

  // Compute normals
  const normals = new Float32Array(gridSize * gridSize * 3);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = (y * gridSize + x) * 3;
      // Simple normal approximation using neighbors
      const left = x > 0 ? positions[((y * gridSize + (x - 1)) * 3) + 2] : positions[idx + 2];
      const right = x < gridSize - 1 ? positions[((y * gridSize + (x + 1)) * 3) + 2] : positions[idx + 2];
      const up = y > 0 ? positions[(((y - 1) * gridSize + x) * 3) + 2] : positions[idx + 2];
      const down = y < gridSize - 1 ? positions[(((y + 1) * gridSize + x) * 3) + 2] : positions[idx + 2];

      const nx = left - right;
      const ny = up - down;
      const nz = 2.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      normals[idx] = nx / len;
      normals[idx + 1] = ny / len;
      normals[idx + 2] = nz / len;
    }
  }

  return { positions, indices, normals, grid };
}
