import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TreeNode from './TreeNode';
import './Tree.scss';

class Tree extends Component {
  render() {
    return (
      <ul>
        {this.props.children}
      </ul>
    );
  }
}

Tree.propTypes = {

};
Tree.TreeNode = TreeNode;
export default Tree;
