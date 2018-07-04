import React, { Component } from 'react';
import { Input, Button, Select, Icon, Modal, Upload } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
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
};
function handleChange(value) {
  window.console.log(`selected ${value}`);
}

class EditTestDetail extends Component {
state = {
  comment: null,
  executeId: null,
  testStep: null,
}
componentWillReceiveProps(nextProps) {
  const { editing } = nextProps;
  const { 
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
  });
}
  
render() {
  const { visible, onOk, onCancel } = this.props;
  const { executeId, testStep, comment } = this.state;
  const delta = text2Delta(this.state.comment);
  const props = {
    name: 'file',
    action: '//jsonplaceholder.typicode.com/posts/',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        window.console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        Choerodon.prompt(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        Choerodon.prompt(`${info.file.name} file upload failed.`);
      }
    },
  };
  return (
    <Sidebar
      title="测试详细信息"
      visible={visible}
      onOk={onOk}
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
        <Select label="状态" placeholder="状态" style={{ width: 200 }} >
          <Option value="jack">通过</Option>
          <Option value="lucy">Lucy</Option>
          <Option value="disabled" disabled>Disabled</Option>
          <Option value="Yiminghe">yiminghe</Option>
        </Select>
        <Select
          mode="tags"
          style={{ width: '100%' }}
          label="缺陷"
          placeholder="缺陷"
          onChange={handleChange}
          allowClear
        >
          {children}
        </Select>
        <div style={styles.editLabel}>附件</div>
        <Upload {...props}>
          <Button className="c7n-EditTestDetail-uploadBtn">
            <Icon type="file_upload" /> 上传附件
          </Button>
        </Upload>
        <div style={styles.editLabel}>注释</div>
        <WYSIWYGEditor
          value={delta}
          style={{ height: 200, width: '100%' }}
          onChange={(value) => {
            this.setState({ comment: value });
          }}            
        />
      </Content>
    </Sidebar>
  );
}
}

EditTestDetail.propTypes = {

};

export default EditTestDetail;
