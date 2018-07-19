import axios from 'axios';
import { observable, action, computed, toJS } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('BacklogStore')
class BacklogStore {
  @observable treeData = [
    { title: '所有版本', key: '0' },
  ]

  axiosGetColorLookupValue() {
    return axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/lookup_values/epic_color`);
  }

  @computed get getTreeData() {
    return toJS(this.treeData);
  }

  @action setTreeData(treeData) {
    this.treeData = treeData;
  }
}

const backlogStore = new BacklogStore();
export default backlogStore;
