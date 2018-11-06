import React, { Component } from 'react';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination, Modal, Progress,
  Spin, Icon, Select, Divider,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { importIssue } from '../../../../api/FileApi';
import { commonLink } from '../../../../common/utils';

class ImportIssue extends Component {
  state = {
    uploading: false,
    importing: false,
    progress: 0,
    importRecord: null,
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

  render() {
    const { visible, uploading, importing } = this.state;
    const okText = uploading ? <FormattedMessage id="upload" /> : <FormattedMessage id="import" />;
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
          <div className="c7ntest-UploadSide">
            <div style={{ width: '512px' }}>
              {!uploading && !importing && this.renderRecord()}
              {uploading && this.renderUploading()}
              {importing && this.renderImporting()}
            </div>
          </div>
          <Divider />
          <Button type="primary" funcType="raised" onClick={uploading ? this.handleOk : this.upload}>
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

          </Button>
        </Content>
      </Page>
    );
  }
}


export default ImportIssue;
