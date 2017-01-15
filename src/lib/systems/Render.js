import EventEmitter from 'events';
import Atlas from '../Atlas';
import Entity from '../Entity';

export default class Render extends EventEmitter {
  constructor(ctx, atlas) {
    super();
    this.ctx = ctx;
    this.atlas = atlas;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
    this.ready = false;
    this.name = 'Render';
    this.required = ['image', 'position', 'size'];
    this.entities = [];
  }

  setup() {
    this.ready = true;
    this.emit('go', this.name);
  }

  /**
   * Draw an image to the canvas context
   * @param {Atlas} atlas - the tilset instance to get the image and tile from
   * @param {string} tileKey  - the name of the tile to draw
   * @param {number} x - the x coordinate (in screen space) to draw the tile
   * @param {number} y - the y coordinate (in screen space) to draw the tile
   */
  drawImage(tileKey, x, y) {
    const tile = this.atlas.getTile(tileKey);
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

  update() {
    for (const ent of this.entities) {
      const { image: { key }, position: { x, y }, size: { width, height } } = ent;
      this.drawImage(key, x - width/2, y - height/2);
    }
  }

  test(obj) {

  }

}
