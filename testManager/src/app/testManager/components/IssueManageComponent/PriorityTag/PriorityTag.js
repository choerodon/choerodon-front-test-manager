import React, { Component } from 'react';
import { color2rgba } from '../../../common/utils';

class PriorityTag extends Component {
  render() {
    const { priority } = this.props; 
    const { colour, name } = priority;
    return (
      <div
        className=""
        style={{
          ...this.props.style,
          backgroundColor: color2rgba(colour, 0.18),
          color: colour,
          borderRadius: '2px',
          padding: '0 8px',
          display: 'inline-block',
          lineHeight: '20px',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        { `${name}` }
      </div>
    );
  }
}
export default PriorityTag;
