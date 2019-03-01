import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import _ from 'lodash';
import './PlanTree.scss';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';
import CloneCycle from '../CloneCycle';
import CloneStage from '../CloneStage';
import AssignBatch from '../AssignBatch';
import { addFolder } from '../../../api/cycleApi';
import PlanTreeTitle from './PlanTreeTitle';
import CreateStage from '../CreateStage';

const { TreeNode } = Tree;

@observer
class PlanTree extends Component {
  state = {
    autoExpandParent: false,
    searchValue: '',
    CreateStageIn: {},
    CreateStageVisible: false,
    currentCloneCycle: null, 
    CloneCycleVisible: false,
    currentCloneStage: null,
    CloneStageVisible: false,
    EditCycleVisible: false,
    AssignBatchShow: false,
    currentEditValue: {},    
  }

  // componentDidUpdate(prevProps, prevState) {
  //   console.log('treeup');
  // }
  
  refresh = () => {
    TestPlanStore.getTree();
  }

  addFolder = (item, e, type) => {
    const { value } = e.target;
    TestPlanStore.enterLoading();    
    addFolder({
      type: 'folder',
      cycleName: value,
      parentCycleId: item.cycleId,
      versionId: item.versionId,
    }).then((data) => {
      if (data.failed) {
        Choerodon.prompt('名字重复');
        TestPlanStore.leaveLoading();
        TestPlanStore.removeAdding();
      } else {
        TestPlanStore.leaveLoading();
        this.refresh();
      }
    }).catch(() => {
      Choerodon.prompt('网络出错');
      TestPlanStore.leaveLoading();
      TestPlanStore.removeAdding();
    });
  }

  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        this.setState({
          currentCloneStage: item,
          CloneStageVisible: true,
        });      
        break;
      }
      case 'ASSIGN_BATCH': {
        this.setState({
          AssignBatchShow: true,
          currentEditValue: item,
        });
        break;
      }
      case 'CLONE_CYCLE': {      
        this.setState({
          currentCloneCycle: item,
          CloneCycleVisible: true,
        });
        break;
      }
      case 'EDIT_CYCLE': {
        this.setState({
          EditCycleVisible: true,
          currentEditValue: item,
        });
        break;
      }
      case 'ADD_FOLDER': {
        this.setState({
          CreateStageIn: item,
          CreateStageVisible: true,
        });
        break;
      }
      default: break;
    }
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')

  renderTreeNodes = data => data.map((item) => {
    const {
      children, key, cycleCaseList, type,
    } = item;
    // debugger;
    const { searchValue } = this.state;
    const expandedKeys = TestPlanStore.getExpandedKeys;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (
      <Icon
        style={{ color: '#3F51B5' }}
        type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
      />
    );
    const title = index > -1 ? (
      <span>
        {beforeStr}
        <span style={{ color: '#f50' }}>{searchValue}</span>
        {afterStr}
      </span>
    ) : <span>{item.title}</span>;
    return (
      <TreeNode
        title={item.versionId
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
  });

  onExpand = (expandedKeys) => {
    TestPlanStore.setExpandedKeys(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  filterCycle = (value) => {
    // window.console.log(value);
    if (value !== '') {
      const expandedKeys = TestPlanStore.dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, TestPlanStore.getTreeData);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
      TestPlanStore.setExpandedKeys(expandedKeys);
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }

  render() {
    const { onClose } = this.props;
    const {
      autoExpandParent, CreateStageVisible, CreateStageIn, AssignBatchShow,
      CloneCycleVisible, currentCloneCycle, CloneStageVisible, currentCloneStage, 
      EditCycleVisible, currentEditValue,
    } = this.state;
    const treeData = TestPlanStore.getTreeData;
    const expandedKeys = TestPlanStore.getExpandedKeys;
    const selectedKeys = TestPlanStore.getSelectedKeys;
    const currentCycle = TestPlanStore.getCurrentCycle;
    return (
      <div className="c7ntest-PlanTree">
        <CloneCycle
          visible={CloneCycleVisible}
          currentCloneCycle={currentCloneCycle}
          onCancel={() => { this.setState({ CloneCycleVisible: false }); }}
          onOk={() => { this.setState({ CloneCycleVisible: false }); this.refresh(); }}
        />
        <CloneStage
          visible={CloneStageVisible}
          currentCloneStage={currentCloneStage}
          onCancel={() => { this.setState({ CloneStageVisible: false }); }}
          onOk={() => { this.setState({ CloneStageVisible: false }); this.refresh(); }}
        />
        <CreateStage
          visible={CreateStageVisible}
          CreateStageIn={CreateStageIn}
          onCancel={() => { this.setState({ CreateStageVisible: false }); }}
          onOk={() => { this.setState({ CreateStageVisible: false }); this.refresh(); }}
        />
        <AssignBatch 
          visible={AssignBatchShow}
          currentEditValue={currentEditValue}
          onCancel={() => { this.setState({ AssignBatchShow: false }); }}
          onOk={() => { this.setState({ AssignBatchShow: false }); this.refresh(); }}
        />
        <div className="c7ntest-PlanTree-treeTop">
          <Input
            prefix={<Icon type="filter_list" style={{ color: 'black' }} />}
            placeholder="过滤"
            style={{ marginTop: 2 }}
            onChange={e => _.debounce(this.filterCycle, 200).call(null, e.target.value)}
          />
          <div
            role="none"
            className="c7ntest-PlanTree-treeTop-button"
            onClick={onClose}
          >
            <Icon type="navigate_before" />
          </div>
        </div>
        
        <div className="c7ntest-PlanTree-tree">          
          <Tree
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            showIcon
            onExpand={this.onExpand}
            onSelect={TestPlanStore.loadCycle}
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
