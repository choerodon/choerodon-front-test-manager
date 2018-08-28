import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Icon, Radio } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { DatePicker, Button } from 'choerodon-ui';
import './EventCalendar.scss';
import CalendarBackItem from './CalendarBackItem';
import EventItem from './EventItem';


const moment = extendMoment(Moment);
class EventCalendar extends Component {
  state = {
    baseDate: moment(),
    mode: 'month',
    pos: 0,
  }

  calculateTime = () => {
    const { mode, pos, baseDate } = this.state;
    const start = moment(baseDate).startOf(mode).add(pos, mode);
    const end = moment(baseDate).endOf(mode).add(pos, mode);
    return { start, end };
  }

  handleModeChange = (e) => {
    this.setState({
      pos: 0,
      mode: e.target.value,
    });
  }

  handleBaseChange = (date) => {
    this.setState({
      baseDate: date,
    });
  }

  render() {
    const { mode } = this.state;
    const { start, end } = this.calculateTime();
    const range = moment.range(start, end);
    const timeArray = Array.from(range.by('day'));
    const fake = [{
      start: moment().startOf('month'),
      end: moment().endOf('month').add(-5, 'day'),
    }, {
      start: moment().startOf('month'),
      end: moment().endOf('month').add(-6, 'day'),
    }, {
      start: moment().startOf('month').add(-5, 'day'),
      end: moment().endOf('month').add(-5, 'day'),
    }, {
      start: moment().startOf('month').add(15, 'day'),
      end: moment().endOf('month').add(5, 'day'),
    }, {
      start: moment().startOf('month').add(0, 'day'),
      end: moment().endOf('month').add(-30, 'day'),
    }, {
      start: moment().startOf('month').add(-10, 'day'),
      end: moment().endOf('month').add(-33, 'day'),
    }];
    return (
      <div className="c7n-EventCalendar">
        <div className="c7n-EventCalendar-header">
          <div style={{ fontWeight: 500 }}>{moment(start).format('YYYY年M月')}</div>
          <div className="c7n-flex-space" />
          <div className="c7n-EventCalendar-header-skip">
            <span style={{ color: 'rgba(0,0,0,0.65)' }}>跳转到</span>
            <Button
              onClick={() => { this.handleBaseChange(moment()); }}
              style={{ fontWeight: 500 }}
            >
              今天
            </Button>
            <DatePicker onChange={this.handleBaseChange} />
          </div>
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
            {fake.map(event => (
              <EventItem
                itemRange={moment.range(event.start, event.end)}
                totalRange={timeArray.length}
                range={range}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

EventCalendar.propTypes = {

};

export default EventCalendar;
