

export default {
  reverse(x, y) {
    if (x) this.velocity.x *= -1;
    if (y) this.velocity.y *= -1;
  },
  updateTileOccupation(size) {
    if (size > 0) {
      this.image.key = 'house_1';
    }
    if (size > 50) {
      this.image.key = 'house_2';
    }
    if (size > 100) {
      this.image.key = 'house_3';
    }
    if (size > 150) {
      this.image.key = 'house_4';
    }
    if (size > 200) {
      this.image.key = 'house_5';
    }
    if (size > 250) {
      this.image.key = 'house_6';
    }
    if (size > 300) {
      this.image.key = 'house_7';
    }
    if (size > 350) {
      this.image.key = 'house_8';
    }
  }
}
