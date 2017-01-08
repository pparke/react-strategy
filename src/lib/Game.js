import EventEmitter from 'events';
import Audio from './Audio';
import Atlas from './Atlas';
import View from './View';
import World from './World';

export default class Game extends EventEmitter {
  constructor({ width, height, ctx, tilesetImage } = {}) {
    super();

    this.width = width;
    this.height = height;
    this.ctx = ctx;

    this.currentSample = 0;
    this.frameSum = 0;
    this.lastFrame = new Date().getTime();
    this.paused = true;
    this.hidden = false;

    this.sound = new Audio();
    this.atlas = new Atlas();
    this.view = new View(this.ctx, this.atlas, { width: 16, height: 16 }, { width: 100, height: 100 }, { width, height });
    this.world = new World(this.ctx, this.atlas, this.view);

    this.world.on('pause', this.togglePause.bind(this));

    // setup the world after all assets have been loaded
    this.atlas.on('loadAll:done', this.world.setup.bind(this.world));

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


    this.emit('init:complete');
  }

  setupEvents() {
    this.on('pause', this.togglePause.bind(this));
    this.on('hidden', () => this.hidden = true);
    this.on('visible', () => this.hidden = false);

    this.emit('events:done');
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
    this.world.update();
  }

  /**
   * Calls the update function at a constant rate.
   */
  tick() {
    if (this.paused || this.hidden) {
      this.currentSample = 0;
      this.frameSum = 0;
      this.lastFrame = 0;
      return;
    }

    // frame timing
    const now = new Date().getTime();
    this.frameSum += now - this.lastFrame;
    this.lastFrame = now;

    this.update();
    // update the FPS counter
    if (++this.currentSample >= 100) {
      const frameAvg = Math.floor(this.frameSum / 100);
      this.currentSample = 0;
      this.frameSum = 0;
      this.emit('FPS', Math.floor(1/((frameAvg)/1000)));
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }
}
