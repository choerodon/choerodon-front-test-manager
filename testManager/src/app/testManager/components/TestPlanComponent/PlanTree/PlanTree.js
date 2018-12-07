import React, { Component } from 'react';
import { Tree, Input, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import './PlanTree.scss';
import FileSaver from 'file-saver';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';
import CloneCycle from '../CloneCycle';
import CloneStage from '../CloneStage';
import AssignBatch from '../AssignBatch';
import {  
  clone, addFolder, exportCycle, 
} from '../../../api/cycleApi';
import PlanTreeTitle from './PlanTreeTitle';
import CreateStage from '../CreateStage';

const { AppState } = stores;
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

  componentDidMount() {
    // this.getTree();
  }

  refresh = () => {
    TestPlanStore.getTree();
  }

  addFolder = (item, e, type) => {
    const { value } = e.target;
    TestPlanStore.enterLoading();
    // window.console.log(this.state.currentCycle);

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
        // const parentKey = this.getParentKey(item.key, TestPlanStore.getTreeData);
        // TestPlanStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
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
        // const parentKey = this.getParentKey(item.key, TestExecuteStore.getTreeData);
        // TestExecuteStore.addItemByParentKey(parentKey, 
        // { ...item, ...{ key: `${parentKey}-CLONE_CYCLE`, type: 'CLONE_CYCLE' } });
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
        // 自动展开当前项

        break;
      }
      case 'EXPORT_CYCLE': {
        exportCycle(item.cycleId).then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const fileName = `${AppState.currentMenuType.name}.xlsx`;
          FileSaver.saveAs(blob, fileName);
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
    // if (type === 'CLONE_FOLDER' || type === 'CLONE_CYCLE') {
    //   return (
    //     <TreeNode
    //       title={(
    //         <div onClick={e => e.stopPropagation()} role="none">
    //           <Input
    //             defaultValue={item.title}
    //             autoFocus
    //             onBlur={(e) => {
    //               this.Clone(item, e, type);
    //             }}
    //           />
    //         </div>
    //       )}
    //       icon={icon}
    //       data={item}
    //     />);
    // } else 
    if (type === 'ADD_FOLDER') {
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
    }
    return (
      <TreeNode
        icon={icon}
        {...item}
        data={item}
      />);
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


  // Clone = (item, e, type) => {
  //   const { value } = e.target;
  //   // window.console.log(item, value);
  //   // e.target.focus();
  //   if (value === item.title) {
  //     Choerodon.prompt('请更改名字');
  //     TestPlanStore.removeAdding();
  //   } else {
  //     TestPlanStore.enterLoading();
  //     clone(item.cycleId, { cycleName: value }, type).then((data) => {
  //       TestPlanStore.leaveLoading();
  //       if (data.failed) {
  //         Choerodon.prompt('名字重复');
  //         TestPlanStore.removeAdding();
  //       } else {
  //         this.refresh();
  //       }
  //     }).catch(() => {
  //       Choerodon.prompt('网络出错');
  //       TestPlanStore.leaveLoading();
  //       TestPlanStore.removeAdding();
  //     });
  //   }
  // }

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
