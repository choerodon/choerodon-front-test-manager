import React, { Component } from 'react';
import Moment from 'moment';
import { observer } from 'mobx-react';
import { extendMoment } from 'moment-range';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Tooltip, Table, Button, Icon, Input, Tree, Spin, Modal,
} from 'choerodon-ui';
import { Link } from 'react-router-dom';
import { getCycleById, getCycles, getStatusList } from '../../../../api/cycleApi';
import { EventCalendar, PlanTree, CreateCycle } from '../../../../components/TestPlanComponent';
import { RichTextShow, SelectFocusLoad } from '../../../../components/CommonComponent';
import DragTable from '../../../../components/DragTable';

import { getUsers } from '../../../../api/CommonApi';
import TestPlanStore from '../../../../store/project/TestPlan/TestPlanStore';
import {
  delta2Html, delta2Text, issueLink,
} from '../../../../common/utils';
import './TestPlanHome.scss';
import noRight from '../../../../assets/noright.svg';

const styles = {
  statusOption: {
    lineHeight: '20px',
    height: 20,
    width: 60,
    textAlign: 'center',
    borderRadius: '2px',
    display: 'inline-block',
    color: 'white',
  },
};
const { AppState } = stores;
const moment = extendMoment(Moment);
@observer
class TestPlanHome extends Component {
  state = {
    CreateCycleVisible: false,
    loading: false,
    treeShow: true,
    executePagination: {
      current: 1,
      total: 0,
      pageSize: 5,
    },
    testList: [],
    statusList: [],
    filters: {},
    rightLoading: false,
    calendarShowMode: 'single',
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    this.setState({
      loading: true,
    });
    getStatusList('CYCLE_CASE').then((statusList) => {
      this.setState({ statusList });
    });
    TestPlanStore.getTree();
    // this.PlanTree.getTree().then(() => {
    //   this.setState({
    //     loading: false,
    //   });
    // });
    // 如果选中了项，就刷新table数据
    const currentCycle = TestPlanStore.getCurrentCycle;
    const selectedKeys = TestPlanStore.getSelectedKeys;
    if (currentCycle.cycleId) {
      this.loadCycle(selectedKeys, { node: { props: { data: currentCycle } } }, true);
    }
  }

