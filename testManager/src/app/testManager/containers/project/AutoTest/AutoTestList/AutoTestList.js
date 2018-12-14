import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Page, Header, Content,
} from 'choerodon-front-boot';
import moment from 'moment';
import {
  Icon, Button, Table, Select, Spin, Tooltip, Modal, Menu, Dropdown,
} from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { User, SmartTooltip } from '../../../../components/CommonComponent';
import {
  getApps, getTestHistoryByApp, reRunTest, getAllEnvs,
} from '../../../../api/AutoTestApi';
import {
  PODSTATUS, TESTRESULT, PodStatus, TestResult,
} from './AutoTestTags';
import { ContainerLog } from './components';
import {
  commonLink, getProjectName, humanizeDuration, cycleLink,
} from '../../../../common/utils';
import './AutoTestList.scss';

const Sidebar = Modal.Sidebar;
const { Option } = Select;
// @observer
class AutoTestList extends Component {
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
        loading: false,
        historyList: history.content,
        pagination: {
          current: history.number + 1,
          total: history.totalElements,
          pageSize: history.size,
        },
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

  getMenu = record => (
    <Menu onClick={this.handleItemClick.bind(this, record)} style={{ margin: '10px 0 0 28px' }}>
      <Menu.Item key="log" disabled={record.testAppInstanceDTO.podStatus === 0 || !record.testAppInstanceDTO.logId}>
        查看日志
      </Menu.Item>
      <Menu.Item key="retry">
        重新执行
      </Menu.Item>
      <Menu.Item key="cycle" disabled={!record.cycleId}>
        <Link to={cycleLink(record.cycleId)} target="_blank">测试循环</Link>
      </Menu.Item>
      <Menu.Item key="report" disabled={!record.resultId}>
        测试报告
      </Menu.Item>
    </Menu>
  );

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  render() {
    const {
      appList, selectLoading, currentApp, historyList, loading, envList,
      pagination,
    } = this.state;
    const appOptions = appList.map(app => <Option value={app.id}>{app.name}</Option>);
    const ENVS = envList.map(env => ({ text: env.name, value: env.id }));
    const columns = [{
      title: '运行状态',
      dataIndex: 'podStatus',
      key: 'podStatus',
      filters: PODSTATUS,
      render: (status, record) => {
        const { testAppInstanceDTO } = record;
        const { podStatus } = testAppInstanceDTO || {};
        return PodStatus(podStatus);
      },
    }, {
      title: '环境',
      dataIndex: 'envId',
      key: 'envId',
      filters: ENVS,
      render: (env, record) => {
        const { testAppInstanceDTO } = record;
        const { envId } = testAppInstanceDTO || {};
        const target = _.find(envList, { id: envId });
        return <span>{target && target.name}</span>;
      },
    }, {
      title: '执行方',
      dataIndex: 'createUser',
      key: 'createUser',
      render: createUser => <User user={createUser} />,
    }, {
      title: '测试框架',
      dataIndex: 'framework',
      key: 'framework',
      filters: [],
    }, {
      title: '应用版本',
      dataIndex: 'version',
      key: 'version',
      filters: [],
      render: (version, record) => {
        const { testAppInstanceDTO } = record;
        const { appVersionName } = testAppInstanceDTO || {};
        return <span>{appVersionName}</span>;
      },
    }, {
      title: '时长',
      dataIndex: 'during',
      key: 'during',
      render: (during, record) => {
        const { creationDate, lastUpdateDate } = record;
        const diff = moment(lastUpdateDate).diff(moment(creationDate));
        return creationDate && lastUpdateDate
          ? humanizeDuration(diff)
          : null;
      },
    }, {
      title: '执行时间',
      dataIndex: 'creationDate',
      key: 'creationDate',
      render: creationDate => (
        <TimeAgo
          datetime={creationDate}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      ),
    }, {
      title: '测试结果',
      dataIndex: 'testStatus',
      key: 'testStatus',
      filters: TESTRESULT,
      render: testStatus => TestResult(testStatus),
    }, {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (action, record) => {
        const {
          id, instanceId, status, resultId, cycleId,
        } = record;
        return (
          <div style={{ display: 'flex' }}>
            <div className="c7ntest-flex-space" />
            <Dropdown overlay={this.getMenu(record)} trigger={['click']}>
              <Button shape="circle" icon="more_vert" style={{ marginRight: -5 }} />
            </Dropdown>
            {/* <div className="c7ntest-flex-space" />
            <Tooltip title={<FormattedMessage id="container.log" />}>
              <Button type="circle" onClick={this.showLog.bind(this, record)}>
                <Icon type="insert_drive_file" />
              </Button>
            </Tooltip>
            <Tooltip title={status === 'failed' ? '重试' : '重新执行'}>
              <Button type="circle" onClick={this.handleRerunTest.bind(this, record)}>
                <Icon type="replay" />
              </Button>
            </Tooltip>
            <Tooltip title="测试执行">
              <Button disabled={!cycleId} type="circle" onClick={this.toTestExecute.bind(this, cycleId)}>
                <Icon type="poll" />
              </Button>
            </Tooltip>
            <Tooltip title="测试报告">
              <Button disabled={!resultId} type="circle" onClick={this.toReport.bind(this, resultId)}>
                <Icon type="poll" />
              </Button>
            </Tooltip> */}
          </div>
        );
      },
    }];
    return (
      <Page className="c7ntest-AutoTestList">
        <Header title={<FormattedMessage id="autotestlist_title" />}>
          <Button onClick={this.toCreateAutoTest}>
            <Icon type="playlist_add icon" />
            <span>添加测试</span>
          </Button>
          <Button onClick={this.loadTestHistoryByApp}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>
        <Content
          title={<FormattedMessage id="autotestlist_content_title" values={{ name: getProjectName() }} />}
          description={<FormattedMessage id="autotestlist_content_description" />}
        // link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
        >
          <Select
            label="选择应用"
            style={{ width: 512, marginBottom: 20 }}
            filter
            value={currentApp}
            loading={selectLoading}
            onChange={this.handleAppChange}
            onFilterChange={this.loadApps}
          >
            {appOptions}
          </Select>
          <Table loading={loading} columns={columns} dataSource={historyList} pagination={pagination} onChange={this.handleTableChange} />
          <ContainerLog
            ref={this.saveRef('ContainerLog')}
          />
        </Content>
      </Page>
    );
  }
}

export default AutoTestList;
