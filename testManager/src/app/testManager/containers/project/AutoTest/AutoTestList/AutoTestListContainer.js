import React, { Component } from 'react';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import {
  getApps, getTestHistoryByApp, reRunTest, getAllEnvs,
} from '../../../../api/AutoTestApi';
import { commonLink, cycleLink } from '../../../../common/utils';
import AutoTestList from './AutoTestList';

class AutoTestListContainer extends Component {
  state = {
    appList: [],
    historyList: [],
    envList: [],
    currentApp: null,
    loading: true,
    selectLoading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    filter: {},
  }

  componentDidMount() {
    this.loadApps();
  }

  componentWillUnmount() {
    if (this.state.ws) {
      this.closeSidebar();
    }
  }

  loadApps = (value = '') => {
    const { currentApp } = this.state;
    let searchParam = {};
    if (value !== '') {
      searchParam = { name: [value] };
    }

    this.setState({
      selectLoading: true,
    });
    Promise.all([
      getApps({
        page: 0,
        size: 10,
        sort: { field: 'id', order: 'desc' },
        postData: { searchParam, param: '' },
      }),
      getAllEnvs(),
    ]).then(([data, envs]) => {
      // 默认取第一个
      if (data.failed) {
        Choerodon.prompt(data.failed);
        return;
      }
      if (!currentApp && !value && data.content.length > 0) {
        this.loadTestHistoryByApp({ appId: data.content[0].id });
        this.setState({
          envList: envs,
          currentApp: data.content[0].id,
          appList: data.content,
          selectLoading: false,
        });
      } else {
        this.setState({
          envList: envs,
          appList: data.content,
          selectLoading: false,
          loading: false,
        });
      }
    });
  }
  
  handleAppChange = (appId) => {
    this.loadTestHistoryByApp({ appId });
    this.setState({
      currentApp: appId,
    });
  }

  loadTestHistoryByApp = ({ appId = this.state.currentApp, pagination = this.state.pagination, filter = this.state.filter } = {}) => {
    this.setState({
      loading: true,
      filter,
    });
    getTestHistoryByApp(appId, pagination, filter).then((history) => {
      this.setState({      
        historyList: history.content,
        pagination: {
          current: history.number + 1,
          total: history.totalElements,
          pageSize: history.size,
        },
      });
    }).finally(() => {
      this.setState({        
        selectLoading: false,
        loading: false,
      });
    });
  }

  handleTableChange = (pagination, filter) => {
    this.loadTestHistoryByApp({ pagination, filter });
  }

  handleRerunTest = (record) => {
    this.setState({
      loading: true,
    });
    const { id } = record;
    reRunTest({ historyId: id }).then((res) => {
      this.loadTestHistoryByApp();
    }).catch((err) => {
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络出错');
    });
  }

  toCreateAutoTest = () => {
    this.props.history.push(commonLink('/AutoTest/create'));
  }

  toReport = (resultId) => {
    this.props.history.push(commonLink(`/AutoTest/report/${resultId}`));
  }

  toTestExecute = (cycleId) => {    
    this.props.history.push(cycleLink(cycleId));
  }

  handleItemClick = (record, { item, key, keyPath }) => {
    const {
      id, instanceId, status, resultId, cycleId,
    } = record;
    // console.log(key, record);
    switch (key) {
      case 'log': {
        this.ContainerLog.open(record);
        // this.showLog(record);
        break;
      }

      case 'retry': {
        this.handleRerunTest(record);
        break;
      }
      // case 'cycle': {
      //   this.toTestExecute(cycleId);
      //   break;
      // }
      case 'report': {
        this.toReport(resultId);
        break;
      }
      default: break;
    }
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  render() {
    return (
      <AutoTestList
        {...this.state}
        toCreateAutoTest={this.toCreateAutoTest}
        onRefreshClick={this.loadTestHistoryByApp}
        onItemClick={this.handleItemClick}
        onAppChange={this.handleAppChange}
        onFilterChange={this.loadApps}
        onTableChange={this.handleTableChange}
        onSaveLogRef={this.saveRef}
      />
    );
  }
}

export default AutoTestListContainer;
