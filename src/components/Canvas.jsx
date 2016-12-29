import React from 'react';

/**
 * Renders a canvas element and calls an onMount handler
 */
export default class CanvasComponent extends React.Component {
  /**
   * Setup is complete, get the canvas context and call
   * the onMount handler
   */
  componentDidMount() {
    const ctx = this.refs.canvas.getContext('2d');
    if ('function' === typeof this.props.onMount) {
      this.props.onMount(ctx);
    }
  }

  /**
   * Teardown about to be performed, call willUnmount
   * so any external cleanup can be done
   */
  componentWillUnmount() {
    if ('function' === typeof this.props.willUnmount) {
      this.props.willUnmount();
    }
  }

  render() {
    return (
      <canvas ref="canvas" width={this.props.width} height={this.props.height}/>
    );
  }
}
