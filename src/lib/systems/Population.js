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
      // update birthrate
      ent.population.birthRate = this.calcBirthrate(ent);
      const { population: { deathRate, birthRate, emigrationRate }} = ent;
      const birthDeath = this.birthDeathChange(ent);
      const leave = this.emigrationChange(ent);
      const change = birthDeath + leave;
      ent.population.size += change;
      if (ent.population.size < 0) {
        ent.population.size = 0;
      }
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

  calcBirthrate(tile) {
    const { population: { size }, terrain: { capacity, fertility, hostility } } = tile;
    return fertility * (1 - (size / capacity / 2)) * (1 - hostility);
  }

  birthDeathChange(tile) {
    const { population: { size, deathRate, birthRate, emigrationRate }, terrain: { capacity } } = tile;
    let change = 0;

    if (Math.random() < birthRate * (1 - size / capacity / 2)) {
      change += 1;
    }
    if (Math.random() < deathRate * (1 + birthRate * size / capacity / deathRate / 2)) {
      change -= 1;
    }

    return change;
  }

  emigrationChange(tile) {
    const { population: { size, emigrationRate }, terrain: { capacity, hostility } } = tile;
    let change = 0;

    // TODO: come up with a better parameter than hostility
    if (Math.random() < emigrationRate * (1 + hostility * size / capacity / emigrationRate / 2)) {
      change -= 1;
    }

    return change;
  }

  habitabilityScore(tile) {
    const { population: { size }, terrain: { hostility, fertility, movementDifficulty, capacity } } = tile;
    let score = 1;
    score -= (size/capacity);
    score += (fertility - hostility);
    score -= (movementDifficulty * 0.5);
    return score;
  }

  rankNeighbours(tiles) {
    const mapped = tiles.map((tile, index) => {
      const score = this.habitabilityScore(tile);
      return { score, index };
    });

    mapped.sort((a, b) => {
      return +(a.score > b.score) || +(a.score === b.score) - 1;
    });

    return mapped.map(el => tiles[el.index]);
  }
}
