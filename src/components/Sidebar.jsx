import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';

const style = {
  color: '#dadada',
  border: '2px solid #b9b9b9',
  borderLeft: 'none',
  padding: '0 15px',
  fontFamily: 'monospace'
};

export function Sidebar(props) {

  const { inspector } = props;

  style.height = props.height;

  const image = inspector.get('image') || {};
  const title = inspector.get('title') || 'Inspector';
  console.log('image', image)

  return (
    <div style={ style }>
      <h1>{ title }</h1>
      <img src={ image.src } onLoad={ image.onload } />

    </div>
  );
}

function mapStateToProps(state) {
  return {
    inspector: state.get('inspector', Map())
  }
}

export const SidebarContainer = connect(mapStateToProps)(Sidebar);
