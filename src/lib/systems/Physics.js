import EventEmitter from 'events';
import Entity from '../Entity';

export default class Physics extends EventEmitter {
  constructor({ bounds } = {}) {
    super();
    this.name = 'Physics';
    this.ready = false;
    this.bounds = bounds;
    console.log(this.bounds)
  }

  setup() {
    this.ready = true;
    this.emit('go', this.name);
  }

  update(entities) {
    for (const key in entities) {
      const ent = entities[key];
      if (Entity.hasComponents(ent, ['position', 'size', 'velocity', 'body'])) {
        ent.position.x += ent.velocity.x;
        ent.position.y += ent.velocity.y;

        this.checkBounds(ent);
      }
    }
  }

  checkBounds(ent) {
    if (this.bounds) {
      const { x, y, width, height } = this.bounds;
      const { x: ex, y: ey } = ent.position;
      const { width: ew, height: eh } = ent.size;
      if (ex < x ||
          ex + ew > x + width ||
          ey < y ||
          ey + eh > y + height) {
            ent.emit('outOfBounds', this.bounds);
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
