import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Icon, Radio } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import './EventCalendar.scss';
import CalendarBackItem from './CalendarBackItem';

const moment = extendMoment(Moment);
class EventCalendar extends Component {
  state = {
    mode: 'month',
    pos: 0,
  }

  calculateTime = () => {
    const { mode, pos } = this.state;
    const start = moment().startOf(mode).add(pos, mode);
    const end = moment().endOf(mode).add(pos, mode);
    return { start, end };
  }

  handleModeChange = (e) => {
    this.setState({
      mode: e.target.value,
    });
  }

  render() {
    const { mode } = this.state;
    const { start, end } = this.calculateTime();
    const range = moment.range(start, end);
    const timeArray = Array.from(range.by('day'));  
    return (
      <div className="c7n-EventCalendar">
        <div className="c7n-EventCalendar-header">          
          {moment(start).format('YYYYMMMM')}
          <div className="c7n-flex-space" />
          <div className="c7n-EventCalendar-header-radio">
            <Radio.Group value={mode} onChange={this.handleModeChange}>
              {/* <Radio.Button value="1">1天</Radio.Button> */}
              <Radio.Button value="week">              
                <FormattedMessage id="week" />
              </Radio.Button>
              <Radio.Button value="month">               
                <FormattedMessage id="month" />
              </Radio.Button>            
            </Radio.Group>
          </div>
          <div className="c7n-EventCalendar-header-page">
            <Icon
              className="c7n-pointer"
              type="keyboard_arrow_left"
              onClick={() => {
                this.setState({
                  pos: this.state.pos - 1,
                });
              }}
            />
            <Icon
              className="c7n-pointer"
              type="keyboard_arrow_right"
              onClick={() => {
                this.setState({
                  pos: this.state.pos + 1,
                });
              }}
            />
          </div>
        </div>
        <div className="c7n-EventCalendar-content">
          <div className="c7n-EventCalendar-BackItems">
            {
              timeArray.map(m => <CalendarBackItem date={m} />)
            }
          </div>
          <div className="c7n-EventCalendar-eventContainer">
            events
          </div>
        </div>
      </div>
    );
  }
}

EventCalendar.propTypes = {

};

export default EventCalendar;
