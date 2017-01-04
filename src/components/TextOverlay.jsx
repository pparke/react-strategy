import React from 'react';
import { List } from 'immutable';

const style = {
  position: 'fixed',
  left: 10,
  top: 10,
  fontSize: 22,
  color: 'rgba(200, 200, 255, 1)',
  fontFamily: 'monospace'
}

export default function TextOverlay(props) {
	const { message } = props;
  let classNames = ['text-overlay'].concat(message.get('classNames', List()).toJS());
  const text = message.get('text', '');
  if (!text) {
    classNames.push('hidden');
  }
  classNames = classNames.join(' ');

  const animationComplete = message.get('animationComplete', () => {});

  return (
    <div className={ classNames } onAnimationEnd={ animationComplete } style={ style }>{ text }</div>
  );
}
