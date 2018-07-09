import React, { Component } from 'react';
import { Table, Tabs, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import CreateStatus from '../../../../components/CreateStatus';
import EditStatusSide from '../../../../components/EditStatusSide';

const TabPane = Tabs.TabPane;

function callback(key) {
  window.console.log(key);
}


const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}];
class CustomStatusHome extends Component {
  state = {
    createVisible: false,
    editVisible: false,
  }
  render() {
    const { createVisible, editVisible } = this.state;
    const that = this;
    const columns = [{
      title: '类型',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '说明',
      dataIndex: 'age',
      key: 'age',
    }, {
      title: '颜色',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: '',
      key: 'action',
      render(text, recorder) {
        return (
          <div>
            <Icon
              type="mode_edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                that.setState({
                  editVisible: true
                })
              }}
            />
            <Icon type="delete" style={{ cursor: 'pointer', marginLeft: 10 }} />
          </div>
        );
      },
    }];
    return (
      <div>
        <CreateStatus
          visible={createVisible}
          onCancel={() => { this.setState({ createVisible: false }); }}
          onOk={() => { window.console.log('ok'); }}
        />
        <EditStatusSide
          visible={editVisible}
          onCancel={() => { this.setState({ editVisible: false }); }}
          onOk={() => { window.console.log('ok'); }}
        />

        <Header title="自定义状态">
          <Button onClick={() => { this.setState({ createVisible: true }); }}>
            <Icon type="playlist_add" />
            <span>创建执行状态</span>
          </Button>
          <Button onClick={() => { this.setState({ createVisible: true }); }}>
            <Icon type="playlist_add" />
            <span>创建步骤状态</span>
          </Button>
          <Button onClick={this.getInfo}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={`项目"${'projectzzy'}"的自定义状态`}
          description="下表显示可用测试执行状态，测试步骤状态。"
          link="#"
        >
          <Tabs defaultActiveKey="1" onChange={callback}>
            <TabPane tab="测试执行状态" key="1">
              <Table columns={columns} dataSource={data} />
            </TabPane>
            <TabPane tab="测试步骤状态" key="2">测试步骤状态</TabPane>
          </Tabs>
        </Content>
      </div>
    );
  }
}

CustomStatusHome.propTypes = {

};

export default CustomStatusHome;
