import React, { Component } from 'react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Link } from 'react-router-dom';
import { Table, Menu, Dropdown, Button, Icon, Collapse } from 'choerodon-ui';
import ReportSelectIssue from '../../../../components/ReportSelectIssue';
import { getReports } from '../../../../../api/reportApi';
import { getIssueStatus } from '../../../../../api/agileApi';
import { getStatusList } from '../../../../../api/cycleApi';
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
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
    openId: null,
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
      getStatusList('CASE_STEP'),
      this.getReports(),
    ]).then(([issueStatusList, statusList]) => {
      this.setState({
        issueStatusList,
        statusList,       
        loading: false,
      });
    });
  }
  getReports = (pagination = this.state.pagination, issueIds = this.state.issueIds) => {
    this.setState({ loading: true });
    getReports({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, issueIds).then((reportData) => {
      this.setState({
        loading: false,
        reportList: reportData.content,
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
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
  handleOpen=(issueId, open) => {
    if (open) {
      this.setState({
        openId: issueId,
      });
    } else {
      this.setState({
        openId: null,
      });
    }
  }
  render() {
    const { selectVisible, reportList, loading, pagination,
      issueStatusList, statusList, openId } = this.state;
    const urlParams = AppState.currentMenuType;
    const that = this;
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`} >故事到测试</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>测试到故事</Link>
        </Menu.Item> 
        <Menu.Item key="2">
          <Link to={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>主页</Link>
        </Menu.Item>     
      </Menu>
    );
    const columns = [{
      className: 'c7n-table-white',
      title: '缺陷',
      dataIndex: 'issueId',
      key: 'issueId',
      render(issueId) {
        return (<Collapse 
          bordered={false} 
          onChange={(keys) => { that.handleOpen(issueId, keys.length > 0); }}
        >
          <Panel
            header={
              <div className="c7n-collapse-header-container">
                <div>640</div>
                <div className="c7n-collapse-header-icon">                 
                  <span style={{ }}>
                  待处理
                  </span>
                </div>
              </div>
            }
            key="1"           
          > sss</Panel>
        </Collapse>);
      },
    }, {
      className: 'c7n-table-white',
      title: '执行',
      dataIndex: 'cycleId',
      key: 'cycleId',
      render(cycleId, record) {
        return (<Collapse 
          bordered={false} 
          activeKey={openId === record.issueId ? ['1'] : []}         
        >
          <Panel
            showArrow={false}
            header={
              <div className="c7n-collapse-header-container">
                <div>640</div>
                <div className="c7n-collapse-header-icon">                 
                  <span style={{ }}>
                  待处理
                  </span>
                </div>
              </div>
            }
            key="1"           
          > sss</Panel>
        </Collapse>);
      },
    }, {
      className: 'c7n-table-white',
      title: '测试',
      dataIndex: 'test',
      key: 'test',   
      render(test, record) {
        return (<Collapse 
          bordered={false} 
          activeKey={openId === record.issueId ? ['1'] : []}         
        >
          <Panel
            showArrow={false}
            header={
              <div className="c7n-collapse-header-container">
                <div>640</div>
                <div className="c7n-collapse-header-icon">                 
                  <span style={{ }}>
                  待处理
                  </span>
                </div>
              </div>
            }
            key="1"           
          > sss</Panel>
        </Collapse>);
      },
    }, {
      className: 'c7n-table-white',
      title: '要求',
      dataIndex: 'demand',
      key: 'demand',
      render(demand, record) {
        return (<Collapse 
          bordered={false} 
          activeKey={openId === record.issueId ? ['1'] : []}         
        >
          <Panel
            showArrow={false}
            header={
              <div className="c7n-collapse-header-container">
                <div>640</div>
                <div className="c7n-collapse-header-icon">                 
                  <span style={{ }}>
                  待处理
                  </span>
                </div>
              </div>
            }
            key="1"           
          > sss</Panel>
        </Collapse>);
      },
    }];
    const temp = [{
      issueId: '155',
      cycleId: '555',
      test: 'test',
      demand: 'demand',
    }];
    return (
      <Page className="c7n-report-story">
        <Header title="要求 -> 测试 -> 执行 -> 缺陷">
          <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
          切换报表 <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>
          <Button 
            style={{ marginLeft: 30, marginRight: 30 }}
            onClick={() => {
              this.setState({
                selectVisible: true,
              });
            }}
          >
            <Icon type="open_in_new" />
            <span>选择问题</span>
          </Button>
          <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
          导出 <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>   
          <Button onClick={this.getInfo} style={{ marginLeft: 30 }}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
        // style={{
        //   padding: '0 0 10px 0',
        // }}
          title={`项目"${'projectzzy'}"的报表`}
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
              getReports(issueIds);
            }}
          />
          <Table           
            loading={loading}
            pagination={pagination}
            columns={columns}
            dataSource={temp}
            onChange={this.handleTableChange}
          />
        </Content>
      </Page>
    );
  }
}


export default ReportStory;
