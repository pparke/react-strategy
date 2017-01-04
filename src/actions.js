
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
