

export default class Atlas {
  constructor() {
    this.img = null;
    this.tiles = new Map();
    this.tileIndex = [];
  }

  loadImage(file) {
    return new Promise((resolve, reject) => {
      this.img = new Image();
      this.img.onload = () => {
        resolve(file);
      }
      this.img.onerror = () => reject(file);
      this.img.src = file;
    });
  }

  add(key, opts={}) {
    this.tiles.set(key, Object.assign({}, opts));
    this.tileIndex = Array.from(this.tiles.keys());
  }

  getIndex (key) {
    return this.tileIndex.indexOf(key);
  }

  getKey (index) {
    return this.tileIndex[index];
  }
}
