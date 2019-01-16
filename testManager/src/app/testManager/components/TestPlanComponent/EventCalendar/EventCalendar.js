import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Button, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from 'choerodon-ui';
import './EventCalendar.scss';
import CalendarBackItem from './CalendarBackItem';
import EventItem from './EventItem';
import { addResizeListener, removeResizeListener } from '../../../common/ResizeListener';

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
      endDate = moment.max(times.map(time => moment(time.end)));
    }

    this.currentDate = baseDate;
    this.state = {
      baseDate, // 显示的开始时间
      endDate, // 显示的结束时间      
      mode: 'month',
      width: 'auto',
      singleWidth: 0, // 单个日期所占宽度
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

  componentDidMount() {
    // 设置事件区域宽度
    this.setRightWidth();
    // 计算单个日期所占宽度
    this.calculateItemWidth();
    // 监听
    addResizeListener(this.header, this.setRightWidth);    
    addResizeListener(this.header, this.calculateItemWidth);
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return {
      scrollLeft: this.scroller.scrollLeft,
      scrollTop: this.scroller.scrollTop,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.calculateItemWidth();
    this.setRightWidth();
  }

  componentWillUnmount() {
    removeResizeListener(this.header, this.setRightWidth);
    removeResizeListener(this.header, this.calculateItemWidth);
  }

  // 设置事件区域宽度
  setRightWidth = () => {      
    const scrollBarWidth = this.scroller.offsetWidth - this.scroller.clientWidth;
    this.fakeScrollBar.style.width = `${scrollBarWidth}px`;
    const rightWidth = Math.ceil(this.HeaderItems.offsetWidth);
    this.wrapper.style.width = `${rightWidth - scrollBarWidth}px`;
    // this.HeaderItems.style.width = `${rightWidth}px`; // 防止tooltip引起的宽度变化
    // 设置高度，防止滚动条跳动，虽然EventItem设置了key，但依然会重新挂载，不清楚原因
    // 原因是不直接设置具体数据
    this.events.style.height = `${this.events.offsetHeight}px`;
  }

  /**
   *计算单个日期所占宽度
   *
   */
  calculateItemWidth = () => {  
    const { baseDate, endDate, singleWidth } = this.state;
    const range = moment.range(baseDate, endDate);
    const dates = range.diff('days');
    const newSingleWidth = this.BackItems.clientWidth / (dates + 1) + 1;
    if (newSingleWidth !== singleWidth) {
      this.setState({
        singleWidth: newSingleWidth,
      });
    }
  }

  calculateTime = () => {
    const { baseDate, endDate } = this.state;
    const start = moment(baseDate).startOf('day');
    const end = moment(endDate).endOf('day');
    return { start, end };
  }


  saveRef = name => (ref) => {
    this[name] = ref;
  }

  /**
   * 鼠标按下，区域拖动
   *
   * 
   */
  handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    this.scroller.style.cursor = 'grabbing';
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
    // console.log('move');
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
    this.scroller.style.cursor = 'grab';
    this.setCurrentDate();
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  // 滚动时保持日期固定在头部
  handleScroll = (e) => {
    // 设置头的位置，固定
    const { scrollLeft } = e.target;
    this.header.scrollLeft = scrollLeft;
  }

  // tooltip会引起header的滚动，在此将header和scroller同步滚动
  handleHeaderScroll = (e) => {
    const { scrollLeft } = e.target;
    if (this.scroller.scrollLeft !== scrollLeft) {
      this.scroller.scrollLeft = scrollLeft;
    }
  }

  /**
   * 当滚动条滚动时，更新左侧当前日期，以此为基准进行上一个月，下一个月切换
   *
   * 
   */
  setCurrentDate = () => {
    const { scrollLeft } = this.scroller;
    const { singleWidth, baseDate } = this.state;
    const leapDays = Math.floor(scrollLeft / singleWidth);
    const currentDate = moment(baseDate).add(leapDays, 'days');
    this.currentDate = currentDate;
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

  /**
   * 左右切换日期
   *
   * @paramter mode "pre"前一个月 "next" 后一个月
   */
  skipTo = (mode) => {
    const { baseDate, endDate } = this.state;
    // 计算目标时间
    const targetDate = mode === 'pre'
      ? moment(this.currentDate).subtract(1, 'months')
      : moment(this.currentDate).add(1, 'months');
    // 当前时间范围
    const range = moment.range(baseDate, endDate);
    // 如果目标时间在当前范围    
    if (range.contains(targetDate)) {
      const skipRange = moment.range(baseDate, targetDate);
      const days = skipRange.diff('days');
      // 目标位置dom       
      const targetDOM = findDOMNode(this[`item_${days}`]);// eslint-disable-line react/no-find-dom-node
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
          <div className="c7ntest-EventCalendar-header-title">计划日历</div>
          <div className="c7ntest-flex-space" />
          <div className="c7ntest-EventCalendar-header-skip">
            <RangePicker
              onChange={this.handleRangeChange}
              defaultValue={[start, end]}
              format={dateFormat}
            />
          </div>

          <div className="c7ntest-EventCalendar-header-page">
            <Tooltip title="上个月">
              <Button type="circle" onClick={this.skipTo.bind(this, 'pre')} icon="keyboard_arrow_left" />
            </Tooltip>
            <Tooltip title="下个月">
              <Button
                type="circle"
                icon="keyboard_arrow_right"
                onClick={this.skipTo.bind(this, 'next')}
              />
            </Tooltip>
          </div>
        </div>
        <div className="c7ntest-EventCalendar-content">
          <div className="c7ntest-EventCalendar-fixed-header" ref={this.saveRef('header')} onScroll={this.handleHeaderScroll}>
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
            <div style={{ position: 'relative', minHeight: '100%' }} ref={this.saveRef('wrapper')}>
              <div className="c7ntest-EventCalendar-BackItems" ref={this.saveRef('BackItems')}>
                {
                  timeArray.map((m, i) => <div className="c7ntest-EventCalendar-BackItems-item" />)
                }
              </div>
              <div className="c7ntest-EventCalendar-eventContainer" ref={this.saveRef('events')}>
                {times.map(event => (
                  <EventItem
                    key={event.key}
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

export default EventCalendar;
