
/**
 * Tilemap is a container class that allows the creation of multiple
 * layers of flat arrays containing arbitrary objects.  The layers are
 * stored in an object and keyed by name for easy access.
 */
export default class Tilemap {
  constructor(width, height, tileWidth, tileHeight) {
    this.numTilesX = width;
    this.numTilesY = height;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.numTiles = this.numTilesX * this.numTilesY;
    this.layers = {};
  }

  coordToOffset(x, y) {
    return (x + (y * this.numTilesX));
  }

  offsetToCoord(offset) {
    const x = offset % this.numTilesX;
    const y = Math.floor(offset / this.numTilesX);
    return { x, y };
  }

  getAtCoords(layerName, x, y) {
    const offset = this.coordToOffset(x, y);
    return this.layers[layerName][offset];
  }

  createTile(ent, x, y) {
    ent.constructor.addComponent(ent, 'image');
    ent.constructor.addComponent(ent, 'position');
    ent.constructor.addComponent(ent, 'edges');

    ent.position.x = x;
    ent.position.y = y;

    return ent;
  }

  /**
   * Create a new layer and fill it with enities produced by the supplied
   * addEnity function
   * @param {string} name - the key the layer will be stored under
   * @param {Function} addEntity - a function that will produce an entity object
   */
  createLayer(name, addEntity) {
    const layer = new Array(this.numTiles);
    for (let i = 0; i < layer.length; i++) {
      const { x, y } = this.offsetToCoord(i);
      const entity = addEntity();
      layer[i] = this.createTile(entity, x, y);
    }
    // TODO better way?
    layer.forEach((ent, i, all) => {
      ent.image.layer = name;
      const { north, east, south, west } = this.cardinal(i, all);
      ent.edges.north = north;
      ent.edges.east = east;
      ent.edges.west = west;
      ent.edges.south = south;
    });
    this.layers[name] = layer;
    return layer;
  }

  /**
   * Apply the given function to an existing layer
   */
  editLayer(name, fn) {
    const layer = this.layers[name];
    for (let i = 0; i < layer.length; i++) {
      fn(layer[i], i, layer);
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

  cardinal(offset, layer) {
    let n = offset + this.coordToOffset(0, -1);
    let e = offset + this.coordToOffset(1, 0);
    let s = offset + this.coordToOffset(0, 1);
    let w = offset + this.coordToOffset(-1, 0);


    const [north, east, south, west] = [n, e, s, w].map((dir) => {
      if (dir < 0) {
        dir = this.numTiles + dir;
      }
      else if (dir > this.numTiles) {
        dir = dir % this.numTiles;
      }
      return layer[dir];
    });

    return { north, east, south, west };
  }

  direction(currentOff, d, layer) {
    let offset;
    switch(d) {
      case 'n': offset = currentOff + this.coordToOffset(0, -1);
      break;
      case 'e': offset = currentOff + this.coordToOffset(1, 0);
      break;
      case 's': offset = currentOff + this.coordToOffset(0, 1);
      break;
      case 'w': offset = currentOff + this.coordToOffset(-1, 0);
      break;
    }

    if (offset < 0) {
      offset = this.numTiles + offset;
    }
    else if (offset > this.numTiles) {
      offset = offset % this.numTiles;
    }

    return layer[offset];
  }
}
