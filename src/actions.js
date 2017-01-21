
export function setState(state) {
  return {
    type: 'SET_STATE',
    state
  }
}

export function setMessage(message) {
  return {
    type: 'SET_MESSAGE',
    message
  }
}

export function setInspector(inspector) {
  return {
    type: 'SET_INSPECTOR',
    inspector
  }
}
