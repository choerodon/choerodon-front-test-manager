import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Moment, { months } from 'moment';
import { extendMoment } from 'moment-range';
import { Icon } from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { DatePicker, Button } from 'choerodon-ui';
import { RadioButton } from '../../CommonComponent';
import './EventCalendar.scss';
import CalendarBackItem from './CalendarBackItem';
import EventItem from './EventItem';

const { RangePicker } = DatePicker;
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
    this.currentDate = baseDate;
    this.state = {
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
    // 设置事件区域宽度
    this.setRightWidth();
    this.calculateItemWidth();
  }

  componentDidUpdate(prevProps, prevState) {
    // this.wrapper.style.width = `${this.BackItems.clientWidth}px`;
    // this.calculateItemWidth();
    this.setRightWidth();
  }

  setRightWidth=() => {
    const scrollBarWidth = this.scroller.offsetWidth - this.scroller.clientWidth;  
    console.log(this.HeaderItems.offsetWidth);
    this.fakeScrollBar.style.width = `${scrollBarWidth}px`;
    this.wrapper.style.width = `${Math.ceil(this.HeaderItems.offsetWidth) - scrollBarWidth}px`;
  }

  calculateItemWidth = () => {
    const { baseDate, endDate, dates } = this.state;
    console.log(dates);
    // const range = moment.range(baseDate, endDate).diff('days') + 1 || 1;
    const singleWidth = this.BackItems.clientWidth / (dates + 1) + 1;
    this.setState({
      singleWidth,
    });
  }

  calculateTime = () => {
    const {
      mode, pos, baseDate, endDate,
    } = this.state;
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

  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.initScrollPosition = {
      x: e.clientX,
      y: e.clientY,
      left: this.scroller.scrollLeft,
      top: this.scroller.scrollTop,
    };
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
    this.setCurrentDate();
    console.log('up');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  // 滚动时保持日期固定在头部
  handleScroll = (e) => {
    console.log('scroll');
    // 设置头的位置，固定
    const { scrollTop, scrollLeft } = e.target;
    console.log(scrollLeft);
    this.header.scrollLeft = scrollLeft;
    // requestAnimationFrame(() => {
    //   this.BackItems.style.top = `${scrollTop}px`;
    //   console.log('scroll');
    // });
  }

  setCurrentDate = () => {
    const { scrollTop, scrollLeft } = this.scroller;
    console.log(scrollLeft);
    const { singleWidth, baseDate } = this.state;
    const leapDays = Math.floor(scrollLeft / singleWidth);
    const currentDate = moment(baseDate).add(leapDays, 'days');
    this.currentDate = currentDate;
    // console.log(currentDate.format('LL'));
  }

  /**
   * 时间范围改变
   *
   * @memberof EventCalendar
   */
  handleRangeChange = (range) => {
    this.setState({
      baseDate: range[0],
      endDate: range[1],
    });
  }

  // 左右切换日期
  skipTo = (mode) => {
    // console.log(mode);
    const { baseDate, endDate } = this.state;
    // 计算目标时间
    const targetDate = mode === 'pre'
      ? moment(this.currentDate).subtract(1, 'months')
      : moment(this.currentDate).add(1, 'months');
    // 当前时间范围
    const range = moment.range(baseDate, endDate);
    // 如果目标时间在当前范围
    console.log({ targetDate: targetDate.format('LL'), currentDate: this.currentDate.format('LL') });
    if (range.contains(targetDate)) {
      const skipRange = moment.range(baseDate, targetDate);
      // console.log(this.currentDate.format('LL'), targetDate.format('LL'));
      const days = skipRange.diff('days');
      // console.log(days, moment.range(baseDate, targetDate).diff('days'));
      // 目标位置dom 
      const targetDOM = findDOMNode(this[`item_${days}`]);
      if (targetDOM) {
        const left = targetDOM.offsetLeft;
        this.scroller.scrollLeft = left;
        this.currentDate = targetDate;
      }
    } else {
      // 设置滚动到最右或最左侧，并且设置当前时间
      this.scroller.scrollLeft = mode === 'pre' ? 0 : this.BackItems.scrollWidth;
      this.currentDate = mode === 'pre' ? baseDate : endDate;
    }
  }

  render() {
    const {
      mode, width, singleWidth,
    } = this.state;
    const { showMode, times } = this.props;

    const { start, end } = this.calculateTime();
    const range = moment.range(start, end);
    const timeArray = Array.from(range.by('day'));
    const dateFormat = 'YYYY/MM/DD';
    return (
      <div className="c7ntest-EventCalendar" style={{ height: showMode === 'multi' ? '100%' : '162px' }}>
        {/* 头部 */}
        <div className="c7ntest-EventCalendar-header">
          {/* <div style={{ fontWeight: 500 }}>{moment(start).format('YYYY年M月')}</div> */}
          <div className="c7ntest-EventCalendar-header-title">计划日历</div>
          <div className="c7ntest-flex-space" />
          <div className="c7ntest-EventCalendar-header-skip">
            {/* <span style={{ color: 'rgba(0,0,0,0.65)', marginRight: 7 }}>跳转到</span> */}
            {/* <Button
              onClick={() => { this.handleBaseChange(moment()); }}
              style={{ fontWeight: 500 }}
            >
            今天
            </Button> */}

            {/* {
              currentDate && currentDate.format('LL')
            } */}
            <RangePicker
              onChange={this.handleRangeChange}
              defaultValue={[start, end]}
              format={dateFormat}
            />
            {/* <DatePicker allowClear={false} onChange={this.handleCalendarChange} value={currentDate} /> */}
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
              onClick={this.skipTo.bind(this, 'pre')}
            />
            <Icon
              className="c7ntest-pointer"
              type="keyboard_arrow_right"
              onClick={this.skipTo.bind(this, 'next')}
            />
          </div>
        </div>
        {/* 滚动区域 */}
        {/* <div style={{ width: 968, overflow: 'auto' }}>
          <div style={{ width: 4684, height: 50 }} />
        </div> */}

        <div className="c7ntest-EventCalendar-content">
          <div className="c7ntest-EventCalendar-fixed-header" ref={this.saveRef('header')}>
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
              <div className="c7ntest-EventCalendar-HeaderItems" ref={this.saveRef('HeaderItems')}>
                {
                  timeArray.map((m, i) => <CalendarBackItem ref={this.saveRef(`item_${i}`)} date={m} />)
                }
                <div className="c7ntest-EventCalendar-fake-scrollBar" ref={this.saveRef('fakeScrollBar')} />
              </div>
            </div>
          </div>
          <div
            role="none"
            className="c7ntest-EventCalendar-scroller"
            ref={this.saveRef('scroller')}
            onScroll={this.handleScroll}
            onMouseDown={this.handleMouseDown}
          >
            <div style={{ position: 'relative' }} ref={this.saveRef('wrapper')}>
              <div className="c7ntest-EventCalendar-BackItems" ref={this.saveRef('BackItems')}>
                {
                  timeArray.map((m, i) => <div className="c7ntest-EventCalendar-BackItems-item" />)
                }
              </div>
              <div className="c7ntest-EventCalendar-eventContainer" ref={this.saveRef('events')}>
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
              </div>
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
