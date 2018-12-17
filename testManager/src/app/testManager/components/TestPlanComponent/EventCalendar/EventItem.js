import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import './EventItem.scss';
import { Tooltip } from 'choerodon-ui';

const background = {
  topversion: '#A1C4FD',
  version: '#78A9F7',
  cycle: '#5094FF',
  folder: '#4677DD',
};
const moment = extendMoment(Moment);
class EventItem extends Component {
  handleItemClick=() => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data);
    }
  }

  renderItems = () => {
    const {
      range, itemRange, data,
    } = this.props;
    const { type, title } = data;
    let preFlex = 0;
    let flex = 0;
    let lastFlex = 0;
    // 日期交集
    const intersect = itemRange.intersect(range);
    if (intersect) {
      // console.log(intersect.start.format('YYYYMMDD'), intersect.end.format('YYYYMMDD')); 
      // 交集前面的区域
      const preRange = moment.range(range.start, intersect.start);
      // 交集后面的区域
      const lastRange = moment.range(intersect.end, range.end);
      // 因为日期格式为00:00-59:59
      flex = intersect.diff('days') + 1;
      preFlex = preRange.diff('days');
      lastFlex = lastRange.diff('days');
    }
    // 旧的计算方法，太繁杂
    // const itemStart = itemRange.start;
    // const itemEnd = itemRange.end;
    // if (range.contains(itemStart) && range.contains(itemEnd)) {
    //   preFlex = itemStart.diff(range.start, 'days');
    //   flex = itemEnd.diff(itemStart, 'days') + 1;
    //   lastFlex = range.end.diff(itemEnd, 'days');
    // } else if (range.contains(itemStart) && !range.contains(itemEnd)) {
    //   preFlex = itemStart.diff(range.start, 'days');
    //   flex = range.end.diff(itemStart, 'days') + 1;
    //   lastFlex = 0;
    // } else if (!range.contains(itemStart) && range.contains(itemEnd)) {
    //   preFlex = 0;
    //   flex = itemEnd.diff(range.start, 'days') + 1;
    //   lastFlex = range.end.diff(itemEnd, 'days');
    // } else if (itemStart.isBefore(range.start) && itemEnd.isAfter(range.end)) {
    //   preFlex = 0;
    //   flex = range.end.diff(range.start, 'days');
    //   lastFlex = 0;
    // } else {
    //   preFlex = 0;
    //   flex = 0;
    //   lastFlex = 0;
    // }
    return [
      <div style={{ flex: preFlex }} />,
      <div
        role="none"
        onClick={this.handleItemClick}
        className="c7ntest-EventItem-event"
        style={{
          flex,
          display: flex === 0 && 'none', 
          background: background[type], 
        }}
      >
        <Tooltip title={title} placement="topLeft">
          <div className="c7ntest-EventItem-event-title c7ntest-text-dot">
            {title}
          </div>
        </Tooltip>
      </div>,
      <div style={{ flex: lastFlex }} />,
    ];
  }

  render() {
    return (
      <div style={{ width: '100%', display: 'flex' }} className="c7ntest-EventItem">
        {this.renderItems()}
      </div>
    );
  }
}

EventItem.propTypes = {

};

export default EventItem;
