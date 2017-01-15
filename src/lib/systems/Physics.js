import EventEmitter from 'events';
import Entity from '../Entity';

export default class Physics extends EventEmitter {
  constructor({ bounds } = {}) {
    super();
    this.name = 'Physics';
    this.ready = false;
    this.bounds = bounds;
    this.required = ['position', 'size', 'velocity', 'body'];
    this.entities = [];
  }

  setup() {
    this.ready = true;
    this.emit('go', this.name);
  }

  update() {
    for (const ent of this.entities) {
      ent.position.x += ent.velocity.x;
      ent.position.y += ent.velocity.y;

      this.checkBounds(ent);
    }
  }

  checkBounds(ent) {
    if (this.bounds) {
      const { x, y, width, height } = this.bounds;
      const { x: ex, y: ey } = ent.position;
      const { width: ew, height: eh } = ent.size;
      let xOut = false;
      let yOut = false;
      if (ex < x || ex + ew > x + width) {
        xOut = true;
      }
      if (ey < y || ey + eh > y + height) {
        yOut = true;
      }
      if (xOut || yOut) {
        ent.emit('outOfBounds', xOut, yOut);
      }
    }
  }

  collides(source, target) {
    return !(
  		( ( source.y + source.height ) < ( target.y ) ) ||
  		( source.y > ( target.y + target.height ) ) ||
  		( ( source.x + source.width ) < target.x ) ||
  		( source.x > ( target.x + target.width ) )
  	);
  }

  checkCollision(source, target, cb) {
    if (this.collides(source, target)) {
      cb(source, target);
    }
  }

  elasticCollision (a, b) {
    return {
      x1: (a.velocity.x * (a.mass - b.mass) + (2 * b.mass * b.velocity.x)) / (a.mass + b.mass),
      y1: (a.velocity.y * (a.mass - b.mass) + (2 * b.mass * b.velocity.y)) / (a.mass + b.mass),
      x2: (b.velocity.x * (b.mass - a.mass) + (2 * a.mass * a.velocity.x)) / (b.mass + a.mass),
      y2: (b.velocity.y * (b.mass - a.mass) + (2 * a.mass * a.velocity.y)) / (b.mass + a.mass)
    }
  }
}
