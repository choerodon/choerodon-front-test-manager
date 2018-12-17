import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import moment from 'moment';
import './CalendarBackItem.scss';

class CalendarBackItem extends Component {
  render() {
    const { date } = this.props;
    return (
      // 周末字体颜色不同
      <div
        className="CalendarBackItem"
        style={{ color: moment(date).day() === 6 || moment(date).day() === 0 ? '#303F9F' : 'black' }}
      >
        <div className="CalendarBackItem-content">
          <Tooltip title={moment(date).format('LL')}>
            <div>
              {moment(date).format('dd')}
            </div>
            <div>
              {moment(date).format('MMM Do')}
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }
}

CalendarBackItem.propTypes = {

};

export default CalendarBackItem;
