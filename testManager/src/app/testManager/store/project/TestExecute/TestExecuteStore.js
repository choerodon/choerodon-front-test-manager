import {
  observable, action, computed, toJS,
} from 'mobx';
import { stores } from 'choerodon-front-boot';

import { BaseTreeProto } from '../prototype';

const { AppState } = stores;
class TestExecuteStore extends BaseTreeProto {
  @observable leftVisible = true;

  @observable treeAssignedTo = AppState.userInfo.id;

  @action setLeftVisible(leftVisible) {
    this.leftVisible = leftVisible;
  }

  @action setTreeAssignedTo(treeAssignedTo) {
    this.treeAssignedTo = treeAssignedTo;
  }
}

export default new TestExecuteStore();
