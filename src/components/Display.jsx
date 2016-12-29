import React from 'react';
import Canvas from './Canvas';
import { connect } from 'react-redux';

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

  render() {
    return (
      <div id="display" className="display container" ref="display">
        <Canvas width={this.props.width} height={this.props.height} onMount={this.props.canvasDidMount} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
  }
}

export const DisplayContainer = connect(mapStateToProps)(Display);
