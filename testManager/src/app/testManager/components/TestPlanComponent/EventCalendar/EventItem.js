import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import './EventItem.scss';
import { Tooltip } from 'choerodon-ui';

const moment = extendMoment(Moment);
class EventItem extends Component {
  renderItems = () => {
    const { range, totalRange, itemRange } = this.props;
    const itemStart = itemRange.start;
    const itemEnd = itemRange.end;
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
      <div className="c7n-EventItem-event" style={{ flex, display: flex === 0 && 'none' }}>
        <Tooltip title="组织管理" placement="topLeft">
          <div className="c7n-EventItem-event-title c7n-text-dot">
          组织管理
          </div>
        </Tooltip>        
      </div>,
      <div style={{ flex: lastFlex }} />,
    ];
  }

  render() {
    const { range } = this.props;
    return (
      <div style={{ width: '100%', display: 'flex' }} className="c7n-EventItem">
        {this.renderItems()}
      </div>

    );
  }
}

EventItem.propTypes = {

};

export default EventItem;
