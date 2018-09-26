import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Select, Form, Input, Button, Modal, Icon, Tooltip, 
} from 'choerodon-ui';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
class CreateTestStep extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
    };
  }

  componentDidMount() {
  }

  handleCreateTest = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { testStep, testData, expectedResult } = values;
        const { lastRank, issueId } = this.props;
        const testCaseStepDTO = {
          attachments: [],
          issueId,
          lastRank,
          nextRank: null,
          testStep,
          testData,
          expectedResult,
        };
        this.handleSave(testCaseStepDTO);
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
    const {
      visible, issueName, onCancel, onOk, 
    } = this.props;

    return (
      <Sidebar        
        title={<FormattedMessage id="issue_createStep_title" />}
        visible={visible || false}
        onOk={this.handleCreateTest}
        onCancel={onCancel}
        okText={<FormattedMessage id="create" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            paddingTop: 0,
            paddingLeft: 0,
            width: 512,
          }}
          title={<FormattedMessage id="issue_createStep_content_title" values={{ issueName }} />}
          description={<FormattedMessage id="issue_createStep_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/case-management/update-list/"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('testStep', {
                rules: [{ required: true, message: '测试步骤为必输项' }],
              })(
                <TextArea label={<FormattedMessage id="execute_testStep" />} autosize={{ minRows: 1, maxRows: 6 }} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('testData', {
                // rules: [{ required: true, message: '测试数据为必输项' }],
              })(
                <TextArea label={<FormattedMessage id="execute_testData" />} autosize={{ minRows: 1, maxRows: 6 }} />,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('expectedResult', {
                rules: [{ required: true, message: '预期结果为必输项' }],
              })(
                <TextArea label={<FormattedMessage id="execute_expectedOutcome" />} autosize={{ minRows: 1, maxRows: 6 }} />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateTestStep));
