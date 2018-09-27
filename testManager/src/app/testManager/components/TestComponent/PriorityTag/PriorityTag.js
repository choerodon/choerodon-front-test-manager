import React, { Component } from 'react';
import {
  Button, Table, Spin, Popover, Tooltip, Icon, Avatar, 
} from 'choerodon-ui';
import { COLOR } from '../../../common/Constant';


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
    return (
      <div
        className=""
        style={{
          ...this.props.style,
          backgroundColor: COLOR[priority.priorityCode].bgColor,
          color: COLOR[priority.priorityCode].color,
          borderRadius: '2px',
          padding: '0 8px',
          display: 'inline-block',
          lineHeight: '20px',
          fontSize: '13px',
          textAlign: 'center',
        }}
      >
        { `${priority.priorityName}` }
      </div>
    );
  }
}
export default PriorityTag;
