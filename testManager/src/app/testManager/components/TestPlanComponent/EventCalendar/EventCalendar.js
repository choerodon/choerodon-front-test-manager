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
    let endDate = moment();
    if (times && times.length > 0) {
      baseDate = times[0].start ? moment(times[0].start).startOf('day') : moment();
      endDate = times[times.length - 1].end ? moment(times[times.length - 1].end).startOf('day') : moment();
    }
    const range = moment.range(baseDate, endDate);
    this.state = {
      currentDate: null,
      baseDate,
      endDate,
      dates: range.diff('days'),
      mode: 'month',
      width: 'auto',
      singleWidth: 0,
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
  // static getDerivedStateFromProps(props, state) {
  //   return {
  //     width: this.wrapper ? this.wrapper.offsetWidth : 'auto',
  //   };
  // }

  componentDidMount() {
    // const scrollBarWidth = this.wrapper.offsetWidth - this.wrapper.clientWidth;
    // this.scroll.style.width = `calc(100% + ${scrollBarWidth}px)`;
    // 设置事件区域宽度
    this.wrapper.style.width = `${this.BackItems.clientWidth}px`;
    this.calculateItemWidth()
  }
  componentDidUpdate(prevProps, prevState) {
    this.wrapper.style.width = `${this.BackItems.clientWidth}px`;
  }
  calculateItemWidth = () => {
    const { baseDate, endDate } = this.state;
    const range = moment.range(baseDate, endDate).diff('days') || 1;
    const singleWidth = this.BackItems.clientWidth / range;
    this.setState({
      singleWidth
    })
  }
  calculateTime = () => {
    const { mode, pos, baseDate, endDate } = this.state;
    const start = moment(baseDate).startOf('day');
    // const start = moment(baseDate).startOf('week').add(pos, mode);
    // const end = moment(baseDate).endOf(mode).add(pos, mode);
    // const end = moment(endDate).endOf('week').add(pos, mode);
    const end = moment(endDate).endOf('day');
    return { start, end };
  }

  handleModeChange = (e) => {
    // const { times } = this.props;
    // this.setState({
    //   pos: 0,
    //   mode: e.target.value,
    //   currentDate: null,
    //   baseDate: times[0].start ? moment(times[0].start).startOf(e.target.value) : moment(),
    // });
  }

  handleBaseChange = (date) => {
    // this.setState({
    //   pos: 0,
    //   baseDate: date,
    //   currentDate: null,
    // });
  }

  handleCalendarChange = (date) => {
    // this.setState({
    //   currentDate: date,
    //   pos: 0,
    //   baseDate: date,
    // });
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }
  // handleScroll = (e) => {
  //   // 左侧滚动距离
  //   const scrollLeft=e.target.scrollLeft;
  //   this.updateCurrentDate(scrollLeft)    
  // }
  // updateCurrentDate=(scrollLeft)=>{
  //   const { baseDate, singleWidth } = this.state;    
  //   const pos= ~~scrollLeft/singleWidth;
  //   this.setState({
  //     singleWidth
  //   })
  // }
  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.initScrollPosition = {
      x: e.clientX,
      y:e.clientY,
      left: this.scroller.scrollLeft,
      top: this.scroller.scrollTop,
    }
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }
  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (this.initScrollPosition) {
      const posX = e.clientX - this.initScrollPosition.x;
      const posY = e.clientY - this.initScrollPosition.y;
      this.scroller.scrollLeft = this.initScrollPosition.left - posX;
      this.scroller.scrollTop = this.initScrollPosition.top - posY;
    }
  }
  handleMouseUp = (e) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
  render() {
    const { mode, currentDate, width, singleWidth } = this.state;
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
          {/* <div className="c7ntest-EventCalendar-header-radio">
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
          </div> */}
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
        {/* <div> */}
        <div className="c7ntest-EventCalendar-scroller" onMouseDown={this.handleMouseDown} ref={this.saveRef('scroller')}>
          <div className="c7ntest-EventCalendar-content">
            <div className="c7ntest-EventCalendar-BackItems" ref={this.saveRef('BackItems')}>
              {
                timeArray.map(m => <CalendarBackItem date={m} />)
              }
            </div>
            <div className="c7ntest-EventCalendar-eventContainer" ref={this.saveRef('wrapper')}>
              {/* <div className="c7ntest-EventCalendar-scroll-wrapper" ref={this.saveRef('scroll')}>          */}
              {times.map(event => (
                <EventItem
                  onClick={this.props.onItemClick}
                  itemRange={moment.range(event.start, event.end)}
                  // totalRange={timeArray.length}
                  data={event}
                  range={range}
                  singleWidth={singleWidth}
                />
              ))}
              {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

EventCalendar.propTypes = {

};

export default EventCalendar;
