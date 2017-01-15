import EventEmitter from 'events';

export default class Population extends EventEmitter {
  constructor() {
    super();
    this.name = 'Population';
    this.ready = false;
    this.required = ['population', 'terrain'];
    this.entities = [];

    this.updateRate = 500;
    this.lastUpdate = 0;
  }

  setup() {

  }

  update() {
    const now = new Date().getTime();
    if (now - this.lastUpdate < this.updateRate) {
      return;
    }
    this.lastUpdate = now;

    for (const ent of this.entities) {
      if (ent.population.size === 0) {
        continue;
      }
      const { population: { deathRate, birthRate, emigrationRate }} = ent;
      const birth = Math.random() < birthRate ? 1 : 0;
      const death = Math.random() < deathRate ? -1 : 0;
      const leave = Math.random() < emigrationRate ? -1 : 0;
      const change = birth + death + leave;
      ent.population.size += change;
      if (change !== 0) {
        ent.emit('populationChange', ent.population.size);
        this.emit('tileUpdate', ent.image.layer, ent.position.x, ent.position.y);
      }
      if (leave !== 0) {
        const destination = Object.values(ent.edges).sort((a,b) => {
          if (a.terrain.hostility < b.terrain.hostility) {
            return 1;
          }
          if (a.terrain.hostility > b.terrain.hostility) {
            return -1;
          }
          return 0;
        })[0];

        destination.population.size += 1;
        destination.emit('populationChange', destination.population.size);

      }
    }
  }
}
