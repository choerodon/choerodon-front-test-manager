import {
  observable, action, computed, toJS,
} from 'mobx';
import { stores, axios } from 'choerodon-front-boot';
import {
  loadVersions, getIssuesByFolder, getIssuesByIds, getSingleIssues,
  getIssuesByVersion, getAllIssues,
} from '../../../api/IssueManageApi';
import IssueTreeStore from './IssueTreeStore';

const { AppState } = stores;


class IssueStore {
  @observable issues = [];

  @observable issueIds = [];

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

  @observable treeShow = false;
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

  loadIssues = (page, size = 10) => {
    page = isNaN(page) ? 0 : page;
    this.setLoading(true);
    const { orderField, orderType } = this.order;
    const funcArr = [];
    funcArr.push(loadVersions());
    const currentCycle = IssueTreeStore.currentCycle;
    const types = ['all', 'topversion', 'version', 'folder'];
    const type = currentCycle.key ? types[currentCycle.key.split('-').length - 1] : 'allissue';
    const { versionId, cycleId, children } = currentCycle;
    // 不是第一页情况
    if (page > 0) {
      // 调用
      funcArr.push(getIssuesByIds(versionId, cycleId,
        this.issueIds.slice(size * page, size * (page + 1))));
    } else {
      // 第一页 五种情况
      // 1.加载全部数据
      if (type === 'all' || type === 'allissue' && !this.paramIssueId) {
        funcArr.push(getAllIssues(page, size, this.getFilter, orderField, orderType));
      } else if (type === 'topversion') {
        // 2.加载某一类versions
        const versions = children.map(child => child.versionId);
        // console.log(versions);
        funcArr.push(getIssuesByVersion(versions,
          page, size, this.getFilter, orderField, orderType));
      } else if (type === 'version') {
        // 3.加载单个version
        funcArr.push(getIssuesByVersion([versionId],
          page, size, this.getFilter, orderField, orderType));
      } else if (type === 'folder') {
        // 4.加载单个folder
        funcArr.push(getIssuesByFolder(cycleId,
          page, size, this.getFilter, orderField, orderType));
      } else if (this.paramIssueId) {
        // 5.地址栏有url 调用只取这一个issue的方法 这个要放最后
        funcArr.push(getSingleIssues(page, size, this.getFilter, orderField, orderType));
      }
    }
    // console.log(type);
    // 三种加载issue情况
    // 1.选择文件夹
    // if (IssueTreeStore.currentCycle.versionId) {
    //   // 2.选择文件夹并不在第一页
    //   const { versionId, cycleId } = IssueTreeStore.currentCycle;
    //   if (page > 0) {
    //     funcArr.push(getIssuesByIds(versionId, cycleId,
    //       this.issueIds.slice(size * page, size * (page + 1))));
    //   } else if (cycleId) {
    //     funcArr.push(getIssuesByFolder(cycleId,
    //       page, size, this.getFilter, orderField, orderType));
    //   } else {
    //     funcArr.push(getIssuesByVersion(versionId,
    //       page, size, this.getFilter, orderField, orderType));
    //   }
    // } else if (this.issueIds.length > 0 && page > 0) {
    //   // 3.直接调用敏捷接口
    //   // funcArr.push(loadIssues(page, size, this.getFilter, orderField, orderType));
    //   funcArr.push(getIssuesByIds(null, null,
    //     this.issueIds.slice(size * page, size * (page + 1))));
    // } else if (this.paramIssueId) {
    //   // 地址栏有id的情况
    //   funcArr.push(loadIssues(page, size, this.getFilter, orderField, orderType));
    // } else {
    //   funcArr.push(getAllIssues(page, size, this.getFilter, orderField, orderType));
    // }
    return Promise.all(funcArr).then(([versions, res]) => {
      this.setVersions(versions);
      if (versions && versions.length > 0) {
        this.selectVersion(versions[0].versionId);
      }
      this.setIssues(res.content);
      if (page === 0) {
        this.setIssueIds(res.allIdValues || []);
      }
      // 调用ids接口不返回总数
      if (page > 0) {
        this.setPagination({
          current: page + 1,
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
      // if ((!IssueTreeStore.currentCycle.versionId && this.issueIds.length === 0) || page === 0) {
      //   this.setPagination({
      //     current: res.number + 1,
      //     pageSize: size,
      //     total: res.totalElements,
      //   });
      // } else {
      //   this.setPagination({
      //     current: page + 1,
      //     pageSize: size,
      //     total: this.pagination.total,
      //   });
      // }

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

  @action setIssueIds(issueIds) {
    this.issueIds = issueIds;
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
