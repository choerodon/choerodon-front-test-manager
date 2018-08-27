import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import './SearchTree.scss';

class SearchTree extends Component {
  render() {
    const { onClose } = this.props;
    return (
      <div className="c7n-SearchTree">
        <div className="c7n-treeTop">
          <Input prefix={<Icon type="filter_list" style={{ color: 'black' }} />} placeholder="过滤" style={{ marginTop: 2 }} />
          <Icon type="close" className="c7n-pointer" onClick={onClose} />
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

SearchTree.propTypes = {

};

export default SearchTree;
