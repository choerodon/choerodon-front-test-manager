
import {
  observable, action, computed, toJS, 
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  getCycle, getCycleDetails, getStatusList, getCycleHistiorys, 
} from '../../../api/CycleExecuteApi';
import { getUsers } from '../../../api/CommonApi';
import { getIssueList, getIssuesForDefects } from '../../../api/agileApi';

const { AppState } = stores;

@store('CycleExecuteStore')
class CycleExecuteStore {
  @observable id = null;

  @observable issueList = [];

  @observable loading = false;

  @observable edit = false;

  @observable selectLoading = false;

  @observable editVisible = false;

  @observable editing = null;

  @observable userList = [];

  // 用户列表
  @observable statusList = [];

  // 状态列表
  @observable stepStatusList = [];

  @observable detailList = [];

  @observable detailPagination = {
    current: 1,
    total: 0,
    pageSize: 5,
  };

  @observable historyList = [];

  @observable historyPagination = {
    current: 1,
    total: 0,
    pageSize: 5,
  };

  @observable cycleData = {
    caseAttachment: [], //
    defects: [], // 缺陷
  };
  // constructor() {

  // }
  getInfo = (id = this.id) => {
    this.enterloading();
    this.setId(id);
    const historyPagination = this.historyPagination;
    const detailPagination = this.detailPagination;
    Promise.all([
      getCycle(id),
      getStatusList('CYCLE_CASE'),
      getCycleDetails({ page: detailPagination.current - 1, size: detailPagination.pageSize }, id),
      getStatusList('CASE_STEP'),
      getCycleHistiorys({
        page: historyPagination.current - 1,
        size: historyPagination.pageSize,
      }, id),
      getIssuesForDefects(),
    ])
      .then(([cycleData, statusList, detailData, stepStatusList, historyData, issueData]) => {      
        this.setCycleData(cycleData);
        this.setStatusList(statusList);
        this.setDetailList(detailData.content);
        this.setDetailPagination({
          current: detailPagination.current,
          pageSize: detailPagination.pageSize,
          total: detailData.totalElements,
        });
        this.setStepStatusList(stepStatusList);
        this.setHistoryPagination({
          current: historyPagination.current,
          pageSize: historyPagination.pageSize,
          total: historyData.totalElements,
        });
        this.setHistoryList(historyData.content);
        this.setIssueList(issueData.content);
        this.unloading();   
      }).catch((error) => {
        Choerodon.prompt('网络异常');
        this.unloading();
      });
  }

  loadHistoryList=(pagination = this.historyPagination) => {
    const id = this.id;
    this.enterloading();
    getCycleHistiorys({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, id).then((history) => {
      this.setHistoryPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: history.totalElements,
      });
      this.setHistoryList(history.content);
      this.unloading();
    });
  }

  loadDetailList=(pagination = this.detailPagination) => {
    const id = this.id;
    this.enterloading();
    getCycleDetails({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, id).then((detail) => {
      this.setDetailPagination({
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: detail.totalElements,
      });
      this.setDetailList(detail.content);
      this.unloading();
    });
  }

  loadIssueList=(value) => {
    this.selectEnterLoading();
    // 加载不含测试类型的issue
    getIssuesForDefects(value).then((issueData) => {
      this.setIssueList(issueData.content);
      this.selectUnLoading();
    });
  }

  loadUserList=(value) => {
    this.selectEnterLoading();
    getUsers(value).then((userData) => {
      this.setUserList(userData.content);     
      this.selectUnLoading();
    });
    getIssueList(value).then((issueData) => {
      this.setIssueList(issueData.content);
      this.selectUnLoading();
    });
  }

  @computed get getLoading() {
    return this.loading;
  }

  @computed get getHistoryPagination() {
    return toJS(this.historyPagination);
  }

  @computed get getDetailPagination() {
    return toJS(this.detailPagination);
  }

  @computed get getCycleData() {
    return toJS(this.cycleData);
  }

  @computed get getHistoryList() {
    return toJS(this.historyList);
  }

  @computed get getDetailList() {
    return toJS(this.detailList);
  }

  @computed get getStatusList() {
    return toJS(this.statusList);
  }

  @computed get getStepStatusList() {
    return toJS(this.stepStatusList);
  }

  @computed get getIssueList() {
    return toJS(this.issueList);
  }

  @computed get getUserList() {
    return toJS(this.userList);
  }

  @computed get getFileList() {
    return this.cycleData.caseAttachment.map((attachment) => {
      const { url, attachmentName } = attachment;
      return {
        uid: attachment.id,
        name: attachmentName,
        status: 'done',
        url,
      };
    });
  }

  @computed get getDefectIds() {
    return this.cycleData.defects.map(defect => defect.issueId.toString());
  }

  getStatusById=(status) => {
    const statusId = Number(status);
    return {
      statusName: _.find(this.statusList, { statusId })
        && _.find(this.statusList, { statusId }).statusName,
      statusColor:
        _.find(this.statusList, { statusId })
        && _.find(this.statusList, { statusId }).statusColor,
    };
  }

  @computed get getStepStatusById() {
    return this.cycleData.defects.map(defect => defect.issueId.toString());
  }

  // set
  @action setId=(id) => {
    this.id = id;
  }

  @action setCycleData=(cycleData) => {
    // window.console.log(cycleData, 'set');
    this.cycleData = cycleData;
  }

  @action setStatusList=(statusList) => {
    this.statusList = statusList;
  }

  @action setStepStatusList=(stepStatusList) => {
    this.stepStatusList = stepStatusList;
  }

  @action setIssueList=(issueList) => {
    this.issueList = issueList;
  }

  @action setUserList=(userList) => {
    this.userList = userList;
  }

  @action setHistoryPagination=(historyPagination) => {
    this.historyPagination = historyPagination;
  }

  @action setDetailPagination=(detailPagination) => {
    this.detailPagination = detailPagination;
  }

  @action setHistoryList=(historyList) => {
    this.historyList = historyList;
  }

  @action setDetailList=(detailList) => {
    this.detailList = detailList;
  }

  @action selectEnterLoading=() => {
    this.selectLoading = true;
  }

  @action selectUnLoading=() => {
    this.selectLoading = false;
  }

  @action enterloading=() => {
    this.loading = true;
  }

  @action unloading=() => {
    this.loading = false;
  }

  // handleHistoryTableChange = (pagination, filters, sorter) => {
  //   this.LoadHistoryList(pagination);
  // }
  // handleDetailTableChange = (pagination, filters, sorter) => {
  //   this.LoadDetailList(pagination);
  // }
}

const cycleExecuteStore = new CycleExecuteStore();
export default cycleExecuteStore;
