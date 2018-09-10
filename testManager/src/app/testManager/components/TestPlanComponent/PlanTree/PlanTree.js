import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import _ from 'lodash';
import './PlanTree.scss';
import { TestPlanTreeStore } from '../../../store/project/treeStore';
import {
  getCycles, deleteExecute, getCycleById, editCycleExecute,
  clone, addFolder, getStatusList, exportCycle,
} from '../../../api/cycleApi';
import PlanTreeTitle from './PlanTreeTitle';
import CreateStage from '../CreateStage';

const { TreeNode } = Tree;
const dataList = [];
@observer
class PlanTree extends Component {
  state = {
    loading: false,
    autoExpandParent: false,
    searchValue: '',
    CreateStageIn: {},
    CreateStageVisible: false,
  }

  componentDidMount() {
    this.getTree();
  }

  addFolder = (item, e, type) => {
    const { value } = e.target;
    this.setState({
      loading: true,
    });
    // window.console.log(this.state.currentCycle);

    addFolder({
      type: 'folder',
      cycleName: value,
      parentCycleId: item.cycleId,
      versionId: item.versionId,
    }).then((data) => {
      if (data.failed) {
        Choerodon.prompt('名字重复');
        this.setState({
          loading: false,
        });
        TestPlanTreeStore.removeAdding();
      } else {
        this.setState({
          loading: false,
        });
        this.refresh();
      }
    }).catch(() => {
      Choerodon.prompt('网络出错');
      this.setState({
        loading: false,
      });
      TestPlanTreeStore.removeAdding();
    });
  }

  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        const parentKey = this.getParentKey(item.key, TestPlanTreeStore.getTreeData);
        TestPlanTreeStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
        break;
      }

      case 'ADD_FOLDER': {
        this.setState({
          CreateStageIn: item,
          CreateStageVisible: true,
        });
        // 自动展开当前项
        
        break;
      }
      default: break;
    }
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')

  getTree = () => {
    this.setState({
      loading: true,
    });
    getStatusList('CYCLE_CASE').then((statusList) => {
      this.setState({ statusList });
    });
    getCycles().then((data) => {
      TestPlanTreeStore.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);
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

    // 如果选中了项，就刷新table数据
    const currentCycle = TestPlanTreeStore.getCurrentCycle;
    const selectedKeys = TestPlanTreeStore.getSelectedKeys;
    if (currentCycle.cycleId) {
      this.loadCycle(selectedKeys, { node: { props: { data: currentCycle } } }, true);
    }
  }

  renderTreeNodes = data => data.map((item) => {
    const {
      children, key, cycleCaseList, type,
    } = item;
    // debugger;
    const { searchValue } = this.state;
    const expandedKeys = TestPlanTreeStore.getExpandedKeys;
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
          title={item.cycleId
            ? (
              <PlanTreeTitle
                statusList={this.state.statusList}
                refresh={this.refresh}
                callback={this.callback}
                text={item.title}
                key={key}
                data={item}
                title={title}
                processBar={cycleCaseList}
              />
            ) : title}
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
      // const currentCycle = TestPlanTreeStore.getCurrentCycle;
      // if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
      //   this.setExpandDefault(node);
      // } else if (currentCycle.cycleId === node.cycleId) {
      //   TestPlanTreeStore.setCurrentCycle(node);
      // }
      dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }

  onExpand = (expandedKeys) => {
    TestPlanTreeStore.setExpandedKeys(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  filterCycle = (value) => {
    // window.console.log(value);
    if (value !== '') {
      const expandedKeys = dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, TestPlanTreeStore.getTreeData);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
      TestPlanTreeStore.setExpandedKeys(expandedKeys);
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }

  getIssuesByFolder = (selectedKeys, {
    selected, selectedNodes, node, event,
  } = {}) => {
    if (selectedKeys) {
      TestPlanTreeStore.setSelectedKeys(selectedKeys);
    }
    // const { executePagination, filters } = this.state;
    // const data = node.props.data;
    // // console.log(data);
    // if (data.cycleId) {
    //   TestPlanTreeStore.setCurrentCycle(data);
    //   IssueStore.loadIssues();
    // }
  }

  render() {
    const { onClose, onSelect } = this.props;
    const {
      autoExpandParent, loading, dragingElement, dragingTreeData, ctrlKey, CreateStageVisible, CreateStageIn,
    } = this.state;
    const treeData = TestPlanTreeStore.getTreeData;
    const expandedKeys = TestPlanTreeStore.getExpandedKeys;
    const selectedKeys = TestPlanTreeStore.getSelectedKeys;
    const currentCycle = TestPlanTreeStore.getCurrentCycle;
    return (
      <div className="c7n-PlanTree">
        <CreateStage
          visible={CreateStageVisible}
          CreateStageIn={CreateStageIn} 
          onCancel={() => { this.setState({ CreateStageVisible: false }); }}
          onOk={() => { this.setState({ CreateStageVisible: false }); this.refresh(); }} 
        />
        <div className="c7n-PlanTree-treeTop">
          <Input
            prefix={<Icon type="filter_list" style={{ color: 'black' }} />}
            placeholder="过滤"
            style={{ marginTop: 2 }}
            onChange={e => _.debounce(this.filterCycle, 200).call(null, e.target.value)}
          />
          <div
            role="none"
            className="c7n-PlanTree-treeTop-button"
            onClick={onClose}
          >
            <Icon type="navigate_before" />
          </div>
        </div>
        <div className="c7n-PlanTree-tree">
          <Tree
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            showIcon
            onExpand={this.onExpand}
            onSelect={onSelect}
            autoExpandParent={autoExpandParent}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        </div>
      </div>
    );
  }
}

PlanTree.propTypes = {

};

export default PlanTree;
