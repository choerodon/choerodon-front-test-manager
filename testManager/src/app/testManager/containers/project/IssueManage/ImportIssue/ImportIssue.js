import React, { Component } from 'react';
import {
  Page, Header, Content, WSHandler, stores,
} from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination, Modal, Progress,
  Spin, Icon, Select, Divider, Tooltip,
} from 'choerodon-ui';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { importIssue } from '../../../../api/FileApi';
import { commonLink, humanizeDuration } from '../../../../common/utils';
import { SelectVersion } from '../../../../components/CommonComponent';
import './ImportIssue.scss';

const { AppState } = stores;

class ImportIssue extends Component {
  state = {
    visible: false,
    uploading: false,
    importing: false,
    progress: 0,
    importRecord: null,
    file: null,
    version: null,
  }

  handleClose = () => {
    this.setState({
      visible: false,
    });
  }

  upload = () => {
    const { file, version } = this.state;
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
      this.setState({
        file: null,
        uploading: false,
        importing: true,
        visible: false,
      });
    }).catch(() => {
      this.setState({
        uploading: false,
      });
      Choerodon.prompt('网络错误');
    });
  }

  humanizeDuration = (record) => {
    const { creationDate, lastUpdateDate } = record;
    const startTime = moment(creationDate);
    const lastTime = moment(lastUpdateDate);

    const diff = lastTime.diff(startTime);

    console.log(diff);
    return creationDate && lastUpdateDate
      ? humanizeDuration(diff / 1000)
      : null;
  }

  renderRecord = () => {
    const { importRecord } = this.state;
    if (!importRecord) {
      return <div className="c7ntest-ImportIssue-record-normal-text">当前没有导入用例记录</div>;
    }
    const {
      lastUpdateDate, successfulCount, failedCount, fileUrl,
    } = importRecord;
    return (
      <div className="c7ntest-ImportIssue-record-normal-text">
        上次导入完成时间
        <span style={{ color: 'black' }}>
          {moment(lastUpdateDate).format('YYYY-MM-DD hh:mm:ss')}
        </span>
        （耗时
        <span style={{ color: 'black' }}>
          {this.humanizeDuration(importRecord)}
        </span>
        ）
        <br />
        共导入
        <span style={{ color: '#23B2B1' }}>
          {successfulCount}
        </span>
        条数据成功，
        <span style={{ color: '#F44336' }}>
          {failedCount}
        </span>
        条数据失败
        {fileUrl && (
          <a href={fileUrl}>
            {' '}
            点击下载失败详情
          </a>
        )}
      </div>
    );
  }

  renderUploading = () => (
    <div className="c7ntest-ImportIssue-progress-area">
      <Progress width={80} strokeLinecap="square" type="circle" percent={25} strokeWidth={10} />
      <div className="c7ntest-ImportIssue-progress-area-text">上传...</div>
    </div>
  )

  renderImporting = () => (
    <div className="c7ntest-ImportIssue-progress-area">
      <Progress width={80} strokeLinecap="square" type="circle" percent={this.state.progress} strokeWidth={10} />
      <div className="c7ntest-ImportIssue-progress-area-text">正在导入...</div>
      <div className="c7ntest-ImportIssue-progress-area-prompt">（本次导入可能会耗时较长，您可以先返回进行其他操作）</div>
    </div>
  )

  handleOk = () => {
    this.setState({
      visible: false,
    });
  }

  beforeUpload = (e) => {
    if (e.target.files[0]) {
      this.setState({
        file: e.target.files[0],
      });
    }
  }

  handleMessage = (data) => {
    console.log(data);
    const { rate, status } = data;

    this.setState({
      progress: rate.toFixed(1),
      importing: status === 1,
      importRecord: data,
    });
  }

  render() {
    const {
      visible, uploading, importing, file, version,
    } = this.state;
    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title="导入用例"
          backPath={commonLink('/IssueManage')}
        >
          <Button
            onClick={() => { }}
          >
            <Icon type="autorenew icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={<FormattedMessage id="upload_side_content_title" />}
          description={<FormattedMessage id="upload_side_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management"
        >
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
          <WSHandler
            messageKey={`choerodon:msg:test-issue-import:${AppState.userInfo.id}`}
            onMessage={this.handleMessage}
          >
            <div className="c7ntest-ImportIssue">
              {!uploading && !importing && this.renderRecord()}
              {/* {uploading && this.renderUploading()} */}
              {importing && this.renderImporting()}
            </div>
          </WSHandler>

          <Divider />
          <Button type="primary" funcType="raised" onClick={() => { this.setState({ visible: true }); }} disabled={importing}>
            <FormattedMessage id="upload" />
          </Button>
        </Content>
      </Page>
    );
  }
}


export default ImportIssue;
