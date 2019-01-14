import {
  observable, action, computed, toJS,
} from 'mobx';
import { stores } from 'choerodon-front-boot';

import { BaseTreeProto } from '../prototype';

const { AppState } = stores;
class TestExecuteStore extends BaseTreeProto {
  @observable leftVisible = true;

  @observable executePagination = {
    current: 1,
    total: 0,
    pageSize: 30,
  };

  @observable treeAssignedTo = 0;

  @action clearStore = () => {
    this.treeAssignedTo = 0;
    this.leftVisible = true;    
    this.executePagination = {
      current: 1,
      total: 0,
      pageSize: 30,
    };
    this.treeData = [
      {
        title: '所有版本',
        key: '0',
        children: [],
      },
    ];  
    this.expandedKeys = ['0'];  
    this.selectedKeys = [];  
    this.addingParent = null;  
    this.currentCycle = {};  
    this.preCycle = {};
  }

  @action setLeftVisible(leftVisible) {
    this.leftVisible = leftVisible;
  }

  @action setExecutePagination(executePagination) {
    this.executePagination = { ...this.executePagination, ...executePagination };
  }

  @action setTreeAssignedTo(treeAssignedTo) {
    this.treeAssignedTo = treeAssignedTo;
  }


  @computed get getExecutePagination() {
    return toJS(this.executePagination);
  }
}

export default new TestExecuteStore();
