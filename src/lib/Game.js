import EventEmitter from 'events';
import Audio from './Audio';
import Render from './systems/Render';
import Physics from './systems/Physics';
import Input from './systems/Input';
import Entity from './Entity';
import Atlas from './Atlas';
import View from './View';
import * as components from './components';

export default class Game extends EventEmitter {
  constructor({ width, height, ctx, tilesetImage } = {}) {
    super();

    this.width = width;
    this.height = height;
    this.ctx = ctx;

    this.time = 0;
    this.fps = 60;
    this.lastUpdate = 0;
    this.paused = true;
    this.hidden = false;

    this.sound = new Audio();
    this.atlas = new Atlas();
    this.view = new View(this.ctx, this.atlas, { width: 16, height: 16 }, { width: 100, height: 100 }, { width, height });

    this.atlas.on('loadAll:done', this.setupSystems.bind(this));
    this.on('systems:done', this.setupEntities.bind(this));
    this.on('entities:done', this.setupEvents.bind(this));
    this.on('events:done', this.setupMap.bind(this));
    this.atlas.loadAll([
      {
        type: 'image',
        name: 'vase',
        file: 'img/vase.png'
      },
      {
        type: 'image',
        name: 'strategy',
        file: 'img/tileset.png'
      },
      {
        type: 'atlas',
        name: 'vase',
        file: 'data/vase.json'
      },
      {
        type: 'atlas',
        name: 'strategy',
        file: 'data/strategy.json'
      }
    ]);

    this.systems = {};
    this.entities = {};

    this.emit('init:complete');
  }

  setupSystems() {
    this.systems = {
      render: new Render(this.ctx, this.atlas),
      physics: new Physics({ bounds: { x: 0, y: 0, width: this.width, height: this.height } }),
      input: new Input(this.ctx)
    };

    for (let key in this.systems) {
      this.systems[key].once('go', this.checkReady.bind(this));
      this.systems[key].setup();
    }
  }

  checkReady(key) {
    console.log(`${key} is go`);
    const systems = Object.values(this.systems);
    if (systems.every(system => system.ready)) {
      console.log('all systems go');
      this.emit('systems:done');
    }
  }

  setupEntities() {
    for (let i = 0; i < 100; i++) {
      this.createVase();
    }

    this.emit('entities:done');
  }

  setupEvents() {
    this.systems.input.on('pause', this.togglePause.bind(this));
    this.systems.input.on('keydown', key => {
      if (key === 'left') this.view.move(-10, 0);
      if (key === 'right') this.view.move(10, 0);
      if (key === 'down') this.view.move(0, 10);
      if (key === 'up') this.view.move(0, -10);
      this.view.updateView(['background', 'foreground']);
    });
    this.on('pause', this.togglePause.bind(this));
    this.on('hidden', () => this.hidden = true);
    this.on('visible', () => this.hidden = false);

    this.emit('events:done');
  }

  setupMap() {
    //const response = await fetch('/data/strategy_mapping.json');
    //const tileIds = await response.json();
    const tileIds = this.atlas.getMapping();
    this.view.createLayer('background', 0, tileIds, 'strategy');
    this.view.tilemap.editLayer('background', () => Math.floor(Math.random() * 4 + 1));
    this.view.updateLayer('background');
    this.view.createLayer('foreground', 1, tileIds, 'strategy');
    this.view.tilemap.editLayer('foreground', () => Math.floor(Math.random()*8 + 1));
    this.view.updateLayer('foreground');
    this.view.updateView(['background', 'foreground']);
  }

  addEntity() {
    const entity = new Entity();
    this.entities[entity.id] = entity;
    return entity;
  }

  createVase() {
    const ent = this.addEntity();
    Entity.addComponent(ent, 'position');
    Entity.addComponent(ent, 'image');
    Entity.addComponent(ent, 'size');
    Entity.addComponent(ent, 'body');
    Entity.addComponent(ent, 'velocity');
    Entity.addComponent(ent, 'controller');

    ent.position.x = this.width * Math.random();
    ent.position.y = this.height * Math.random();
    ent.velocity.x = Math.random() * (2 - 1);
    ent.velocity.y = Math.random() * (2 - 1);
    ent.size.width = 16;
    ent.size.height = 16;
    ent.image.key = 'vase';
    ent.on('outOfBounds', function(bounds) {
      if (this.position.x < bounds.x || this.position.x > bounds.x + bounds.width) this.velocity.x *= -1;
      if (this.position.y < bounds.y || this.position.y > bounds.y + bounds.height) this.velocity.y *= -1;
    })
  }


  /**
   * Pause the game, this stops the tick method from scheduling
   * itself to be called again by requestAnimationFrame. Calling
   * while paused will toggle the paused property and call tick
   * @event Game#paused
   * @event Game#unpaused
   */
  togglePause() {
    console.log('toggling pause')
    this.paused = !this.paused;
    if (this.paused) {
      this.emit('paused');
    }
    else {
      this.emit('unpaused');
    }
    this.tick();
  }


  /**
   * The main update function, most game logic or system calls will go here
   */
  update() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.view.render();
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

    // frame timing
    const now = new Date().getTime();
    const dt = now - this.time;
    const rate = 1000/this.fps;

    // fps calculation
    const ut = now - this.lastUpdate
    const currentFPS = Math.floor(1000/ut);

    if (true /*dt > rate*/) {
      this.time = now - (this.time % rate);
      this.update();
    }
    // update the FPS counter
    if (ut > 500) {
      this.lastUpdate = now;
      this.emit('FPS', Math.floor(dt));
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }
}
