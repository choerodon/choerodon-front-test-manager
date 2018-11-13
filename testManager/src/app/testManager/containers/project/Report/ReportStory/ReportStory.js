
import React, { Component } from 'react';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import { Link } from 'react-router-dom';
import {
  Table, Menu, Dropdown, Button, Icon, Collapse, Tooltip,
} from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { getReportsFromStory } from '../../../../api/reportApi';
import { getIssueTypes, getIssueStatus } from '../../../../api/agileApi';
import { getStatusList } from '../../../../api/TestStatusApi';
import { issueLink, cycleLink, executeDetailShowLink } from '../../../../common/utils';
import './ReportStory.scss';

export const STATUS = {
  todo: '#ffb100',
  doing: '#4d90fe',
  done: '#00bfa5',
};
const { AppState } = stores;
const Panel = Collapse.Panel;

class ReportStory extends Component {
  state = {
    loading: false,
    reportList: [],
    statusList: [],
    issueTypes: [],
    issueStatusList: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    openId: {},
    search: {
      advancedSearchArgs: {
      },
      searchArgs: {
      },
    },
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.getReportsFromStory();
  }


  getReportsFromStory = (pagination, search) => {
    const Pagination = pagination || this.state.pagination;
    const Search = search || this.state.search;
    this.setState({ loading: true });
    Promise.all([getReportsFromStory({
      page: Pagination.current - 1,
      size: Pagination.pageSize,
    }, Search),
    getStatusList('CYCLE_CASE'),
    getIssueTypes(),
    getIssueTypes('agile'),
    getIssueStatus(),
    ])
      .then(([reportData, statusList, issueTypes, agileTypeList, issueStatusList]) => {
        if (reportData.totalElements !== undefined) {
          this.setState({
            loading: false,
            // reportList: reportData.content,
            statusList,
            issueTypes: issueTypes.concat(agileTypeList),
            issueStatusList,
            openId: {},
            reportList: reportData.content,
            pagination: {
              current: Pagination.current,
              pageSize: Pagination.pageSize,
              // total: reportData.totalElements,
              total: reportData.totalElements,
            },
          });
        }
      }).catch((error) => {
        window.console.log(error);
        this.setState({
          loading: false,
        });
      });
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.getReportsFromStory(pagination);
  }

  handleOpen = (issueId, keys) => {
    const { openId } = this.state;
    openId[issueId] = keys;
    this.setState({
      openId: { ...openId },
    });
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    const { statusId, priorityCode, typeId } = filters;
    const {
      issueNum, summary, assignee, sprint, version, component, epic, content,
    } = filters;
    console.log(barFilters);
    const search = {
      content: barFilters[0] ? barFilters[0] : content ? content[0] : '',
      advancedSearchArgs: {
        statusId: statusId || [],
        // priorityCode: priorityCode || [],
        issueTypeId: typeId || [],
      },
      otherArgs: {
        issueNum: issueNum ? issueNum[0] : '',
        summary: summary ? summary[0] : '',
        // assignee: assignee ? assignee[0] : '',
        // sprint: sprint ? sprint[0] : '',
        // version: version ? version[0] : '',
        // component: component ? component[0] : '',
        // epic: epic ? epic[0] : '',
      },
    };
    const Pagination = this.state.pagination;
    Pagination.current = 1;
    this.setState({
      search,
    });
    this.getReportsFromStory(Pagination, search);
  }

