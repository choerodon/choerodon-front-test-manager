
import React, { Component } from 'react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Link } from 'react-router-dom';
import { Table, Menu, Dropdown, Button, Icon, Collapse } from 'choerodon-ui';
import _ from 'lodash';
import ReportSelectIssue from '../../../../components/ReportSelectIssue';
import { getReportsFromDefect } from '../../../../api/reportApi';
import { getIssueStatus } from '../../../../api/agileApi';
import { getStatusList } from '../../../../api/cycleApi';
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
  issue_test: '#ff7043',
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
  state={
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
  getInfo=() => {
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
        loading: false,
        openId: [],
      });
    });
  }
  getReportsFromDefect = (pagination, issueIds = this.state.issueIds) => {
    const Pagination = pagination || this.state.pagination;
    this.setState({ loading: true });
    getReportsFromDefect({
      page: Pagination.current - 1,
      size: Pagination.pageSize,
    }, issueIds).then((reportData) => {
      this.setState({
        loading: false,
        // reportList: reportData.content,
        reportList: reportData,
        pagination: {
          current: Pagination.current,
          pageSize: Pagination.pageSize,
          total: reportData.totalElements,
        },
      });
    }).catch((error) => {
      window.console.log(error);
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络异常');
    });
  }
  handleTableChange = (pagination, filters, sorter) => {
    this.getList(pagination);
  }
  handleOpen=(issueId) => {
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
          <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`} >要求到缺陷</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>缺陷到要求</Link>
        </Menu.Item> 
        <Menu.Item key="2">
          <Link to={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>主页</Link>
        </Menu.Item>     
      </Menu>
    );
    const columns = [{
      className: 'c7n-table-white',
      title: '缺陷',
      dataIndex: 'a',
      key: 'a',   
      width: '25%',
      render(test, record) {
        const { issueInfosDTO } = record;
        const { issueId, issueColor, issueStatusName, issueName, summary } = issueInfosDTO;
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
                    <div style={{ width: 100, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issueName}</div>
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
      title: '执行',
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
            <div style={{ display: 'flex', margin: '15px 0', alignItems: 'center' }} >
              <div style={{ width: 80 }}>
                {execute.cycleName || execute.testStep}
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
                  >步骤</div> : null
                  
              }
              
            </div>);
        });
        return openId.includes(issueId.toString()) ? 
          <div style={{ minHeight: 30 }}> { caseShow }   </div> 
          :
          (
            <div>
              <div>总共：{totalExecute}</div>
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
      title: '测试',
      dataIndex: 'cycleId',
      key: 'cycleId',
      width: '25%',
      render(cycleId, record) {
        // const { linkedTestIssues } = record; 
        const { testCycleCaseES, testCycleCaseStepES } = record;
        const { issueId } = record.issueInfosDTO;
        const caseShow = testCycleCaseES.concat(testCycleCaseStepES).map((execute) => {
          const { issueInfosDTO } = execute;
          const { issueColor, issueName, issueStatusName, summary } = issueInfosDTO;
          return (<div>
            <div className="c7n-collapse-show-item">
              <div>{issueName}</div>
              <div className="c7n-collapse-header-icon">                 
                <span style={{ color: issueColor, borderColor: issueColor }}>
                  {issueStatusName}
                </span>
              </div>        
            </div>
            <div style={{ fontSize: '13px' }}>{summary}</div>
          </div>);
        });
        return openId.includes(issueId.toString()) ?  
          <div style={{ minHeight: 30 }}> { caseShow }   </div> 
          :
          (         
            <div>总共：{testCycleCaseES.concat(testCycleCaseStepES).length}</div>            
          );
      },
    }, {
      className: 'c7n-table-white',
      title: '要求',
      dataIndex: 'demand',
      key: 'demand',
      width: '25%',
      render(demand, record) {
        const { testCycleCaseES, testCycleCaseStepES } = record;
        const { issueId } = record.issueInfosDTO;
        const caseShow = testCycleCaseES.concat(testCycleCaseStepES).map((execute, i) => {
          const { issueLinkDTOS } = execute;
          // window.console.log(issueLinkDTOS.length);
          const issueLinks = issueLinkDTOS.map((link) => {
            const { statusColor, statusName, issueNum, summary } = link;
            return (<div>
              <div className="c7n-collapse-show-item">
                <div>{issueNum}</div>
                <div className="c7n-collapse-header-icon">                 
                  <span style={{ color: statusColor, borderColor: statusColor }}>
                    {statusName}
                  </span>
                </div>        
              </div>
              <div style={{ fontSize: '13px' }}>{summary}</div>
            </div>);
          });
          return (<div style={{ 
            minHeight: 40, 
          }}
          >{issueLinks}</div>);
        });

        return openId.includes(issueId.toString()) ? caseShow : '-';
      },
    }];

    return (
      <Page className="c7n-report-test">
        <Header title="缺陷 -> 执行 -> 测试 -> 要求">
          <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
          切换报表 <Icon type="arrow_drop_down" />
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
            <span>选择问题</span>
          </Button>
          {/* <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
          导出 <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>    */}
          <Button onClick={this.getInfo} style={{ marginLeft: 30 }}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
        // style={{
        //   padding: '0 0 10px 0',
        // }}
          title={`项目"${AppState.currentMenuType.name}"的报表`}
          description="两种可跟踪性报告可用：要求 -> 测试 -> 执行 -> 缺陷，缺陷 -> 执行 -> 测试 -> 。
        点击您需要查看的报告类型可以查看具体的详细内容。"
          link="#"
        >
          <div style={{ display: 'flex' }} />
          <ReportSelectIssue 
            visible={selectVisible}
            onCancel={() => { this.setState({ selectVisible: false }); }}
            onOk={(issueIds) => {
              this.setState({ selectVisible: false, issueIds }); 
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

