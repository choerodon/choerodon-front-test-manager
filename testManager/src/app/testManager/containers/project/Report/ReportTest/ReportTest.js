
import React, { Component } from 'react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Link } from 'react-router-dom';
import { Table, Menu, Dropdown, Button, Icon, Collapse, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import ReportSelectIssue from '../../../../components/ReportSelectIssue';
import { getReportsFromDefect } from '../../../../api/reportApi';
import { getIssueStatus } from '../../../../api/agileApi';
import { getStatusList } from '../../../../api/cycleApi';
import { issueLink, cycleLink } from '../../../../common/utils';
import './ReportTest.scss';

const { AppState } = stores;
const Panel = Collapse.Panel;
const ICON = {
  story: 'turned_in',
  bug: 'bug_report',
  task: 'assignment',
  issue_epic: 'priority',
  sub_task: 'relation',
  issue_test: 'test',
};

const TYPE = {
  story: '#00bfa5',
  bug: '#f44336',
  task: '#4d90fe',
  issue_epic: '#743be7',
  sub_task: '#4d90fe',
  issue_test: '#FFB100',
};

const NAME = {
  story: '故事',
  bug: '故障',
  task: '任务',
  issue_epic: '史诗',
  sub_task: '子任务',
  issue_test: '测试',
};

class ReportTest extends Component {
  state = {
    selectVisible: false,
    loading: false,
    reportList: [],
    issueStatusList: [],
    statusList: [],
    stepStatusList: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    openId: [],
    issueIds: [],
  }
  componentDidMount() {
    this.getInfo();
  }
  getInfo = () => {
    this.setState({
      loading: true,
    });
    Promise.all([
      getIssueStatus(),
      getStatusList('CYCLE_CASE'),
      getStatusList('CASE_STEP'),
      this.getReportsFromDefect(),
    ]).then(([issueStatusList, statusList, stepStatusList]) => {
      this.setState({
        issueStatusList,
        statusList,
        stepStatusList,
        // loading: false,
        openId: [],
      });
    });
  }
  sliceIssueIds = (arr, pagination) => {
    const { current, pageSize } = pagination;
    return arr.slice(pageSize * (current - 1), pageSize * current);
  }
  getReportsFromDefect = (pagination, issueIds = this.state.issueIds) => {
    const Pagination = pagination || this.state.pagination;
    this.setState({ loading: true });
    getReportsFromDefect({
      page: Pagination.current - 1,
      size: Pagination.pageSize,
    }, this.sliceIssueIds(issueIds, Pagination)).then((reportData) => {
      if (reportData.totalElements) {
        this.setState({
          loading: false,
          // reportList: reportData.content,
          reportList: reportData.content,
          pagination: {
            current: Pagination.current,
            pageSize: Pagination.pageSize,
            // total: reportData.totalElements,
            total: reportData.totalElements,
          },
        });
      } else {
        this.setState({
          loading: false,
          // reportList: reportData.content,
          reportList: reportData,
          pagination: {
            current: Pagination.current,
            pageSize: Pagination.pageSize,
            // total: reportData.totalElements,
            total: issueIds.length,
          },
        });
      }
    }).catch((error) => {
      window.console.log(error);
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络异常');
    });
  }
  handleTableChange = (pagination, filters, sorter) => {
    this.getReportsFromDefect(pagination);
  }
  handleOpen = (issueId) => {
    const { openId } = this.state;
    if (!openId.includes(issueId.toString())) {
      this.setState({
        openId: openId.concat([issueId.toString()]),
      });
    } else {
      const index = openId.indexOf(issueId.toString());
      openId.splice(index, 1);
      this.setState({
        openId: [...openId],
      });
    }
  }
  render() {
    const { selectVisible, reportList, loading, pagination,
      issueStatusList, statusList, stepStatusList, openId } = this.state;
    const urlParams = AppState.currentMenuType;
    const that = this;
    const menu = (
      <Menu style={{ marginTop: 35 }}>
        <Menu.Item key="0">
          <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`} >
            <FormattedMessage id="report_dropDown_demand" />
          </Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>
            <FormattedMessage id="report_dropDown_defect" />
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>
            <FormattedMessage id="report_dropDown_home" />
          </Link>
        </Menu.Item>
      </Menu>
    );
    const columns = [{
      className: 'c7n-table-white',
      title: <FormattedMessage id="bug" />,
      dataIndex: 'a',
      key: 'a',
      width: '25%',
      render(test, record) {
        const { issueInfosDTO } = record;
        const { issueId, issueColor, issueStatusName,
          issueName, summary, typeCode } = issueInfosDTO;
        return (
          <Collapse
            activeKey={openId}
            bordered={false}
            onChange={(keys) => { that.handleOpen(issueId, keys); }}
          >
            <Panel
              showArrow={false}
              header={
                <div>
                  <div className="c7n-collapse-show-item">
                    <Icon type="navigate_next" className="c7n-collapse-icon" />
                    <Tooltip title={issueName}>
                      <Link className="c7n-showId" to={issueLink(issueId, typeCode)} target="_blank">
                        {issueName}
                      </Link>
                    </Tooltip>
                    <div className="c7n-collapse-header-icon">
                      <span style={{ color: issueColor, borderColor: issueColor }}>
                        {issueStatusName}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px' }}>{summary}</div>
                </div>
              }
              key={issueId}
            />
          </Collapse>
        );
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="execute" />,
      dataIndex: 'execute',
      key: 'execute',
      width: '25%',
      render(a, record) {
        const { testCycleCaseES, testCycleCaseStepES, issueInfosDTO } = record;
        const { issueId } = issueInfosDTO;
        const executeStatus = {};
        const totalExecute = testCycleCaseES.length + testCycleCaseStepES.length;
        const caseShow = testCycleCaseES.concat(testCycleCaseStepES).map((execute, i) => {
          // 执行的颜色
          const { executionStatus, stepStatus } = execute;
          let statusColor = '';
          let statusName = '';
          if (executionStatus) {
            statusColor = _.find(statusList, { statusId: executionStatus }) ?
              _.find(statusList, { statusId: executionStatus }).statusColor : '';
            statusName = _.find(statusList, { statusId: executionStatus }) &&
              _.find(statusList, { statusId: executionStatus }).statusName;
          } else {
            statusColor = _.find(stepStatusList, { statusId: stepStatus }) ?
              _.find(stepStatusList, { statusId: stepStatus }).statusColor : '';
            statusName = _.find(stepStatusList, { statusId: stepStatus }) ?
              _.find(stepStatusList, { statusId: stepStatus }).statusName : '';
          }

          if (!executeStatus[statusName]) {
            executeStatus[statusName] = 1;
          } else {
            executeStatus[statusName] += 1;
          }

          return (
            <div className="c7n-cycle-show-container">
              <div
                style={{ width: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <Tooltip title={`${execute.cycleName}${execute.folderName ? `/${execute.folderName}` : ''}`}>
                  <Link className="c7n-showId" to={cycleLink(execute.cycleId)} target="_blank">
                    {execute.cycleName}{execute.folderName ? `/${execute.folderName}` : ''}
                  </Link>
                </Tooltip>
              </div>
              <div
                className="c7n-collapse-text-icon"
                style={{ color: statusColor, borderColor: statusColor }}
              >
                {statusName}
              </div>
              <Link
                style={{ lineHeight: '13px' }}
                to={`/testManager/Cycle/execute/${execute.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}
              >
                <Icon type="explicit2" style={{ marginLeft: 10, color: 'black' }} />
              </Link>
              {
                i >= testCycleCaseES.length ?
                  <div style={{
                    height: 20,
                    width: 43,
                    marginLeft: 30,
                    color: 'white',
                    padding: '0 8px',
                    background: 'rgba(0,0,0,0.20)',
                    borderRadius: '100px',
                  }}
                  ><FormattedMessage id="step" /></div> : null

              }

            </div>);
        });
        return openId.includes(issueId.toString()) ?
          <div style={{ minHeight: 30 }}> {caseShow}   </div>
          :
          (
            <div>
              <div><FormattedMessage id="report_total" />：{totalExecute}</div>
              <div style={{ display: 'flex' }}>
                {
                  Object.keys(executeStatus).map(key => (<div>
                    <span>{key}：</span>
                    <span>{executeStatus[key]}</span>
                  </div>))
                }
              </div>
            </div>
          );
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="test" />,
      dataIndex: 'cycleId',
      key: 'cycleId',
      width: '25%',
      render(cycleId, record) {
        // const { linkedTestIssues } = record; 
        const { testCycleCaseES, testCycleCaseStepES } = record;
        const { issueId } = record.issueInfosDTO;
        const caseShow = testCycleCaseES.concat(testCycleCaseStepES).map((execute) => {
          const { issueInfosDTO } = execute;
          const { issueColor, issueName, issueStatusName, summary, typeCode } = issueInfosDTO;
          return (<div className="c7n-issue-show-container">
            <div className="c7n-collapse-show-item">
              <Tooltip title={issueName}>
                <Link className="c7n-showId" to={issueLink(issueId, typeCode)} target="_blank">
                  {issueName}
                </Link>
              </Tooltip>
              <div className="c7n-collapse-header-icon">
                <span style={{ color: issueColor, borderColor: issueColor }}>
                  {issueStatusName}
                </span>
              </div>
            </div>
            <div className="c7n-report-summary">{summary}</div>
          </div>);
        });
        return openId.includes(issueId.toString()) ?
          <div style={{ minHeight: 50 }}> {caseShow}   </div>
          :
          (
            <div> <FormattedMessage id="report_total" />：{testCycleCaseES.concat(testCycleCaseStepES).length}</div>
          );
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="demand" />,
      dataIndex: 'demand',
      key: 'demand',
      width: '25%',
      render(demand, record) {
        const { testCycleCaseES, testCycleCaseStepES } = record;
        const { issueId } = record.issueInfosDTO;
        const caseShow = testCycleCaseES.concat(testCycleCaseStepES).map((execute, i) => {
          const { issueLinkDTOS } = execute;
          // window.console.log(issueLinkDTOS.length);
          const issueLinks = issueLinkDTOS && issueLinkDTOS.map((link) => {
            const { statusColor, statusName, issueNum, summary } = link;
            return (<div className="c7n-issue-show-container">
              <div className="c7n-collapse-show-item">
                <Tooltip title={issueNum}>
                  <Link className="c7n-showId" to={issueLink(link.issueId, link.typeCode)} target="_blank">
                    {issueNum}
                  </Link>
                </Tooltip>
                <div className="c7n-collapse-header-icon">
                  <span style={{ color: statusColor, borderColor: statusColor }}>
                    {statusName}
                  </span>
                </div>
              </div>
              <div className="c7n-report-summary">{summary}</div>
            </div>);
          });
          return (<div style={{
            minHeight: 50,
          }}
          >{issueLinks}</div>);
        });

        return openId.includes(issueId.toString()) ? caseShow : '-';
      },
    }];

    return (
      <Page className="c7n-report-test">
        <Header
          title={<FormattedMessage id="report_defectToDemand" />}
          backPath={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}
        >
          <Dropdown overlay={menu} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              <FormattedMessage id="report_switch" />
              <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>
          <Button
            style={{ marginLeft: 30 }}
            onClick={() => {
              this.setState({
                selectVisible: true,
              });
            }}
          >
            <Icon type="open_in_new" />
            <span>
              <FormattedMessage id="report_chooseQuestion" />
            </span>
          </Button>
          {/* <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
          导出 <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>    */}
          <Button onClick={this.getInfo} style={{ marginLeft: 30 }}>
            <Icon type="autorenew icon" />
            <span>
              <FormattedMessage id="refresh" />
            </span>
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={<FormattedMessage id="report_content_title" />}
          description={<FormattedMessage id="report_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
        >
          <div style={{ display: 'flex' }} />
          <ReportSelectIssue
            visible={selectVisible}
            onCancel={() => { this.setState({ selectVisible: false }); }}
            onOk={(issueIds) => {
              this.setState({
                selectVisible: false,
                pagination: {
                  current: 1,
                  total: 0,
                  pageSize: 10,
                },
                issueIds
              });
              this.getReportsFromDefect(null, issueIds);
            }}
          />
          <Table
            filterBar={false}
            loading={loading}
            pagination={pagination}
            columns={columns}
            dataSource={reportList}
            onChange={this.handleTableChange}
          />
        </Content>
      </Page>
    );
  }
}


export default ReportTest;

