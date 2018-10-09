import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  Select, Form, Input, Button, Modal, Icon, Tooltip,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import './CreateIssue.scss';
import '../../../assets/main.scss';
import { UploadButton } from '../CommonComponent';
import { handleFileUpload, beforeTextUpload } from '../../../common/utils';
import {
  createIssue, loadLabels, loadPriorities, loadVersions, loadComponents, 
  getFoldersByVersion,
} from '../../../api/IssueApi';
import { getUsers } from '../../../api/CommonApi';
import { COLOR } from '../../../common/Constant';
import { FullEditor, WYSIWYGEditor } from '../../CommonComponent';
import UserHead from '../UserHead';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;

let sign = false;

class CreateIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delta: '',
      edit: false,
      createLoading: false,
      fileList: [],
      selectLoading: false,
      originLabels: [],
      originComponents: [],
      originPriorities: [],
      originFixVersions: [],  
      originUsers: [],

      origin: {},
      folders: [],
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

  onFilterChange(input) {
    if (!sign) {
      this.setState({
        selectLoading: true,
      });
      getUsers(input).then((res) => {
        this.setState({
          originUsers: res.content,
          selectLoading: false,
        });
      });
      sign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  debounceFilterIssues = _.debounce((input) => {
    this.setState({
      selectLoading: true,
    });
    getUsers(input).then((res) => {
      this.setState({
        originUsers: res.content,
        selectLoading: false,
      });
    });
  }, 500);

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

  loadFolders = () => {
    const { getFieldValue } = this.props.form;
    if (getFieldValue('versionId')) {
      this.setState({
        selectLoading: true,
      });
      getFoldersByVersion(getFieldValue('versionId')).then((folders) => {
        this.setState({
          folders,
          selectLoading: false,
        });
      });
    }
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
        const version = values.versionId;       
        const target = _.find(exitFixVersions, { versionId: version });
        let fixVersionIssueRelDTOList = [];
        if (target) {
          fixVersionIssueRelDTOList = [{
            ...target,
            relationType: 'fix',
          }];
        } else {
          Choerodon.prompt('版本错误');
          return null;
        }
        
        // return;
        // const fixVersionIssueRelDTOList = _.map(values.fixVersionIssueRel, (version) => {
        //   const target = _.find(exitFixVersions, { name: version });
        //   if (target) {
        //     return {
        //       ...target,
        //       relationType: 'fix',
        //     };
        //   } else {
        //     return ({
        //       name: version,
        //       relationType: 'fix',
        //       projectId: AppState.currentMenuType.id,
        //     });
        //   }
        // });
        const extra = {
          typeCode: 'issue_test',
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
          this.handleSave(extra, values.folderId);
        }
        this.props.onOk(extra);
      }
      
    });
  };

  handleSave = (data, folderId) => {
    const fileList = this.state.fileList;
    const callback = (newFileList) => {
      this.setState({ fileList: newFileList });
    };
    createIssue(data, folderId)
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
    const {
      initValue, visible, onCancel, onOk,
    } = this.props;
    const { folders, selectLoading } = this.state;
    const folderOptions = folders.map(folder => (
      <Option value={folder.folderId} key={folder.folderId}>
        {folder.name}
      </Option>
    ));
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };

    return (
      <Sidebar
        className="c7ntest-createIssue"
        title={<FormattedMessage id="issue_create_name" />}
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={<FormattedMessage id="issue_create_title" />}
          description={<FormattedMessage id="issue_create_content_description" />}
          link="http://v0-8.choerodon.io/zh/docs/user-guide/agile/issue/create-issue/"
        >
          <Form layout="vertical">
            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('summary', {
                rules: [{ required: true, message: '概要为必输项' }],
              })(
                <Input label={<FormattedMessage id="issue_issueFilterBySummary" />} maxLength={44} />,
              )}
            </FormItem>

            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('priorityCode', {
                rules: [{ required: true, message: '优先级为必选项' }],
                initialValue: this.state.origin.defaultPriorityCode,
              })(
                <Select
                  label={<FormattedMessage id="issue_issueFilterByPriority" />}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {this.transformPriorityCode(this.state.originPriorities).map(type => (
                    <Option key={type.valueCode} value={type.valueCode}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                        <div
                          style={{
                            color: COLOR[type.valueCode].color, width: 20, height: 20, textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: 8,
                          }}
                        >
                          <Icon
                            type="flag"
                            style={{ fontSize: '13px' }}
                          />
                        </div>
                        <span>{type.name}</span>
                      </div>
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>

            <div>
              <div style={{ display: 'flex', marginBottom: 13, alignItems: 'center' }}>
                <div style={{ fontWeight: 500 }}><FormattedMessage id="execute_description" /></div>
                <div style={{ marginLeft: 80 }}>
                  <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ edit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                    <span style={{ color: '#3f51b5' }}><FormattedMessage id="execute_edit_fullScreen" /></span>
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

            <FormItem style={{ width: 520, display: 'inline-block' }}>
              {getFieldDecorator('assigneedId', {})(
                <Select
                  label={<FormattedMessage id="issue_issueSortByPerson" />}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  loading={this.state.selectLoading}
                  filter
                  filterOption={false}
                  allowClear
                  onFilterChange={this.onFilterChange.bind(this)}
                >
                  {this.state.originUsers.map(user => (
                    <Option key={user.id} value={user.id}>
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
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <Tooltip title="可自行选择经办人，如不选择，会应用模块的默认经办人逻辑和项目的默认经办人策略">
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

            {/* {
              this.props.form.getFieldValue('typeCode') !== 'issue_epic' && (
                <FormItem style={{ width: 520 }}>
                  {getFieldDecorator('epicId', {})(
                    <Select
                      label={<FormattedMessage id="issue_create_content_epic" />}
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
                      {this.state.originEpics.map(epic => <Option key={epic.issueId} value={epic.issueId}>{epic.epicName}</Option>)}
                    </Select>,
                  )}
                </FormItem>
              )
            }

            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('sprintId', {})(
                <Select
                  label={<FormattedMessage id="issue_create_content_sprint" />}
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
                  {this.state.originSprints.map(sprint => (
                    <Option
                      key={sprint.sprintId}
                      value={sprint.sprintId}
                    >
                      {sprint.sprintName}

                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem> */}

            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('versionId', {
                rules: [
                  {
                    required: true,
                    message: '请选择版本',
                  }, {
                    transform: value => (value ? value.toString() : value),
                  }],
              })(
                <Select
                  label={<FormattedMessage id="issue_create_content_version" />}
                  // mode="tags"
                  loading={this.state.selectLoading}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  tokenSeparators={[',']}
                  onChange={() => {
                    const { resetFields } = this.props.form;
                    resetFields(['folderId']);
                  }}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadVersions(['version_planning', 'released']).then((res) => {
                      this.setState({
                        originFixVersions: res,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originFixVersions.map(version => <Option key={version.name} value={version.versionId}>{version.name}</Option>)}
                </Select>,
              )}
            </FormItem>
            <FormItem
              style={{ width: 520 }}
                  // {...formItemLayout}
              label={null}
            >
              {getFieldDecorator('folderId', {
                // rules: [{
                //   required: true, message: '请选择文件夹!',
                // }],
              })(
                <Select
                  loading={selectLoading}
                  onFocus={this.loadFolders}                 
                  label={<FormattedMessage id="issue_folder" />}
                >
                  {folderOptions}
                </Select>,                    
              )}
            </FormItem>
            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('componentIssueRel', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label={<FormattedMessage id="summary_component" />}
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
                  {this.state.originComponents.map(component => <Option key={component.name} value={component.name}>{component.name}</Option>)}
                </Select>,
              )}
            </FormItem>

            <FormItem style={{ width: 520 }}>
              {getFieldDecorator('issueLink', {
                rules: [{ transform: value => (value ? value.toString() : value) }],
              })(
                <Select
                  label={<FormattedMessage id="summary_label" />}
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
                  {this.state.originLabels.map(label => (
                    <Option
                      key={label.labelName}
                      value={label.labelName}
                    >
                      {label.labelName}

                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Form>

          <div className="sign-upload" style={{ marginTop: 38 }}>
            <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
              <div style={{ fontWeight: 500 }}><FormattedMessage id="attachment" /></div>
            </div>
            <div style={{ marginTop: -38 }}>
              <UploadButton
                onRemove={this.setFileList}
                onBeforeUpload={this.setFileList}
                fileList={this.state.fileList}
              />
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
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateIssue));
