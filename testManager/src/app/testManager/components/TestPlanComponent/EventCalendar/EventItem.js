import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Tooltip } from 'choerodon-ui';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';
import { editFolder } from '../../../api/cycleApi';
import './EventItem.scss';

const styles = {
  topversion: {
    borderTop: '4px solid #3F51B5',
    background: '#E8ECFC',
    color: '#3F51B5',
  },
  version: {
    borderTop: '4px solid #FFB100',
    background: '#FFF8E7',
    color: '#FFB100',
  },
  cycle: {
    borderTop: '4px solid #00BFA5',
    background: '#E5F9F6',
    color: '#00BFA5',
  },
  folder: {
    // borderTop: '4px solid #3F51B5',
    background: '#E9F1FF',
    color: '#4D90FE',
    lineHeight: '34px',
  },
};
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
  };

  static getDerivedStateFromProps(props, state) {
    // 调整大小时以state为准
    if (state.resizing) {
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
      type, title, preFlex, flex, lastFlex,
    } = this.state;
    return [
      <div style={{ flex: preFlex }} />,
      <div
        role="none"
        onClick={this.handleItemClick}
        className="c7ntest-EventItem-event"
        style={{
          flex,
          // display: flex === 0 && 'none',
          ...styles[type],
        }}
      >
        <Tooltip title={title} placement="topLeft">
          <div className="c7ntest-EventItem-event-title c7ntest-text-dot">
            <div className="c7ntest-EventItem-event-title-resizer-left" onMouseDown={this.handleMouseDown.bind(this, 'left')} ref={this.saveRef('left')} role="none" />
            {title}
            <div className="c7ntest-EventItem-event-title-resizer-right" onMouseDown={this.handleMouseDown.bind(this, 'right')} ref={this.saveRef('right')} role="none" />
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
    if (flex > 0) {
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
    // console.log(this[mode].getBoundingClientRect().left, e.clientX);
    this.setState({
      resizing: true,
      mode,
    });
    this.initScrollPosition = {
      x: e.clientX,
    };
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const { mode } = this.state;
    if (this.initScrollPosition) {
      // resize的变化量
      const posX = e.clientX - this.initScrollPosition.x;
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
    const {
      preFlex,
      flex,
      lastFlex,
      initFlex,
    } = this.state;
    this.setState({    
      initFlex: {
        preFlex,
        flex,
        lastFlex,
      },
    });
    this.updateCycle();
  }

  /**
   *更新循环或阶段
   *
   * @paramter vary 日期改变量，正
   */
  updateCycle=() => {
    const { preFlex, lastFlex, mode } = this.state;
    const { range, itemRange, data } = this.props;
    const { start, end } = range;
    console.log(start, end, preFlex, lastFlex);    
    const fromDate = mode === 'left' ? moment(start).add(preFlex, 'days') : moment(data.fromDate);
    const toDate = mode === 'right' ? moment(end).subtract(lastFlex, 'days') : moment(data.toDate);
    console.log(fromDate.format('LL'), toDate.format('LL'), mode);
    console.log(this.props.data);
    const updateData = {
      cycleId: data.cycleId,
      type: 'cycle',
      fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
      toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
    };    
    editFolder(updateData).then((res) => {
      TestPlanStore.getTree().finally(() => {
        this.setState({
          resizing: false, // 不在mouseup设置而是延迟设置false,防止旧值闪现
        });
      });
    }).catch((err) => {
      Choerodon.prompt('网络错误');
      this.setState({
        resizing: false, // 不在mouseup设置而是延迟设置false,防止旧值闪现
      });
    });
  }

  render() {
    const { resizing } = this.state;
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
            cursor: 'e-resize',
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
