import EventEmitter from 'events';
import Entity from './Entity';
import Render from './systems/Render';
import Physics from './systems/Physics';
import Input from './systems/Input';
import * as components from './components';

export default class World extends EventEmitter {
  constructor(ctx, atlas, view) {
    super();
    this.ctx = ctx;
    this.atlas = atlas;
    this.view = view;
    this.systems = {};
    this.entities = {};
  }

  setup() {
    this.setupSystems();
    this.setupEntities();
    this.setupEvents();
    this.setupMap();
  }

  update() {
    for (let key in this.systems) {
      this.systems[key].update(this.entities);
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

  setupSystems() {
    this.systems = {
      render: new Render(this.ctx, this.atlas),
      physics: new Physics({ bounds: { x: 0, y: 0, width: this.view.width, height: this.view.height } }),
      input: new Input(this.ctx)
    };

    for (let key in this.systems) {
      this.systems[key].once('go', this.checkReady.bind(this));
      this.systems[key].setup();
    }
  }

  setupEntities() {
    for (let i = 0; i < 10; i++) {
      this.createVase();
    }
/*
    for (let i = 0; i < this.view.tilemap.numTiles; i++) {
      this.createTile(this.view.tilemap.offsetToCoord(i));
    }
*/
    this.emit('entities:done');
  }

  setupMap() {
    const tileIds = this.atlas.getMapping();
    this.view.createLayer('background', 0, tileIds, 'strategy');
    this.view.tilemap.editLayer('background', () => Math.floor(Math.random() * 4 + 1));
    this.view.updateLayer('background');
    this.view.createLayer('foreground', 1, tileIds, 'strategy');
    this.view.tilemap.editLayer('foreground', () => Math.floor(Math.random()*8 + 1));
    this.view.updateLayer('foreground');
    this.view.updateView(['background', 'foreground']);
  }

  setupEvents() {
    this.systems.input.on('pause', () => this.emit('pause'));
    this.systems.input.on('keydown', key => {
      if (key === 'left') this.view.move(-10, 0);
      if (key === 'right') this.view.move(10, 0);
      if (key === 'down') this.view.move(0, 10);
      if (key === 'up') this.view.move(0, -10);
      this.view.updateView(['background', 'foreground']);
    });

    this.emit('events:done');
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

    ent.position.x = this.view.width * Math.random();
    ent.position.y = this.view.height * Math.random();
    ent.velocity.x = Math.random() * (2 - 1);
    ent.velocity.y = Math.random() * (2 - 1);
    ent.size.width = 16;
    ent.size.height = 16;
    ent.image.key = 'vase';
    Entity.addEvent(ent, 'outOfBounds', 'reverse');
  }

  createTile({ x, y }) {
    const ent = this.addEntity();
    Entity.addComponent(ent, 'position');
    Entity.addComponent(ent, 'terrain');
    Entity.addComponent(ent, 'population');

    ent.position.x = x;
    ent.position.y = y;
    ent.terrain.fertility = Math.random();
    ent.terrain.hostility = Math.random();
    ent.population.size = Math.random() > 0.98 ? Math.floor(Math.random()*300) : 0;
    ent.population.deathRate = (ent.terrain.hostility - ent.terrain.fertility) * 0.1;
    ent.population.birthRate = (ent.terrain.fertility - ent.terrain.hostility) * 0.1;
    // TODO: add event for tile change
  }
}
