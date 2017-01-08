import Tilemap from './Tilemap';

export default class View {
  constructor(ctx, atlas, tile, map, viewport) {
    this.ctx = ctx;
    this.atlas = atlas;
    this.tileWidth = tile.width;
    this.tileHeight = tile.height;
    this.mapWidth = map.width;
    this.mapHeight = map.height;
    this.tilemap = new Tilemap(map.width, map.height);
    this.layers = {};
    this.viewport =  {};
    this.viewport.canvas = document.createElement('canvas');
    this.viewport.canvas.width = viewport.width;
    this.viewport.canvas.height = viewport.height;
    this.viewport.ctx = this.viewport.canvas.getContext('2d');
    this.position = {
      x: this.mapWidth*this.tileWidth/2,
      y: this.mapHeight*this.tileHeight/2
    }

    this._layerProto = {
      name: '',
      zIndex: 0,
      canvas: null,
      ctx: null,
      tileIds: [],
      atlasKey: ''
    }
  }

  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  createLayer(name, zIndex, tileIds, atlasKey) {
    const layer = Object.assign({}, this._layerProto, { name, zIndex, tileIds, atlasKey });
    layer.canvas = document.createElement('canvas');
    layer.canvas.width = this.mapWidth * this.tileWidth;
    layer.canvas.height = this.mapHeight * this.tileHeight;
    layer.ctx = layer.canvas.getContext('2d');
    this.tilemap.createLayer(name);
    this.layers[name] = layer;
  }

  toScreenCoords(offset) {
    let y = Math.floor(offset / this.viewport.width);
    let x = (offset % this.viewport.width);
    return {x, y};
  }

  /**
   * Updates the given layer by rendering tiles based on the tilemap
   * layer that underpins it
   */
  updateLayer(layer) {
    if ('string' === typeof layer) {
      layer = this.layers[layer];
    }

    const height = this.tilemap.numTilesY;
    const width = this.tilemap.numTilesX;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tileIndex = this.tilemap.getAtCoords(layer.name, x, y);
        const tileName = layer.tileIds[tileIndex];
        const tile = this.atlas.getTile(tileName);
        const tileX = x * this.tileWidth;
        const tileY = y * this.tileHeight;
        this.drawImage(layer, tile, tileX, tileY);
      }
    }
  }

  updateView(layers) {
    const { width, height } = this.viewport.canvas;
    const x = this.position.x - Math.floor(width / 2);
    const y = this.position.y - Math.floor(height / 2);

    layers = layers.map(l => this.layers[l]);

    // sort the layers by z-order, lowest first
    const sortedLayers = layers.sort((a, b) => Math.sign(a.zIndex - b.zIndex));
    // get the image data described by x, y, width, height from each layer
    // and draw it to the viewport
    Object.values(sortedLayers).forEach(layer => {
      //const imageData = layer.ctx.getImageData(x, y, width, height);
      //this.viewport.ctx.putImageData(imageData, 0, 0);
      this.viewport.ctx.drawImage(layer.canvas, x, y, width, height, 0, 0, width, height);
    });
  }

  render() {
    this.ctx.drawImage(this.viewport.canvas, 0, 0);
  }

  /**
   * Draw an image to the context of the layer at the x and y position specified
   * @param {object} layer - the layer object containing the ctx to draw to
   * @param {object} tile - the tile containing the tile data
   * @param {number} x - the x coordinate (in screen space) to draw the tile
   * @param {number} y - the y coordinate (in screen space) to draw the tile
   */
  drawImage(layer, tile, x, y) {
    // Nine arguments: the element, source (x,y) coordinates, source width and
    // height (for cropping), destination (x,y) coordinates, and destination width
    // and height (resize).
    layer.ctx.drawImage( tile.tileset,
                        tile.x,
                        tile.y,
                        tile.w,
                        tile.h,
                        x,
                        y,
                        tile.w,
                        tile.h
                      );
  }

  saveLayerAsImage(layer) {
    return new Promise((resolve, reject) => {
      // save canvas as image
      layer.canvas.toBlob((blob) => {
        const image = document.createElement('img');
        const url = URL.createObjectURL(blob);

        image.onload = () => {
          // no longer need to read the blob, revoke it
          url.revokeObjectURL(url);
          // resolve to the image
          resolve(image);
        }

        image.onerror = (err) => {
          reject(err);
        }

        image.src = url;
      });
    });
  }
}
