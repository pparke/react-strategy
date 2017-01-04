import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import { DisplayContainer } from './components/Display';
import Game from './lib/Game';
import { onHidden } from './lib/util';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import reducer from './reducer';
import { setState, setMessage } from './actions';
import { fromJS, List, Map } from 'immutable';

const store = createStore(reducer);
const WIDTH = 500;
const HEIGHT = 400;

/**
 * The initial state to populate the store with
 * @type {object}
 */
const initialState = fromJS({
  messages: []
});

// set the intial state of the store
store.dispatch(setState(initialState));

/**
 * Bound Helpers
 * These functions bind context or store actions
 * so that they can be passed into components
 */
function setupGame(ctx) {
  // setup the game object
  const game = new Game({
    width: WIDTH,
    height: HEIGHT,
    tilesetImage: '/img/vase.png',
    ctx
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

  game.on('FPS', (fps) => {
    store.dispatch(setMessage(
      fromJS({
        id: 'fps',
        text: fps
      })
    ));
  });

  // setup behaviour for when the game window isn't visible
  onHidden(() => game.emit('hidden'), () => game.emit('visible'));
}


// render the app to the root element
ReactDOM.render(
  <Provider store={store}>
    <App>
      <DisplayContainer width={ 500 } height={ 400 } canvasDidMount={ setupGame } />,
    </App>
  </Provider>,
  document.getElementById('app')
);
