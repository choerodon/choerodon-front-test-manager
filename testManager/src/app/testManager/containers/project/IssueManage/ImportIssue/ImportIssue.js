import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination, Modal, Progress,
  Spin, Icon, Select, Divider, Tooltip,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { importIssue } from '../../../../api/FileApi';
import { commonLink } from '../../../../common/utils';
import { SelectVersion } from '../../../../components/CommonComponent';

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
        uploading: false,
        importing: true,
      });
    }).catch(() => {
      this.setState({
        uploading: false,
      });
      Choerodon.prompt('网络错误');
    });
  }

  renderRecord = () => {
    const { importRecord } = this.state;
    if (!importRecord) {
      return <div className="c7ntest-UploadSide-record-normal-text">当前没有导入用例记录</div>;
    }
    return <div className="c7ntest-UploadSide-record-normal-text">上次导入完成时间2018-10-24 15:31:01（耗时9秒）</div>;
  }

  renderUploading = () => (
    <div className="c7ntest-UploadSide-progress-area">
      <Progress width={80} strokeLinecap="square" type="circle" percent={25} strokeWidth={10} />
      <div className="c7ntest-UploadSide-progress-area-text">上传...</div>
    </div>
  )

  renderImporting = () => (
    <div className="c7ntest-UploadSide-progress-area">
      <Progress width={80} strokeLinecap="square" type="circle" percent={this.state.progress} strokeWidth={10} />
      <div className="c7ntest-UploadSide-progress-area-text">正在导入...</div>
      <div className="c7ntest-UploadSide-progress-area-prompt">（本次导入将会耗时较长，您可以先返回进行其他操作）</div>
    </div>
  )

  handleOk = () => {
    this.setState({
      visible: false,
    });
  }

  beforeUpload=(e) => {
    if (e.target.files[0]) {
      this.setState({
        file: e.target.files[0],
      });
    }
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
          <div className="c7ntest-UploadSide">
            <div style={{ width: '512px' }}>
              {!uploading && !importing && this.renderRecord()}
              {uploading && this.renderUploading()}
              {importing && this.renderImporting()}
            </div>
          </div>
          <Divider />
          <Button type="primary" funcType="raised" onClick={() => { this.setState({ visible: true }); }}>
            <FormattedMessage id="upload" />
          </Button>
        </Content>
      </Page>
    );
  }
}


export default ImportIssue;
