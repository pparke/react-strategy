import { List, Map } from 'immutable';

function setState(state, newState) {
  return state.merge(newState);
}

function setMessage(state, message) {
  let messages = state.get('messages');
  let index = messages.findIndex(m => m.get('id') === message.get('id'));
  if (index > -1) {
    const newState = state.updateIn(['messages'], arr => arr.setIn([index], message));
    return newState
  }
  return state.set('messages', messages.push(message));
}

function setInspector(state, inspector) {
  return state.set('inspector', inspector);
}

export default function(state = Map(), action) {
  switch(action.type) {
    case 'SET_STATE':
      return setState(state, action.state);
    case 'SET_MESSAGE':
      return setMessage(state, action.message);
    case 'SET_INSPECTOR':
      return setInspector(state, action.inspector);
  }
  return state;
}
