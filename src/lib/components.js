
export const position = {
  x: 0,
  y: 0
};

export const velocity = {
  x: 0,
  y: 0
};

export const size = {
  width: 0,
  height: 0
};

export const image = {
  tileset: {},
  layer: '',
  key: ''
};

export const body = {
  fixed: true,
  mass: 1,
  acceleration: 1,
  deltaMax: 1
}

export const controller = {

}

export const population = {
  type: 'human',
  size: 0,
  deathRate: 0.01,
  birthRate: 0.02,
  emigrationRate: 0.01
}

export const terrain = {
  type: '',
  tileIndex: 1,
  movementDifficulty: 0.2,
  fertility: 1,
  hostility: 1,
  capacity: 1
}

export const edges = {
  north: null,
  south: null,
  east: null,
  west: null
}
