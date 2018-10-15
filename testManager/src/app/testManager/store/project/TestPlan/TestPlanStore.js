import {
  observable, action, computed, toJS,
} from 'mobx';
import moment from 'moment';
import { store } from 'choerodon-front-boot';
import { getCycles, getCycleById } from '../../../api/cycleApi';
import { getStatusList } from '../../../api/TestStatusApi';


@store('TestPlanStore')
class TestPlanStore {
  @observable treeData = [
    {
      title: '所有版本',
      key: '0',
      children: [],
    },
  ]

  @observable expandedKeys = ['0'];

  @observable selectedKeys = [];

  @observable addingParent = null;

  @observable currentCycle = {};

  @observable statusList = [];

  @observable times = [];

  @observable dataList = [];

  @observable testList = [];

  @observable executePagination = {
    current: 1,
    total: 0,
    pageSize: 5,
  }

  @observable loading = false;

  @observable filters = {};

  @observable rightLoading = false;

  @observable calendarShowMode = 'single';

  @observable EditCycleVisible = false;

  @observable CurrentEditCycle = {};

  @observable EditStageVisible = false;

  @observable CurrentEditStage = {};

  @observable assignedTo = null;

  @observable lastUpdatedBy = null;

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

  getTree = () => new Promise((resolve) => {
    this.enterLoading();
    getStatusList('CYCLE_CASE').then((statusList) => {
      this.setStatusList({ statusList });
    });
    getCycles().then((data) => {
      this.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);

      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);
      resolve();
      // window.console.log(dataList);
    }).catch((err) => {
      Choerodon.prompt('网络错误');
    }).finally(() => {
      this.leaveLoading();
    });

    // 如果选中了项，就刷新table数据
    const currentCycle = this.getCurrentCycle;
    const selectedKeys = this.getSelectedKeys;

