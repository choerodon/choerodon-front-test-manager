import axios from 'axios';
import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';
import { getCycles } from '../../../api/cycleApi';

const { AppState } = stores;

@store('IssueTreeStore')
class IssueTreeStore {
  @observable treeData = [
    {
      title: '所有版本',
      key: '0',
      children: [
        // {
        //   title: '1.0.1',
        //   key: '0-0',
        //   versionId: 1,
        //   children: [{
        //     cycleId: 1,
        //     versionId: 1,
        //     type: 'cycle',
        //     title: '1.0.1',
        //     key: '0-0-0',
        //   }],
        // }, {
        //   title: '1.1.0',
        //   key: '0-1',
        //   versionId: 1,
        //   children: [{
        //     cycleId: 2,
        //     versionId: 1,
        //     type: 'cycle',
        //     title: '1.0.1',
        //     key: '0-1-0',
        //   }],
        // },
      ],
    },
  ]

  @observable expandedKeys = ['0'];

  @observable selectedKeys = [];

  @observable addingParent = null;

  @observable currentCycle = {};

  @observable draggingFolder = null;

  @observable isCopy = false;

  @computed get getTreeData() {
    return toJS(this.treeData);
  }

  @computed get getExpandedKeys() {
    return toJS(this.expandedKeys);
  }

  @computed get getSelectedKeys() {
    return toJS(this.selectedKeys);
  }

  @computed get getCurrentCycle() {
    return toJS(this.currentCycle);
  }

  @action setExpandedKeys(expandedKeys) {
    // window.console.log(expandedKeys);
    this.expandedKeys = expandedKeys;
  }

  @action setSelectedKeys(selectedKeys) {
    this.selectedKeys = selectedKeys;
  }

  @action setTreeData(treeData) {
    this.treeData = treeData;
  }

  @action setCurrentCycle(currentCycle) {
    this.currentCycle = currentCycle;
  }

  @action removeAdding = () => {
    this.addingParent.children.shift();
    // this.setTreeData()
  }

  @action addItemByParentKey = (key, item) => {
    const arr = key.split('-');
    let temp = this.treeData;
    arr.forEach((index, i) => {
      // window.console.log(temp);
      if (i === 0) {
        temp = temp[index];
      } else {
        temp = temp.children[index];
      }
    });
    // 添加测试
    temp.children.unshift(item);
    this.addingParent = temp;
    // window.console.log({ ...item, ...{ key: `${key}-add'`, type: 'add' } });
  }

  @action setCopy = (isCopy) => {
    this.isCopy = isCopy;
  }
}

const issueTreeStore = new IssueTreeStore();
export default issueTreeStore;
