import React, { Component } from 'react';
import { Input, Button, Select, Icon, Modal, Upload, Spin } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { editCycleSide } from '../../../api/CycleExecuteApi';
import './EditTestDetail.less';
import WYSIWYGEditor from '../WYSIWYGEditor';

import {
  delta2Html,
  escape,
  handleFileUpload,
  text2Delta,
  beforeTextUpload,
} from '../../common/utils';

const { Sidebar } = Modal;
const { Option } = Select;
const children = [];
for (let i = 10; i < 36; i += 1) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}
const styles = {
  editLabel: {
    margin: '15px 0',
  },
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
};
function handleChange(value) {
  window.console.log(`selected ${value}`);
}

class EditTestDetail extends Component {
  state = {
    fileList: [],
    loading: false,
    stepId: null,
    comment: null,
    executeId: null,
    testStep: null,
    stepStatus: null,
    stepStatusList: [],
    executeStepId: null,
    objectVersionNumber: null,
    stepAttachment: [],
    caseAttachment: [],
    defects: [],
  }
  componentWillReceiveProps(nextProps) {
    const { editing } = nextProps;
    // console.log(editing)
    const {
      stepStatusList,
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment,
      stepAttachment,
      caseAttachment,
      defects,
    } = editing || {};

    this.setState({
      stepStatus,
      executeId,
      testStep,
      comment,
      stepStatusList: stepStatusList || [],
      stepId,
      executeStepId,
      objectVersionNumber,
      stepAttachment: stepAttachment || [],
      caseAttachment: caseAttachment || [],
      fileList: stepAttachment ? stepAttachment.map((attachment) => {
        const { id, attachmentName, url } = attachment;
        return {
          uid: id,
          name: attachmentName,
          status: 'done',
          url,
        };
      }) : [],
      defects: defects || [],
    });
  }
  onOk = () => {
    // editCycleSide
    const {
      fileList,
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment,
      stepAttachment,
      caseAttachment,
      defects } = this.state;    
    const data = {
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment,
      stepAttachment,
      caseAttachment,
      defects,
    };
    const formData = new FormData();
    fileList.forEach((file) => {
      if (!file.url) {
        formData.append('file', file);
      }
    });
    Object.keys(data).forEach((key) => {
      formData.append(key, JSON.stringify(data[key]));
    });
    this.setState({ loading: true });
    editCycleSide(formData).then(() => {
      this.setState({
        loading: false,
      });
      this.props.onOk();
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络错误');
    });
  }
  handleChange = (value) => {
    this.setState({
      stepStatus: value,
    });
  }
  handleFileChange = (info) => {
    const fileList = info.fileList;
    this.setState({ fileList });
  }

  render() {
    const { visible, onOk, onCancel } = this.props;
    const { fileList, executeId, testStep, comment, 
      stepStatusList, stepStatus, loading } = this.state;
    const delta = text2Delta(comment);
    // console.log(delta)
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange: this.handleFileChange,
      multiple: true,
      beforeUpload: (file) => {
        this.setState(({ List }) => ({
          fileList: [...List, file],
        }));
        return false;
      },
    };
    const options = stepStatusList.map((status) => {
      const { statusName, statusColor } = status;
      return (<Option value={statusName} key={statusName}>
        <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {statusName}
        </div>
      </Option>);
    });
    return (
      <Sidebar
        title="测试详细信息"
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={`修改“${testStep}”的信息`}
          description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
          link="#"
        >
          <Spin spinning={loading}>
            <Select
              label="状态"
              placeholder="状态"
              value={stepStatus}
              style={{ width: 500 }}
              onChange={(value) => {
                this.setState({
                  stepStatus: value,
                });
              }}
            >
              {options}
            </Select>
            <br />
            <Select
              mode="tags"
              style={{ width: 500 }}
              label="缺陷"
              placeholder="缺陷"
              onChange={handleChange}
              allowClear
            >
              {children}
            </Select>
            <div style={styles.editLabel}>附件</div>
            <Upload {...props} fileList={fileList}>
              <Button className="c7n-EditTestDetail-uploadBtn">
                <Icon type="file_upload" /> 上传附件
              </Button>
            </Upload>
            <div style={styles.editLabel}>注释</div>
            <WYSIWYGEditor
              // value={comment}
              value={delta}
              style={{ height: 200, width: '100%' }}
              onChange={(value) => {
                this.setState({ comment: value });
              }}
            />
          </Spin>
        </Content>
      </Sidebar>
    );
  }
}

EditTestDetail.propTypes = {

};

export default EditTestDetail;
