import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Icon, Tooltip } from 'choerodon-ui';

import './CreateIssue.scss';
import '../../assets/main.scss';
import { UploadButton } from '../CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../common/utils';
import { createIssue, loadLabels, loadPriorities, loadVersions, loadSprints, loadComponents, loadEpics } from '../../api/IssueApi';
import { getUsers } from '../../api/CommonApi';
import { COLOR } from '../../common/Constant';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UserHead from '../UserHead';
import TypeTag from '../TypeTag';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;

const NAME = {
  story: '故事',
  bug: '故障',
  task: '任务',
  issue_epic: '史诗',
  issue_test: '测试',
};

class CreateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delta: '',
      edit: false,
      createLoading: false,
      fileList: [],
      selectLoading: true,

      originLabels: [],
      originComponents: [],
      originEpics: [],
      originPriorities: [],
      originFixVersions: [],
      originSprints: [],
      originUsers: [],

      origin: {},
    };
  }

  componentDidMount() {
    this.loadPriorities();
    this.getProjectSetting();
  }

  getProjectSetting() {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
      .then((res) => {
        this.setState({
          origin: res,
        });
      });
  }

  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  loadPriorities() {
    loadPriorities().then((res) => {
      this.setState({
        originPriorities: res.lookupValues,
      });
    });
  }

  handleFullEdit = (delta) => {
    this.setState({
      delta,
      edit: false,
    });
  }

  transformPriorityCode(originpriorityCode) {
    if (!originpriorityCode.length) {
      return [];
    } else {
      const arr = [];
      arr[0] = _.find(originpriorityCode, { valueCode: 'high' });
      arr[1] = _.find(originpriorityCode, { valueCode: 'medium' });
      arr[2] = _.find(originpriorityCode, { valueCode: 'low' });
      return arr;
    }
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const exitComponents = this.state.originComponents;
        const componentIssueRelDTOList = _.map(values.componentIssueRel, (component) => {
          const target = _.find(exitComponents, { name: component });
          if (target) {
            return target;
          } else {
            return ({
              name: component,
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const exitLabels = this.state.originLabels;
        const labelIssueRelDTOList = _.map(values.issueLink, (label) => {
          const target = _.find(exitLabels, { labelName: label });
          if (target) {
            return target;
          } else {
            return ({
              labelName: label,
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const exitFixVersions = this.state.originFixVersions;
        const fixVersionIssueRelDTOList = _.map(values.fixVersionIssueRel, (version) => {
          const target = _.find(exitFixVersions, { name: version });
          if (target) {
            return {
              ...target,
              relationType: 'fix',
            };
          } else {
            return ({
              name: version,
              relationType: 'fix',
              projectId: AppState.currentMenuType.id,
            });
          }
        });
        const extra = {
          typeCode: values.typeCode,
          summary: values.summary,
          priorityCode: values.priorityCode,
          sprintId: values.sprintId || 0,
          epicId: values.epicId || 0,
          epicName: values.epicName,
          parentIssueId: 0,
          assigneeId: values.assigneedId,
          labelIssueRelDTOList,
          versionIssueRelDTOList: fixVersionIssueRelDTOList,
          componentIssueRelDTOList,
        };
        this.setState({ createLoading: true });
        const deltaOps = this.state.delta;
        if (deltaOps) {
          beforeTextUpload(deltaOps, extra, this.handleSave);
        } else {
          extra.description = '';
          this.handleSave(extra);
        }
        this.props.onOk(extra);
      }
    });
  };

  handleSave = (data) => {
    const fileList = this.state.fileList;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createIssue(data)
      .then((res) => {
        if (fileList.length > 0) {
          const config = {
            issueType: res.statusId,
            issueId: res.issueId,
            fileName: fileList[0].name,
            projectId: AppState.currentMenuType.id,
          };
          if (fileList.some(one => !one.url)) {
            handleFileUpload(this.state.fileList, callback, config);
          }
        }
        this.props.onOk();
      })
      .catch((error) => {
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };

    return (
      <Sidebar
        className="c7n-createIssue"
        title="创建问题"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <div className="c7n-region">
          <h2 className="c7n-space-first">在项目“{AppState.currentMenuType.name}”中创建问题</h2>
          <p>
            请在下面输入问题的详细信息，包含详细描述、人员信息、版本信息、进度预估、优先级等等。您可以通过丰富的任务描述帮助相关人员更快更全面的理解任务，同时更好的把控问题进度。
            <a href="http://v0-7.choerodon.io/zh/docs/user-guide/agile/issue/create-issue/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <Icon type="open_in_new" style={{ fontSize: '13px' }} />
            </a>
          </p>
          <Form layout="vertical">
            <FormItem label="问题类型" style={{ width: 520 }}>
              {getFieldDecorator('typeCode', {
                initialValue: 'issue_test',
                rules: [{ required: true }],
              })(
                <Select
                  label="问题类型"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {['issue_test'].map(type => (
                    <Option key={type} value={type}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                        <TypeTag
                          type={{
                            typeCode: type,
                          }}
                        />
                        <span style={{ marginLeft: 8 }}>{NAME[type]}</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="概要" style={{ width: 520 }}>
              {getFieldDecorator('summary', {
                rules: [{ required: true, message: '概要为必输项' }],
              })(
                <Input label="概要" maxLength={44} />,
              )}
            </FormItem>

            {
              this.props.form.getFieldValue('typeCode') === 'issue_epic' && (
                <FormItem label="Epic名称" style={{ width: 520 }}>
                  {getFieldDecorator('epicName', {
                    rules: [{ required: true, message: 'Epic名称为必输项' }],
                  })(
                    <Input label="Epic名称" maxLength={44} />,
                  )}
                </FormItem>
              )
            }

            <FormItem label="优先级" style={{ width: 520 }}>
              {getFieldDecorator('priorityCode', {
                rules: [{ required: true, message: '优先级为必选项' }],
                initialValue: this.state.origin.defaultPriorityCode,
              })(
                <Select
                  label="优先级"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {this.transformPriorityCode(this.state.originPriorities).map(type =>
                    (<Option key={type.valueCode} value={type.valueCode}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                        <div
                          style={{ color: COLOR[type.valueCode].color, width: 20, height: 20, textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: 8 }}
                        >
                          <Icon
                            type="flag"
                            style={{ fontSize: '13px' }}
                          />
                        </div>
                        <span>{type.name}</span>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <div>
              <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
                <div style={{ fontWeight: 'bold' }}>描述</div>
                <div style={{ marginLeft: 80 }}>
                  <Button className="leftBtn" funcTyp="flat" onClick={() => this.setState({ edit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                    <span style={{ color: '#3f51b5' }}>全屏编辑</span>
                  </Button>
                </div>
              </div>
              {
                !this.state.edit && (
                  <div className="clear-p-mw">
                    <WYSIWYGEditor
                      value={this.state.delta}
                      style={{ height: 200, width: '100%' }}
                      onChange={(value) => {
                        this.setState({ delta: value });
                      }}
                    />
                  </div>
                )
              }
            </div>

            <FormItem label="经办人" style={{ width: 520, display: 'inline-block' }}>
              {getFieldDecorator('assigneedId', {})(
                <Select
                  label="经办人"
                  getPopupContainer={triggerNode => triggerNode.parentNode}
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
                        originUsers: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originUsers.map(user =>
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
            <Tooltip title={'可自行选择经办人，如不选择，会应用模块的默认经办人逻辑和项目的默认经办人策略'}>
              <Icon
                type="error"
                style={{
                  fontSize: '16px',
                  color: 'rgba(0,0,0,0.54)',
                  marginLeft: 15,
                  marginTop: 20,
                }}
              />
            </Tooltip>

            {
              this.props.form.getFieldValue('typeCode') !== 'issue_epic' && (
                <FormItem label="史诗" style={{ width: 520 }}>
                  {getFieldDecorator('epicId', {})(
                    <Select
                      label="史诗"
                      allowClear
                      filter
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      loading={this.state.selectLoading}
                      onFocus={() => {
                        this.setState({
                          selectLoading: true,
                        });
                        loadEpics().then((res) => {
                          this.setState({
                            originEpics: res,
                            selectLoading: false,
                          });
                        });
                      }}
                    >
                      {this.state.originEpics.map(epic =>
                        <Option key={epic.issueId} value={epic.issueId}>{epic.epicName}</Option>,
                      )}
                    </Select>,
                  )}
                </FormItem>
              )
            }

            <FormItem label="冲刺" style={{ width: 520 }}>
              {getFieldDecorator('sprintId', {})(
                <Select
                  label="冲刺"
                  allowClear
                  filter
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={this.state.selectLoading}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadSprints(['sprint_planning', 'started']).then((res) => {
                      this.setState({
                        originSprints: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originSprints.map(sprint =>
                    <Option key={sprint.sprintId} value={sprint.sprintId}>{sprint.sprintName}</Option>,
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="修复版本" style={{ width: 520 }}>
              {getFieldDecorator('fixVersionIssueRel', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label="修复版本"
                  mode="tags"
                  loading={this.state.selectLoading}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  tokenSeparators={[',']}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadVersions(['version_planning']).then((res) => {
                      this.setState({
                        originFixVersions: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originFixVersions.map(version =>
                    <Option key={version.name} value={version.name}>{version.name}</Option>,
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="模板" style={{ width: 520 }}>
              {getFieldDecorator('componentIssueRel', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label="模块"
                  mode="tags"
                  loading={this.state.selectLoading}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  tokenSeparators={[',']}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadComponents().then((res) => {
                      this.setState({
                        originComponents: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originComponents.map(component =>
                    <Option key={component.name} value={component.name}>{component.name}</Option>,
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="标签" style={{ width: 520 }}>
              {getFieldDecorator('issueLink', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label="标签"
                  mode="tags"
                  loading={this.state.selectLoading}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  tokenSeparators={[',']}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadLabels().then((res) => {
                      this.setState({
                        originLabels: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originLabels.map(label =>
                    <Option key={label.labelName} value={label.labelName}>{label.labelName}</Option>,
                  )}
                </Select>,
              )}
            </FormItem>
          </Form>
          
          <div className="sign-upload" style={{ marginTop: 38 }}>
            <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: 'bold' }}>附件</div>
            </div>
            <div style={{ marginTop: -38 }}>
              <UploadButton
                onRemove={this.setFileList}
                onBeforeUpload={this.setFileList}
                fileList={this.state.fileList}
              />
            </div>
          </div>
        </div>
        {
          this.state.edit ? (
            <FullEditor
              initValue={this.state.delta}
              visible={this.state.edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateIssue));