    if (currentCycle.versionId) {
      this.reloadCycle();
    }
  })

  reloadCycle = () => {
    const data = this.getCurrentCycle;
    const { executePagination, filters } = this;
    if (data.type === 'folder') {
      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, data.cycleId,
      {
        ...filters,
        lastUpdatedBy: [Number(this.lastUpdatedBy) || null],
        assignedTo: [Number(this.assignedTo) || null],
      }).then((cycle) => {
        this.rightLeaveLoading();
        this.setTestList(cycle.content);
        this.setExecutePagination({
          current: executePagination.current,
          pageSize: executePagination.pageSize,
          total: cycle.totalElements,
        });
      });
    }
  }

  // 点击树的一项，加载数据
  loadCycle = (selectedKeys, {
    selected, selectedNodes, node, event,
  } = {}) => {
    const { executePagination, filters } = this;
    const data = node ? node.props.data : this.getCurrentCycle;
    // 点所有的都生成事件日历
    this.clearTimes();
    this.generateTimes([data]);
    if (data.type === 'folder') {
      this.setCalendarShowMode('single');
    } else {
      this.setFilters({});
      this.setCalendarShowMode('multi');
    }
    // if (data.versionId) {
    if (selectedKeys) {
      this.setSelectedKeys(selectedKeys);
    }


    this.rightEnterLoading();


    this.setCurrentCycle(data);
    // window.console.log(data);
    if (data.type === 'folder') {
      getCycleById({
        page: 0,
        size: executePagination.pageSize,
      }, data.cycleId,
      {
        ...filters,
        lastUpdatedBy: [Number(this.lastUpdatedBy) || null],
        assignedTo: [Number(this.assignedTo) || null],
      }).then((cycle) => {
        this.rightLeaveLoading();
        this.setTestList(cycle.content);
        this.setExecutePagination({
          current: 1,
          pageSize: executePagination.pageSize,
          total: cycle.totalElements,
        });
      });
    }
    // }
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')

  getParent = (key) => {
    const parentKey = this.getParentKey(key);
    const arr = parentKey.split('-');
    let temp = this.treeData;
    arr.forEach((index, i) => {
      // window.console.log(temp);
      if (i === 0) {
        temp = temp[index];
      } else {
        temp = temp.children[index];
      }
    });
    return temp;
  }

  generateList = (data) => {
    // const temp = data;
    // while (temp) {
    //   dataList = dataList.concat(temp.children);
    //   if()
    // }
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      // 找出url上的cycleId
      // const { cycleId } = getParams(window.location.href);
      const currentCycle = this.getCurrentCycle;
      // if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
      //   this.setExpandDefault(node);
      // } else
      // 两种情况，version或者cycle和文件夹，version没有type
      if (currentCycle.key === node.key) {
        this.setCurrentCycle(node);
        this.clearTimes();
        // debugger;
        this.generateTimes([node]);
      }
      this.dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }

  @action setAssignedTo(assignedTo) {
    this.assignedTo = assignedTo;
  }

  @action setLastUpdatedBy(lastUpdatedBy) {
    this.lastUpdatedBy = lastUpdatedBy;
  }

  @action setCalendarShowMode = (calendarShowMode) => {
    this.calendarShowMode = calendarShowMode;
  }

  @action setFilters = (filters) => {
    this.filters = filters;
  }

  @action clearTimes = () => {
    this.times = [];
  }

  @action generateTimes = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const {
        fromDate, toDate, title, type, children, versionId, cycleId,
      } = node;

      if (!versionId && !cycleId && children.length > 0) {
        // 版本 规划中
        let stepChildren = [];
        children.forEach((child) => {
          stepChildren = [...stepChildren, ...child.children];
        });
        // 进行过滤，防止时间为空
        const starts = stepChildren.filter(child => child.fromDate && child.toDate).map(child => moment(child.fromDate));
        const ends = stepChildren.filter(child => child.fromDate && child.toDate).map(child => moment(child.toDate));
        if (starts.length > 0 && ends.length > 0) {
          this.times.push({
            ...node,
            // children, 不需要编辑，不用限制时间的选择，所有不用传children
            type: 'topversion',
            start: moment.min(starts),
            end: moment.max(ends),
          });
        }
      } else if (versionId && !cycleId && children.length > 0) {
        // 版本 0.1.1
        // console.log(children);
        const starts = children.filter(child => child.fromDate && child.toDate).map(child => moment(child.fromDate));
        const ends = children.filter(child => child.fromDate && child.toDate).map(child => moment(child.toDate));
        if (starts.length > 0 && ends.length > 0) {
          this.times.push({
            ...node,
            // children,
            type: 'version',
            start: moment.min(starts),
            end: moment.max(ends),
          });
        }
      } else if (fromDate && toDate) {
        this.times.push({
          ...node,
          children,
          start: moment(fromDate),
          end: moment(toDate),
        });
      }

      if (node.children) {
        this.generateTimes(node.children);
      }
    }
  }

  @action setStatusList(statusList) {
    this.statusList = statusList;
  }

  @action enterLoading() {
    this.loading = true;
  }

  @action leaveLoading() {
    this.loading = false;
  }

  @action rightEnterLoading() {
    this.rightLoading = true;
  }

  @action rightLeaveLoading() {
    this.rightLoading = false;
  }

  @action setTestList = (testList) => {
    this.testList = testList;
  }

  @action setExecutePagination = (executePagination) => {
    this.executePagination = executePagination;
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

  @action EditStage(CurrentEditStage) {
    const parent = this.getParent(CurrentEditStage.key);
    const { fromDate, toDate } = parent;
    // 为阶段设置父元素时间段，来限制时间的选择
    this.CurrentEditStage = {
      ...CurrentEditStage,
      parentTime: { start: moment(fromDate), end: moment(toDate) },
    };
    this.EditStageVisible = true;
  }

  @action ExitEditStage() {
    this.CurrentEditStage = {};
    this.EditStageVisible = false;
  }

  @action EditCycle(CurrentEditCycle) {
    this.CurrentEditCycle = CurrentEditCycle;
    this.EditCycleVisible = true;
  }

  @action ExitEditCycle() {
    this.CurrentEditCycle = {};
    this.EditCycleVisible = false;
  }
}

const testPlanStore = new TestPlanStore();
export default testPlanStore;
