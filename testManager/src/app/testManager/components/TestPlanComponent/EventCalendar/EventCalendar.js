import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Icon } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { DatePicker, Button } from 'choerodon-ui';
import { RadioButton } from '../../CommonComponent';
import './EventCalendar.scss';
import CalendarBackItem from './CalendarBackItem';
import EventItem from './EventItem';


const moment = extendMoment(Moment);
class EventCalendar extends Component {
  state = {
    currentDate: null,
    baseDate: moment(),
    mode: 'month',
    pos: 0,
  }

  componentWillReceiveProps(nextProps) {
    const { times } = nextProps;
    const { mode } = this.state;
    // console.log(times);
    // 使事件始终可以显示在当前范围
    if (times && times.length > 0) {
      this.setState({
        pos: 0,
        currentDate: null,
        baseDate: times[0].start ? moment(times[0].start).startOf(mode) : moment(),
      });
    }
  }

  calculateTime = () => {
    const { mode, pos, baseDate } = this.state;
    const start = moment(baseDate).startOf(mode).add(pos, mode);
    const end = moment(baseDate).endOf(mode).add(pos, mode);
    return { start, end };
  }

  handleModeChange = (e) => {
    const { times } = this.props;
    this.setState({
      pos: 0,
      mode: e.target.value,
      currentDate: null,
      baseDate: times[0].start ? moment(times[0].start).startOf(e.target.value) : moment(),
    });
  }

  handleBaseChange = (date) => {
    this.setState({
      pos: 0,
      baseDate: date,
      currentDate: null,
    });
  }

  handleCalendarChange=(date) => {
    this.setState({
      currentDate: date,
      pos: 0,
      baseDate: date,
    });
  }

  render() {
    const { mode, currentDate } = this.state;
    const { showMode, times } = this.props;
    const { start, end } = this.calculateTime();
    const range = moment.range(start, end);
    const timeArray = Array.from(range.by('day'));
    const fake = [{
      start: moment().startOf('month'),
      end: moment().endOf('month').add(-5, 'day'),
    },
      // {
      //   start: moment().startOf('month'),
      //   end: moment().endOf('month').add(-6, 'day'),
      // }, {
      //   start: moment().startOf('month').add(-5, 'day'),
      //   end: moment().endOf('month').add(-5, 'day'),
      // }, {
      //   start: moment().startOf('month').add(15, 'day'),
      //   end: moment().endOf('month').add(5, 'day'),
      // }, {
      //   start: moment().startOf('month').add(0, 'day'),
      //   end: moment().endOf('month').add(-30, 'day'),
      // }, {
      //   start: moment().startOf('month').add(-10, 'day'),
      //   end: moment().endOf('month').add(-33, 'day'),
      // }
    ];
    return (
      <div className="c7n-EventCalendar" style={{ height: showMode === 'multi' ? '100%' : '162px' }}>
        <div className="c7n-EventCalendar-header">
          <div style={{ fontWeight: 500 }}>{moment(start).format('YYYY年M月')}</div>
          <div className="c7n-flex-space" />
          <div className="c7n-EventCalendar-header-skip">
            <span style={{ color: 'rgba(0,0,0,0.65)', marginRight: 7 }}>跳转到</span>
            {/* <Button
              onClick={() => { this.handleBaseChange(moment()); }}
              style={{ fontWeight: 500 }}
            >
今天

            </Button> */}
            {
              currentDate && currentDate.format('LL')
            }
            <DatePicker allowClear={false} onChange={this.handleCalendarChange} value={currentDate} />
          </div>
          <div className="c7n-EventCalendar-header-radio">
            <RadioButton
              defaultValue={mode}
              onChange={this.handleModeChange}
              data={[{
                value: 'week',
                text: 'week',
              }, {
                value: 'month',
                text: 'month',
              }]}
            />
          </div>
          <div className="c7n-EventCalendar-header-page">
            <Icon
              className="c7n-pointer"
              type="keyboard_arrow_left"
              onClick={() => {
                this.setState({
                  currentDate: null,
                  pos: this.state.pos - 1,
                });
              }}
            />
            <Icon
              className="c7n-pointer"
              type="keyboard_arrow_right"
              onClick={() => {
                this.setState({
                  currentDate: null,
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
            {times.map(event => (
              <EventItem
                onClick={this.props.onItemClick}
                itemRange={moment.range(event.start, event.end)}
                // totalRange={timeArray.length}
                data={event}
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
