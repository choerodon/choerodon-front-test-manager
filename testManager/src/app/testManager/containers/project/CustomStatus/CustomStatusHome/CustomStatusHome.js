import React, { Component } from 'react';
import {
  Table, Tabs, Button, Icon, Spin,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
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

  refresh = () => {
    this.getList(this.state.statusType);
  }

  handleStatusTableChange = (pagination, filters, sorter) => {
    // this.getList(pagination);
  }

  handleTabChange = (key) => {
    this.setState({
      statusType: key,
    });
    this.getList(key);
  }

  deleteStatus = (data) => {
    this.setState({
      loading: true,
    });
    deleteStatus(data.statusId).then((res) => {
      if (res.failed) {
        Choerodon.prompt('状态已被使用，不可删除');
      }
      this.setState({
        loading: false,
      });
      this.getList();
    }).catch(() => {
      this.setState({
        loading: false,
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
    const columns = [{
      title: <FormattedMessage id="status_type" />,
      dataIndex: 'statusName',
      key: 'statusName',
      filters: [],
      onFilter: (value, record) => {
        const reg = new RegExp(value, 'g');
        return reg.test(record.statusName);
      },
    }, {
      title: <FormattedMessage id="status_comment" />,
      dataIndex: 'description',
      key: 'description',
      filters: [],
      onFilter: (value, record) => {
        const reg = new RegExp(value, 'g');       
        return record.description && reg.test(record.description);
      }, 
    }, {
      title: <FormattedMessage id="status_color" />,
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
      render: (text, record) => (
        record.projectId !== 0
          && (
            <div>
              <Icon
                type="mode_edit"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  // window.console.log(record);
                  this.setState({
                    editVisible: true,
                    editing: record,
                  });
                }}
              />
              <Icon
                type="delete_forever"
                style={{ cursor: 'pointer', marginLeft: 10 }}
                onClick={() => { this.deleteStatus(record); }}
              />
            </div>
          )
      ),
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

        <Header title={<FormattedMessage id="status_title" />}>
          <Button onClick={() => { this.setState({ createVisible: true }); }}>
            <Icon type="playlist_add" />
            <span><FormattedMessage id="status_create" /></span>
          </Button>
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>
        <Spin spinning={loading}>
          <Content
            // style={{
            //   padding: '0 0 10px 0',
            // }}
            title={<FormattedMessage id="status_custom_home_title" />}
            description={<FormattedMessage id="status_custom_home_description" />}
            link="http://choerodon.io/zh/docs/user-guide/test-management/setting/status/"
          >
            <Tabs defaultActiveKey="CYCLE_CASE" onChange={this.handleTabChange}>
              <TabPane tab={<FormattedMessage id="status_executeStatus" />} key="CYCLE_CASE">
                <Table
                  rowKey="statusId"
                  // pagination={statusPagination}
                  columns={columns}
                  dataSource={statusList}
                // onChange={this.handleStatusTableChange}
                />
              </TabPane>
              <TabPane tab={<FormattedMessage id="status_steptatus" />} key="CASE_STEP">
                <Table
                  rowKey="statusId"
                  // pagination={statusPagination}
                  columns={columns}
                  dataSource={statusList}
                // onChange={this.handleStatusTableChange}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Spin>
      </div>
    );
  }
}


export default CustomStatusHome;
