
import React, { Component } from 'react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Link } from 'react-router-dom';
import { Table, Menu, Dropdown, Button, Icon, Collapse } from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import ReportSelectIssue from '../../../../components/ReportSelectIssue';
import { getReportsFromStory } from '../../../../api/reportApi';
import { getIssueStatus } from '../../../../api/agileApi';
import { getStatusList } from '../../../../api/cycleApi';
import { issueLink } from '../../../../common/utils';
import './ReportStory.scss';

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

class ReportStory extends Component {
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
    openId: {},
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
      this.getReportsFromStory(),
    ]).then(([issueStatusList, statusList]) => {
      this.setState({
        issueStatusList,
        statusList,       
        // loading: false,
        openId: {},
      });
    });
  }
  getReportsFromStory = (pagination, issueIds = this.state.issueIds) => {
    const Pagination = pagination || this.state.pagination;
   
    this.setState({ loading: true });
    getReportsFromStory({
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
    this.getReportsFromStory(pagination);
  }
  handleOpen=(issueId, keys) => {
    const { openId } = this.state;  
    openId[issueId] = keys;
    // if (open) {
    this.setState({
      openId: { ...openId },
    });
    // } else {
    //   openId.splice(openId.indexOf(issueId), 1);
    //   this.setState({
    //     openId: [...openId],
    //   });
    // }
  }
  render() {
    const { selectVisible, reportList, loading, pagination,
      issueStatusList, statusList, openId } = this.state;
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
      title: <FormattedMessage id="demand" />,
      dataIndex: 'issueId',
      key: 'issueId',
      width: '25%',
      render(issue, record) {
        const { defectInfo, defectCount } = record;
        const { issueStatusName, issueName, issueColor, issueId } = defectInfo;
        return (
          <div>
            <div className="c7n-collapse-header-container">
              <Link className="c7n-showId" to={issueLink(issueId)} target="_blank">{issueName}</Link>
              <div className="c7n-collapse-header-icon">                 
                <span style={{ color: issueColor, borderColor: issueColor }}>
                  {issueStatusName}
                </span>
              </div>
            
            </div>
            <div>
              <FormattedMessage id="report_defectCount" />: {defectCount}
            </div>
          </div>         
        );
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="test" />,
      dataIndex: 'test',
      key: 'test',   
      width: '25%',
      render(test, record) {
        const { issueStatus, linkedTestIssues, issueId } = record;
        return (
          <Collapse 
            activeKey={openId[issueId]}
            bordered={false} 
            onChange={(keys) => { that.handleOpen(issueId, keys); }}
          >
            {
              linkedTestIssues.map((issue, i) => (<Panel
                showArrow={false}
                header={
                  <div >                                 
                    <div style={{ display: 'flex', alignItems: 'center' }}>     
                      <Icon type="navigate_next" className="c7n-collapse-icon" />       
                      <Link className="c7n-showId" to={issueLink(issue.issueId)} target="_blank">{issue.issueName}</Link>       
                           
                    </div>
                    <div style={{ fontSize: '13px' }}>{issue.summary}</div>
                  </div>
                }
                key={issue.issueId}
              />))
            }
          </Collapse>
        );
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="execute" />,
      dataIndex: 'cycleId',
      key: 'cycleId',
      width: '25%',
      render(cycleId, record) {
        const { linkedTestIssues } = record;        
        return (<div>{linkedTestIssues.map((testIssue) => {
          const { testCycleCaseES, issueId } = testIssue;
          // console.log()
          const totalExecute = testCycleCaseES.length;
          // const todoExecute = 0;
          // let doneExecute = 0;
          const executeStatus = {};
          const caseShow = testCycleCaseES.map((execute) => {
            // 执行的颜色
            const { executionStatus } = execute;
            const statusColor = _.find(statusList, { statusId: executionStatus }) ?
              _.find(statusList, { statusId: executionStatus }).statusColor : '';
            const statusName = _.find(statusList, { statusId: executionStatus }) &&
                _.find(statusList, { statusId: executionStatus }).statusName;
              // if (statusColor !== 'gray') {
              //   doneExecute += 1;
              // }
            if (!executeStatus[statusName]) {
              executeStatus[statusName] = 1;
            } else {
              executeStatus[statusName] += 1;
            }
            const marginBottom = 
            Math.max((execute.defects.length + execute.subStepDefects.length) - 1, 0) * 20;
            return (
              <div style={{ display: 'flex', margin: '5px 0', alignItems: 'center', marginBottom }} >
                <div
                  title={execute.cycleName}
                  style={{ width: 80, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {execute.cycleName}
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
              </div>);
          });
          // window.console.log(executeStatus);
          return openId[record.issueId] && openId[record.issueId]
            .includes(issueId.toString()) ? <div style={{ minHeight: 30 }}> { caseShow }   </div> 
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
        })}
        </div>);        
      },
    }, {
      className: 'c7n-table-white',
      title: <FormattedMessage id="bug" />,
      dataIndex: 'demand',
      key: 'demand',
      width: '25%',
      render(demand, record) {
        const { linkedTestIssues } = record;        
        return (<div>{ linkedTestIssues.map((testIssue) => {
          const { testCycleCaseES, issueId } = testIssue;         
          
          return (openId[record.issueId] && openId[record.issueId]
            .includes(issueId.toString()) ? <div>
              {                
                testCycleCaseES.map((item) => {
                  const { defects, subStepDefects } = item;
                  return (<div>{defects.concat(subStepDefects).length > 0 ? 
                    defects.concat(subStepDefects).map(defect => 
                      (<div className="c7n-collapse-show-item">
                        <Link className="c7n-showId" to={issueLink(defect.issueId)} target="_blank">{defect.defectName}</Link>
                        <div className="c7n-collapse-header-icon">                 
                          <span style={{ 
                            color: defect.defectColor, borderColor: defect.defectColor }}
                          >
                            {defect.defectStatus}
                          </span>
                        </div>
                        {defect.defectType === 'CASE_STEP' &&
                        <div style={{
                          marginLeft: 60,
                          color: 'white',
                          padding: '0 8px',
                          background: 'rgba(0,0,0,0.20)',
                          borderRadius: '100px',
                        }}
                        ><FormattedMessage id="step" /></div>}
                      </div>)) : <div className="c7n-collapse-show-item">－</div>}</div>);
                })
         
              } 
            </div> :            
            <div>
              {
                testCycleCaseES.map((item) => {
                  const { defects, subStepDefects } = item;
                  return (<div>{defects.concat(subStepDefects).map((defect, i) => (
                    <span style={{
                      fontSize: '13px',
                      color: '#3F51B5',                 
                    }}
                    >
                      {i === 0 ? null : '，'}
                      <Link className="c7n-showId" to={issueLink(defect.issueId)} target="_blank">
                        {defect.defectName}
                      </Link>                     
                    </span>))}</div>);
                })}
            </div>);
        })}
        </div>);
      },
    }];

    return (
      <Page className="c7n-report-story">
        <Header title={<FormattedMessage id="report_demandToDefect" />}>
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
              this.setState({ selectVisible: false, issueIds }); 
              this.getReportsFromStory(null, issueIds);
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


export default ReportStory;
