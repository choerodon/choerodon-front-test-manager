import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Icon, Button, Table, Select, Spin, Tooltip,
} from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import { FormattedMessage } from 'react-intl';
import { User } from '../../../../components/CommonComponent';
import { getAppList, getTestHistoryByApp } from '../../../../api/AutoTestApi';
import { CiStatus, TestResult } from './AutoTestTags';

const { Option } = Select;
class AutoTestList extends Component {
  state = {
    appList: [],
    historyList: [],
    currentApp: null,
    loading: false,
    selectLoading: false,
  }

  componentDidMount() {
    this.getAppList();
  }

  getAppList = (value) => {
    const { currentApp } = this.state;
    this.setState({
      selectLoading: true,
    });
    getAppList(value).then((List) => {
      console.log(currentApp);
      if (!currentApp && !value && List.length > 0) {
        this.setState({
          currentApp: List[0].id,
          appList: List,
          selectLoading: false,
        });
        this.getTestHistoryByApp(List[0].id);
      } else {
        this.setState({
          appList: List,
          selectLoading: false,
        });
      }
    });
  }

  getTestHistoryByApp = (appId = this.state.currentApp) => {
    this.setState({
      loading: true,
    });
    getTestHistoryByApp(appId).then((history) => {
      this.setState({
        loading: false,
        historyList: history.content,
      });
    });
  }

  render() {
    const {
      appList, selectLoading, currentApp, historyList, loading,
    } = this.state;
    const options = appList.map(app => <Option value={app.id}>{app.name}</Option>);
    const columns = [{
      title: '容器状态',
      dataIndex: 'status',
      key: 'status',
      render: status => CiStatus(status),
    }, {
      title: '执行方',
      dataIndex: 'lastUpdateUser',
      key: 'lastUpdateUser',
      render: lastUpdateUser => <User user={lastUpdateUser} />,
    }, {
      title: '测试框架',
      dataIndex: 'testType',
      key: 'testType',
    }, {
      title: '应用版本',
      dataIndex: 'appVersion',
      key: 'appVersion',
    }, {
      title: '时长',
      dataIndex: 'during',
      key: 'during',
    }, {
      title: '执行时间',
      dataIndex: 'time',
      key: 'time',
      render: time => (
        <TimeAgo
          datetime={time}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      ),
    }, {
      title: '测试结果',
      dataIndex: 'result',
      key: 'result',
      render: result => TestResult(result),
    }, {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (action, record) => {
        const { id, status } = record;
        return (
          <div>
            <Tooltip title={status === 'failed' ? '重试' : '重新执行'}>
              <Icon type="replay" className="c7ntest-icon-in-table" />
            </Tooltip>
            <Icon type="exit_to_app" className="c7ntest-icon-in-table" style={{ marginLeft: 8 }} />
          </div>
        );
      },
    }];
    
    return (
      <Page className="c7ntest-AutoTestList">
        <Header title={<FormattedMessage id="autotestlist_title" />}>
          <Button onClick={this.getTestHistoryByApp}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={<FormattedMessage id="autotestlist_content_title" />}
          description={<FormattedMessage id="autotestlist_content_description" />}
        // link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
        >
          <Spin spinning={loading}>             
            <Select
              label="选择应用"
              style={{ width: 512, marginBottom: 16 }}
              filter
              value={currentApp}
              loading={selectLoading}
              onChange={this.handleDefectsChange}
              onFilterChange={this.getAppList}
            >
              {options}
            </Select>
            <Table columns={columns} dataSource={historyList} />
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default AutoTestList;
