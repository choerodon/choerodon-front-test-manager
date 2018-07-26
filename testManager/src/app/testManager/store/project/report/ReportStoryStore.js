import { observable, action, computed, toJS } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

@store('ReportStoryStore')
class ReportStoryStore {
  @observable statusList = [];
  @observable stepStatusList= [];
  @observable openId= {}; 
  @computed get getStatusList() {
    return toJS(this.statusList);
  }
  @computed get getStepStatusList() {
    return toJS(this.stepStatusList);
  }
  @computed get getOpenId() {
    return toJS(this.openId);
  }
  @action setStatusList(statusList) {
    this.statusList = statusList;
  }
  @action setStepStatusList(stepStatusList) {
    this.stepStatusList = stepStatusList;
  }
  @action setOpenId(openId) {
    this.openId = openId;
  }
}

const reportStoryStore = new ReportStoryStore();
export default reportStoryStore;
