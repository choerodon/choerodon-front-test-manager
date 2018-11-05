import React, { Component } from 'react';

class PriorityTag extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  render() {
    const { priority } = this.props; 
    const { colour, name } = priority;
    return (
      <div
        className=""
        style={{
          ...this.props.style,
          // backgroundColor: colour,
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
