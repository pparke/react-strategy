

export default class Tilemap {
  constructor(width, height) {
    this.numTilesX = width;
    this.numTilesY = height;
    this.numTiles = this.numTilesX * this.numTilesY;
    this.bufferSize = this.numTiles * 4;
    this.layerBuffers = [];
    this.layers = {};
  }

  coordToOffset(x, y) {
    return (x + (y * this.numTilesX));
  }

  getAtCoords(layerName, x, y) {
    const offset = this.coordToOffset(x, y);
    return this.layers[layerName][offset];
  }

  /**
   * Create a new layer and apply the given function to all of
   * its elements
   * @param {Function} fn - a function to apply to each element
   */
  createLayer(name, fn) {
    const buf = new ArrayBuffer(this.bufferSize);
    this.layerBuffers.push(buf);
    const layer = new Uint32Array(buf);
    if (fn) {
      for (let i = 0; i < layer.length; i++) {
        layer[i] = fn(layer[i], i, layer);
      }
    }
    this.layers[name] = layer;
  }

  /**
   * Apply the given function to an existing layer
   */
  editLayer(name, fn) {
    const layer = this.layers[name];
    for (let i = 0; i < layer.length; i++) {
      layer[i] = fn(layer[i], i, layer);
    }
  }

  neighbours (offset, layer) {
    const neighbs = new Array(9);
    let i = 0;
    for (let y = -1; y < 2; y++) {
      for (let x = -1; x < 2; x++) {
        let newOffset = offset + this.coordToOffset(x, y);

        // TODO: handle edge without wrapping
        if (newOffset < 0) {
          newOffset = this.numTiles + newOffset;
        }
        else if (newOffset > this.numTiles) {
          newOffset = newOffset % this.numTiles;
        }
        neighbs[i++] = layer[newOffset];
      }
    }
    return neighbs;
  }

  cardinal(offset, layer, test) {
    let n = offset + this.coordToOffset(0, -1);
    let e = offset + this.coordToOffset(1, 0);
    let s = offset + this.coordToOffset(0, 1);
    let w = offset + this.coordToOffset(-1, 0);

    let bit = 3;
    let neighbs = 0;
    for (let dir of [n, e, s, w]) {
      if (dir < 0) {
        dir = this.numTiles + dir;
      }
      else if (dir > this.numTiles) {
        dir = dir % this.numTiles;
      }
      const value = layer[dir];
      neighbs = test(value) << bit | neighbs;
      bit -= 1;
    }
    return neighbs;
  }
}
