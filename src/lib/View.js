import Tilemap from './Tilemap';

// TODO: refactor to separate tile and layer logic into the tilemap class
// tilemap class should deal with a flat array of tile objects since we
// don't need to rapidly iterate over them and draw every frame anymore
export default class View {
  constructor(ctx, atlas, tilemap, viewport) {
    this.ctx = ctx;
    this.atlas = atlas;
    this.tileWidth = tilemap.tileWidth;
    this.tileHeight = tilemap.tileHeight;
    this.mapWidth = tilemap.numTilesX;
    this.mapHeight = tilemap.numTilesY;
    this.tilemap = tilemap;
    this.layers = {};

    this.viewport =  {};
    this.viewport.canvas = document.createElement('canvas');
    this.viewport.canvas.width = viewport.width;
    this.viewport.canvas.height = viewport.height;
    this.viewport.ctx = this.viewport.canvas.getContext('2d');
    this.viewport.ctx.imageSmoothingEnabled = false;

    this.width = viewport.width;
    this.height = viewport.height;
    this.position = {
      x: this.mapWidth*this.tileWidth/2,
      y: this.mapHeight*this.tileHeight/2
    }
    this.needsUpdate = false;
    this.scale = 1;

    this._layerProto = {
      name: '',
      zIndex: 0,
      canvas: null,
      ctx: null,
      dirty: false
    }
  }

  move(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  zoom(amt) {
    console.log('zooming', amt)
    this.scale += amt;
    if (this.scale < 1) {
      this.scale = 1;
      return;
    }
    if (amt > 0) {
      this.viewport.ctx.scale(2, 2);
    }
    else {
      this.viewport.ctx.scale(0.5, 0.5);
    }
  }

  handleClick(event) {
    const canvas = event.target;
    const elemLeft = canvas.offsetLeft;
    const elemTop = canvas.offsetTop;
    const { width, height } = this.viewport.canvas;
    const x = event.pageX - elemLeft + this.position.x - width/2;
    const y = event.pageY - elemTop + this.position.y - height/2;
    const tileX = Math.floor(x/16);
    const tileY = Math.floor(y/16);
    this.layers.foreground.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    this.layers.foreground.ctx.fillRect(tileX*16, tileY*16, 16, 16);
    console.log(x, y);
    console.log(Math.floor(x/16), Math.floor(y/16));
  }

  /**
   * TODO: have tilemap layers be created independently
   */
  createLayer(name, zIndex) {
    const layer = Object.assign({}, this._layerProto, { name, zIndex });
    layer.canvas = document.createElement('canvas');
    layer.canvas.width = this.mapWidth * this.tileWidth;
    layer.canvas.height = this.mapHeight * this.tileHeight;
    layer.ctx = layer.canvas.getContext('2d');
    this.layers[name] = layer;
  }

  toScreenCoords(offset) {
    let y = Math.floor(offset / this.viewport.width);
    let x = (offset % this.viewport.width);
    return {x, y};
  }

  updateTile(key, x, y) {
    const viewLayer = this.layers[key];
    const tile = this.tilemap.getAtCoords(key, x, y);
    const tileImage = this.atlas.getTile(tile.image.key);
    this.drawImage(viewLayer, tileImage, tile.position.x, tile.position.y, true);
    this.needsUpdate = true;
  }

  /**
   * Updates the given layer by rendering tiles based on the tilemap
   * layer that underpins it
   */
  updateLayer(key) {
    const viewLayer = this.layers[key];
    const tileLayer = this.tilemap.layers[key];
    for (const tile of tileLayer) {
      const tileImage = this.atlas.getTile(tile.image.key);
      this.drawImage(viewLayer, tileImage, tile.position.x, tile.position.y);
    }
    this.needsUpdate = true;
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
    if (this.needsUpdate) {
      this.needsUpdate = false;
      this.updateView(Object.keys(this.layers));
    }

    this.ctx.drawImage(this.viewport.canvas, 0, 0);
  }

  /**
   * Draw an image to the context of the layer at the x and y position specified
   * @param {object} layer - the layer object containing the ctx to draw to
   * @param {object} tile - the tile containing the tile data
   * @param {number} x - the x coordinate (in screen space) to draw the tile
   * @param {number} y - the y coordinate (in screen space) to draw the tile
   */
  drawImage(layer, tile, x, y, clear = false) {
    const source = {
      x: tile.x,
      y: tile.y,
      w: tile.w,
      h: tile.h
    };
    const dest = {
      x: x * tile.w,
      y: y * tile.h,
      w: tile.w,
      h: tile.h
    }
    if (clear) {
      layer.ctx.clearRect(dest.x, dest.y, tile.w, tile.h);
    }
    // Nine arguments: the element, source (x,y) coordinates, source width and
    // height (for cropping), destination (x,y) coordinates, and destination width
    // and height (resize).
    layer.ctx.drawImage( tile.tileset,
                        source.x,
                        source.y,
                        source.w,
                        source.h,
                        dest.x,
                        dest.y,
                        dest.w,
                        dest.h
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
          URL.revokeObjectURL(url);
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
