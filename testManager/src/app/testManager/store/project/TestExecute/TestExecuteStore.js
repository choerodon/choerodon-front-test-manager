import {
  observable, action, computed, toJS,
} from 'mobx';
import { stores } from 'choerodon-front-boot';

import { BaseTreeProto } from '../prototype';
import { getProjectId } from '../../../common/utils';

const { AppState } = stores;
class TestExecuteStore extends BaseTreeProto {
  @observable leftVisible = true;

  @observable preProjectId = getProjectId();

  @observable executePagination = {
    current: 1,
    total: 0,
    pageSize: 5,
  };

  @observable treeAssignedTo = 0;

  @action setLeftVisible(leftVisible) {
    this.leftVisible = leftVisible;
  }

  @action setExecutePagination(executePagination) {
    this.executePagination = { ...this.executePagination, ...executePagination };
  }

  @action setTreeAssignedTo(treeAssignedTo) {
    this.treeAssignedTo = treeAssignedTo;
  }

  @action setPreProjectId(projectId) {
    this.preProjectId = projectId;
  }

  @computed get getExecutePagination() {
    return toJS(this.executePagination);
  }
}

export default new TestExecuteStore();
