import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import {
  Select, Form, Input, Button, Modal, Icon, Tooltip,
} from 'choerodon-ui';
import { FormattedMessage, injectIntl } from 'react-intl';
import {
  handleFileUpload, beforeTextUpload, getProjectName, getProjectId, getOrganizationId,
} from '../../../common/utils';
import {
  getIssueTypes, getPrioritys, getUsers, getEpics, getSprintsUnClosed, getProjectVersion, getModules, getLabels, createBug,
} from '../../../api/agileApi';
import { addBug } from '../../../api/ExecuteDetailApi';
import { WYSIWYGEditor, FullEditor } from '../../CommonComponent';
import UserHead from '../../IssueManageComponent/UserHead';
import TypeTag from '../../IssueManageComponent/AgileTypeTag';
import UploadButton from '../../IssueManageComponent/CommonComponent/UploadButton';
import ExecuteDetailStore from '../../../store/project/TestExecute/ExecuteDetailStore';
import './CreateBug.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
const sign = false;

@injectIntl
class CreateBug extends Component {
  debounceFilterIssues = _.debounce((input) => {
    this.setState({ selectLoading: true });
    getUsers(input).then((res) => {
      this.setState({
        originUsers: res.content.filter(u => u.enabled),
        selectLoading: false,
      });
    });
  }, 500);

  constructor(props) {
    super(props);
    this.state = {
      delta: '',
      fullEdit: false,
      selectLoading: false,
      createLoading: false,
      fileList: [],
      originIssueTypes: [],
      originPriorities: [],
      originUsers: [],
      originEpics: [],
      originSprints: [],
      originFixVersions: [],
      originComponents: [],
      originLabels: [],
      defaultPriority: false,
      bugType: undefined,
    };
  }

  componentDidMount() {
    Promise.all([
      getIssueTypes('agile'), getPrioritys(), getUsers(), getEpics(), getSprintsUnClosed(), getProjectVersion(), getModules(), getLabels(),
    ]).then(([originIssueTypes, originPriorities, originUsers, originEpics, originSprints, originFixVersions, originComponents, originLabels]) => {
      this.setState({
        originIssueTypes,
        originPriorities,
        originUsers: originUsers.content.filter(u => u.enabled),
        originEpics,
        originSprints,
        originFixVersions,
        originComponents,
        defaultPriority: originPriorities.find(item => item.default),
        originLabels,
        bugType: originIssueTypes.find(item => item.typeCode === 'bug'),
      });
    });
  }

        setFileList = (data) => {
          this.setState({ fileList: data });
        };

