import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Content } from 'choerodon-front-boot';
import { Modal, Icon } from 'choerodon-ui';
import { Upload } from '../../CommonComponent';

const { Sidebar } = Modal;

class UploadSide extends Component {
  state = {
    visible: false,
    uploading: false,
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
  }

  getUploadOkText=() => (
    <Upload
      handleUpload={this.importIssue}
    >
      <Icon type="file_upload" />
      {' '}
      <FormattedMessage id="issue_importIssue" />
    </Upload>
  );
  
  formatMessage = (id, values = {}) => {
    const { intl } = this.props;
    return intl.formatMessage({
      id,
    }, values);
  };

  render() {
    const { visible, uploading } = this.state;
    const okText = uploading ? <FormattedMessage id="add" /> : <FormattedMessage id="save" />;
    return (
      <Sidebar
        title="导入用例"
        visible={visible}
        okText={uploading ? this.getUploadOkText() : okText}
        // confirmLoading={uploading && fileLoading && submitting}
        cancelText={<FormattedMessage id={uploading ? 'close' : 'cancel'} />}
        onOk={uploading ? this.upload : this.handleOk}
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
          <div>
            <div style={{ width: '512px' }}>
              {/* {this.getUploadInfo()} */}
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
