import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import { loadIssues, loadVersions, getIssuesByFolder } from '../../../api/IssueApi';
import IssueTreeStore from '../treeStore/IssueTreeStore';

const { AppState } = stores;

@store('SprintCommonStore')
class SprintCommonStore {
  @observable issues = [];

  @observable versions = [];

  @observable selectedVersion = null;

  @observable pagination = {};

  @observable filter = {
    advancedSearchArgs: {},
    searchArgs: {},
  };

  @observable filteredInfo = {};

  @observable order = {
    orderField: '',
    orderType: '',
  };

  @observable loading = true;

  @observable paramType = undefined;

  @observable paramId = undefined;

  @observable paramName = undefined;

  @observable paramStatus = undefined;

  @observable paramIssueId = undefined;

  @observable paramUrl = undefined;

  @observable barFilters = undefined;

  @observable draggingTableItems = [];

  @observable copy = false;

  @observable tableDraging = false;
  // @observable expand = false;

  // @observable selectedIssue={};

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: { typeCode: ['issue_test'] },
      searchArgs: {},
    });
    this.setFilteredInfo({});
    // this.loadIssues();
  }

  loadIssues = (page = 0, size = 10) => {
    this.setLoading(true);
    const { orderField, orderType } = this.order;
    const funcArr = [];
    funcArr.push(loadVersions());
    if (IssueTreeStore.currentCycle.cycleId) {
      funcArr.push(getIssuesByFolder(IssueTreeStore.currentCycle.cycleId, 
        page, size, this.getFilter, orderField, orderType));
    } else {
      funcArr.push(loadIssues(page, size, this.getFilter, orderField, orderType));
    }
    Promise.all(funcArr).then(([versions, res]) => {
      this.setVersions(versions);
      if (versions && versions.length > 0) {
        this.selectVersion(versions[0].versionId);
      }
      this.setIssues(res.content);
      this.setPagination({
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      });
      this.setLoading(false);
      return Promise.resolve(res);
    });
  }

  createIssue(issueObj, projectId = AppState.currentMenuType.id) {
    const issue = {
      projectId: AppState.currentMenuType.id,
      ...issueObj,
    };
    return axios.post(`/agile/v1/projects/${projectId}/issue`, issue);
  }

  @action setIssues(data) {
    this.issues = data;
  }

  @action setVersions(versions) {
    this.versions = versions;
  }

  @action selectVersion(selectedVersion) {
    this.selectedVersion = selectedVersion;
  }

  @action setPagination(data) {
    this.pagination = data;
  }

  @action setFilter(data) {
    this.filter = data;
  }

  @action setFilteredInfo(data) {
    this.filteredInfo = data;
  }

  @action setOrder(data) {
    this.order = data;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @action setParamType(data) {
    this.paramType = data;
  }

  @action setParamId(data) {
    this.paramId = data;
  }

  @action setParamName(data) {
    this.paramName = data;
  }

  @action setParamStatus(data) {
    this.paramStatus = data;
  }

  @action setParamIssueId(data) {
    this.paramIssueId = data;
  }

  @action setParamUrl(data) {
    this.paramUrl = data;
  }

  @action setBarFilters(data) {
    this.barFilters = data;
  }

  @action setCopy(flag) {
    this.copy = flag;
  }

  @action setExpand(flag) {
    this.expand = this.expand;
  }

  @action setSelectedIssue(selectedIssue) {
    this.selectedIssue = selectedIssue;
  }

  @action setDraggingTableItems(draggingTableItems) {
    console.log('set', draggingTableItems);
    this.draggingTableItems = draggingTableItems;
  }

  @action setTableDraging(flag) {
    this.tableDraging = flag;
  }

  @computed get getIssues() {
    return toJS(this.issues);
  }

  @computed get getVersions() {
    return toJS(this.versions);
  }

  @computed get getSeletedVersion() {
    return toJS(this.selectedVersion);
  }

  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramUrl) {
      return undefined;
    } else {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    }
  }

  @computed get getFilter() {
    const filter = this.filter;
    const otherArgs = {
      type: this.paramType,
      id: this.paramId ? [this.paramId] : undefined,
      issueIds: this.paramIssueId ? [this.paramIssueId] : undefined,
    };
    return {
      ...filter,
      otherArgs: this.barFilters ? otherArgs : undefined,
    };
  }

  @computed get getDraggingTableItems() {
    return toJS(this.draggingTableItems);
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
