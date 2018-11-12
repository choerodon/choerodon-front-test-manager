import React, { Component } from 'react';

class StatusTag extends Component {
  render() {
    const { status } = this.props; 
    return (
      <div
        className=""
        style={{
          background: status.statusColor,
          // color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
          padding: '0 6px',
          lineHeight: '20px',
          fontSize: '12px',
          width: 48,
          textAlign: 'center',
          ...this.props.style,
        }}
      >
        { status.statusName }
      </div>
    );
  }
}
export default StatusTag;
