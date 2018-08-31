import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'choerodon-ui';

class TreeNode extends Component {
  state = {
    expand: false,
  }

  handleExpand = () => {
    const { expand } = this.state;
    if (!this.props.children) {
      return;
    }
    this.setState({
      expand: !expand,
    });
  }

  renderChildren = () => {
    const { expand } = this.state;
    const { children, title, icon } = this.props;
    return (
      children && children.length > 0 ? (
        <div>
          <div role="none" className="menu-item" onClick={this.handleExpand}>            
            <Icon type="baseline-arrow_right" className={expand ? 'toggler toggled' : 'toggler'} />
            {icon}
            {title}
          </div>
          <div className={expand ? 'collapsible-wrapper' : 'collapsible-wrapper collapsed'}>
            {children ? (
              <ul className="collapsible" ref={(node) => { this.node = node; }}>
                {children}
              </ul>
            ) : null}
          </div>
        </div>
      )
        : (
          <div className="menu-item">
            {icon}
            {title}
          </div>
        )
    );
  };

  render() {
    return (
      <li>
        {this.renderChildren()}
      </li>
    );
  }
}

TreeNode.propTypes = {

};

export default TreeNode;
