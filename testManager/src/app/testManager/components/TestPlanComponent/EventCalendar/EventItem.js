import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Tooltip } from 'choerodon-ui';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';
import { editFolder } from '../../../api/cycleApi';
import './EventItem.scss';

const types = {
  topversion: '版本类型',
  version: '版本',
  cycle: '测试循环',
  folder: '测试阶段',
};
const canReasizes = ['cycle', 'folder'];
const styles = {
  topversion: {
    borderTop: '4px solid #3F51B5',
    background: '#E8ECFC',
    tipBackground: 'rgba(63,81,181,0.6)',
    color: '#3F51B5',
  },
  version: {
    borderTop: '4px solid #FFB100',
    background: '#FFF8E7',
    tipBackground: 'rgba(255,177,0,0.6)',
    color: '#FFB100',
  },
  cycle: {
    borderTop: '4px solid #00BFA5',
    background: '#E5F9F6',
    tipBackground: 'rgba(0,191,165,0.6)',
    color: '#00BFA5',
  },
  folder: {
    // borderTop: '4px solid #3F51B5',
    background: '#E9F1FF',
    color: '#4D90FE',
    tipBackground: 'rgba(77,144,254,0.6)',
    lineHeight: '34px',
  },
};
const AUTOSCROLL_RATE = 7;
const isScrollable = (...values) => values.some(value => value === 'auto' || value === 'scroll');
function findScroller(n) {
  let node = n;
  while (node) {
    const style = window.getComputedStyle(node);
    if (isScrollable(style.overflow, style.overflowY, style.overflowX)) {
      return node;
    } else {
      node = node.parentNode;
    }
  }
  return null;
}
// const easeInOutCubic = (t, b, c, d) => {
//   const cc = c - b;
//   t /= d / 2;
//   if (t < 1) {
//     return cc / 2 * t * t * t + b;
//   } else {
//     return cc / 2 * ((t -= 2) * t * t + 2) + b;
//   }
// };
// const scrollToTop = (e) => {
//   const scrollTop = this.getCurrentScrollTop();
//   const startTime = Date.now();
//   const scrollTimer = () => {
//     const timestamp = Date.now();
//     const time = timestamp - startTime;
//     this.setScrollTop(easeInOutCubic(time, scrollTop, 0, 450));
//     if (time < 450) {
//     } else {
//       this.setScrollTop(0);
//     }
//   };
//   (this.props.onClick || noop)(e);
// }


const moment = extendMoment(Moment);
class EventItem extends Component {
  state = {
    type: null,
    title: null,
    preFlex: 0,
    flex: 0,
    lastFlex: 0,
    initFlex: {
      preFlex: 0,
      flex: 0,
      lastFlex: 0,
    },
    mode: 'left',
    resizing: false,
    done: true,
    enter: false,
  };


  static getDerivedStateFromProps(props, state) {
    // 调整大小时以state为准
    if (!state.done) {
      return null;
    }
    const {
      range, itemRange, data,
    } = props;
    const { type, title } = data;
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
    return {
      type,
      title,
      preFlex,
      flex,
      lastFlex,
      initFlex: {
        preFlex,
        flex,
        lastFlex,
      },
    };
  }

  prepareForScroll=() => {
    const scroller = findScroller(findDOMNode(this));
    const { left, width } = scroller.getBoundingClientRect();
    const scrollRightPosition = left + width;
    const scrollLeftPosition = left;
    this.autoScroll = {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    };
  }

