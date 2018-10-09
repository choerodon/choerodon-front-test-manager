import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Select, Form, Input, Button, Modal, Icon, Tooltip, Radio } from 'choerodon-ui';
import UserHead from '../UserHead';
import { getUsers, getSelf } from '../../../api/CommonApi';
import { loadVersions } from '../../../api/IssueApi';

import './ExecuteTest.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

class ExecuteTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectLoading: false,
      createLoading: false,
      versions: [],
      circles: [],
      folders: [],
      users: [],
      userMine: {},
    };
  }

  componentDidMount() {
    getSelf().then((res) => {
      this.setState({
        userMine: res || {},
      });
    });
  }

  onChangeRadio = (e) => {
    const value = e.target.value;
    if (value === 'temp') {
      this.props.form.setFieldsValue({
        version: undefined,
        circle: undefined,
      }); 
    }
    if (value === 'mine') {
      this.props.form.setFieldsValue({
        other: undefined,
      }); 
    }
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({ createLoading: true });
        const testCycleDTO = {
          assignedTo: values.other || this.state.userMine.id,
          cycleId: values.folder || values.circle,
          issueId: this.props.issueId,
          lastRank: this.props.lastRank,
        };
        this.handleSave(testCycleDTO);
      }
    });
  };

  handleSave = (testCycleDTO) => {
    this.setState({ createLoading: true });
    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/case/insert`, testCycleDTO)
      .then((res) => {
        if (res.failed) {
          Choerodon.prompt('同一用例中不能有重复测试');
        } else {
          this.props.onOk();
        }
        this.setState({ createLoading: false });
      })
      .catch((error) => {
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { issueName, visible, onCancel, onOk } = this.props;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Sidebar
        className="c7ntest-createSubIssue"
        title={<FormattedMessage id="issue_edit_executeTest" />}
        visible
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText={<FormattedMessage id="execute" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={<FormattedMessage id="issue_executeTest_content_title" values={{ issueName }} />}
          description={<FormattedMessage id="issue_executeTest_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/execution-test/"
        >
          <Form layout="vertical">
            <FormItem>
              {getFieldDecorator('version', {
                rules: [{
                  required: true,
                  message: '此项为必选项',
                }],
              })(
                <Select
                  label={<FormattedMessage id="version" />}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadVersions().then((res) => {
                      this.setState({
                        versions: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.versions.map(version =>
                    (<Option
                      key={version.versionId}
                      value={version.versionId}
                    >
                      {version.name}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('circle', {
                rules: [{
                  required: true,
                  message: '此项为必选项',
                }],
              })(
                <Select
                  label={<FormattedMessage id="cycle" />}
                  disabled={!this.props.form.getFieldValue('version')}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/query/cycle/versionId/${this.props.form.getFieldValue('version')}`).then((res) => {
                      this.setState({
                        circles: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.circles.map(circle =>
                    (<Option
                      key={circle.cycleId}
                      value={circle.cycleId}
                    >
                      {circle.cycleName}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('folder', {
              })(
                <Select
                  label={<FormattedMessage id="cycle_createExecute_folder" />}
                  disabled={!this.props.form.getFieldValue('circle')}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={(input, option) => 
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/query/folder/cycleId/${this.props.form.getFieldValue('circle')}`).then((res) => {
                      this.setState({
                        folders: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.folders.map(folder =>
                    (<Option
                      key={folder.cycleId}
                      value={folder.cycleId}
                    >
                      {folder.cycleName}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator('assigneed', {
                initialValue: 'mine',
              })(
                <RadioGroup label={<FormattedMessage id="cycle_createExecute_folder" />} onChange={this.onChangeRadio}>
                  <Radio style={radioStyle} value={'mine'}>
                    <FormattedMessage id="cycle_createExecute_me" />
                  </Radio>
                  <Radio style={radioStyle} value={'other'}>
                    <FormattedMessage id="cycle_createExecute_others" />
                  </Radio>
                </RadioGroup>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('other', {
                rules: [{
                  required: this.props.form.getFieldValue('assigneed') === 'other',
                  message: '当被指定人为其他时，此项为必选项',
                }],
              })(
                <Select
                  label={<FormattedMessage id="cycle_createExecute_others" />}
                  disabled={this.props.form.getFieldValue('assigneed') === 'mine'}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={false}
                  allowClear
                  onFilterChange={(input) => {
                    this.setState({
                      selectLoading: true,
                    });
                    getUsers(input).then((res) => {
                      this.setState({
                        users: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.users.map(user =>
                    (<Option key={user.id} value={user.id}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                        <UserHead
                          user={{
                            id: user.id,
                            loginName: user.loginName,
                            realName: user.realName,
                            avatar: user.imageUrl,
                          }}
                        />
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(ExecuteTest));
