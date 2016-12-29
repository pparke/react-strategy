import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { DisplayContainer } from './components/Display';
import Game from './lib/Game';
import { onHidden } from './lib/util';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducer';
import { setState } from './actions';
import { fromJS, List, Map } from 'immutable';

const store = createStore(reducer);

/**
 * The initial state to populate the store with
 * @type {object}
 */
const initialState = fromJS({

});

// set the intial state of the store
store.dispatch(setState(initialState));

const WIDTH = 500;
const HEIGHT = 400;

// setup the game object
const game = new Game({
  width: WIDTH,
  height: HEIGHT,
  tilesetImage: '/img/vase.png'
});

/**
 * Game Events
 * setup event listeners so the UI can react to the game state
 * by dispatching actions to the store
 */
game.on('paused', () => {
});

game.on('unpaused', () => {
});

game.on('ready', () => {
  // game starts paused, toggle to start
  game.emit('pause');
});

/**
 * Bound Helpers
 * These functions bind context or store actions
 * so that they can be passed into components
 */
function setGameCtx(ctx) {
  game.setCtx(ctx);
}

// setup behaviour for when the game window isn't visible
onHidden(() => game.emit('pause'));

// render the app to the root element
ReactDOM.render(
  <Provider store={store}>
    <App>
      <DisplayContainer width={ 500 } height={ 400 } canvasDidMount={ setGameCtx } />,
    </App>
  </Provider>,
  document.getElementById('app')
);
