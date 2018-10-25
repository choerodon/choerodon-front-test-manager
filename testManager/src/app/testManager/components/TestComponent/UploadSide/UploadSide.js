import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import { Modal, Progress } from 'choerodon-ui';
import { importIssue } from '../../../api/FileApi';
import './UploadSide.scss';

const { Sidebar } = Modal;

class UploadSide extends Component {
  state = {
    visible: false,
    uploading: false,
    importing: false,
    progress: 0,
    importRecord: null,
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
    const ws = new WebSocket(`ws://${process.env.API_HOST}:3000`);

    ws.onopen = function (evt) {
      console.log('Connection open ...');
      // ws.send("Hello WebSockets!");
    };

    ws.onmessage = function (evt) {
      console.log(`Received Message: ${evt.data}`);
      // ws.close();
    };

    ws.onclose = function (evt) {
      console.log('Connection closed.');
    };
  }

  importIssue = (e) => {
    const formData = new FormData();
    [].forEach.call(e.target.files, (file) => {
      formData.append('file', file);
    });
    this.uploadInput.value = '';
    this.setState({
      uploading: true,
    });
    importIssue(formData).then(() => {
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

  getUploadOkText = () => (
    <span>
      <input
        ref={
          (uploadInput) => { this.uploadInput = uploadInput; }
        }
        type="file"
        onChange={this.importIssue}
        style={{ display: 'none' }}
      />
      <FormattedMessage id="upload" />
    </span>
  );

  upload = () => {
    this.uploadInput.click();
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

  render() {
    const { visible, uploading, importing } = this.state;
    const okText = uploading ? <FormattedMessage id="upload" /> : <FormattedMessage id="import" />;
    return (
      <Sidebar
        title="导入用例"
        visible={visible}
        okText={uploading ? okText : this.getUploadOkText()}
        confirmLoading={uploading}
        cancelText={<FormattedMessage id="close" />}
        onOk={uploading ? this.handleOk : this.upload}
        onCancel={this.handleClose}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={<FormattedMessage id="upload_side_content_title" />}
          description={<FormattedMessage id="upload_side_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management"
        >
          <div className="c7ntest-UploadSide">
            <div style={{ width: '512px' }}>
              {!uploading && !importing && this.renderRecord()}
              {uploading && this.renderUploading()}
              {importing && this.renderImporting()}
            </div>
          </div>
        </Content>
      </Sidebar>
    );
  }
}

UploadSide.propTypes = {

};

export default UploadSide;
