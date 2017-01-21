import EventEmitter from 'events';
import Entity from './Entity';
import Render from './systems/Render';
import Physics from './systems/Physics';
import Input from './systems/Input';
import Population from './systems/Population';
import * as components from './components';

export default class World extends EventEmitter {
  constructor(ctx, atlas, view, tilemap) {
    super();
    this.ctx = ctx;
    this.atlas = atlas;
    this.view = view;
    this.tilemap = tilemap;
    this.systems = {};
    this.entities = {};
  }

  setup() {
    this.setupSystems();
    this.setupEntities();
    this.setupEvents();
  }

  update() {
    for (const sys of Object.values(this.systems)) {
      sys.update();
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
      input: new Input(this.ctx),
      population: new Population()
    };

    for (let key in this.systems) {
      this.systems[key].once('go', this.checkReady.bind(this));
      this.systems[key].setup();
    }
  }

  setupEntities() {
    /*
    for (let i = 0; i < 10; i++) {
      this.createVase();
    }
    */

    this.setupMap();

    // add the entities to the systems that will act on them
    for (const ent of Object.values(this.entities)) {
      for (const sys of Object.values(this.systems)) {
        if (Entity.hasComponents(ent, sys.required)) {
          sys.entities.push(ent);
        }
      }
    }

    this.emit('entities:done');
  }

  setupMap() {
    this.view.createLayer('background', 0);
    this.tilemap.createLayer('background', this.addEntity.bind(this));
    this.tilemap.editLayer('background', (tile, i) => {
      const { x, y } = this.tilemap.offsetToCoord(i);
      if (y % 2 === 0) {
        if (x % 2 === 0) {
          tile.image.key = 'light_grass';
        }
        else {
          tile.image.key = 'dark_grass';
        }
      }
      else {
        if (x % 2 === 0) {
          tile.image.key = 'dark_grass';
        }
        else {
          tile.image.key = 'light_grass';
        }
      }
    });
    this.view.updateLayer('background');

    this.view.createLayer('foreground', 1);
    this.tilemap.createLayer('foreground', this.addEntity.bind(this));
    this.tilemap.editLayer('foreground', (tile, i, all) => {
      Entity.addComponent(tile, 'terrain');
      Entity.addComponent(tile, 'population');

      tile.terrain.fertility = Math.random();
      tile.terrain.hostility = Math.random();
      tile.terrain.movementDifficulty = Math.random();
      switch (Math.floor(tile.terrain.movementDifficulty * 10)) {
        case 0:
          tile.image.key = 'empty';
          break;
        case 1:
          tile.image.key = 'trees_1';
          break;
        case 2:
          tile.image.key = 'trees_2';
          break;
        case 3:
          tile.image.key = 'trees_3';
          break;
        case 4:
          tile.image.key = 'hill_1';
          break;
        case 5:
          tile.image.key = 'hill_2';
          break;
        case 6:
          tile.image.key = 'lake_1';
          break;
        case 7:
          tile.image.key = 'mountain_1';
          break;
        case 8:
          tile.image.key = 'mountain_2';
          break;
        case 9:
          tile.image.key = 'mountain_3';
          break;
      }


      tile.terrain.capacity = Math.floor(Math.random() * 500);
      tile.population.size = Math.random() > 0.90 ? Math.floor(Math.random() * tile.terrain.capacity) : 0;
      tile.population.deathRate = Math.random();
      tile.population.birthRate = Math.random();
      tile.population.emigrationRate = tile.terrain.hostility * tile.terrain.movementDifficulty * 0.1;
      // TODO: add event for tile change
      Entity.addEvent(tile, 'populationChange', 'updateTileOccupation');
    });
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
    this.systems.input.on('zoomin', () => this.view.zoom(1));
    this.systems.input.on('zoomout', () => this.view.zoom(-1));

    this.systems.population.on('mapUpdate', () => {
      this.view.dirty = true;
    });

    this.systems.population.on('tileUpdate', this.view.updateTile.bind(this.view));

    this.ctx.canvas.addEventListener('click', this.view.handleClick.bind(this.view));

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
    Entity.addComponent(ent, 'edges');

    ent.position.x = x;
    ent.position.y = y;
    ent.terrain.fertility = Math.random();
    ent.terrain.hostility = Math.random();
    ent.terrain.movementDifficulty = Math.random();
    ent.population.size = Math.random() > 0.90 ? Math.floor(Math.random()*300) : 0;
    ent.population.deathRate = (ent.terrain.hostility - ent.terrain.fertility) * 0.1;
    ent.population.birthRate = (ent.terrain.fertility - ent.terrain.hostility) * 0.1;
    ent.population.emigrationRate = ent.terrain.hostility * ent.terrain.movementDifficulty * 0.1;
    // TODO: add event for tile change
    Entity.addEvent(ent, 'populationChange', 'updateTileOccupation');
    return ent;
  }
}
