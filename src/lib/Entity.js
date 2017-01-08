import uuid from 'uuid/v1';
import * as components from './components';
import behaviors from './behaviors';

export default class Entity {
  constructor() {
    this.id = uuid();
    this.events = {};
  }

  static addComponent(entity, name) {
    if (!components[name]) {
      throw new Error('No such component:', name);
    }

    entity[name] = Object.assign({}, components[name]);
    return entity;
  }

  static hasComponents(entity, components) {
    return components.every(c => entity[c]);
  }

  static addEvent(entity, key, behavior) {
    const fn = behaviors[behavior];
    if (!fn) {
      throw new Error('No such behavior:', key);
    }
    entity.on(key, fn);
  }

  on(key, handler) {
    this.events[key] = handler;
  }

  emit(key, ...args) {
    if ('function' === typeof this.events[key]) {
      this.events[key].apply(this, args);
    }
  }
}
