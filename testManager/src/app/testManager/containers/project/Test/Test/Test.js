import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Table, Button, Select, Popover, Tabs, Tooltip, Input, Dropdown, Menu, Pagination, Spin, Icon } from 'choerodon-ui';

import '../TestComponent/assets/main.scss';
import './Test.scss';

import IssueStore from '../TestComponent/stores/IssueStore';

import { STATUS, COLOR, TYPE, ICON, TYPE_NAME } from '../TestComponent/common/Constant';
import pic from '../TestComponent/assets/问题管理－空.png';
import { loadIssue, createIssue } from '../TestComponent/api/IssueApi';
import UserHead from '../TestComponent/components/UserHead';
import PriorityTag from '../TestComponent/components/PriorityTag';
import StatusTag from '../TestComponent/components/StatusTag';
import TypeTag from '../TestComponent/components/TypeTag';
import { ReadAndEdit } from '../TestComponent/components/CommonComponent';
import EmptyBlock from '../TestComponent/components/EmptyBlock';
import DailyLog from '../TestComponent/components/DailyLog';
import CreateIssue from '../TestComponent/components/CreateIssue';
import EditIssue from '../TestComponent/components/EditIssueWide';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
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
      selectIssueType: 'task',
      createIssueValue: '',
      createLoading: false,
    };
  }
  componentDidMount() {
    this.getInit();
  }

  getInit() {
    const Request = this.GetRequest(this.props.location.search);
    const { paramType, paramId, paramName } = Request;
    IssueStore.setParamId(paramId);
    IssueStore.setParamType(paramType);
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
    IssueStore.setBarFilters(arr);
    IssueStore.init();
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
      const obj = {
        assigneeId: res.assigneeId,
        assigneeName: res.assigneeName,
        imageUrl: res.imageUrl || '',
        issueId: res.issueId,
        issueNum: res.issueNum,
        priorityCode: res.priorityCode,
        priorityName: res.priorityName,
        projectId: res.projectId,
        statusCode: res.statusCode,
        statusColor: res.statusColor,
        statusName: res.statusName,
        summary: res.summary,
        typeCode: res.typeCode,
      };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = obj;
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
        typeCode: this.state.selectIssueType,
        epicId: 0,
        epicName: this.state.selectIssueType === 'issue_epic' ? this.state.createIssueValue : undefined,
        parentIssueId: 0,
      };
      this.setState({
        createLoading: true,
      });
      createIssue(data)
        .then((res) => {
          IssueStore.init();
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
    IssueStore.setBarFilters(barFilters);
    window.console.log(barFilters);
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
    obj.advancedSearchArgs.typeCode = typeCode || [];
    obj.searchArgs.issueNum = issueNum && issueNum.length ? issueNum[0] : '';
    obj.searchArgs.summary = summary && summary.length ? summary[0] : '';
    IssueStore.setFilter(obj);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }

  renderWideIssue(issue) {
    return (
      <div style={{ display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer' }}>
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
          <a style={{ paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {issue.issueNum}
          </a>
        </Tooltip>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
            <p style={{ paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset' }}>
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
        <div style={{ display: 'flex', marginBottom: '5px', width: '100%', flex: 1 }}>
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
            <a style={{ paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {issue.issueNum}
            </a>
          </Tooltip>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
              <p style={{ paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset' }}>
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
        showName: '问题名称',
      },
      {
        code: 'typeCode',
        showName: '问题类型',
      },
      {
        code: 'priorityCode',
        showName: '问题优先级',
      },
      {
        code: 'statusId',
        showName: '问题状态',
      },
      {
        code: 'assigneeId',
        showName: '经办人',
      },
    ];
    const filterColumns = [
      {
        title: '类型',
        dataIndex: 'typeCode',
        key: 'typeCode',
        filters: [
          {
            text: '故事',
            value: 'story',
          },
          {
            text: '任务',
            value: 'task',
          },
          {
            text: '故障',
            value: 'bug',
          },
          {
            text: '史诗',
            value: 'issue_epic',
          },
        ],
        filterMultiple: true,
      },
      {
        title: '编号',
        dataIndex: 'issueNum',
        key: 'issueNum',
        filters: [],
      },
      {
        title: '概要',
        dataIndex: 'summary',
        key: 'summary',
        filters: [],
      },
      {
        title: '优先级',
        dataIndex: 'priorityCode',
        key: 'priorityCode',
        filters: [
          {
            text: '高',
            value: 'high',
          },
          {
            text: '中',
            value: 'medium',
          },
          {
            text: '低',
            value: 'low',
          },
        ],
        filterMultiple: true,
      },
      {
        title: '状态',
        dataIndex: 'statusCode',
        key: 'statusCode',
        filters: [
          {
            text: '待处理',
            value: 'todo',
          },
          {
            text: '进行中',
            value: 'doing',
          },
          {
            text: '已完成',
            value: 'done',
          },
        ],
        filterMultiple: true,
      },
    ];
    const columns = [
      {
        title: 'summary',
        dataIndex: 'summary',
        render: (summary, record) => (
          !this.state.expand ? this.renderWideIssue(record) : this.renderNarrowIssue(record)
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
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          ['story', 'task', 'bug', 'issue_epic'].map(type => (
            <Menu.Item key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  type={{
                    typeCode: type,
                  }}
                />
                <span style={{ marginLeft: 8 }}>
                  {TYPE_NAME[type]}
                </span>
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return (
      <Page className="c7n-Issue c7n-region">
        <Header
          title="问题管理"
          backPath={IssueStore.getBackUrl}
        >
          <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ create: true })}>
            <Icon type="playlist_add icon" />
            <span>创建问题</span>
          </Button>
          <Button
            funcTyp="flat"
            onClick={() => {
              const { current, pageSize } = IssueStore.pagination;
              IssueStore.loadIssues(current - 1, pageSize);
            }}
          >
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0' }}>
          <div 
            className="c7n-content-issue" 
            style={{
              width: this.state.expand ? '28%' : '100%',
              display: 'block',
              overflowY: 'scroll',
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
              />
            </section>
            <section className="c7n-count">
              <span className="c7n-span-count">共{IssueStore.pagination.total}条任务</span>
              <Dropdown overlay={sort} trigger={['click']}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', lineHeight: '20px', cursor: 'pointer', position: 'absolute', right: 25, bottom: 28 }}>
                  <Icon type="swap_vert" style={{ fontSize: '16px', marginRight: '5px' }} />
                  <span>排序</span>
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
                    title="根据当前搜索条件没有查询到问题"
                    des="尝试修改您的过滤选项或者在下面创建新的问题"
                  />
                ) : (
                  <Table
                    rowKey={record => record.id}
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
                        <Dropdown overlay={typeList} trigger={['click']}>
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
                            <Icon
                              type="arrow_drop_down"
                              style={{ fontSize: 16 }}
                            />
                          </div>
                        </Dropdown>
                        <div style={{ marginLeft: 8, flexGrow: 1 }}>
                          <Input
                            autoFocus
                            value={this.state.createIssueValue}
                            placeholder="需要做什么"
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
                      <div style={{ marginTop: 10, display: 'flex', marginLeft: 50, paddingRight: 70 }}>
                        <Button 
                          type="primary"
                          onClick={() => {
                            this.setState({
                              createIssue: false,
                            });
                          }}
                        >取消</Button>
                        <Button
                          type="primary"
                          loading={this.state.createLoading}
                          onClick={this.handleBlurCreateIssue.bind(this)}
                        >确定</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="leftBtn"
                      style={{ color: '#3f51b5' }}
                      funcTyp="flat"
                      onClick={() => {
                        this.setState({ 
                          createIssue: true,
                          createIssueValue: '',
                        });
                      }}
                    >
                      <Icon type="playlist_add icon" />
                      <span>创建问题</span>
                    </Button>
                  )}
                </div>
              </div>
              {
                IssueStore.issues.length !== 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16 }}>
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
              this.state.expand && <EditIssue
                issueId={this.state.selectedIssue.issueId}
                changeIssueId={this.handleChangeIssueId.bind(this)}
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
                }}
                onUpdate={this.handleIssueUpdate.bind(this)}
              />
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
