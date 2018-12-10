import React, { Component } from 'react';
import { Tooltip } from 'choerodon-ui';
import PropTypes from 'prop-types';

const defaultStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
class SmartTooltip extends Component {
  state = {
    overflow: false,
  }

  static defaultProps = {
    style: {},
    placement: 'topLeft',
  };

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // if (this.state.overflow !== prevState.overflow) {
    if (this.container) {
      const { scrollWidth, clientWidth } = this.container;
      const isOverflow = scrollWidth > clientWidth;
      return isOverflow;
    }
    return false;
      
   
    // }
  }

  componentDidUpdate(prevProps, prevState, isOverflow) {
    if (this.state.overflow !== isOverflow) {
      this.setState({
        overflow: isOverflow,
      });
    }
  }
  
  saveRef = name => (ref) => {
    this[name] = ref;
  }

  renderContent = () => {
    const {
      title, children, style, width, placement,
    } = this.props;
    const { overflow } = this.state;
    const dom = <div style={{ ...defaultStyle, ...style, width }} ref={this.saveRef('container')}>{children}</div>;
    return overflow
      ? (
        <Tooltip placement={placement} title={title || children}>
          {dom}
        </Tooltip>
      )
      : dom;
  }

  render() {
    return this.renderContent();
  }
}

SmartTooltip.propTypes = {

};

export default SmartTooltip;
