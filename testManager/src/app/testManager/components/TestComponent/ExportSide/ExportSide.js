import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Content, stores } from 'choerodon-front-boot';
import {
  Modal, Progress, Table, Select, Button, Icon,
} from 'choerodon-ui';
import FileSaver from 'file-saver';
import moment from 'moment';
import { SelectVersion, SelectFolder } from '../../CommonComponent';
import { exportIssues } from '../../../api/IssueManageApi';
import './ExportSide.scss';

const Option = Select.Option;
const { Sidebar } = Modal;
const { AppState } = stores;
function humanizeDuration(timeInMillisecond) {
  let result = '';
  if (timeInMillisecond) {
    if ((result = Math.round(timeInMillisecond / (60 * 60 * 24 * 30 * 12))) > 0) { // year
      result = `${result} 年`;
    } else if ((result = Math.round(timeInMillisecond / (60 * 60 * 24 * 30))) > 0) { // months
      result = `${result} 月`;
    } else if ((result = Math.round(timeInMillisecond / (60 * 60 * 24))) > 0) { // days
      result = `${result} 天`;
    } else if ((result = Math.round(timeInMillisecond / (60 * 60))) > 0) { // Hours
      result = `${result} 小时`;
    } else if ((result = Math.round(timeInMillisecond / (60))) > 0) { // minute
      result = `${result} 分钟`;
    } else if ((result = Math.round(timeInMillisecond)) > 0) { // second
      result = `${result} 秒`;
    } else {
      result = `${timeInMillisecond} 毫秒`;
    }
  }
  return result;
}
class ExportSide extends Component {
  state = {
    visible: false,
    versionId: null,
    folderId: null,
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

  handleVersionChange = (versionId) => {
    this.setState({
      versionId,
      folderId: null,
    });
  }

  handleFolderChange = (folderId) => {
    this.setState({
      folderId,
    });
  }

  render() {
    const { visible, versionId, folderId } = this.state;
    const data = [{
      source: '项目：测试管理开发项目',
      version: '0.1.0',
      folder: '文件夹',
      num: 10,
      time: '2018-10-25',
      during: 30,
      progress: 50,
      file: {
        name: '测试管理开发项目.xlsx',
        url: 'http://minio.staging.saas.hand-china.com/error-member-role/file_414d93294456483aa81fbfefef92d79e_errorMemberRole.xls',
      },
    }, {
      source: '版本：0.1.0',
      version: '0.1.0',
      folder: '文件夹',
      num: 10,
      time: '2018-10-25',
      during: 100,
      progress: 100,
      file: {
        name: '测试管理开发项目.xlsx',
        url: 'http://minio.staging.saas.hand-china.com/error-member-role/file_414d93294456483aa81fbfefef92d79e_errorMemberRole.xls',
      },
    }, {
      source: '文件夹：新文件夹',
      version: '0.1.0',
      folder: '文件夹',
      num: 10,
      time: '2018-10-25',
      during: 1000,
      progress: 100,
      file: {
        name: '测试管理开发项目.xlsx',
        url: 'http://minio.staging.saas.hand-china.com/error-member-role/file_414d93294456483aa81fbfefef92d79e_errorMemberRole.xls',
      },
    }];
    const columns = [{
      title: '导出来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: source => <div className="c7ntest-text-dot">{source}</div>,
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
      width: 160,
      render: () => moment().format('YYYY-MM-DD h:mm:ss'),
    }, {
      title: '耗时',
      dataIndex: 'during',
      key: 'during',
      width: 100,
      render: during => <div>{humanizeDuration(during)}</div>,
    }, {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: progress => (progress === 100
        ? <div>已完成</div>
        : (
          <div>
            {progress}
            %
          </div>
        )),
    }, {
      title: '下载',
      dataIndex: 'file',
      key: 'file',
      render: (file, record) => (
        // <a className="c7ntext-text-dot" href={file.url}>

        <Button shape="circle" funcType="flat" icon="get_app" disabled={record.progress < 100} />

        // </a>
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
            <SelectVersion allowClear value={versionId} onChange={this.handleVersionChange} />
            <SelectFolder label="文件夹" versionId={versionId} value={folderId} allowClear onChange={this.handleFolderChange} />


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
