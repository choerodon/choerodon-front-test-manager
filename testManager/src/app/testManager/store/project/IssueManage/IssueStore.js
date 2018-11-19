/* eslint-disable no-lonely-if */
import {
  observable, action, computed, toJS,
} from 'mobx';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  getIssuesByFolder, getIssuesByIds, getSingleIssues,
  getIssuesByVersion, getAllIssues,
} from '../../../api/IssueManageApi';
import {
  getProjectVersion, getPrioritys, getIssueTypes, getIssueStatus,
} from '../../../api/agileApi';
import IssueTreeStore from './IssueTreeStore';

const { AppState } = stores;


class IssueStore {
  @observable issues = [];

  @observable issueIds = [];

  @observable versions = [];

  @observable prioritys = [];

  @observable issueTypes = [];

  @observable issueStatusList = [];

  @observable selectedVersion = null;

  @observable pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  };

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

  @observable paramName = undefined;

  @observable paramIssueId = undefined;

  @observable barFilters = undefined;

  @observable draggingTableItems = [];

  @observable copy = false;

  @observable tableDraging = false;

  @observable treeShow = false;
  // @observable expand = false;

  // @observable selectedIssue={};

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: {
        // issueTypeId: [18],
        // typeCode: ['issue_test'] 
      },
      searchArgs: {},
    });
    this.setFilteredInfo({});
    // this.loadIssues();
  }

  loadIssues = (page, size = this.pagination.pageSize) => {
    const Page = page === undefined ? this.pagination.current - 1 : Math.max(page, 0);
    this.setLoading(true);
    const { orderField, orderType } = this.order;
    return new Promise((resolve) => {
      getIssueTypes().then((issueTypes) => {
        this.setIssueTypes(issueTypes);
        // 设置测试类型
        const filter = this.getFilter;
        filter.advancedSearchArgs.issueTypeId = issueTypes.map(type => type.id);
        this.setFilter(filter);
        const funcArr = [];
        funcArr.push(getProjectVersion());
        funcArr.push(getPrioritys());
        funcArr.push(getIssueStatus());
        const currentCycle = IssueTreeStore.currentCycle;
        // 树的每一层的类型
        const types = ['all', 'topversion', 'version', 'folder'];
        const type = currentCycle.key ? types[currentCycle.key.split('-').length - 1] : 'allissue';
        const { versionId, cycleId, children } = currentCycle;
        // 不是第一页情况
        if (Page > 0) {
          // 调用
          funcArr.push(getIssuesByIds(versionId, cycleId,
            this.issueIds.slice(size * Page, size * (Page + 1))));
        } else {
          // 第一页 五种情况 地址栏有参数时的优先级为最低
          /**
           * 1.加载所有issue
           * 2.记载某一类型的版本下的issue,例如规划中的版本
           * 3.加载某个版本的issue
           * 4.加载某个文件夹下的issue
           * 5.地址栏有paramIssueId时只取单个issue并打开侧边
           * 
           */
          // 1.加载全部数据
          if ((type === 'all' || type === 'allissue') && !this.paramIssueId) {
            funcArr.push(getAllIssues(Page, size, this.getFilter, orderField, orderType));
          } else if (type === 'topversion') {
            // 2.加载某一类versions
            const versions = children.map(child => child.versionId);      
            funcArr.push(getIssuesByVersion(versions,
              Page, size, this.getFilter, orderField, orderType));
          } else if (type === 'version') {
            // 3.加载单个version
            funcArr.push(getIssuesByVersion([versionId],
              Page, size, this.getFilter, orderField, orderType));
          } else if (type === 'folder') {
            // 4.加载单个folder
            funcArr.push(getIssuesByFolder(cycleId,
              Page, size, this.getFilter, orderField, orderType));
          } else if (this.paramIssueId) {
            // 5.地址栏有url 调用只取这一个issue的方法 这个要放最后
            funcArr.push(getSingleIssues(Page, size, this.getFilter, orderField, orderType));
          }
        }

        Promise.all(funcArr).then(([versions, prioritys, issueStatusList, res]) => {
          this.setVersions(versions);
          this.setPrioritys(prioritys);
          this.setIssueStatusList(issueStatusList);
          if (versions && versions.length > 0) {
            this.selectVersion(versions[0].versionId);
          }
          this.setIssues(res.content);
          if (Page === 0) {
            this.setIssueIds(res.allIdValues || []);
          }
          // 调用ids接口不返回总数
          if (Page > 0) {
            this.setPagination({
              current: Page + 1,
              pageSize: size,
              total: this.pagination.total,
            });
          } else {
            this.setPagination({
              current: res.number + 1,
              pageSize: size,
              total: res.totalElements,
            });
          }
          resolve(res);
          this.setLoading(false);
        });
      });
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

  @action setIssueIds(issueIds) {
    this.issueIds = issueIds;
  }

  @action setVersions(versions) {
    this.versions = versions;
  }

  @action setPrioritys(prioritys) {
    this.prioritys = prioritys;
  }

  @action setIssueTypes(issueTypes) {
    this.issueTypes = issueTypes;
  }

  @action setIssueStatusList(issueStatusList) {
    this.issueStatusList = issueStatusList;
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

  @action setParamName(data) {
    this.paramName = data;
  }

  @action setParamIssueId(data) {
    this.paramIssueId = data;
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
    // console.log('set', draggingTableItems);
    this.draggingTableItems = draggingTableItems;
  }

  @action setTableDraging(flag) {
    this.tableDraging = flag;
  }

  @action setTreeShow(flag) {
    this.treeShow = flag;
  }

  @computed get getIssues() {
    return toJS(this.issues);
  }

  @computed get getVersions() {
    return toJS(this.versions);
  }

  @computed get getPrioritys() {
    return toJS(this.prioritys);
  }

  @computed get getMediumPriority() {
    const priority = _.find(this.prioritys, { default: true });
    if (priority) {
      return priority.id;
    }
    return null;
  }

  @computed get getIssueTypes() {
    return toJS(this.issueTypes);
  }

  @computed get getTestType() {
    const type = _.find(this.issueTypes, { typeCode: 'issue_test' });
    if (type) {
      return type.id;
    }
    return null;
  }

  @computed get getIssueStatus() {
    return toJS(this.issueStatusList);
  }

  @computed get getSeletedVersion() {
    return toJS(this.selectedVersion);
  }

  @computed get getFilter() {
    const filter = this.filter;
    const otherArgs = {
      issueIds: this.paramIssueId ? [Number(this.paramIssueId)] : undefined,
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
export default new IssueStore();
