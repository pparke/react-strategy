import React from 'react';
import Canvas from './Canvas';
import TextOverlay from './TextOverlay';
import { connect } from 'react-redux';
import { List } from 'immutable';

export class Display extends React.PureComponent {
  constructor (props) {
    super(props);

  }

  componentDidMount() {
    //this.props.didMount();
  }

  componentWillUnmount() {
    //this.props.willUnmount();
  }

  renderText(message) {
    return <TextOverlay key={ message.get('id') } message={ message }/>
  }

  render() {
    return (
      <div id="display" className="display container" ref="display">
        <Canvas width={this.props.width} height={this.props.height} onMount={this.props.canvasDidMount} />
        { this.props.messages.map(this.renderText) }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    messages: state.get('messages', List())
  }
}

export const DisplayContainer = connect(mapStateToProps)(Display);
