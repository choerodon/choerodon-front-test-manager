import React, { Component } from 'react';
import isEqual from 'react-fast-compare';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Button, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import { DatePicker } from 'choerodon-ui';
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


  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps) || !isEqual(this.state, nextState);
  }

  // componentDidMount() {
  //   console.log('didmount');    
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {    
  //   console.log('didupdate');    
  // }
  
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
      const targetDOM = document.getElementsByClassName('CalendarBackItem')[days]; // findDOMNode(this[`item_${days}`]);// eslint-disable-line react/no-find-dom-node
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
    // console.log('render');
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
              // placement="bottomRight"
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
        <div role="none" className="c7ntest-EventCalendar-content" ref={this.saveRef('scroller')} onMouseDown={this.handleMouseDown}>      
          <div style={{
            width: 'fit-content', height: 'fit-content', minWidth: '100%', minHeight: '100%', position: 'relative',
          }}
          >   
            <div className="c7ntest-EventCalendar-fixed-header">            
              { timeArray.map((m, i) => (<CalendarBackItem date={m} />)) }            
            </div>
            <div className="c7ntest-EventCalendar-eventContainer">
              <div className="c7ntest-EventCalendar-BackItems">
                {
                  timeArray.map((m, i) => <div className="c7ntest-EventCalendar-BackItems-item" />)
                }
              </div>
              {times.map(event => (
                <EventItem
                  key={event.key}
                  onClick={this.props.onItemClick}
                  itemRange={moment.range(event.start, event.end)}                  
                  data={event}
                  range={range}              
                />
              ))}
            </div>          
          </div>
        </div>
      </div>
    );
  }
}

export default EventCalendar;
