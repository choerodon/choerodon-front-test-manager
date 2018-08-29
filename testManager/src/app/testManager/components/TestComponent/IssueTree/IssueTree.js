import React, { Component } from 'react';
import {
  Tree, Input, Icon, Spin, 
} from 'choerodon-ui';
import _ from 'lodash';
import './IssueTree.scss';
import { IssueTreeStore } from '../../../store/project/treeStore';
// import { TreeTitle } from '../../CycleComponent';
import { getCycles, getStatusList } from '../../../api/cycleApi';

const { TreeNode } = Tree;
const dataList = [];
class IssueTree extends Component {
  state = {
    loading: false,
    autoExpandParent: false,
    searchValue: '',
  }

  componentDidMount() {
    this.getTree();
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')

  getTree = () => {
    this.setState({
      loading: true,
    });

    getCycles().then((data) => {
      IssueTreeStore.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);
      this.setState({
        // treeData: [
        //   { title: '所有版本', key: '0', children: data.versions },
        // ],
        loading: false,
      });
      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);

      // window.console.log(dataList);
    });
  }

  renderTreeNodes = data => data.map((item) => {
    const {
      children, key, cycleCaseList, type,
    } = item;
    // debugger;
    const { searchValue } = this.state;
    const expandedKeys = IssueTreeStore.getExpandedKeys;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (
      <Icon
        style={{ color: '#3F51B5' }}
        type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
      />
    );
    if (type === 'CLONE_FOLDER' || type === 'CLONE_CYCLE') {
      return (
        <TreeNode
          title={(
            <div onClick={e => e.stopPropagation()} role="none">
              <Input
                defaultValue={item.title}
                autoFocus
                onBlur={(e) => {
                  this.Clone(item, e, type);
                }}
              />
            </div>
          )}
          icon={icon}
          data={item}
        />);
    } else if (type === 'ADD_FOLDER') {
      return (
        <TreeNode
          title={(
            <div onClick={e => e.stopPropagation()} role="none">
              <Input
                defaultValue={item.title}
                autoFocus
                onBlur={(e) => {
                  this.addFolder(item, e, type);
                }}
              />
            </div>
          )}
          icon={icon}
          data={item}
        />);
    } else if (children) {
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      return (
        <TreeNode
          title={title}           
          key={key}
          data={item}
          showIcon
          icon={icon}
        >
          {this.renderTreeNodes(children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        icon={icon}
        {...item}
        data={item}
      />);
  });

  generateList = (data) => {
    // const temp = data;
    // while (temp) {
    //   dataList = dataList.concat(temp.children);
    //   if()
    // }
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      // 找出url上的cycleId
      // const { cycleId } = getParams(window.location.href);
      // const currentCycle = IssueTreeStore.getCurrentCycle;
      // if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
      //   this.setExpandDefault(node);
      // } else if (currentCycle.cycleId === node.cycleId) {
      //   IssueTreeStore.setCurrentCycle(node);
      // }
      dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }

  onExpand = (expandedKeys) => {
    IssueTreeStore.setExpandedKeys(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  filterCycle = (value) => {
    // window.console.log(value);
    if (value !== '') {
      const expandedKeys = dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, IssueTreeStore.getTreeData);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
      IssueTreeStore.setExpandedKeys(expandedKeys);
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }

  render() {
    const { onClose } = this.props;
    const { autoExpandParent, loading } = this.state;
    const treeData = IssueTreeStore.getTreeData;
    const expandedKeys = IssueTreeStore.getExpandedKeys;
    const selectedKeys = IssueTreeStore.getSelectedKeys;
    const currentCycle = IssueTreeStore.getCurrentCycle;
    return (
      <Spin spinning={loading}>      
        <div className="c7n-IssueTree">
          <div className="c7n-treeTop">
            <Input
              prefix={<Icon type="filter_list" style={{ color: 'black' }} />} 
              placeholder="过滤"
              style={{ marginTop: 2 }} 
              onChange={e => _.debounce(this.filterCycle, 200).call(null, e.target.value)}
            />
            <Icon type="close" className="c7n-pointer" onClick={onClose} />
          </div>
          <Tree
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            showIcon
            onExpand={this.onExpand}
            onSelect={this.loadCycle}
            autoExpandParent={autoExpandParent}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        </div>
      </Spin>
    );
  }
}

IssueTree.propTypes = {

};

export default IssueTree;
