import EventEmitter from 'events';
import Atlas from '../Atlas';

export default class Render extends EventEmitter {
  constructor(ctx) {
    super();
    this.ctx = ctx;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.atlas = new Atlas();
    this.ready = false;
    this.name = 'Render';
  }

  async setup() {
    await this.loadImages();
    this.ready = true;
    this.emit('go', this.name);
  }

  async loadImages(images) {
    await this.atlas.loadImage('vase', 'img/vase.png');
    await this.atlas.loadImage('strategy', 'img/tileset.png');
    await this.atlas.loadAtlas('data/vase.json', 'vase');
    await this.atlas.loadAtlas('data/strategy.json', 'strategy');
  }

  /**
   * Draw an image to the canvas context
   * @param {Atlas} atlas - the tilset instance to get the image and tile from
   * @param {string} tileKey  - the name of the tile to draw
   * @param {number} x - the x coordinate (in screen space) to draw the tile
   * @param {number} y - the y coordinate (in screen space) to draw the tile
   */
  drawImage(atlas, tileKey, x, y) {
    const tile = atlas.getTile(tileKey);
    if (tile === undefined) {
      throw new Error(`Tile not found for key: ${tileKey}`);
    }
    // Nine arguments: the element, source (x,y) coordinates, source width and
    // height (for cropping), destination (x,y) coordinates, and destination width
    // and height (resize).
    this.ctx.drawImage( tile.tileset,
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

  update(entities) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const key in entities) {
      const ent = entities[key];
      if (ent['image'] && ent['position'] && ent['size']) {
        this.drawImage(this.atlas, ent.image.key, ent.position.x - ent.size.width/2, ent.position.y - ent.size.height/2);
      }
    }
  }

  test(obj) {

  }

}
