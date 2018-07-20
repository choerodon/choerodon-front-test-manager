import React, { Component } from 'react';
import { Icon, Modal, Upload, Spin, Select, Table } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import './ReportSelectIssue.less';
import { getIssueListSearch, getIssueStatus, getProjectVersion } from '../../api/agileApi';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;

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
class ReportSelectIssue extends Component {
  state = {
    selectLoading: false,
    loading: false,
    versions: [],
    issueList: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 4,
    },
    typeCode: 'story',
    version: 'all',
    issueIds: [],
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.visible === false && nextProps.visible === true) {
      this.setState({
        issueIds: [],
      });
      this.getList();
    }
  }

  onOk = () => {
    const { issueIds } = this.state;        
    const { onOk } = this.props;
    onOk(issueIds);
  }
  getList = (pagination = this.state.pagination, typeCode = this.state.typeCode) => {
    this.setState({ loading: true });
    const search = {
      advancedSearchArgs: {
        typeCode: [typeCode],
      },
    };
    if (this.state.version !== 'all') {
      search.otherArgs = {
        version: [this.state.version],
      };
    }
    getIssueListSearch(search).then((issueData) => {
      this.setState({
        loading: false,
        issueList: issueData.content,
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: issueData.totalElements,
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
  loadVersions = () => {
    this.setState({
      selectLoading: true,
    });
    getProjectVersion().then((versions) => {
      this.setState({
        versions,
        selectLoading: false,
      });
    });
  }
  handleTableChange = (pagination, filters, sorter) => {
    this.getList(pagination);
  }
  selectItems = (selectedRowKeys, selectedRows) => {
    // const issueIds = selectedRows.map(row => row.issueId);

    this.setState({ issueIds: selectedRowKeys });
    window.console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  }
  render() {
    const { visible, onOk, onCancel } = this.props;
    const { loading, versions, selectLoading, pagination, 
      issueList, version, issueIds } = this.state;
    const versionOptions = versions.map(item =>
      (<Option value={item.versionId} key={item.versionId}>
        {item.name}
      </Option>));
    const columns = [{
      title: '类型',
      dataIndex: 'typeCode',
      key: 'typeCode',
      render(typeCode) {
        return NAME[typeCode];
      },
    }, {
      title: '测试问题ID',
      dataIndex: 'issueNum',
      key: 'issueNum',
    }, {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary', 
    }];
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title="选择问题"
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={`项目“${AppState.currentMenuType.name}”的报表选择问题`}
              description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
              link="#"
            >

              <div style={{ display: 'flex' }}>
                <Select
                  defaultValue={version}
                  style={{ flex: 1, maxWidth: 300, margin: '0 0 10px 0' }}
                  label="版本"               
                  loading={selectLoading}
                  onFocus={this.loadVersions}
                  onSelect={(value) => {
                    this.setState({
                      version: value,
                    });
                    this.getList();
                  }}
                >
                  <Option value="all" key="all">
                    所有版本
                  </Option>
                  {versionOptions}
                </Select>
                <Select
                  defaultValue="story"
                  style={{ flex: 1, maxWidth: 300, margin: '0 0 10px 30px' }}
                  label="类型"
                  onSelect={(code) => {
                    this.setState({
                      typeCode: code,
                    });
                    this.getList(pagination, code);
                  }}
                >{
                    Object.keys(TYPE).map(type => (<Option value={type} key={type}>
                      <div style={{ display: 'inline-flex', height: 20 }}>
                        <div style={{
                          background: TYPE[type],
                          borderRadius: '50%',
                          color: 'white',
                          width: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}
                        >
                          <Icon type={ICON[type]} style={{ fontSize: '14px' }} />
                        </div>
                        <span>
                          {NAME[type]}
                        </span>
                      </div>
                    </Option>))
                  }
                </Select>
              </div>
              <Table
                rowKey="issueId"
                rowSelection={{ onChange: this.selectItems, selectedRowKeys: issueIds }}
                loading={loading}
                pagination={pagination}
                columns={columns}
                dataSource={issueList}
                onChange={this.handleTableChange}
              />
            </Content>
          </Sidebar>
        </Spin>
      </div>
    );
  }
}


export default ReportSelectIssue;
