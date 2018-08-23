import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores, axios, 
} from 'choerodon-front-boot';
import {
  Table, Button, Tooltip, Input, Dropdown, Menu, Pagination, Spin, Icon, 
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import FileSaver from 'file-saver';
import '../../../../assets/main.scss';
import './TestHome.scss';
import IssueStore from '../../../../store/project/IssueStore';
import {
  STATUS, COLOR, TYPE, ICON, TYPE_NAME, 
} from '../../../../common/Constant';
import pic from '../../../../assets/问题管理－空.png';
import { loadIssue, createIssue } from '../../../../api/IssueApi';
import UserHead from '../../../../components/TestComponent/UserHead';
import PriorityTag from '../../../../components/TestComponent/PriorityTag';
import StatusTag from '../../../../components/TestComponent/StatusTag';
import TypeTag from '../../../../components/TestComponent/TypeTag';
import EmptyBlock from '../../../../components/TestComponent/EmptyBlock';
import CreateIssue from '../../../../components/TestComponent/CreateIssue';
import EditIssueWide from '../../../../components/TestComponent/EditIssueWide';
import EditIssueNarrow from '../../../../components/TestComponent/EditIssueNarrow';


const { AppState } = stores;

@observer
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      create: false,
      selectedIssue: {},
      createIssue: false,
      selectIssueType: 'issue_test',
      createIssueValue: '',
      createLoading: false,
    };
  }

  componentDidMount() {
    this.getInit();
  }

  getInit() {
    const Request = this.GetRequest(this.props.location.search);
    const {
      paramType, paramId, paramName, paramStatus, paramIssueId, paramUrl, 
    } = Request;
    IssueStore.setParamId(paramId);
    IssueStore.setParamType(paramType);
    IssueStore.setParamName(paramName);
    IssueStore.setParamStatus(paramStatus);
    IssueStore.setParamIssueId(paramIssueId);
    IssueStore.setParamUrl(paramUrl);
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
    if (paramStatus) {
      const obj = {
        advancedSearchArgs: { },
        searchArgs: {},
      };
      const a = [paramStatus];
      obj.advancedSearchArgs.statusCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ statusCode: [paramStatus] });
      IssueStore.loadIssues();
    } else if (paramIssueId) {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues()
        .then((res) => {
          window.console.log(res);
          this.setState({
            selectedIssue: res.content.length ? res.content[0] : {},
            expand: true,
          });
        });
    } else {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues();
    }
  }

  GetRequest(url) {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  handleCreateIssue(issueObj) {
    this.setState({ create: false });
    IssueStore.init();
    IssueStore.loadIssues();
  }

  handleChangeIssueId(issueId) {
    this.setState({
      expand: false,
    }, () => {
      this.setState({
        selectedIssue: {
          issueId,
        },
        expand: true,
      });
    });
  }

  handleIssueUpdate(issueId = this.state.selectedIssue.issueId) {
    loadIssue(issueId).then((res) => {
      // const obj = {
      //   assigneeId: res.assigneeId,
      //   assigneeName: res.assigneeName,
      //   imageUrl: res.imageUrl || '',
      //   issueId: res.issueId,
      //   issueNum: res.issueNum,
      //   priorityCode: res.priorityCode,
      //   priorityName: res.priorityName,
      //   projectId: res.projectId,
      //   statusCode: res.statusCode,
      //   statusColor: res.statusColor,
      //   statusName: res.statusName,
      //   summary: res.summary,
      //   typeCode: res.typeCode,
      // };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = res;
      IssueStore.setIssues(originIssues);
    });
  }

  handleBlurCreateIssue() {
    if (this.state.createIssueValue !== '') {
      const data = {
        priorityCode: 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: 0,
        summary: this.state.createIssueValue,
        typeCode: 'issue_test',
        epicId: 0,
        parentIssueId: 0,
      };
      this.setState({
        createLoading: true,
      });
      createIssue(data)
        .then((res) => {
          IssueStore.init();
          IssueStore.loadIssues();
          this.setState({
            createIssueValue: '',
            createLoading: false,
          });
        })
        .catch((error) => {
        });
    }
  }

  handleChangeType({ key }) {
    this.setState({
      selectIssueType: key,
    });
  }

  handleSort({ key }) {
    const currentSort = IssueStore.order;
    const targetSort = {};
    if (currentSort.orderField === key) {
      targetSort.orderField = key;
      if (currentSort.orderType !== 'desc') {
        targetSort.orderType = 'desc';
      } else {
        targetSort.orderType = 'asc';
      }
    } else {
      targetSort.orderField = key;
      targetSort.orderType = 'desc';
    }
    IssueStore.setOrder(targetSort);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }

  handlePaginationChange(page, pageSize) {
    IssueStore.loadIssues(page - 1, pageSize);
  }

  handlePaginationShowSizeChange(current, size) {
    IssueStore.loadIssues(current - 1, size);
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    IssueStore.setFilteredInfo(filters);
    IssueStore.setBarFilters(barFilters);
    // window.console.log(pagination, filters, sorter, barFilters[0]);
    if (barFilters === undefined || barFilters.length === 0) {
      IssueStore.setBarFilters(undefined);
    }
    const obj = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
    const { statusCode, priorityCode, typeCode } = filters;
    const { issueNum, summary } = filters;
    obj.advancedSearchArgs.statusCode = statusCode || [];
    obj.advancedSearchArgs.priorityCode = priorityCode || [];
    obj.advancedSearchArgs.typeCode = ['issue_test'];
    obj.searchArgs.issueNum = issueNum && issueNum.length ? issueNum[0] : barFilters[0];
    obj.searchArgs.summary = summary && summary.length ? summary[0] : '';
    IssueStore.setFilter(obj);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }

  exportExcel() {
    const projectId = AppState.currentMenuType.id;
    const searchParam = IssueStore.getFilter;
    axios.post(`/zuul/agile/v1/projects/${projectId}/issues/export`, searchParam, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xls`;
        FileSaver.saveAs(blob, fileName);
      });
  }

  renderTestIssue(issue) {
    const {
      typeCode, issueNum, summary, assigneeId, assigneeName, assigneeImageUrl, reporterId,
      reporterName, reporterImageUrl, statusName, statusColor, priorityName, priorityCode,
      epicName, epicColor, componentIssueRelDTOList, labelIssueRelDTOList, 
      versionIssueRelDTOList, creationDate, lastUpdateDate, 
    } = issue;
    return (
      <div style={{
        display: 'flex', flex: 1, marginTop: '3px', flexDirection: 'column', marginBottom: '3px', cursor: 'pointer', 
      }}
      >
        <div style={{
          display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer', 
        }}
        >
          <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueType" values={{ type: TYPE_NAME[typeCode] }} />}>
            <div>
              <TypeTag
                type={{
                  typeCode,
                }}
              />
            </div>
          </Tooltip>
          <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueNum" values={{ num: issueNum }} />}>
            <a style={{
              paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', 
            }}
            >
              {issueNum}
            </a>
          </Tooltip>
          <div style={{ overflow: 'hidden' }}>
            <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={<FormattedMessage id="issue_issueSummary" values={{ summary }} />}>
              <p style={{
                paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset', 
              }}
              >
                {summary}
              </p>
            </Tooltip>
          </div>
          <div className="c7n-flex-space" />          
          {
            assigneeId && reporterName ? (            
              <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueReport" values={{ report: reporterName }} />}>
                <div style={{ margin: '0 5px' }}>
                  <UserHead
                    user={{
                      id: reporterId,
                      loginName: '',
                      realName: reporterName,
                      avatar: reporterImageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }
          {
            assigneeId && reporterName
              ? (
                <div style={{ margin: '0 5px' }}>
                  <FormattedMessage id="issue_issueReportTo" />              
                </div>
              ) : null
          }
          {
            assigneeId ? (            
              <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueAssign" values={{ assign: assigneeName }} />}>
                <div style={{ margin: '0 5px' }}>
                  <UserHead
                    user={{
                      id: assigneeId,
                      loginName: '',
                      realName: assigneeName,
                      avatar: assigneeImageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }          
          <div style={{ margin: '0 5px' }}>
            <FormattedMessage id="issue_issueUpdateOn" />    
          </div>
          <Icon type="today" style={{ margin: '0 5px' }} />
          <div style={{ marginRight: 12 }}>
            {moment(lastUpdateDate).format('LL')}
          </div>   
          <div style={{ flexShrink: '0', display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueStatus" values={{ status: statusName }} />}>
              <div>
                <StatusTag
                  status={{
                    statusColor,
                    statusName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
        </div>
        {/* 第二行 */}
        <div style={{
          display: 'flex', flex: 1, marginTop: '3px', alignItems: 'center', marginBottom: '3px', cursor: 'pointer', 
        }}
        >
          <div style={{ flexShrink: '0' }}>
            <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issuePriority" values={{ priority: priorityName }} />}>
              <div style={{ marginRight: 5 }}>
                <PriorityTag
                  priority={{
                    priorityCode,
                    priorityName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
          {
            versionIssueRelDTOList.map(version => (
              <div 
                style={{
                  color: 'rgba(0,0,0,0.36)',
                  height: 22,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(0,0,0,0.36)',
                  borderRadius: '2px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  padding: '0 8px', 
                  margin: '0 5px',   
                }}
              >
                {version.name}
              </div>
            ))
          }
          {
            epicName ? (
              <div 
                style={{
                  color: epicColor,
                  height: 22,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: epicColor,
                  borderRadius: '2px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  padding: '0 8px',
                  margin: '0 5px',    
                }}
              >
                {epicName}
              </div>
            ) : null
          }
          {componentIssueRelDTOList.length > 0 ? (
            <div style={{ margin: '0 5px', color: '#3F51B5', fontWeight: 500 }}>
              {
              componentIssueRelDTOList.map(component => component.name).join(',')
            }
            </div>
          ) : null}
          <div style={{ margin: '0 5px', fontSize: '13px', color: 'rgba(0,0,0,0.65)' }}>
            <FormattedMessage id="issue_issueCreateAt" />
          </div>
          <Icon type="today" style={{ margin: '0 5px' }} />
          {moment(creationDate).format('LL')}
          <div className="c7n-flex-space" />
          {/* 标签 */}
          {
            labelIssueRelDTOList.map(label => (
              <div
                style={{
                  color: '#000',              
                  borderRadius: '100px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  padding: '2px 12px',
                  background: 'rgba(0, 0, 0, 0.08)',
                  margin: '0 5px',
                  // marginBottom: 3,
                }}
              >
                {label.labelName}
              </div>
            ))
          }          
        </div>
      </div>
    );
  }

  renderWideIssue(issue) {
    return (
      <div style={{
        display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer', 
      }}
      >
        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[issue.typeCode]}`}>
          <div>
            <TypeTag
              type={{
                typeCode: issue.typeCode,
              }}
            />
          </div>
        </Tooltip>
        <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${issue.issueNum}`}>
          <a style={{
            paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', 
          }}
          >
            {issue.issueNum}
          </a>
        </Tooltip>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
            <p style={{
              paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset', 
            }}
            >
              {issue.summary}
            </p>
          </Tooltip>
        </div>

        <div style={{ flexShrink: '0' }}>
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityName}`}>
            <div style={{ marginRight: 12 }}>
              <PriorityTag
                priority={{
                  priorityCode: issue.priorityCode,
                  priorityName: issue.priorityName,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div style={{ flexShrink: '0' }}>
          {
            issue.assigneeId ? (
              <Tooltip mouseEnterDelay={0.5} title={`任务经办人： ${issue.assigneeName}`}>
                <div style={{ marginRight: 12 }}>
                  <UserHead
                    user={{
                      id: issue.assigneeId,
                      loginName: '',
                      realName: issue.assigneeName,
                      avatar: issue.imageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }
        </div>
        <div style={{ flexShrink: '0', display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusName}`}>
            <div>
              <StatusTag
                status={{
                  statusColor: issue.statusColor,
                  statusName: issue.statusName,
                }}
              />
            </div>
          </Tooltip>
        </div>
      </div>
    );
  }

  renderNarrowIssue(issue) {
    return (
      <div style={{ marginTop: '5px', marginBottom: '5px', cursor: 'pointer' }}>
        <div style={{
          display: 'flex', marginBottom: '5px', width: '100%', flex: 1, 
        }}
        >
          <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[issue.typeCode]}`}>
            <div>
              <TypeTag
                type={{
                  typeCode: issue.typeCode,
                }}
              />
            </div>
          </Tooltip>
          <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${issue.issueNum}`}>
            <a style={{
              paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', 
            }}
            >
              {issue.issueNum}
            </a>
          </Tooltip>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
              <p style={{
                paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset', 
              }}
              >
                {issue.summary}
              </p>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityName}`}>
              <div style={{ marginRight: 12 }}>
                <PriorityTag
                  priority={{
                    priorityCode: issue.priorityCode,
                    priorityName: issue.priorityName,
                  }}
                />
              </div>
            </Tooltip>
            <div style={{ width: '140px', flexShrink: '0' }}>
              {
                issue.assigneeId ? (
                  <Tooltip mouseEnterDelay={0.5} title={`任务经办人： ${issue.assigneeName}`}>
                    <div style={{ marginRight: 12 }}>
                      <UserHead
                        user={{
                          id: issue.assigneeId,
                          loginName: '',
                          realName: issue.assigneeName,
                          avatar: issue.imageUrl,
                        }}
                      />
                    </div>
                  </Tooltip>
                ) : null
              }
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusName}`}>
              <div>
                <StatusTag
                  status={{
                    statusColor: issue.statusColor,
                    statusName: issue.statusName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }

  render() {    
    const ORDER = [
      {
        code: 'summary',
        showName: <FormattedMessage id="issue_issueSortByName" />,
      },
      // {
      //   code: 'typeCode',
      //   showName: <FormattedMessage id="issue_issueSortByType" />,
      // },
      {
        code: 'priorityCode',
        showName: <FormattedMessage id="issue_issueSortByPriority" />,
      },
      {
        code: 'statusId',
        showName: <FormattedMessage id="issue_issueSortByStatus" />,
      },
      {
        code: 'assigneeId',
        showName: <FormattedMessage id="issue_issueSortByPerson" />,
      },
    ];
    const filterColumns = [
      {
        title: <FormattedMessage id="issue_issueFilterByNum" />,
        dataIndex: 'issueNum',
        key: 'issueNum',
        filters: [],
      },
      {
        title: <FormattedMessage id="issue_issueFilterBySummary" />,
        dataIndex: 'summary',
        key: 'summary',
        filters: [],
      },
      {
        title: <FormattedMessage id="issue_issueFilterByPriority" />,
        dataIndex: 'priorityCode',
        key: 'priorityCode',
        filters: [
          {
            text: <FormattedMessage id="high" />,
            value: 'high',
          },
          {
            text: <FormattedMessage id="medium" />,
            value: 'medium',
          },
          {
            text: <FormattedMessage id="low" />,
            value: 'low',
          },
        ],
        filterMultiple: true,
      },
      {
        title: <FormattedMessage id="issue_issueFilterByStatus" />,
        dataIndex: 'statusCode',
        key: 'statusCode',
        filters: [
          {
            text: <FormattedMessage id="todo" />,
            value: 'todo',
          },
          {
            text: <FormattedMessage id="doing" />,
            value: 'doing',
          },
          {
            text: <FormattedMessage id="done" />,
            value: 'done',
          },
        ],
        filterMultiple: true,
        filteredValue: IssueStore.filteredInfo.statusCode || null,
      },
    ];
    const columns = [
      {
        title: 'summary',
        dataIndex: 'summary',
        render: (summary, record) => (
          !this.state.expand ? this.renderTestIssue(record) : this.renderNarrowIssue(record)
        ),
      },
    ];
    const sort = (
      <Menu onClick={this.handleSort.bind(this)}>
        {
          ORDER.map(v => (
            <Menu.Item key={v.code}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: IssueStore.order.orderField === v.code ? 'blue' : '#000',
                }}
              >
                <span style={{ width: 100 }}>
                  {v.showName}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {
                    IssueStore.order.orderField === v.code && IssueStore.order.orderType === 'asc' && (
                      <Icon
                        type="arrow_upward"
                      />
                    )
                  }
                  {
                    IssueStore.order.orderField === v.code && IssueStore.order.orderType === 'desc' && (
                      <Icon
                        type="arrow_downward"
                      />
                    )
                  }
                </div>
              </div>
            </Menu.Item>
          ))
        }

      </Menu>
    );

    return (
      <Page className="c7n-Issue c7n-region">
        <Header
          title={<FormattedMessage id="issue_name" />}
          backPath={IssueStore.getBackUrl}
        >
          <Button className="leftBtn" onClick={() => this.setState({ create: true })}>
            <Icon type="playlist_add icon" />
            <FormattedMessage id="issue_createTestIssue" />       
          </Button>
          <Button className="leftBtn" onClick={() => this.exportExcel()}>
            <Icon type="file_upload icon" />
            <FormattedMessage id="export" />        
          </Button>
          <Button            
            onClick={() => {      
              if (this.EditIssueWide) {
                this.EditIssueWide.reloadIssue(this.state.selectedIssue.issueId);   
              }                
              const { current, pageSize } = IssueStore.pagination;
              IssueStore.loadIssues(current - 1, pageSize);
            }}
          >
            <Icon type="autorenew icon" />
            <FormattedMessage id="refresh" />    
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0' }}>
          <div
            className="c7n-content-issue"
            style={{
              width: this.state.expand ? '28%' : '100%',
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <section className="c7n-bar">
              <Table
                rowKey={record => record.id}
                columns={filterColumns}
                dataSource={[]}
                filterBar
                showHeader={false}
                onChange={this.handleFilterChange}
                pagination={false}
                filters={IssueStore.barFilters || []}
                filterBarPlaceholder={<FormattedMessage id="issue_filterTestIssue" />}
              />
            </section>
            <section className="c7n-count">
              <span className="c7n-span-count"><FormattedMessage id="issue_issueTotal" values={{ total: IssueStore.pagination.total }} /></span>
              <Dropdown overlay={sort} trigger={['click']}>
                <div style={{
                  display: 'flex', alignItems: 'center', fontSize: '13px', lineHeight: '20px', cursor: 'pointer', position: 'absolute', right: 25, bottom: 28, 
                }}
                >
                  <Icon type="swap_vert" style={{ fontSize: '16px', marginRight: '5px' }} />
                  <FormattedMessage id="issue_issueSort" />
                </div>
              </Dropdown>
            </section>
            <section
              className={`c7n-table ${this.state.expand ? 'expand-sign' : ''}`}
              style={{
                paddingRight: this.state.expand ? '0' : '24px',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {
                IssueStore.issues.length === 0 && !IssueStore.loading ? (
                  <EmptyBlock
                    style={{ marginTop: 40 }}
                    border
                    pic={pic}
                    title={<FormattedMessage id="issue_noIssueTitle" />}
                    des={<FormattedMessage id="issue_noIssueDescription" />}
                  />
                ) : (
                  <Table
                    rowKey={record => record.issueId}
                    columns={columns}
                    dataSource={_.slice(IssueStore.issues)}
                    filterBar={false}
                    showHeader={false}
                    scroll={{ x: true }}
                    loading={IssueStore.loading}
                    onChange={this.handleTableChange}
                    pagination={false}
                    onRow={record => ({
                      onClick: () => {
                        this.setState({
                          selectedIssue: record,
                          expand: true,
                        });
                      },
                    })
                    }
                    rowClassName={(record, index) => (
                      record.issueId === this.state.selectedIssue.issueId ? 'c7n-border-visible' : 'c7n-border')}
                  />
                )
              }

              <div className="c7n-backlog-sprintIssue">
                <div
                  style={{
                    userSelect: 'none',
                    background: 'white',
                    padding: '12px 0 12px 20px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  {this.state.createIssue ? (
                    <div className="c7n-add" style={{ display: 'block', width: '100%' }}>
                      <div style={{ display: 'flex' }}>
                        <div style={{ display: 'flex', alignItem: 'center' }}>
                          <div
                            className="c7n-sign"
                            style={{
                              backgroundColor: TYPE[this.state.selectIssueType],
                              marginRight: 2,
                            }}
                          >
                            <Icon
                              style={{ fontSize: '14px' }}
                              type={ICON[this.state.selectIssueType]}
                            />
                          </div>
                        </div>
                        <div style={{ marginLeft: 8, flexGrow: 1 }}>
                          <Input
                            autoFocus
                            value={this.state.createIssueValue}
                            placeholder={<FormattedMessage id="issue_whatToDo" />}
                            onChange={(e) => {
                              this.setState({
                                createIssueValue: e.target.value,
                              });
                            }}
                            maxLength={44}
                            onPressEnter={this.handleBlurCreateIssue.bind(this)}
                          />
                        </div>
                      </div>
                      <div style={{
                        marginTop: 10, display: 'flex', marginLeft: 50, paddingRight: 70, 
                      }}
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            this.setState({
                              createIssue: false,
                            });
                          }}
                        >
                          <FormattedMessage id="cancel" />
                        </Button>
                        <Button
                          type="primary"
                          loading={this.state.createLoading}
                          onClick={this.handleBlurCreateIssue.bind(this)}
                        >
                          <FormattedMessage id="ok" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="leftBtn"
                      style={{ color: '#3f51b5' }}
                      funcType="flat"
                      onClick={() => {
                        this.setState({
                          createIssue: true,
                          createIssueValue: '',
                        });
                      }}
                    >
                      <Icon type="playlist_add icon" style={{ marginRight: -2 }} />
                      <span><FormattedMessage id="issue_issueCreate" /></span>
                    </Button>
                  )}
                </div>
              </div>
              {
                IssueStore.issues.length !== 0 ? (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16, 
                  }}
                  >
                    <Pagination
                      current={IssueStore.pagination.current}
                      defaultCurrent={1}
                      defaultPageSize={10}
                      pageSize={IssueStore.pagination.pageSize}
                      showSizeChanger
                      total={IssueStore.pagination.total}
                      onChange={this.handlePaginationChange.bind(this)}
                      onShowSizeChange={this.handlePaginationShowSizeChange.bind(this)}
                    />
                  </div>
                ) : null
              }
            </section>
          </div>

          <div
            className="c7n-sidebar"
            style={{
              width: this.state.expand ? '72%' : 0,
              display: this.state.expand ? 'block' : 'none',
              overflowY: 'hidden',
              overflowX: 'hidden',
            }}
          >
            {
              this.state.expand ? (
                <EditIssueNarrow    
                  ref={(instance) => { 
                    if (instance) { this.EditIssueWide = instance; } 
                  }}             
                  issueId={this.state.selectedIssue.issueId}
                  onCancel={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                    });
                  }}
                  onDeleteIssue={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                    });
                    IssueStore.init();
                    IssueStore.loadIssues();
                  }}
                  onUpdate={this.handleIssueUpdate.bind(this)}
                  onCopyAndTransformToSubIssue={() => {
                    const { current, pageSize } = IssueStore.pagination;
                    IssueStore.loadIssues(current - 1, pageSize);
                  }}
                />
              ) : null
            }
          </div>
          {
            this.state.create ? (
              <CreateIssue
                visible={this.state.create}
                onCancel={() => this.setState({ create: false })}
                onOk={this.handleCreateIssue.bind(this)}

              />
            ) : null
          }
        </Content>
      </Page>
    );
  }
}
export default Test;
