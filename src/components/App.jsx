import React from 'react';

/**
 * This component does nothing except render its child components
 */
export default class App extends React.PureComponent {
  render() {
    return <div>{this.props.children}</div>;
  }
}
