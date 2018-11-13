import React, { Component } from 'react';

export const STATUS = {
  todo: '#ffb100',
  doing: '#4d90fe',
  done: '#00bfa5',
};
const StatusTagSimple = (props) => {
  const { status } = props; 
  const { statusCode, statusName } = status;
  return (
    <div
      style={{
        display: 'inline-block',
        color: STATUS[statusCode],
        fontSize: '15px',
        lineHeight: '18px',
      }}
    >
      {statusName || ''}
    </div>
  );
};

class StatusTag extends Component {
  render() {
    const { status } = this.props; 
    return (
      <div
        className=""
        style={{
          display: 'inline-block',
          background: STATUS[status.statusCode],
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          borderRadius: '2px',
          padding: '0 6px',
          lineHeight: '20px',
          fontSize: '12px',
          width: 50,
          textAlign: 'center',
          ...this.props.style,
        }}
      >
        { status.statusName }
      </div>
    );
  }
}
StatusTag.Simple = StatusTagSimple;
export default StatusTag;