          handleCreateIssue = () => {
            const { form } = this.props;
            const {
              originIssueTypes,
              originComponents,
              originLabels,
              originFixVersions,
              delta,
              bugType,
            } = this.state;

            form.validateFields((err, values) => {
              if (!err) {
                const exitComponents = originComponents;
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
                const exitLabels = originLabels;
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
                const exitFixVersions = originFixVersions;
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
                  issueTypeId: bugType.id,
                  typeCode: bugType.typeCode,
                  summary: values.summary,
                  priorityId: values.priorityId,
                  priorityCode: `priority-${values.priorityId}`,
                  sprintId: values.sprintId || 0,
                  epicId: values.epicId || 0,
                  epicName: values.epicName,
                  parentIssueId: 0,
                  assigneeId: values.assigneedId,
                  labelIssueRelDTOList,
                  versionIssueRelDTOList: fixVersionIssueRelDTOList,
                  componentIssueRelDTOList,
                  storyPoints: values.storyPoints,
                  remainingTime: values.estimatedTime,
                };
                this.setState({ createLoading: true });
                const deltaOps = delta;
                if (deltaOps) {
                  beforeTextUpload(deltaOps, extra, this.handleSave);
                } else {
                  extra.description = '';
                  this.handleSave(extra);
                }
                // this.props.onOk(extra);
              }
            });
          };

            handleSave = (data) => {
              const { fileList } = this.state;
              const { onOk, defectType, id } = this.props;
              const callback = (newFileList) => {
                this.setState({ fileList: newFileList });
              };
              // createBug(data)
              addBug(defectType, id, data)
                .then((res) => {
                  if (fileList.length > 0) {
                    const config = {
                      issueType: res.statusId,
                      issueId: res.issueId,
                      fileName: fileList[0].name,
                      projectId: AppState.currentMenuType.id,
                    };
                    if (fileList.some(one => !one.url)) {
                      handleFileUpload(fileList, callback, config);
                    }
                  }
                  onOk(res);
                  ExecuteDetailStore.getInfo();
                })
                .catch(() => {
                  onOk();
                });
            };

            render() {
              const {
                visible,
                onCancel,
                store,
                form,
                intl,
              } = this.props;
              const { getFieldDecorator } = form;
              const {
                originPriorities, defaultPriority, createLoading,
                fullEdit, delta, originUsers,
                originEpics, originSprints, originFixVersions, originComponents,
                originLabels, fileList, originIssueTypes, selectLoading, bugType,
              } = this.state;
              // const bugType = originIssueTypes && originIssueTypes.length > 0 && originIssueTypes.find(item => item.typeCode === 'bug');
              const callback = (value) => {
                this.setState({
                  delta: value,
                  fullEdit: false,
                });
              };
              // const originIssueTypes = store.getIssueTypes;
              return (
                <Sidebar
                  className="c7n-createBug"
                  title={<FormattedMessage id="createBug_title" />}
                  visible={visible || false}
                  onOk={this.handleCreateIssue}
                  onCancel={onCancel}
                  okText={<FormattedMessage id="createBug_okText" />}
                  cancelText={<FormattedMessage id="createBug_cancelText" />}
                  confirmLoading={createLoading}
                >
                  <Content
                    title={<FormattedMessage id="createBug_content_title" values={{ name: getProjectName() }} />}
                    description={<FormattedMessage id="createBug_content_description" />}
                    link="http://v0-10.choerodon.io/zh/docs/user-guide/test-management/execution-test/execution"
                  >
                    <div>
                      <Form layout="vertical">
                        <Select
                          style={{ width: 520, marginBottom: 20 }}
                          label={<FormattedMessage id="createBug_field_issueType" />}
                          getPopupContainer={triggerNode => triggerNode.parentNode}
                          disabled
                          value={bugType && bugType.id}
                        >
                          {bugType && (
                            <Option key={bugType.id} value={bugType.id}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
                                <TypeTag
                                  data={bugType}
                                  showName
                                />
                              </div>
                            </Option>
                          )}
                        </Select>
                        <FormItem label={<FormattedMessage id="createBug_field_summary" />} style={{ width: 520 }}>
                          {getFieldDecorator('summary', {
                            rules: [{ required: true, message: intl.formatMessage({ id: 'createBug_field_summaryRequire' }) }],
                          })(
                            <Input label={<FormattedMessage id="createBug_field_summary" />} maxLength={44} placeholder={<FormattedMessage id="createBug_fielf_summaryPlaceHolder" />} />,
                          )}
                        </FormItem>
                        <FormItem label={<FormattedMessage id="createBug_field_priority" />} style={{ width: 520 }}>
                          {getFieldDecorator('priorityId', {
                            rules: [{ required: true, message: intl.formatMessage({ id: 'createBug_field_priorityRequire' }) }],
                            initialValue: defaultPriority ? defaultPriority.id : '',
                          })(
                            <Select
                              label={<FormattedMessage id="createBug_field_priority" />}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                              {originPriorities && originPriorities.length && originPriorities.map(priority => (
                                <Option key={priority.id} value={priority.id}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: 2 }}>
                                    <span>{priority.name}</span>
                                  </div>
                                </Option>
                              ))}
                            </Select>,
                          )}
                        </FormItem>
                        <div style={{ width: 520 }}>
                          <div style={{ display: 'flex', marginBottom: 3, alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>{<FormattedMessage id="createBug_field_description" />}</div>
                            <div style={{ marginLeft: 80 }}>
                              <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ fullEdit: true })} style={{ display: 'flex', alignItems: 'center' }}>
                                <Icon type="zoom_out_map" style={{ color: '#3f51b5', fontSize: '18px', marginRight: 12 }} />
                                <span style={{ color: '#3f51b5' }}>{<FormattedMessage id="createBug_field_descriptionFullEdit" />}</span>
                              </Button>
                            </div>
                          </div>
                          {
                            !fullEdit && (
                            <div className="clear-p-mw">
                              <WYSIWYGEditor
                                value={delta}
                                style={{ height: 200, width: '100%' }}
                                onChange={(value) => {
                                  this.setState({ delta: value });
                                }}
                              />
                            </div>
                            )
                        }
                        </div>

                        <FormItem label={<FormattedMessage id="createBug_field_assignee" />} style={{ width: 520, display: 'inline-block' }}>
                          {getFieldDecorator('assigneedId', {})(
                            <Select
                              label={<FormattedMessage id="createBug_field_assignee" />}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              filter
                              filterOption={
                                (input, option) => (
                                  option.props.children.props.children.props.user.realName.toLowerCase().indexOf(
                                    input.toLowerCase(),
                                  ) >= 0 || option.props.children.props.children.props.user.loginName.toLowerCase().indexOf(
                                    input.toLowerCase(),
                                  ) >= 0
                                )
                                }
                              allowClear
                            >
                              {originUsers && originUsers.length && originUsers.map(user => (
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

                        {
              form.getFieldValue('typeCode') !== 'issue_epic' && (
                <FormItem label={<FormattedMessage id="createBug_field_epic" />} style={{ width: 520 }}>
                  {getFieldDecorator('epicId', {})(
                    <Select
                      label={<FormattedMessage id="createBug_field_epic" />}
                      allowClear
                      filter
                      filterOption={
                        (input, option) => option.props.children && option.props.children.toLowerCase().indexOf(
                          input.toLowerCase(),
                        ) >= 0
                      }
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                    >
                      {originEpics && originEpics.length && originEpics.map(
                        epic => (
                          <Option
                            key={epic.issueId}
                            value={epic.issueId}
                          >
                            {epic.epicName}
                          </Option>
                        ),
                      )}
                    </Select>,
                  )}
                </FormItem>
              )
            }

                        <FormItem label={<FormattedMessage id="createBug_field_sprint" />} style={{ width: 520 }}>
                          {getFieldDecorator('sprintId', {})(
                            <Select
                              label={<FormattedMessage id="createBug_field_sprint" />}
                              allowClear
                              filter
                              filterOption={
                                (input, option) => option.props.children.toLowerCase().indexOf(
                                  input.toLowerCase(),
                                ) >= 0
                                }
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                            >
                              {originSprints && originSprints.length && originSprints.map(sprint => (
                                <Option key={sprint.sprintId} value={sprint.sprintId}>
                                  {sprint.sprintName}
                                </Option>
                              ))}
                            </Select>,
                          )}
                        </FormItem>

                        <FormItem label={<FormattedMessage id="createBug_field_fixVersion" />} style={{ width: 520 }}>
                          {getFieldDecorator('fixVersionIssueRel', {
                            rules: [{ transform: value => (value ? value.toString() : value) }],
                          })(
                            <Select
                              label={<FormattedMessage id="createBug_field_fixVersion" />}
                              mode="tags"
                              loading={selectLoading}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              tokenSeparators={[',']}
                            >
                              {
                      originFixVersions && originFixVersions.length && originFixVersions.map(
                        version => (
                          <Option
                            key={version.name}
                            value={version.name}
                          >
                            {version.name}
                          </Option>
                        ),
                      )}
                            </Select>,
                          )}
                        </FormItem>

                        <FormItem label={<FormattedMessage id="createBug_field_component" />} style={{ width: 520 }}>
                          {getFieldDecorator('componentIssueRel', {
                            rules: [{ transform: value => (value ? value.toString() : value) }],
                          })(
                            <Select
                              label={<FormattedMessage id="createBug_field_component" />}
                              mode="tags"
                              loading={selectLoading}
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              tokenSeparators={[',']}
                            >
                              {
                      originComponents && originComponents.length && originComponents.map(
                        component => (
                          <Option
                            key={component.name}
                            value={component.name}
                          >
                            {component.name}
                          </Option>
                        ),
                      )}
                            </Select>,
                          )}
                        </FormItem>

                        <FormItem label={<FormattedMessage id="createBug_field_label" />} style={{ width: 520 }}>
                          {getFieldDecorator('issueLink', {
                            rules: [{ transform: value => (value ? value.toString() : value) }],
                          })(
                            <Select
                              label={<FormattedMessage id="createBug_field_label" />}
                              mode="tags"
                              getPopupContainer={triggerNode => triggerNode.parentNode}
                              tokenSeparators={[',']}
                            >
                              {originLabels && originLabels.length && originLabels.map(label => (
                                <Option key={label.labelName} value={label.labelName}>
                                  {label.labelName}
                                </Option>
                              ))}
                            </Select>,
                          )}
                        </FormItem>
                      </Form>

                      <div className="sign-upload" style={{ marginTop: 20 }}>
                        <div style={{ display: 'flex', marginBottom: '13px', alignItems: 'center' }}>
                          <div style={{ fontWeight: 'bold' }}>{<FormattedMessage id="createBug_field_annex" />}</div>
                        </div>
                        <div style={{ marginTop: -38 }}>
                          <UploadButton
                            onRemove={this.setFileList}
                            onBeforeUpload={this.setFileList}
                            fileList={fileList}
                          />
                        </div>
                      </div>
                    </div>
          
                    {
                    fullEdit ? (
                      <FullEditor
                        initValue={delta}
                        visible={fullEdit}
                        onCancel={() => this.setState({ fullEdit: false })}
                        onOk={callback}
                      />
                    ) : null
                    }
                  </Content>
                </Sidebar>
              );
            }
}
export default Form.create({})(CreateBug);
