import EventEmitter from 'events';
import mousetrap from '../mousetrap';

export default class Input extends EventEmitter {
  constructor(ctx) {
    super();
    this.name = 'Input';
    this.ready = false;
    this.ctx = ctx;

    // keys
    this.keys = {};
  }

  setup(ctx) {
    mousetrap.bind('left', () => { this.keyDown('left'); this.keyUp('right'); }, 'keydown');
    mousetrap.bind('left', () => { this.keyUp('left') }, 'keyup');
    mousetrap.bind('right', () => { this.keyDown('right'); this.keyUp('left'); }, 'keydown');
    mousetrap.bind('right', () => { this.keyUp('right') }, 'keyup');
    mousetrap.bind('up', () => { this.keyDown('up'); this.keyUp('down'); }, 'keydown');
    mousetrap.bind('up', () => { this.keyUp('up') }, 'keyup');
    mousetrap.bind('down', () => { this.keyDown('down'); this.keyUp('up'); }, 'keydown');
    mousetrap.bind('down', () => { this.keyUp('down') }, 'keyup');
    //mousetrap.bind('p', this.togglePause.bind(this) );
    const canvas = this.ctx.canvas;
    canvas.addEventListener('touchstart', this.onTouchStart.bind(this), false);
    canvas.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    canvas.addEventListener('touchend', this.onTouchEnd.bind(this), false);

    this.ready = true;
    this.emit('go', this.name);
  }

  keyDown(k) {
    this.keys[k] = true;
  }

  keyUp(k) {
    this.keys[k] = false;
  }

  update() {

  }

  onTouchStart(e) {
    e.preventDefault();
    this.touch = e.changedTouches[0];
    // handle double tap
    if (!this.tapped) {
      this.tapped = setTimeout(() => this.tapped = null, 300);
    }
    else {
      clearTimeout(this.tapped);
      this.tapped = null;
      // double tap detected
      this.onDoubleTap(e);
    }
  }

  onTouchMove(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
  }

  onTouchEnd(e) {
    e.preventDefault();
  }

  onDoubleTap(e) {

  }
}