  // 拖动时，当鼠标到边缘时，自动滚动
  startAutoScroll = (initMouseX, mode) => {
    // console.log('start');
    const {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    } = this.autoScroll;
    const initScrollLeft = scroller.scrollLeft;
    // 到最左或最右，停止滚动
    const shouldStop = () => (mode === 'right' && ~~(scroller.scrollLeft + scroller.offsetWidth) === scroller.scrollWidth)
    || (mode === 'left' && scroller.scrollLeft === 0);
    if (shouldStop()) {
      cancelAnimationFrame(this.scrollTimer);
      return;
    }
    if (this.scrollTimer) {
      cancelAnimationFrame(this.scrollTimer);
    }
    const scrollFunc = () => {
      if (mode === 'right') {
        scroller.scrollLeft += AUTOSCROLL_RATE; 
      } else {
        scroller.scrollLeft -= AUTOSCROLL_RATE;
      }      
      const { scrollLeft } = this.initScrollPosition;
      this.initScrollPosition.scrollPos = scroller.scrollLeft - scrollLeft;
      // 因为鼠标并没有move，所以这里要手动触发，否则item的宽度不会变化
      this.fireResize(initMouseX);

      if (shouldStop()) {
        cancelAnimationFrame(this.scrollTimer);
      } else {
        this.scrollTimer = requestAnimationFrame(scrollFunc);
      }
    };
    this.scrollTimer = requestAnimationFrame(scrollFunc);
  }

  // 停止自动滚动
  stopAutoScroll = () => {
    cancelAnimationFrame(this.scrollTimer);
    // console.log('stop');
  }

  handleItemClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.data);
    }
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  renderItems = () => {
    const {
      type, title, preFlex, flex, lastFlex, enter, resizing,
    } = this.state;
    const tipTitle = `${types[type]}：${title}`;
    const canReasize = canReasizes.includes(type);
    return [
      <div style={{ flex: preFlex }} />,
      <div
        role="none"
        onClick={this.handleItemClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        className="c7ntest-EventItem-event"
        style={{
          flex,
          display: flex === 0 && 'none',
          ...styles[type],
        }}
      >
        {canReasize && <div className="c7ntest-EventItem-event-resizer-left" style={{ left: preFlex === 0 ? 0 : -10 }} onMouseDown={this.handleMouseDown.bind(this, 'left')} ref={this.saveRef('left')} role="none" />}
        {canReasize && <div className="c7ntest-EventItem-event-resizer-right" style={{ right: lastFlex === 0 ? 0 : -10 }} onMouseDown={this.handleMouseDown.bind(this, 'right')} ref={this.saveRef('right')} role="none" />}
        {(enter || resizing) && <div className="c7ntest-EventItem-event-tip-left" style={{ background: styles[type].tipBackground }} />}
        {(enter || resizing) && <div className="c7ntest-EventItem-event-tip-right" style={{ background: styles[type].tipBackground }} />}
        <Tooltip getPopupContainer={() => document.getElementsByClassName('c7ntest-EventCalendar-content')[0]} title={tipTitle} placement="topLeft">
          <div className="c7ntest-EventItem-event-title c7ntest-text-dot">
            {title}
          </div>
        </Tooltip>
      </div>,
      <div style={{ flex: lastFlex }} />,
    ];
  }

  /**
   * item改变大小
   * @parameter mode 模式 left或right
   * @parameter multiple 变几个 => 1
   */
  handleItemResize = (mode, multiple) => {
    // console.log(mode, multiple);
    let {
      preFlex, flex, lastFlex,
    } = this.state.initFlex;
    if (mode === 'left') {
      preFlex += multiple;
      flex -= multiple;
    } else {
      flex += multiple;
      lastFlex -= multiple;
    }  
    // 最小为一天
    if (flex > 0 && preFlex >= 0 && lastFlex >= 0) {
      this.setState({
        preFlex,
        flex,
        lastFlex,
        mode,
      });
    }
  }

  handleMouseDown = (mode, e) => {
    e.stopPropagation();
    e.preventDefault();
    // 为自动滚动做准备
    this.prepareForScroll();
    // console.log(this[mode].getBoundingClientRect().left, e.clientX);
    this.setState({
      resizing: true,
      done: false,
      mode,
    });
    const { scroller } = this.autoScroll;
    this.initScrollPosition = {
      x: e.clientX,
      scrollPos: 0,
      scrollLeft: scroller.scrollLeft,
    };
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const {
      scroller,
      scrollLeftPosition,
      scrollRightPosition,
    } = this.autoScroll;
    this.initMouseX = e.clientX;
    if (scrollLeftPosition >= e.clientX) {
      this.startAutoScroll(e.clientX, 'left');
    } else if (scrollRightPosition <= e.clientX) {
      this.startAutoScroll(e.clientX, 'right');
    } else {
      this.stopAutoScroll(e.clientX);
    }

    this.fireResize(e.clientX);
  }

  // 触发item的宽度变化
  fireResize = (clientX) => {
    const { mode } = this.state;
    if (this.initScrollPosition) {
      // resize的变化量
      const { x, scrollPos } = this.initScrollPosition;
      const posX = clientX - this.initScrollPosition.x + scrollPos;
      const { singleWidth } = this.props;
      // console.log(posX, singleWidth / 2);
      // 一个日历日期所占宽度
      if (Math.abs(posX) > (singleWidth / 2)) {
        // 变化的倍数 当达到宽度1/2的倍数的时候触发变化        
        const multiple = Math.round(Math.abs(posX) / (singleWidth / 2));
        // console.log(multiple);
        // 奇数和偶数的不同处理 5=>2  4=>2
        if (multiple % 2 === 0) {
          this.handleItemResize(mode, multiple * (posX > 0 ? 1 : -1) / 2);
        } else {
          this.handleItemResize(mode, (multiple - 1) / 2 * (posX > 0 ? 1 : -1));
        }
      }
    }
  }

  /**
   * 鼠标up将数据初始化
   * 
   * 
   */
  handleMouseUp = (e) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.setState({
      resizing: false,
    });
    const {
      preFlex,
      flex,
      lastFlex,
      initFlex,
    } = this.state;
    // 只在数据变化时才请求
    if (preFlex === initFlex.preFlex && flex === initFlex.flex && lastFlex === initFlex.lastFlex) {
      this.setState({
        done: true,
      });
    } else {
      this.setState({
        initFlex: {
          preFlex,
          flex,
          lastFlex,
        },
      });
      this.updateCycle();
    }
  }

  handleMouseEnter = () => {
    const { type } = this.state;
    const canReasize = canReasizes.includes(type);
    if (canReasize) {
      this.setState({
        enter: true,
      });
    }
  }

  handleMouseLeave = () => {
    const { type } = this.state;
    const canReasize = canReasizes.includes(type);
    if (canReasize) {
      this.setState({
        enter: false,
      });
    }
  }

  /**
   *更新循环或阶段
   *
   * @paramter vary 日期改变量，正
   */
  updateCycle = () => {
    const { preFlex, lastFlex, mode } = this.state;
    const { range, itemRange, data } = this.props;
    const { start, end } = range;
    // console.log(start, end, preFlex, lastFlex);    
    const fromDate = mode === 'left' ? moment(start).add(preFlex, 'days') : moment(data.fromDate);
    const toDate = mode === 'right' ? moment(end).subtract(lastFlex, 'days') : moment(data.toDate);
    // console.log(fromDate.format('LL'), toDate.format('LL'), mode);
    // console.log(this.props.data);
    const updateData = {
      cycleId: data.cycleId,
      parentCycleId: data.parentCycleId,
      type: data.type,
      objectVersionNumber: data.objectVersionNumber,
      fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
      toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
    };
    TestPlanStore.enterLoading();
    editFolder(updateData).then((res) => {
      TestPlanStore.getTree().finally(() => {
        this.setState({
          done: true, // 不在mouseup设置而是延迟设置false,防止旧值闪现
        });
      });
    }).catch((err) => {
      Choerodon.prompt('网络错误');
      TestPlanStore.leaveLoading();
      this.setState({
        done: true, // 不在mouseup设置而是延迟设置false,防止旧值闪现
      });
    });
  }

  render() {
    const { resizing, mode } = this.state;
    return (
      <div style={{ width: '100%', display: 'flex' }} className="c7ntest-EventItem">
        {/* 拖动时，创建一个蒙层来显示拖动效果，防止鼠标指针闪烁 */}
        {resizing && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 9999,
            cursor: 'col-resize',
          }}
          />
        )}
        {this.renderItems()}
      </div>
    );
  }
}

EventItem.propTypes = {

};

export default EventItem;
