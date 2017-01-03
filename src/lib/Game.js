import EventEmitter from 'events';
import Audio from './Audio';
import Render from './systems/Render';
import Physics from './systems/Physics';
import Input from './systems/Input';
import Entity from './Entity';


export default class Game extends EventEmitter {
  constructor({ width, height, ctx, tilesetImage } = {}) {
    super();

    this.width = width;
    this.height = height;
    this.ctx = ctx;

    this.time = 0;
    this.fps = 60;
    this.paused = true;
    this.hidden = false;

    this.sound = new Audio();

    this.systems = {
      render: new Render(ctx),
      physics: new Physics({ bounds: { x: 0, y: 0, width, height } }),
      input: new Input(ctx)
    }

    for (let key in this.systems) {
      this.systems[key].once('go', this.checkReady.bind(this));
      this.systems[key].setup();
    }

    this.entities = {};

    // listen for events
    this.on('pause', this.togglePause.bind(this));
    this.on('hidden', () => this.hidden = true);
    this.on('visible', () => this.hidden = false);

    this.emit('init:complete');

    this.setup();
  }

  setup() {
    for (let i = 0; i < 100; i++) {
      this.createVase();
    }
  }

  createVase() {
    const ent = this.addEntity();
    Entity.addComponent(ent, 'position');
    Entity.addComponent(ent, 'image');
    Entity.addComponent(ent, 'size');
    Entity.addComponent(ent, 'body');
    Entity.addComponent(ent, 'velocity');

    ent.position.x = this.width*Math.random();
    ent.position.y = this.height*Math.random();
    ent.velocity.x = Math.random()*2 - 1;
    ent.velocity.y = Math.random()*2 - 1;
    ent.size.width = 16;
    ent.size.height = 16;
    ent.image.key = 'vase';
    ent.on('outOfBounds', function(bounds) {
      if (this.position.x < bounds.x || this.position.x > bounds.x + bounds.width) this.velocity.x *= -1;
      if (this.position.y < bounds.y || this.position.y > bounds.y + bounds.height) this.velocity.y *= -1;
    })
  }

  checkReady(key) {
    console.log(`${key} is go`);
    const systems = Object.values(this.systems);
    if (systems.every(system => system.ready)) {
      console.log('all systems go');
      this.emit('ready');
    }
  }

  /**
   * Pause the game, this stops the tick method from scheduling
   * itself to be called again by requestAnimationFrame. Calling
   * while paused will toggle the paused property and call tick
   * @event Game#paused
   * @event Game#unpaused
   */
  togglePause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.emit('paused');
    }
    else {
      this.emit('unpaused');
    }
    this.tick();
  }

  addEntity() {
    const entity = new Entity();
    this.entities[entity.id] = entity;
    return entity;
  }



  /**
   * The main update function, most game logic or system calls will go here
   */
  update() {
    for (let key in this.systems) {
      this.systems[key].update(this.entities);
    }
  }

  /**
   * Calls the update function at a constant rate.
   */
  tick() {
    if (this.paused || this.hidden) {
      return;
    }

    const now = new Date().getTime();
    const dt = now - this.time;
    const rate = 1000/this.fps;
    this.currentFPS = Math.floor(1000/dt);

    if (dt > rate) {
      this.time = now - (this.time % rate);
      this.update();
      this.ctx.font = '22px consola';
      this.ctx.fillStyle = '#aaaaff';
      this.ctx.fillText(this.currentFPS, 10, 30);
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }
}