  render() {
    const {
      reportList, loading, pagination,
      statusList, openId, issueTypes, issueStatusList,
    } = this.state;
    const urlParams = AppState.currentMenuType;
    const { organizationId } = AppState.currentMenuType;
    const that = this;
    const menu = (
      <Menu style={{ marginTop: 35 }}>
        <Menu.Item key="0">
          <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
            <FormattedMessage id="report_dropDown_demand" />
          </Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
            <FormattedMessage id="report_dropDown_defect" />
          </Link>
        </Menu.Item>
        <Menu.Item key="2">
          <Link to={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
            <FormattedMessage id="report_dropDown_home" />
          </Link>
        </Menu.Item>
      </Menu>
    );
    const filterColumns = [
      {
        title: '类型',
        dataIndex: 'typeId',
        key: 'typeId',
        filters: issueTypes.map(type => ({ text: type.name, value: type.id })),
        filterMultiple: true,
      },
      // {
      //   title: '经办人',
      //   dataIndex: 'assignee',
      //   key: 'assignee',
      //   filters: [],
      // },
      // {
      //   title: '编号',
      //   dataIndex: 'issueNum',
      //   key: 'issueNum',
      //   filters: [],
      // },
      // {
      //   title: '概要',
      //   dataIndex: 'summary',
      //   key: 'summary',
      //   filters: [],
      // },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        filters: [],
      },
      // {
      //   title: '优先级',
      //   dataIndex: 'priorityCode',
      //   key: 'priorityCode',
      //   filters: [
      //     {
      //       text: '高',
      //       value: 'high',
      //     },
      //     {
      //       text: '中',
      //       value: 'medium',
      //     },
      //     {
      //       text: '低',
      //       value: 'low',
      //     },
      //   ],
      //   filterMultiple: true,
      // },
      {
        title: '状态',
        dataIndex: 'statusId',
        key: 'statusId',
        filters: issueStatusList.map(status => ({ text: status.name, value: status.id })),
        filterMultiple: true,
        // filteredValue: IssueStore.filteredInfo.statusCode || null,
      },
      // {
      //   title: '冲刺',
      //   dataIndex: 'sprint',
      //   key: 'sprint',
      //   filters: [],
      // },
      // {
      //   title: '模块',
      //   dataIndex: 'component',
      //   key: 'component',
      //   filters: [],
      // },
      // {
      //   title: '版本',
      //   dataIndex: 'version',
      //   key: 'version',
      //   filters: [],
      // },
      // {
      //   title: '史诗',
      //   dataIndex: 'epic',
      //   key: 'epic',
      //   filters: [],
      // },
    ];
    const columns = [{
      className: 'c7ntest-table-white',
      title: <FormattedMessage id="demand" />,
      dataIndex: 'issueId',
      key: 'issueId',
      render(issue, record) {
        const { defectInfo, defectCount } = record;
        const {
          statusMapDTO, issueStatusName, issueName, issueId, typeCode, summary,
        } = defectInfo;
        const { name: statusName, colour: statusColor, type: statusCode } = statusMapDTO || {};
        return (
          <div>
            <div className="c7ntest-collapse-header-container">
              <Tooltip title={(
                <div>
                  <div>{issueName}</div>
                  <div>{summary}</div>
                </div>
              )}
              >
                <Link className="c7ntest-showId" to={issueLink(issueId, typeCode)} target="_blank">
                  {issueName}
                </Link>
              </Tooltip>
              <div className="c7ntest-issue-status-icon">
                <span style={{ color: STATUS[statusCode], borderColor: STATUS[statusCode] }}>
                  {statusName}
                </span>
              </div>

            </div>
            <div>
              <FormattedMessage id="report_defectCount" />
              {':'}
              {defectCount}
            </div>
          </div>
        );
      },
    }, {
      className: 'c7ntest-table-white',
      title: <FormattedMessage id="test" />,
      dataIndex: 'test',
      key: 'test',
      render(test, record) {
        const { issueStatus, linkedTestIssues, defectInfo } = record;
        const { issueId } = defectInfo;
        return (
          <Collapse
            activeKey={openId[issueId]}
            bordered={false}
            onChange={(keys) => { that.handleOpen(issueId, keys); }}
          >
            {
              linkedTestIssues.map((issue, i) => (
                <Panel
                  showArrow={false}
                  header={
                    (
                      <div style={{
                        marginBottom: openId[issueId]
                          && openId[issueId].includes(`${issue.issueId}-${i}`)
                          && issue.testCycleCaseES.length > 1
                          ? (issue.testCycleCaseES.length * 30) - 48 : 0,
                      }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Icon type="navigate_next" className="c7ntest-collapse-icon" />
                          <Tooltip title={issue.issueName}>
                            <Link className="c7ntest-text-dot" to={issueLink(issue.issueId, 'issue_test')} target="_blank">
                              {issue.issueName}
                            </Link>
                          </Tooltip>
                        </div>
                        <div className="c7ntest-report-summary">{issue.summary}</div>
                      </div>
                    )}
                  key={`${issue.issueId}-${i}`}
                />
              ))
            }
          </Collapse>
        );
      },
    }, {
      className: 'c7ntest-table-white',
      title: <FormattedMessage id="execute" />,
      dataIndex: 'cycleId',
      key: 'cycleId',
      render(cycleId, record) {
        const { linkedTestIssues, defectInfo } = record;
        return (
          <div>
            {linkedTestIssues.map((testIssue, i) => {
              const { testCycleCaseES, issueId } = testIssue;

              // console.log()
              const totalExecute = testCycleCaseES.length;
              // const todoExecute = 0;
              // let doneExecute = 0;
              const executeStatus = {};
              const caseShow = testCycleCaseES.map((execute) => {
                // 执行的颜色
                const { executionStatus } = execute;
                const statusColor = _.find(statusList, { statusId: executionStatus })
                  ? _.find(statusList, { statusId: executionStatus }).statusColor : '';
                const statusName = _.find(statusList, { statusId: executionStatus })
                  && _.find(statusList, { statusId: executionStatus }).statusName;
                // if (statusColor !== 'gray') {
                //   doneExecute += 1;
                // }
                if (!executeStatus[statusName]) {
                  executeStatus[statusName] = 1;
                } else {
                  executeStatus[statusName] += 1;
                }
                const marginBottom = Math.max((execute.defects.length + execute.subStepDefects.length) - 1, 0) * 30;
                return (
                  <div className="c7ntest-cycle-show-container" style={{ marginBottom }}>
                    <div
                      style={{
                        width: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      <Tooltip title={`${execute.cycleName}${execute.folderName ? `/${execute.folderName}` : ''}`}>
                        <Link className="c7ntest-showId" to={cycleLink(execute.cycleId)} target="_blank">
                          {execute.cycleName}
                          {execute.folderName ? `/${execute.folderName}` : ''}
                        </Link>
                      </Tooltip>
                    </div>
                    <div
                      className="c7ntest-collapse-text-icon"
                      style={{ color: statusColor, borderColor: statusColor }}
                    >
                      {statusName}
                    </div>
                    <Link
                      style={{ lineHeight: '13px' }}
                      to={executeDetailShowLink(execute.executeId)}
                    >
                      <Icon type="explicit2" style={{ marginLeft: 10, color: 'black' }} />
                    </Link>
                  </div>);
              });
              // window.console.log(executeStatus);
              return openId[record.defectInfo.issueId] && openId[record.defectInfo.issueId]
                .includes(`${issueId}-${i}`) ? (
                  <div
                    style={{ minHeight: totalExecute === 0 ? 50 : 30 }}
                  >
                    {caseShow}
                    {' '}

                  </div>
                )
                : (
                  <div style={{ height: 50 }}>
                    <div>
                      <FormattedMessage id="report_total" />
                      {'：'}
                      {totalExecute}
                    </div>
                    <div style={{ display: 'flex' }}>
                      {
                        Object.keys(executeStatus).map(key => (
                          <div>
                            <span>
                              {key}
                              {'：'}
                            </span>
                            <span>{executeStatus[key]}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                );
            })}
          </div>
        );
      },
    }, {
      className: 'c7ntest-table-white',
      title: <FormattedMessage id="bug" />,
      dataIndex: 'demand',
      key: 'demand',
      render(demand, record) {
        const { linkedTestIssues, defectInfo } = record;
        return (
          <div>
            {linkedTestIssues.map((testIssue, i) => {
              const { testCycleCaseES, issueId } = testIssue;
              if (testCycleCaseES.length === 0) {
                return <div style={{ minHeight: 50 }} />;
              }
              return (openId[record.defectInfo.issueId] && openId[record.defectInfo.issueId]
                .includes(`${issueId}-${i}`) ? (
                  <div>
                    {
                      testCycleCaseES.map((item) => {
                        const { defects, subStepDefects } = item;
                        return (
                          <div>
                            {defects.concat(subStepDefects).length > 0
                              ? defects.concat(subStepDefects).map((defect) => {
                                const { issueInfosDTO } = defect;
                                return (
                                  <div className="c7ntest-issue-show-container">
                                    <Tooltip title={issueInfosDTO && issueInfosDTO.issueNum}>
                                      <Link
                                        className="c7ntest-showId"
                                        to={issueLink(issueInfosDTO && issueInfosDTO.issueId,
                                          issueInfosDTO && issueInfosDTO.typeCode)}
                                        target="_blank"
                                      >
                                        {issueInfosDTO && issueInfosDTO.issueNum}
                                      </Link>
                                    </Tooltip>
                                    <div className="c7ntest-issue-status-icon">
                                      <span style={{
                                        color: issueInfosDTO && issueInfosDTO.issueColor,
                                        borderColor: issueInfosDTO && issueInfosDTO.issueColor,
                                      }}
                                      >
                                        {issueInfosDTO && issueInfosDTO.issueStatusName}
                                      </span>
                                    </div>
                                    {defect.defectType === 'CASE_STEP'
                                      && (
                                        <div style={{
                                          marginLeft: 20,
                                          color: 'white',
                                          padding: '0 8px',
                                          background: 'rgba(0,0,0,0.20)',
                                          borderRadius: '100px',
                                          whiteSpace: 'nowrap',
                                        }}
                                        >
                                          <FormattedMessage id="step" />

                                        </div>
                                      )}
                                  </div>
                                );
                              }) : <div className="c7ntest-issue-show-container">－</div>}

                          </div>
                        );
                      })

                    }
                  </div>
                )
                : (
                  <div style={{ minHeight: 50 }}>
                    {
                      testCycleCaseES.map((item) => {
                        const { defects, subStepDefects } = item;
                        return (
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {defects.concat(subStepDefects).map((defect, i) => {
                              const { issueInfosDTO } = defect;
                              return (
                                <span style={{
                                  fontSize: '13px',
                                  color: '#3F51B5',
                                }}
                                >
                                  <Link className="c7ntest-showId" to={issueLink(issueInfosDTO && issueInfosDTO.issueId, issueInfosDTO && issueInfosDTO.typeCode)} target="_blank">
                                    {issueInfosDTO && issueInfosDTO.issueName}
                                  </Link>
                                  {i === defects.concat(subStepDefects).length - 1 ? null : '，'}
                                </span>
                              );
                            })}

                          </div>
                        );
                      })}
                  </div>
                ));
            })}
          </div>
        );
      },
    }];

    return (
      <Page className="c7ntest-report-story">
        <Header
          title={<FormattedMessage id="report_demandToDefect" />}
          backPath={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}
        >
          <Dropdown overlay={menu} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              <FormattedMessage id="report_switch" />
              <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>
          {/* <Button
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
          </Button> */}
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
          <div className="c7ntest-report-story-filter-table">
            <Table
              rowKey={record => record.id}
              columns={filterColumns}
              dataSource={[]}
              filterBar
              showHeader={false}
              onChange={this.handleFilterChange}
              pagination={false}
              // 设置筛选input内默认文本
              // filters={IssueStore.barFilters || []}
              filterBarPlaceholder="过滤表"
            />
          </div>
          <Table
            filterBar={false}
            loading={loading}
            pagination={pagination}
            columns={columns}
            dataSource={reportList}
            onChange={this.handleTableChange}
          />
          {/* <ReportStoryArea demands={reportList} /> */}
        </Content>
      </Page>
    );
  }
}


export default ReportStory;
