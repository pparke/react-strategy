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
        const destination = this.rankNeighbours(Object.values(ent.edges))[0];

        destination.population.size += 1;
        destination.emit('populationChange', destination.population.size);

      }
    }
  }

  rankNeighbours(tiles) {
    const mapped = tiles.map((tile, index) => {
      const { population: { size }, terrain: { hostility, fertility, movementDifficulty } } = tile;
      let capacity = (fertility - hostility) * 100;
      capacity = capacity > 0 ? capacity : 0;
      let score = 1;
      score -= (size/capacity);
      score += (fertility - hostility);
      score -= (movementDifficulty * 0.5);

      return { score, index };
    });

    mapped.sort((a, b) => {
      return +(a.score > b.score) || +(a.score === b.score) - 1;
    });

    return mapped.map(el => tiles[el.index]);
  }
}