  loadCycle = (selectedKeys, {
    selected, selectedNodes, node, event,
  } = {}, flag) => {
    // window.console.log(selectedNodes, node, event);
    if (selectedKeys) {
      TestPlanStore.setSelectedKeys(selectedKeys);
    }
    const { executePagination, filters } = this.state;
    const data = node ? node.props.data : TestPlanStore.getCurrentCycle;
    if (data.cycleId) {
      if (data.type === 'cycle') {
        this.setState({
          calendarShowMode: 'multi',
        });
      } else {
        this.setState({
          calendarShowMode: 'single',
        });
      }
      if (!flag) {
        this.setState({
          rightLoading: true,
          // currentCycle: data,
        });
      }

      TestPlanStore.setCurrentCycle(data);
      // window.console.log(data);

      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, data.cycleId,
      {
        ...filters,
        lastUpdatedBy: [Number(this.lastUpdatedBy)],
        assignedTo: [Number(this.assignedTo)],
      }).then((cycle) => {
        this.setState({
          rightLoading: false,
          testList: cycle.content,
          executePagination: {
            current: executePagination.current,
            pageSize: executePagination.pageSize,
            total: cycle.totalElements,
          },
        });
        // window.console.log(cycle);
      });
    }
  }

  render() {
    const {
      treeShow, CreateCycleVisible, testList, rightLoading, statusList,
      executePagination, calendarShowMode,
    } = this.state;
    const loading = TestPlanStore.loading;
    const currentCycle = TestPlanStore.getCurrentCycle;
    const { cycleId, title } = currentCycle;
    const columns = [{
      title: 'ID',
      dataIndex: 'issueName',
      key: 'issueName',
      flex: 1,
      // filters: [],
      // onFilter: (value, record) => 
      //   record.issueInfosDTO && record.issueInfosDTO.issueName.indexOf(value) === 0,  
      render(issueId, record) {
        const { issueInfosDTO } = record;
        return (
          issueInfosDTO && (
            <Tooltip
              title={(
                <div>
                  <div>{issueInfosDTO.issueNum}</div>
                  <div>{issueInfosDTO.summary}</div>
                </div>
              )}
            >
              <Link
                className="c7n-text-dot"
                style={{
                  width: 100,
                }}
                to={issueLink(issueInfosDTO.issueId, issueInfosDTO.typeCode)}
                target="_blank"
              >
                {issueInfosDTO.issueNum}
              </Link>
            </Tooltip>
          )
        );
      },
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'executionStatus',
      key: 'executionStatus',
      filters: statusList.map(status => ({ text: status.statusName, value: status.statusId })),
      // onFilter: (value, record) => record.executionStatus === value,  
      flex: 1,
      render(executionStatus) {
        const statusColor = _.find(statusList, { statusId: executionStatus })
          ? _.find(statusList, { statusId: executionStatus }).statusColor : '';
        return (
          <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
            {_.find(statusList, { statusId: executionStatus })
              && _.find(statusList, { statusId: executionStatus }).statusName}
          </div>
        );
      },
    }, {
      title: <FormattedMessage id="cycle_comment" />,
      dataIndex: 'comment',
      key: 'comment',
      filters: [],
      flex: 1,
      render(comment) {
        return (
          <Tooltip title={<RichTextShow data={delta2Html(comment)} />}>
            <div
              className="c7n-text-dot"
            // style={{
            //   width: 65,
            // }}
            >
              {delta2Text(comment)}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: <FormattedMessage id="bug" />,
      dataIndex: 'defects',
      key: 'defects',
      flex: 1,
      render: defects => (
        <Tooltip
          placement="topLeft"
          title={(
            <div>
              {defects.map((defect, i) => (
                defect.issueInfosDTO && (
                  <div>
                    <Link
                      style={{
                        color: 'white',
                      }}
                      to={issueLink(defect.issueInfosDTO.issueId, defect.issueInfosDTO.typeCode)}
                      target="_blank"
                    >
                      {defect.issueInfosDTO.issueName}
                    </Link>
                    <div>{defect.issueInfosDTO.summary}</div>
                  </div>
                )
              ))}
            </div>
          )}
        >
          {defects.map((defect, i) => defect.issueInfosDTO && defect.issueInfosDTO.issueName).join(',')}
        </Tooltip>
      ),
    },
    {
      title: <FormattedMessage id="cycle_executeBy" />,
      dataIndex: 'lastUpdateUser',
      key: 'lastUpdateUser',
      flex: 1,
      render(lastUpdateUser) {
        return (
          <div
            className="c7n-text-dot"
          >
            {lastUpdateUser.realName}
          </div>
        );
      },
    }, {
      title: <FormattedMessage id="cycle_executeTime" />,
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
      flex: 1,
      render(lastUpdateDate) {
        return (
          <div
            className="c7n-text-dot"
          >
            {/* {lastUpdateDate && moment(lastUpdateDate).format('D/MMMM/YY')} */}
            {lastUpdateDate && moment(lastUpdateDate).format('YYYY-MM-DD')}
          </div>
        );
      },
    }, {
      title: <FormattedMessage id="cycle_assignedTo" />,
      dataIndex: 'assigneeUser',
      key: 'assigneeUser',
      flex: 1,
      render(assigneeUser) {
        return (
          <div
            className="c7n-text-dot"
          >
            {assigneeUser && assigneeUser.realName}
          </div>
        );
      },
    }, {
      title: '',
      key: 'action',
      flex: 1,
      render: (text, record) => (
        record.projectId !== 0
        && (
          <div style={{ display: 'flex' }}>
            {/* <Tooltip title={<FormattedMessage id="execute_quickPass" />}>
              <Icon type="pass" onClick={this.quickPass.bind(this, record)} style={{ cursor: 'pointer' }} />
            </Tooltip> */}
            <Icon
              type="explicit2"
              style={{ cursor: 'pointer', margin: '0 10px' }}
              onClick={() => {
                const { history } = this.props;
                const urlParams = AppState.currentMenuType;
                history.push(`/testManager/TestExecute/execute/${record.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
              }}
            />
            {/* <Icon
              type="delete_forever"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                this.deleteExecute(record);
              }}
            /> */}
          </div>
        )
      ),
    }];
    const otherColumns = [
      {
        title: <FormattedMessage id="cycle_createExecute_component" />,
        dataIndex: 'issueInfosDTO',
        key: 'component',
        render(issueInfosDTO) {
          if (!issueInfosDTO) {
            return null;
          }
          const { componentIssueRelDTOList } = issueInfosDTO;
          return (
            <Tooltip
              placement="topLeft"
              title={(
                <div>
                  {componentIssueRelDTOList.map((component, i) => (
                    <div>
                      {component.name}
                    </div>
                  ))}
                </div>
              )}
            >
              {componentIssueRelDTOList.map((component, i) => component.name).join(',')}
            </Tooltip>
          );
        },
      },
      {
        title: <FormattedMessage id="cycle_createExecute_label" />,
        dataIndex: 'issueInfosDTO',
        key: 'statusName',
        render(issueInfosDTO) {
          if (!issueInfosDTO) {
            return null;
          }
          const { labelIssueRelDTOList } = issueInfosDTO;
          return (
            <Tooltip
              placement="topLeft"
              title={(
                <div>
                  {labelIssueRelDTOList.map((label, i) => (
                    <div>
                      {label.labelName}
                    </div>
                  ))}
                </div>
              )}
            >
              <div style={{
                display: 'flex', flexFlow: 'row wrap', width: '100%', justifyContent: 'space-between', alignItems: 'center', maxHeight: 24, overflow: 'hidden',
              }}
              >
                {labelIssueRelDTOList.map((label, i) => (
                  <div
                    style={{
                      flexShrink: 0,
                      width: '48%',
                      color: '#000',
                      borderRadius: '100px',
                      fontSize: '13px',
                      lineHeight: '20px',
                      padding: '2px 5px',
                      textAlign: 'center',
                      background: 'rgba(0, 0, 0, 0.08)',
                      // margin: '0 5px',
                      // marginBottom: 3,
                    }}
                    className="c7n-text-dot"
                  >
                    {label.labelName}
                  </div>
                ))}
              </div>

            </Tooltip>
          );
        },
      },
    ];
    return (
      <Page className="c7n-TestPlan">
        <Header title={<FormattedMessage id="testPlan_name" />}>
          <Button onClick={() => { this.setState({ CreateCycleVisible: true }); }}>
            <Icon type="playlist_add icon" />
            <span>
              <FormattedMessage id="cycle_create_title" />
            </span>
          </Button>
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span>
              <FormattedMessage id="refresh" />
            </span>
          </Button>
        </Header>
        
        <Content
          title={null}
          description={null}
          style={{ padding: 0 , display: 'flex' }}
        >
          <Spin spinning={loading}>
            <div className="c7n-TestPlan-content">
              <CreateCycle
                visible={CreateCycleVisible}
                onCancel={() => { this.setState({ CreateCycleVisible: false }); }}
                onOk={() => { this.setState({ CreateCycleVisible: false }); this.refresh(); }}
              />
              {!treeShow && (
              <div className="c7n-TestPlan-bar">
                <div
                  role="none"
                  className="c7n-TestPlan-bar-button"
                  onClick={() => {
                    this.setState({
                      treeShow: true,
                    });
                  }}
                >
                  <Icon type="navigate_next" />
                </div>
                <p
                  role="none"
                  onClick={() => {
                    this.setState({
                      treeShow: true,
                    });
                  }}
                >
                  <FormattedMessage id="testPlan_name" />
                </p>
              </div>
              )}
              <div className="c7n-TestPlan-tree">
                {treeShow && (
                <PlanTree
                  ref={(tree) => { this.PlanTree = tree; }}
                  onClose={() => {
                    this.setState({
                      treeShow: false,
                    });
                  }}
                  loadCycle={this.loadCycle}
                />
                )}
              </div>
              {/* <Spin spinning={loading}> */}
              {cycleId ? (
                <div className="c7n-TestPlan-content-right">
                  <EventCalendar showMode={calendarShowMode} />
                  {calendarShowMode === 'single' && (
                  <div className="c7n-TestPlan-content-right-bottom">
                    <div style={{ display: 'flex', marginBottom: 20 }}>
                      <SelectFocusLoad
                        label={<FormattedMessage id="cycle_executeBy" />}
                        request={getUsers}
                        onChange={(value) => {
                          this.lastUpdatedBy = value;
                          this.loadCycle();
                        }}
                      />
                      <div style={{ marginLeft: 20 }}>
                        <SelectFocusLoad
                          label={<FormattedMessage id="cycle_assignedTo" />}
                          request={getUsers}
                          onChange={(value) => {
                            this.assignedTo = value;
                            this.loadCycle();
                          }}
                        />
                      </div>
                    </div>
                    <DragTable
                      pagination={executePagination}
                      loading={rightLoading}
                      onChange={this.handleExecuteTableChange}
                      dataSource={testList}
                      columns={treeShow ? columns
                        : columns.slice(0, 4).concat(otherColumns).concat(columns.slice(4))}
                      onDragEnd={this.onDragEnd}
                      dragKey="executeId"
                    />
                  </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', height: 250, margin: '88px auto', padding: '50px 75px', border: '1px dashed rgba(0,0,0,0.54)',
                }}
                >
                  <img src={noRight} alt="" />
                  <div style={{ marginLeft: 40 }}>
                    <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)' }}>根据当前选定的测试循环没有查询到循环信息</div>
                    <div style={{ fontSize: '20px', marginTop: 10 }}>尝试在您的树状图中选择测试循环</div>
                  </div>
                </div>
              )}

            </div>
          </Spin>
        </Content>
        
      </Page>
    );
  }
}

TestPlanHome.propTypes = {

};

export default TestPlanHome;
