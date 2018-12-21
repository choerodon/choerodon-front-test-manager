import React, { Component } from 'react';
import {
  Table, Tabs, Button, Icon, Spin, Modal,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Page, Header, Content } from 'choerodon-front-boot';
import { CreateStatus, EditStatusSide } from '../../../../components/CustomStatusComponent';
import { getProjectName } from '../../../../common/utils';
import { getStatusList, deleteStatus } from '../../../../api/TestStatusApi';

const TabPane = Tabs.TabPane;
const { confirm } = Modal;
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
  }

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


  handleTabChange = (key) => {
    this.setState({
      statusType: key,
    });
    this.getList(key);
  }

  deleteStatus = (data) => {
    confirm({
      title: '确定要删除状态?',
      onOk: () => {
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
      },         
    });
  }

  render() {
    const {
      loading, statusType,
      createVisible, editVisible, statusList,
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
        <Page>
          <Header title={<FormattedMessage id="status_title" />}>
            <Button icon="playlist_add" onClick={() => { this.setState({ createVisible: true }); }}>
              <FormattedMessage id="status_create" />
            </Button>
            <Button icon="autorenew" onClick={this.refresh}>
              <FormattedMessage id="refresh" />
            </Button>
          </Header>
          <Spin spinning={loading}>
            <Content            
              title={<FormattedMessage id="status_custom_home_title" values={{ name: getProjectName() }} />}
              description={<FormattedMessage id="status_custom_home_description" />}
              link="http://choerodon.io/zh/docs/user-guide/test-management/setting/status/"
            >
              <Tabs defaultActiveKey="CYCLE_CASE" onChange={this.handleTabChange}>
                <TabPane tab={<FormattedMessage id="status_executeStatus" />} key="CYCLE_CASE">                
                  <Table
                    rowKey="statusId"               
                    columns={columns}
                    dataSource={statusList}
                  />
                </TabPane>
                <TabPane tab={<FormattedMessage id="status_steptatus" />} key="CASE_STEP">
                  <Table
                    rowKey="statusId" 
                    columns={columns}
                    dataSource={statusList}
                  />
                </TabPane>
              </Tabs>
            </Content>
          </Spin>
        </Page>
      </div>
    );
  }
}


export default CustomStatusHome;
