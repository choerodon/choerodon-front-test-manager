import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import './Tree.scss';

const { TreeNode } = Tree;
class MyTree extends Component {
  render() {
    return (
      <Tree
        className="c7ntest-tree"
        {...this.props}
      />
    );
  }
}
MyTree.TreeNode = TreeNode;
export default MyTree;
