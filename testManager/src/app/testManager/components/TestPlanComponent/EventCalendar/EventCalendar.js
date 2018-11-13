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
  constructor(props) {
    super(props);
    const { times } = props;
    let baseDate = moment();
    if (times && times.length > 0) {
      baseDate = times[0].start ? moment(times[0].start).startOf('month') : moment();
    }
    this.state = {
      currentDate: null,
      baseDate,
      mode: 'month',
      pos: 0,
    };
  }
  

  // componentWillReceiveProps(nextProps) {
  //   const { times } = nextProps;
  //   const { mode } = this.state;
  //   // console.log(times);
  //   // 使事件始终可以显示在当前范围
  //   if (times && times.length > 0) {
  //     this.setState({
  //       pos: 0,
  //       currentDate: null,
  //       baseDate: times[0].start ? moment(times[0].start).startOf(mode) : moment(),
  //     });
  //   }
  // }
  // static getDerivedStateFromProps(props, state) {
  //   const { times } = props;
  //   const { mode, baseDate } = state;
  //   // 使事件始终可以显示在当前范围
  //   if (times && times.length > 0) {
  //     return {
  //       pos: 0,
  //       currentDate: null,  
  //       baseDate: times[0].start ? moment(times[0].start).startOf(mode) : moment(),
  //     };      
  //   } else {
  //     return null;
  //   }
  // }

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

    return (
      <div className="c7ntest-EventCalendar" style={{ height: showMode === 'multi' ? '100%' : '162px' }}>
        <div className="c7ntest-EventCalendar-header">
          <div style={{ fontWeight: 500 }}>{moment(start).format('YYYY年M月')}</div>
          <div className="c7ntest-flex-space" />
          <div className="c7ntest-EventCalendar-header-skip">
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
          <div className="c7ntest-EventCalendar-header-radio">
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
          <div className="c7ntest-EventCalendar-header-page">
            <Icon
              className="c7ntest-pointer"
              type="keyboard_arrow_left"
              onClick={() => {
                this.setState({
                  currentDate: null,
                  pos: this.state.pos - 1,
                });
              }}
            />
            <Icon
              className="c7ntest-pointer"
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
        <div className="c7ntest-EventCalendar-content">
          <div className="c7ntest-EventCalendar-BackItems">
            {
              timeArray.map(m => <CalendarBackItem date={m} />)
            }
          </div>
          <div className="c7ntest-EventCalendar-eventContainer">
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
