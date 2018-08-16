import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { Select, Form, Input, Button, Modal, Icon, Tooltip, Spin, Upload } from 'choerodon-ui';
import { UploadButton } from '../CommonComponent';
import './EditTestStep.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;

function uploadFile(data, config) {
  const { bucketName, attachmentLinkId } = config;
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-datal' },
  };

  return axios.post(
    `/zuul/test/v1/projects/${projectId}/test/case/attachment?bucket_name=test&attachmentLinkId=${attachmentLinkId}&attachmentType=CASE_STEP`,
    data,
    axiosConfig,
  );
}
function deleteAttachment(id) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`test/v1/projects/${projectId}/test/case/attachment/delete/bucket/test/attach/${id}`);
}
class EditTestStep extends Component {
  constructor(props) {
    super(props);
    window.console.log(props.attachments);
    this.state = {
      createLoading: false,
      loading: false,
      files: [],
      fileList: props.attachments.map((attachment) => {
        const { id, attachmentName, url } = attachment;
        return {
          uid: id,
          name: attachmentName,
          status: 'done',
          url,
        };
      }),
      origin: {},
    };
  }
  
  componentDidMount() {
    this.loadTest(this.props.issueId, this.props.stepId);
  }

  handleFileChange = (info) => {
    const fileList = info.fileList;
    this.setState({ fileList });
  }
  removeFile=(List) => {
    const origin = this.state.fileList;
  }
  loadTest(issueId, stepId) {
    axios.get(`/test/v1/projects/${AppState.currentMenuType.id}/case/step/query/${issueId}`)
      .then((res) => {
        const fileList = _.map(res.attachments, attachment => ({
          uid: attachment.id,
          name: attachment.attachmentName,
          url: attachment.url,
        }));
        this.setState({
          origin: res.find(v => v.stepId === stepId) || {},
          // files: fileList,
          // fileList,
        });
      });
  }

  handleEditTest = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { testStep, testData, expectedResult } = values;
        const { nextRank, issueId } = this.props;
        const files = this.state.fileList;
        const formData = new FormData();
        if (files.length > 0 && files.some(v => !v.url)) {
          const config = {
            bucket_name: 'test',
            attachmentLinkId: this.state.origin.stepId,
            attachmentType: 'CASE_STEP',
          };
          // upload file
          files.forEach((file) => {
            if (!file.url) {
              formData.append('file', file);
            }
          });          
          this.setState({ loading: true });
          uploadFile(formData, config).then(() => {
            this.setState({
              loading: false,
            });
            const testCaseStepDTO = {
              ...this.state.origin,
              attachments: [],
              testStep,
              testData,
              expectedResult,
            };
            this.handleSave(testCaseStepDTO);
          }).catch(() => {
            this.setState({
              loading: false,
            });
            Choerodon.prompt('网络错误');
          });
        } else {
          const testCaseStepDTO = {
            ...this.state.origin,
            attachments: [],
            testStep,
            testData,
            expectedResult,
          };
          this.handleSave(testCaseStepDTO);
        }
      }
    });
  };

  handleSave = (testCaseStepDTO) => {
    const projectId = AppState.currentMenuType.id;
    this.setState({ createLoading: true });
    axios.put(`/test/v1/projects/${projectId}/case/step/change`, testCaseStepDTO)
      .then((res) => {
        this.setState({ createLoading: false });
        this.props.onOk();
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, onCancel, onOk } = this.props;
    const { loading, fileList } = this.state;
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange: this.handleFileChange,
      multiple: true,
      onRemove: (file) => {
        if (file.url) {
          this.setState({ loading: true });
          deleteAttachment(file.uid).then(() => {
            this.setState({ loading: false });
          }).catch(() => {
            Choerodon.prompt('网络异常');
            this.setState({ loading: false });
          });
        } else {
          const index = _.findIndex(fileList, { uid: file.uid });
          this.setState({
            fileList: fileList.splice(index, 1),
          });
        }
      },
      beforeUpload: (file) => {
        this.setState({
          fileList: [...fileList, file],
        });
        return false;
      },
    };
    return (
      <Sidebar
        className="c7n-createTest"
        title={<FormattedMessage id="issue_edit_step_title" />}
        visible={visible || false}
        onOk={this.handleEditTest}
        onCancel={onCancel}
        okText={<FormattedMessage id="ok" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            paddingTop: 0,
            paddingLeft: 0,
            width: 512,
          }}
          title={<FormattedMessage id="issue_edit_step_content_title" values={{ testStep: this.state.origin.testStep }} />}
          description={<FormattedMessage id="issue_edit_step_content_description" />}
        >
          <Spin spinning={loading}>
            <Form layout="vertical">
              <FormItem >
                {getFieldDecorator('testStep', {
                  rules: [{ required: true, message: '测试步骤为必输项' }],
                  initialValue: this.state.origin.testStep,
                })(
                  <Input label={<FormattedMessage id="execute_testStep" />} maxLength={30} />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('testData', {
                  rules: [{ required: true, message: '测试数据为必输项' }],
                  initialValue: this.state.origin.testData,
                })(
                  <Input label={<FormattedMessage id="execute_testData" />} maxLength={30} />,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('expectedResult', {
                  rules: [{ required: true, message: '预期结果为必输项' }],
                  initialValue: this.state.origin.expectedResult,
                })(
                  <Input label={<FormattedMessage id="execute_expectedOutcome" />} maxLength={30} />,
                )}
              </FormItem>
            </Form>
            <div className="sign-upload" style={{ marginTop: 38 }}>
              <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
                <div style={{ fontWeight: 500 }}>
                  <FormattedMessage id="execute_stepAttachment" />
                </div>
              </div>
              <Upload {...props} fileList={fileList}>
                <Button className="c7n-EditTestDetail-uploadBtn">
                  <Icon type="file_upload" /> 
                  <FormattedMessage id="upload_attachment" />
                </Button>
              </Upload>
              {/* <UploadButton
                funcType="raised"
                onRemove={this.removeFile}
                onBeforeUpload={this.setFileList}
                fileList={this.state.fileList}
              /> */}
            </div>
          </Spin>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(EditTestStep));
