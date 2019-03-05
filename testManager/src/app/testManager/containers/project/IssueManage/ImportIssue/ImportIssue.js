import React, { Component } from 'react';
import {
  Page, Header, Content, WSHandler, stores,
} from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination, Modal, Progress,
  Spin, Icon, Select, Divider, Tooltip,
} from 'choerodon-ui';
import moment from 'moment';
import FileSaver from 'file-saver';
import { FormattedMessage } from 'react-intl';
import { importIssue } from '../../../../api/FileApi';
import { commonLink, humanizeDuration, getProjectName } from '../../../../common/utils';
import { SelectVersion } from '../../../../components/CommonComponent';
import { getImportHistory, cancelImport, downloadTemplate } from '../../../../api/IssueManageApi';
import './ImportIssue.scss';

const { AppState } = stores;
const { confirm, Sidebar } = Modal;

class ImportIssue extends Component {
  state = {
    visible: false,
    importVisible: false,
    uploading: false,
    progress: 0,
    importRecord: null,
    file: null,
    version: null,
    step: 1,
  };

  getImportHistory = () => {
    getImportHistory().then((data) => {
      this.setState({
        importRecord: data,
        step: data.status === 1 ? 3 : 1,
      });
    });
  };

  handleClose = () => {
    this.setState({
      visible: false,
    });
  };

