import React, { Component } from 'react';
import { Table, Tabs, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import CreateStatus from '../../../../components/CreateStatus';
import EditStatusSide from '../../../../components/EditStatusSide';
import { getStatusList, deleteStatus } from '../../../../api/TestStatusApi';

const TabPane = Tabs.TabPane;
const { AppState } = stores;
class CustomStatusHome extends Component {
  state = {
    loading: false,
    statusType: 'CYCLE_CASE',
    createVisible: false,
    editVisible: false,
    statusList: [],
    editing: {
      statusId: null,
      statusType: 'CYCLE_CASE',
      objectVersionNumber: null,
      statusName: null,
      description: null,
      statusColor: null,
    },
    statusPagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
  }
  // getList = (pagination) => {
  //   this.setState({ loading: true });
  //   getStatusList({
  //     page: pagination.current - 1,
  //     size: pagination.pageSize,
  //   }, 1).then((statusData) => {
  //     this.setState({
  //       loading: false,
  //       statusPagination: {
  //         current: pagination.current,
  //         pageSize: pagination.pageSize,
  //         total: history.totalElements,
  //       },
  //       statusList: statusData.content,
  //     });
  //   }).catch(() => {
  //     this.setState({
  //       loading: false,
  //     });
  //     Choerodon.prompt('网络异常');
  //   });
  // }
  // getList = (pagination) => {
  //   this.setState({ loading: true });
  //   getStatusList({
  //     page: pagination.current - 1,
  //     size: pagination.pageSize,
  //   }, 1).then((statusData) => {
  //     this.setState({
  //       loading: false,
  //       statusPagination: {
  //         current: pagination.current,
  //         pageSize: pagination.pageSize,
  //         total: history.totalElements,
  //       },
  //       statusList: statusData.content,
  //     });
  //   }).catch(() => {
  //     this.setState({
  //       loading: false,
  //     });
  //     Choerodon.prompt('网络异常');
  //   });
  // }
  componentDidMount() {
    this.getList(this.state.statusType);
  }

  getList = (statusType = this.state.statusType) => {
    this.setState({ loading: true });
    getStatusList(statusType).then((statusList) => {
      this.setState({
        loading: false,
        statusList,
      });
    }).catch(() => {
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络异常');
    });
  }
  refresh=() => {
    this.getList(this.state.statusType);
  }
  handleStatusTableChange = (pagination, filters, sorter) => {
    this.getList(pagination);
  }
  handleTabChange = (key) => {
    this.setState({
      statusType: key,
    });
    this.getList(key);
  }
  deleteStatus=(data) => {
    this.setState({
      loading: true,
    });
    deleteStatus(data.statusId).then(() => {
      this.setState({
        loading: true,
      });
      this.getList();
    }).catch(() => {
      this.setState({
        loading: true,
      });
    });
    // window.console.log(data);
  }
  render() {
    const { 
      loading, statusType, 
      createVisible, editVisible, statusPagination, statusList, 
      editing,
    } = this.state;
    const that = this;
    const columns = [{
      title: '类型',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
    }, {
      title: '颜色',
      dataIndex: 'statusColor',
      key: 'statusColor',
      render(statusColor) {
        return (
          <div style={{ width: 18, height: 18, background: statusColor }} />
        );
      },
    }, {
      title: '',
      key: 'action',
      render(text, record) {
        return (
          record.projectId !== 0 &&
            <div>
              <Icon
                type="mode_edit"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                // window.console.log(record);
                  that.setState({
                    editVisible: true,
                    editing: record,
                  });
                }}
              />
              <Icon 
                type="delete" 
                style={{ cursor: 'pointer', marginLeft: 10 }} 
                onClick={() => { that.deleteStatus(record); }} 
              />
            </div>
        );
      },
    }];
    return (
      <div>
        <CreateStatus        
          visible={createVisible}
          onCancel={() => { this.setState({ createVisible: false }); }}
          onOk={() => { this.setState({ createVisible: false }); this.getList(statusType); }}
        />
        <EditStatusSide
          type={statusType}
          visible={editVisible}
          initValue={editing}
          onCancel={() => { this.setState({ editVisible: false }); }}
          onOk={() => { this.setState({ editVisible: false }); this.getList(statusType); }}
        />

        <Header title="自定义状态">
          <Button onClick={() => { this.setState({ createVisible: true }); }}>
            <Icon type="playlist_add" />
            <span>创建状态</span>
          </Button>
          {/* <Button onClick={() => { this.setState({ createVisible: true }); }}>
            <Icon type="playlist_add" />
            <span>创建步骤状态</span>
          </Button> */}
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Spin spinning={loading}>
          <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
            title={`项目"${AppState.currentMenuType.name}"的自定义状态`}
            description="下表显示可用测试执行状态，测试步骤状态。"
            link="#"
          >
            <Tabs defaultActiveKey="CYCLE_CASE" onChange={this.handleTabChange}>
              <TabPane tab="测试执行状态" key="CYCLE_CASE">
                <Table
                  pagination={statusPagination}
                  columns={columns}
                  dataSource={statusList}
                  onChange={this.handleStatusTableChange}
                />
              </TabPane>
              <TabPane tab="测试步骤状态" key="CASE_STEP">
                <Table
                  pagination={statusPagination}
                  columns={columns}
                  dataSource={statusList}
                  onChange={this.handleStatusTableChange}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Spin>
      </div>
    );
  }
}

CustomStatusHome.propTypes = {

};

export default CustomStatusHome;
