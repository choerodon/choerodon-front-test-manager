import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import './PlanTree.scss';

class PlanTree extends Component {
  render() {
    const { onClose } = this.props;
    return (
      <div className="c7n-PlanTree">
        <div className="c7n-PlanTree-treeTop">
          <Input prefix={<Icon type="filter_list" style={{ color: 'black' }} />} placeholder="过滤" style={{ marginTop: 2 }} />
          <div
            role="none"
            className="c7n-PlanTree-treeTop-button"
            onClick={onClose}
          >
            <Icon type="navigate_before" />
          </div>         
        </div>
        <Tree
          // selectedKeys={selectedKeys}
          // expandedKeys={expandedKeys}
          showIcon
        // onExpand={this.onExpand}
        // onSelect={this.loadCycle}
        // autoExpandParent={autoExpandParent}
        >
          {/* {this.renderTreeNodes(treeData)} */}
        </Tree>
      </div>
    );
  }
}

PlanTree.propTypes = {

};

export default PlanTree;
