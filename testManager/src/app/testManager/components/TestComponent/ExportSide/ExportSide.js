import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Content, stores, WSHandler } from 'choerodon-front-boot';
import {
  Modal, Progress, Table, Button, Icon, Tooltip,
} from 'choerodon-ui';
import _ from 'lodash';
import FileSaver from 'file-saver';
import moment from 'moment';
import { SelectVersion, SelectFolder } from '../../CommonComponent';
import {
  exportIssues, exportIssuesFromVersion, exportIssuesFromFolder, getExportList,
} from '../../../api/IssueManageApi';
import './ExportSide.scss';

const { Sidebar } = Modal;
const { AppState } = stores;
function humanizeDuration(seconds) {
  let result = '';
  if (seconds) {
    if ((result = Math.round(seconds / (60 * 60 * 24 * 30 * 12))) > 0) { // year
      result = `${result} 年`;
    } else if ((result = Math.round(seconds / (60 * 60 * 24 * 30))) > 0) { // months
      result = `${result} 月`;
    } else if ((result = Math.round(seconds / (60 * 60 * 24))) > 0) { // days
      result = `${result} 天`;
    } else if ((result = Math.round(seconds / (60 * 60))) > 0) { // Hours
      result = `${result} 小时`;
    } else if ((result = Math.round(seconds / (60))) > 0) { // minute
      result = `${result} 分钟`;
    } else if ((result = Math.round(seconds)) > 0) { // second
      result = `${result} 秒`;
    } else {
      result = `${seconds} 毫秒`;
    }
  }
  return result;
}
class ExportSide extends Component {
  state = {
    visible: false,
    versionId: null,
    folderId: null,
    exportList: [],
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
    getExportList().then((exportList) => {
      this.setState({
        exportList,
      });
    });
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

  createExport = () => {
    const { versionId, folderId } = this.state;
    if (folderId) {
      exportIssuesFromFolder(folderId).then((data) => {

      });
    } else if (versionId) {
      exportIssuesFromVersion(versionId).then((data) => {

      });
    } else {
      exportIssues().then((data) => {

      });
    }
  }

  handleDownload = (record) => {
    const { fileUrl } = record;
    if (fileUrl) {
      const ele = document.createElement('a');
      ele.href = fileUrl;
      ele.target = '_blank';
      document.body.appendChild(ele);
      ele.click();
      document.removeChild(ele);
    }
  }

  handleMessage=(data) => {
    console.log(data);
    const exportList = [...this.state.exportList];
    const { id, rate } = data;
    data.rate = parseInt(data.rate);
    const index = _.findIndex(exportList, { id });
    if (index >= 0) {
      exportList[index] = data;
    } else {
      exportList.unshift(data);
    }
    this.setState({
      exportList,
    });
  }

  render() {
    const {
      visible, versionId, folderId, exportList,
    } = this.state;
    const columns = [{
      title: '导出来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      // width: 100,
      render: (sourceType, record) => {        
        const ICONS = {
          1: 'project',
          2: 'version',
          4: 'folder',
        };
        return (
          <div className="c7ntest-center">
            <Icon type={ICONS[sourceType]} />
            <span className="c7ntest-text-dot" style={{ marginLeft: 10 }}>{record.name}</span>
          </div>
        );
      },
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
      // width: 100,
    }, {
      title: '导出时间',
      dataIndex: 'time',
      key: 'time',
      // width: 160,
      render: () => moment().format('YYYY-MM-DD h:mm:ss'),
    }, {
      title: '耗时',
      dataIndex: 'during',
      key: 'during',
      // width: 100,
      render: during => <div>{humanizeDuration(during)}</div>,
    }, {
      title: '进度',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate, record) => (record.status === 2
        ? <div>已完成</div>
        : (
          <Tooltip title={`进度：${rate}%`}>
            <Progress percent={rate} showInfo={false} />
          </Tooltip>
        )),
    }, {
      title: '',
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      render: (fileUrl, record) => (
        // <a className="c7ntext-text-dot" href={file.url}>
        <div style={{ textAlign: 'right' }}>
          <Tooltip title="下载文件">
            <Button style={{ marginRight: -3 }} shape="circle" funcType="flat" icon="get_app" disabled={!record.fileUrl} onClick={this.handleDownload.bind(this, record)} />
          </Tooltip>
        </div>
        // </a>
      ),
    }];
    return (
      <Sidebar
        title="导出用例"
        visible={visible}
        destroyOnClose
        // okText={null}
        // cancelText={<FormattedMessage id="close" />}
        // onOk={this.handleOk}
        footer={<Button onClick={this.handleClose} type="primary" funcType="raised"><FormattedMessage id="close" /></Button>}
      // onCancel={this.handleClose}
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
            <div style={{ marginBottom: 24 }}>
              <SelectVersion allowClear value={versionId || '所有版本'} onChange={this.handleVersionChange} />
              <SelectFolder style={{ width: 200, margin: '0 24px' }} label="文件夹" disabled={!versionId} versionId={versionId} value={folderId} allowClear onChange={this.handleFolderChange} />
              <Button type="primary" icon="playlist_add" onClick={this.createExport}>新建导出</Button>
            </div>
            <WSHandler
              messageKey={`choerodon:msg:test-issue-export:${AppState.userInfo.id}`}
              onMessage={this.handleMessage}
            >
              <Table columns={columns} dataSource={exportList} />
            </WSHandler>
          </div>
        </Content>
      </Sidebar>
    );
  }
}


export default ExportSide;
