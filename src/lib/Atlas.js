

export default class Atlas {
  constructor() {
    this.img = {};
    this.tiles = new Map();
    this.tileIndex = [];
  }

  /**
   * Load an image from a url and store it in the img
   * object under name for later use
   * @param {string} name - the unique name for the image
   * @param {string} file - the path to the file
   */
  loadImage(name, file) {
    return new Promise((resolve, reject) => {
      this.img[name] = new Image();
      const img = this.img[name];
      img.onload = () => {
        resolve(name);
      }
      img.onerror = () => reject(name);
      img.src = encodeURI(file);
    });
  }

  /**
   * Load data from a json file.  Adds tile data to the
   * tilemap Map and associates the specified image with
   * the tile.  This way tile data can be loaded from
   * multiple files for one image.
   */
  loadAtlas(file, imgName) {
    return fetch(encodeURI(file))
    .then(response => response.json())
    .then(atlas => {
      Object.keys(atlas).forEach(key => {
        const tile = atlas[key];
        tile.tileset = this.img[imgName] || tile.tileset;
        this.add(key, tile);
      });
    })
    .catch(err => {
      throw new Error(`Couldn't load JSON from ${file}\n${err.message}`);
    });
  }


  /**
   * Add a new tile, key will be the unique name used to access
   * the tile and opts is an object containing the x, y, w, h
   * properties of the tile
   * @param {string} key - the unique name of the tile
   * @param {object} opts - the tile properties {x, y, w, h}
   */
  add(key, opts={}) {
    if ('string' === typeof opts.tileset) {
      opts.tileset = this.img[opts.tileset];
    }
    this.tiles.set(key, Object.assign({}, opts));
    this.tileIndex = Array.from(this.tiles.keys());
  }

  getTile(name) {
    return this.tiles.get(name);
  }

  getIndex(key) {
    return this.tileIndex.indexOf(key);
  }

  getKey(index) {
    return this.tileIndex[index];
  }
}