  upload = () => {
    const { file, version, importRecord } = this.state;
    if (!file || !version) {
      Choerodon.prompt('请选择文件和目标版本');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.setState({
      uploading: true,
    });
    importIssue(formData, version).then(() => {
      this.uploadInput.value = '';
      this.changeStep(1);
      this.setState({
        file: null,
        uploading: false,
        visible: false,
        importRecord: {
          ...importRecord,
          status: 1,
        }
      });
    }).catch((e) => {
      this.setState({
        uploading: false,
      });
      Choerodon.prompt('网络错误');
    });
  };

  humanizeDuration = (record) => {
    const { creationDate, lastUpdateDate } = record;
    const startTime = moment(creationDate);
    const lastTime = moment(lastUpdateDate);

    const diff = lastTime.diff(startTime);
    return creationDate && lastUpdateDate
      ? humanizeDuration(diff / 1000)
      : null;
  };

  renderRecord = () => {
    const { importRecord } = this.state;
    if (!importRecord) {
      return '';
    }
    const {
      version='v0.1', failedCount, fileUrl,
    } = importRecord;
    return (
      failedCount ?
      <div className="c7ntest-ImportIssue-record-normal-text">
        {'导入版本为 '}
        <span>
          {version}
        </span>
        {'，导入失败 '}
        <span style={{ color: '#F44336' }}>
          {failedCount}
        </span>
        {' 条用例'}
        {fileUrl && (
          <a href={fileUrl}>
            {' 点击下载失败详情'}
          </a>
        )}
      </div> : ''
    );
  };

  handleOk = () => {
    this.setState({
      visible: false,
    });
  };

  beforeUpload = (e) => {
    if (e.target.files[0]) {
      this.setState({
        file: e.target.files[0],
      });
    }
  };

  handleMessage = (data) => {
    const { importRecord } = this.state;
    const { rate, id, status, fileUrl } = data;
    if (importRecord.status === 4 && id === importRecord.id && status !== 4) {
      return;
    }
    if (fileUrl) {
      window.location.href = fileUrl;
    }
    this.setState({
      progress: rate.toFixed(1),
      importRecord: data,
    });
  };

  handleCancelImport=() => {
    const { importRecord } = this.state;
    confirm({
      title: '取消导入',
      content: '取消导入不会删除已经导入的数据。',
      onOk: () => {
        // 取消之后重取一下数据
        if (importRecord.id) {
          cancelImport(importRecord.id).then((res) => {
            // this.getImportHistory();
          });
        }        
      },
    });
  };

  open = () => {
    this.setState({
      importVisible: true,
    });
    this.getImportHistory();
  };

  handleImportClose = () => {
    this.setState({
      visible: false,
      importVisible: false,
      uploading: false,
      progress: 0,
      importRecord: null,
      file: null,
      version: null,
      step: 1,
    });
  };

  exportExcel = () => {
    downloadTemplate().then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = '导入模板.xlsx';
      FileSaver.saveAs(blob, fileName);
    });
  };

  importExcel = () => {
    this.setState({
      visible: true,
    });
  };

  changeStep = (value) => {
    const { step } = this.state;
    this.setState({
      step: step + value,
    });
  };

  footer = () => {
    const { step, importRecord } = this.state;
    const { status } = importRecord || {};
    if (step === 1) {
      return [
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(1)}>下一步</Button>,
        <Button funcType="raised" onClick={this.handleImportClose}>取消</Button>,
      ];
    } else if (step === 2) {
      return [
        <Button type="primary" funcType="raised" onClick={() => this.changeStep(-1)}>上一步</Button>,
        <Button funcType="raised" onClick={this.handleImportClose}>取消</Button>,
      ];
    } else {
      return [
        <Button type="primary" funcType="raised" onClick={this.handleImportClose}>完成</Button>,
        <Button funcType="raised" disabled={status !== 1} onClick={this.handleCancelImport}>取消上传</Button>,
      ];
    }
  };

  renderProgress = () => {
    const { importRecord } = this.state;
    const {
      rate = 0,
      status,
    } = importRecord;
    if (status === 1) {
      return (
        <div style={{ width: 512 }}>
          <span style={{ marginRight: 10 }}>正在导入</span>
          <Progress
            style={{ width: 450 }}
            percent={(rate).toFixed(0)}
            size="small"
            status="active"
          />
        </div>
      );
    } else if (status === 2 || status === 4) {
      return this.renderRecord();
    } else {
      return (
        <div>
          {'正在查询导入信息，请稍后'}
        </div>
      );
    }
  };

  renderForm = () => {
    const { step, uploading, importRecord } = this.state;
    if (step === 1) {
      return (
        <React.Fragment>
          <Button type="primary" funcType="flat" onClick={() => this.exportExcel()}>
            <Icon type="get_app icon" />
            <span>下载模板</span>
          </Button>
          {this.renderRecord()}
        </React.Fragment>
      );
    } else if (step === 2) {
      return (
        <Button loading={uploading} type="primary" funcType="flat" onClick={() => this.importExcel()}>
          <Icon type="archive icon" />
          <span>导入用例</span>
        </Button>
      );
    } else {
      return (
        <WSHandler
          messageKey={`choerodon:msg:test-issue-import:${AppState.userInfo.id}`}
          onMessage={this.handleMessage}
        >
          {this.renderProgress()}
        </WSHandler>
      );
    }
  };

  render() {
    const {
      visible, uploading, file, version, importVisible,
    } = this.state;
    return (
      <Sidebar
        title="导入用例"
        visible={importVisible}
        footer={this.footer()}
        onCancel={this.handleImportClose}
        destroyOnClose
      >
        <Content
          style={{
            padding: 1,
          }}
          title={<FormattedMessage id="upload_side_content_title" values={{ name: getProjectName() }} />}
          description={<FormattedMessage id="upload_side_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management"
        >
          {this.renderForm()}
          <Modal
            title="导入用例"
            visible={visible}
            okText={<FormattedMessage id="upload" />}
            confirmLoading={uploading}
            cancelText={<FormattedMessage id="close" />}
            onOk={this.upload}
            onCancel={this.handleClose}
          >
            <div className="c7ntest-center" style={{ marginBottom: 20 }}>
              <SelectVersion value={version} onChange={(versionId) => { this.setState({ version: versionId }); }} style={{ width: 120 }} />
              <Input
                style={{ width: 340, margin: '17px 0 0 18px' }}
                value={file && file.name}
                prefix={<Icon type="attach_file" style={{ color: 'black', fontSize: '14px' }} />}
                suffix={<Tooltip title="选择文件"><Icon type="create_new_folder" style={{ color: 'black', cursor: 'pointer' }} onClick={() => { this.uploadInput.click(); }} /></Tooltip>}

              />
            </div>
            <input
              ref={
                (uploadInput) => { this.uploadInput = uploadInput; }
              }
              type="file"
              onChange={this.beforeUpload}
              style={{ display: 'none' }}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </Modal>
        </Content>
      </Sidebar>
    );
  }
}


export default ImportIssue;
