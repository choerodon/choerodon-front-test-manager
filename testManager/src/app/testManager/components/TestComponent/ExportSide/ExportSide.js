import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Content, stores } from 'choerodon-front-boot';
import {
  Modal, Progress, Table, Select, Button,
} from 'choerodon-ui';
import FileSaver from 'file-saver';
import { exportIssues } from '../../../api/IssueManageApi';
import './ExportSide.scss';

const Option = Select.Option;
const { Sidebar } = Modal;
const { AppState } = stores;
class ExportSide extends Component {
  state = {
    visible: false,
  }

  handleClose = () => {
    this.setState({
      visible: false,
    });
  }

  open = () => {
    this.setState({
      visible: true,
    });
    // const ws = new WebSocket(`ws://${process.env.API_HOST}:3000`);

    // ws.onopen = function (evt) {
    //   console.log('Connection open ...');
    //   // ws.send("Hello WebSockets!");
    // };

    // ws.onmessage = function (evt) {
    //   console.log(`Received Message: ${evt.data}`);
    //   // ws.close();
    // };

    // ws.onclose = function (evt) {
    //   console.log('Connection closed.');
    // };
  }

  renderRecord = () => {
    const { importRecord } = this.state;
    if (!importRecord) {
      return <div className="c7ntest-ExportSide-record-normal-text">当前没有导入用例记录</div>;
    }
    return <div className="c7ntest-ExportSide-record-normal-text">上次导入完成时间2018-10-24 15:31:01（耗时9秒）</div>;
  }

  exportExcel() {
    exportIssues(null, null).then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = `${AppState.currentMenuType.name}.xlsx`;
      FileSaver.saveAs(blob, fileName);
    });
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { visible } = this.state;
    const data = [{
      type: 'all',
      version: '0.1.0',
      folder: '文件夹',
      num: 10,
      time: '2018-10-25',
      during: 100,
      progress: 50,
      file: {
        name: '测试管理开发项目.xlsx',
        url: 'http://minio.staging.saas.hand-china.com/error-member-role/file_414d93294456483aa81fbfefef92d79e_errorMemberRole.xls',
      },
    }];
    const columns = [{
      title: '导出类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    }, 
    // {
    //   title: '版本',
    //   dataIndex: 'version',
    //   key: 'version',
    // }, {
    //   title: '文件夹',
    //   dataIndex: 'folder',
    //   key: 'folder',
    // }, 
    {
      title: '用例个数',
      dataIndex: 'num',
      key: 'num',
      width: 100,
    }, {
      title: '导出时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
    }, {
      title: '耗时',
      dataIndex: 'during',
      key: 'during',
      width: 100,
    }, {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: () => <Progress percent={50} status="active" size="small" showInfo={false} />,
    }, {
      title: '文件',
      dataIndex: 'file',
      key: 'file',
      render: file => (
        <a className="c7ntext-text-dot" href={file.url}>
          {file.name}
        </a>
      ),
    }];
    return (
      <Sidebar
        title="导出用例"
        visible={visible}
        okText={<FormattedMessage id="close" />}
        cancelText={<FormattedMessage id="close" />}
        onOk={this.handleOk}
        onCancel={this.handleClose}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={<FormattedMessage id="export_side_content_title" />}
          description={<FormattedMessage id="export_side_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management"
        >
          <div className="c7ntest-ExportSide"> 
            <Select label="版本" placeholder="Please Select" allowClear style={{ width: 200 }} onChange={this.handleChange}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
            <Select label="文件夹" placeholder="Please Select" allowClear style={{ width: 200 }} onChange={this.handleChange}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>Disabled</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>   
            <Button type="primary" funcType="raised">新建导出</Button>       
            {/* {this.renderRecord()} */}
            <Table columns={columns} dataSource={data} />          
          </div>
        </Content>
      </Sidebar>
    );
  }
}

ExportSide.propTypes = {

};

export default ExportSide;
