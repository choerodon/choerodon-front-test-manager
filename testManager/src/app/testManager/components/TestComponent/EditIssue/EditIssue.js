import React, { Component } from 'react';
import { stores, Permission } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Select, Input, Button, Modal, Tooltip, Dropdown, Menu, Spin, Icon,
} from 'choerodon-ui';
import './EditIssue.scss';
import '../../../assets/main.scss';
import { UploadButtonNow, IssueDescription } from '../CommonComponent';
import { TextEditToggle, User } from '../../CommonComponent';
import {
  delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload, color2rgba,
} from '../../../common/utils';
import {
  loadDatalogs, loadLinkIssues, loadIssue, updateStatus, updateIssue, createIssueStep,
  createCommit, deleteIssue, loadStatus, cloneIssue, getIssueSteps, getIssueExecutes,
} from '../../../api/IssueManageApi';
import { getLabels, getPrioritys, getModules } from '../../../api/agileApi';
import { getUsers } from '../../../api/IamApi';
import { FullEditor, WYSIWYGEditor } from '../../CommonComponent';
import CreateLinkTask from '../CreateLinkTask';
import UserHead from '../UserHead';
import Comment from './Component/Comment';
import DataLogs from './Component/DataLogs';
import LinkList from './Component/LinkList';
import PriorityTag from '../PriorityTag';
import CopyIssue from '../CopyIssue';
import TestStepTable from '../TestStepTable';
import TestExecuteTable from '../TestExecuteTable';
import TypeTag from '../TypeTag';

const { AppState } = stores;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
let sign = true;
let filterSign = false;
const { Text, Edit } = TextEditToggle;
const navs = [
  { code: 'detail', tooltip: '详情', icon: 'error_outline' },
  { code: 'des', tooltip: '描述', icon: 'subject' },
  { code: 'test1', tooltip: '测试详细信息', icon: 'compass' },
  { code: 'test2', tooltip: '测试执行', icon: 'explicit2' },
  { code: 'attachment', tooltip: '附件', icon: 'attach_file' },
  { code: 'commit', tooltip: '评论', icon: 'sms_outline' },
  { code: 'data_log', tooltip: '活动日志', icon: 'insert_invitation' },
  { code: 'link_task', tooltip: '相关任务', icon: 'link' },
];
class EditIssueNarrow extends Component {
  state = {
    // 子组件显示控制
    issueLoading: false,
    selectLoading: true,
    FullEditorShow: false,
    createLinkTaskShow: false,
    editDescriptionShow: false,
    addingComment: false,

    currentNav: 'detail',

    // issue信息
    issueInfo: {},

    datalogs: [],
    fileList: [],
    testStepData: [],
    testExecuteData: [],

    linkIssues: [],
    StatusList: [],
    priorityList: [],
    componentList: [],
    labelList: [],
    userList: [],
  }


  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.reloadIssue(this.props.issueId);
    document.getElementById('scroll-area').addEventListener('scroll', (e) => {
      if (sign) {
        const currentNav = this.getCurrentNav(e);
        if (this.state.currentNav !== currentNav && currentNav) {
          this.setState({
            currentNav,
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.issueId !== this.props.issueId) {
      this.reloadIssue(nextProps.issueId);
    }
  }

  /**
   * Attachment
   */
  onChangeFileList = (arr) => {
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        issueType: this.state.typeCode,
        issueId: this.state.issueId,
        fileName: arr[0].name || 'AG_ATTACHMENT',
        projectId: AppState.currentMenuType.id,
      };
      handleFileUpload(arr, this.addFileToFileList, config);
    }
  }


  /**
   * Attachment
   */
  addFileToFileList = (data) => {
    this.reloadIssue();
  }

  setIssueToState = (issue) => {
    const {
      issueAttachmentDTOList,
    } = issue;
    const fileList = _.map(issueAttachmentDTOList, issueAttachment => ({
      uid: issueAttachment.attachmentId,
      name: issueAttachment.fileName,
      url: issueAttachment.url,
    }));
    this.setState({
      issueInfo: issue,
      fileList,
      issueLoading: false,
    });
  }

  getCurrentNav(e) {
    return _.find(navs.map(nav => nav.code), i => this.isInLook(document.getElementById(i)));
  }

  isInLook(ele) {
    const a = ele.offsetTop;
    const target = document.getElementById('scroll-area');
    // return a >= target.scrollTop && a < (target.scrollTop + target.offsetHeight);
    return a + ele.offsetHeight > target.scrollTop;
  }

  scrollToAnchor = (anchorName) => {
    if (anchorName) {
      const anchorElement = document.getElementById(anchorName);
      if (anchorElement) {
        sign = false;
        anchorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          // inline: "nearest",
        });
        setTimeout(() => {
          sign = true;
        }, 2000);
      }
    }
  }

  onFilterChange(input) {
    if (!filterSign) {
      this.setState({
        selectLoading: true,
      });
      getUsers(input).then((res) => {
        this.setState({
          userList: res.content,
          selectLoading: false,
        });
      });
      filterSign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  /**
   * Attachment
   */
  setFileList = (data) => {
    this.setState({ fileList: data });
  }

  debounceFilterIssues = _.debounce((input) => {
    this.setState({
      selectLoading: true,
    });
    getUsers(input).then((res) => {
      this.setState({
        userList: res.content,
        selectLoading: false,
      });
    });
  }, 500);

  /**
   *加载issue以及相关信息
   *
   * @param {*} [issueId=this.state.issueInfo.issueId]
   * @memberof EditIssueNarrow
   */
  reloadIssue(issueId = this.state.issueInfo.issueId) {
    this.setState({
      addingComment: false,
      editDescriptionShow: false,
      issueLoading: true,
    });
    Promise.all([
      loadIssue(issueId),
      loadLinkIssues(issueId),
      loadDatalogs(issueId),
      getIssueSteps(issueId),
      getIssueExecutes(issueId),
    ]).then(([issue, linkIssues, datalogs, testStepData, testExecuteData]) => {
      const {
        issueAttachmentDTOList,
      } = issue;
      const fileList = _.map(issueAttachmentDTOList, issueAttachment => ({
        uid: issueAttachment.attachmentId,
        name: issueAttachment.fileName,
        url: issueAttachment.url,
      }));
      this.setState({
        issueInfo: issue,
        fileList,
        linkIssues,
        datalogs,
        testStepData,
        testExecuteData,
        issueLoading: false,
      });
    });
  }

  /**
   *多选提交前的准备，因为可以手动输入，所以会有原先不存在的值提交，后台会自动新建
   *
   * @memberof EditIssueNarrow
   */
  prepareMutilSelectValueBeforeSubmit = (selected, fromList, key) => selected.map((item) => {
    const exist = _.find(fromList, { name: item });
    // 如果已有则返回已有值，如果不存在，则返回name和projectId
    if (exist) {
      return exist;
    } else {
      const prepared = { projectId: AppState.currentMenuType.id };
      prepared[key] = item;
      return prepared;
    }
  })

  /**
   *更新用例信息
   * @param newValue 例 { statusId: 1 }
   * @memberof EditIssueNarrow
   */
  editIssue = (newValue) => {
    const key = Object.keys(newValue)[0];
    const value = newValue[key];
    const {
      issueInfo, StatusList, componentList, labelList,
    } = this.state;
    const { issueId, objectVersionNumber } = issueInfo;

    let issue = {
      issueId,
      objectVersionNumber,
    };
    switch (key) {
      case 'statusId': {
        const targetStatus = _.find(StatusList, { endStatusId: value });
        if (targetStatus) {
          updateStatus(targetStatus.id, issue.issueId, issue.objectVersionNumber)
            .then((res) => {
              this.reloadIssue();
              if (this.props.onUpdate) {
                this.props.onUpdate();
              }
            });
        }
        break;
      }
      case 'componentIssueRelDTOList': {
        issue.componentIssueRelDTOList = this.prepareMutilSelectValueBeforeSubmit(value, componentList, 'name');
        updateIssue(issue)
          .then((res) => {
            this.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          });
        break;
      }
      case 'labelIssueRelDTOList': {
        issue.labelIssueRelDTOList = this.prepareMutilSelectValueBeforeSubmit(value, labelList, 'labelName');
        updateIssue(issue)
          .then((res) => {
            this.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          });
        break;
      }
      case 'description': {
        if (value) {
          returnBeforeTextUpload(value, issue, updateIssue, 'description')
            .then((res) => {
              this.reloadIssue();
            });
        }
        break;
      }
      default: {
        issue = { ...issue, ...newValue };
        updateIssue(issue)
          .then((res) => {
            this.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          });
        break;
      }
    }
  }

  /**
   * Comment
   */
  handleCreateCommit(newComment) {
    const { issueInfo } = this.state;
    const { issueId } = issueInfo;
    const extra = { issueId };
    if (newComment) {
      beforeTextUpload(newComment, extra, this.createCommit, 'commentText');
    } else {
      extra.commentText = '';
      this.createCommit(extra);
    }
  }

  /**
   * Comment
   */
  createCommit = (commit) => {
    createCommit(commit).then((res) => {
      this.reloadIssue();
      this.setState({
        addingComment: false,
      });
    });
  }

  transToArr(arr, pro, type = 'string') {
    if (typeof arr !== 'object') {
      return '';
    }
    if (!arr.length) {
      return type === 'string' ? '无' : [];
    } else if (typeof arr[0] === 'object') {
      return type === 'string' ? _.map(arr, pro).join() : _.map(arr, pro);
    } else {
      return type === 'string' ? arr.join() : arr;
    }
  }


  handleCreateLinkIssue() {
    this.reloadIssue();
    this.setState({
      createLinkTaskShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  handleCopyIssue() {
    this.reloadIssue();
    this.setState({
      copyIssueShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
    if (this.props.onCopyAndTransformToSubIssue) {
      this.props.onCopyAndTransformToSubIssue();
    }
  }


  handleClickMenu(e) {
    const { issueInfo } = this.state;
    const { issueId } = issueInfo;
    switch (e.key) {
      case 'copy': {
        const copyConditionDTO = {
          issueLink: false,
          sprintValues: false,
          subTask: false,
          summary: false,
        };
        this.setState({
          issueLoading: true,
        });
        cloneIssue(issueId, copyConditionDTO).then((res) => {
          this.handleCopyIssue();
        }).catch((err) => {
          this.setState({
            issueLoading: false,
          });
          Choerodon.prompt('网络错误');
        });
        // this.setState({ copyIssueShow: true });
        break;
      }
      case 'item_1': {
        this.handleDeleteIssue(issueId);
        break;
      }
      default: break;
    }
  }

  handleDeleteIssue = (issueId) => {
    const { issueInfo } = this.state;
    const { issueNum } = issueInfo;
    confirm({
      width: 560,
      title: `删除测试用例${issueNum}`,
      content: '这个测试用例将会被彻底删除。包括所有步骤和相关执行',
      onOk: () => deleteIssue(issueId)
        .then((res) => { this.props.onDeleteIssue(); }),
      okText: '删除',
      okType: 'danger',
    });
  }

  /**
   * Comment
   */
  renderCommits() {
    const { addingComment } = this.state;
    const { issueCommentDTOList } = this.state.issueInfo;
    return (
      <div>
        {
          addingComment && (
            <div className="line-start mt-10">
              <WYSIWYGEditor
                bottomBar
                style={{ height: 200, width: '100%' }}
                handleSave={value => this.handleCreateCommit(value)}
              />
            </div>
          )
        }
        {
          issueCommentDTOList && issueCommentDTOList.map(comment => (
            <Comment
              key={comment.commentId}
              comment={comment}
              onDeleteComment={() => this.reloadIssue()}
              onUpdateComment={() => this.reloadIssue()}
            />
          ))
        }
      </div>
    );
  }

  /**
   * DataLog
   */
  renderDataLogs() {
    const { datalogs } = this.state;
    return (
      <DataLogs
        datalogs={datalogs}
      />
    );
  }

  renderLinkIssues() {
    const { linkIssues } = this.state;
    const group = _.groupBy(linkIssues, 'ward');
    return (
      <div className="c7ntest-tasks">
        {
          _.map(group, (issues, ward) => (
            <div key={ward}>
              <div style={{ margin: '7px auto' }}>{ward}</div>
              {
                _.map(issues, (linkIssue, i) => this.renderLinkList(linkIssue, i))
              }
            </div>
          ))
        }
      </div>
    );
  }


  renderLinkList(link, i) {
    const { issueInfo } = this.state;
    const { issueId } = issueInfo;
    return (
      <LinkList
        key={link.linkId}
        issue={link}
        i={i}
        // onOpen={(issueId, linkedIssueId) => {
        //   const menu = AppState.currentMenuType;
        //   const { type, id: projectId, name } = menu;
        //   this.props.history.push(`/agile/issue?
        // type=${type}&id=${projectId}&name=${name}&paramIssueId=${linkedIssueId}`);
        //   // this.reloadIssue(issueId === this.state.issueId ? linkedIssueId : issueId);
        // }}
        onRefresh={() => {
          this.reloadIssue(issueId);
        }}
      />

    );
  }

  /**
   * 用例描述
   *
   * @returns
   * @memberof EditIssueNarrow
   */
  renderDescription() {
    const { issueInfo, editDescriptionShow } = this.state;
    const { description } = issueInfo;
    let delta;
    if (editDescriptionShow === undefined) {
      return null;
    }
    if (!description || editDescriptionShow) {
      delta = text2Delta(description);
      return (
        <div className="line-start mt-10">
          <WYSIWYGEditor
            bottomBar
            value={text2Delta(description)}
            style={{ height: 200, width: '100%' }}
            handleDelete={() => {
              this.setState({
                editDescriptionShow: false,
              });
            }}
            handleSave={(value) => {
              this.setState({
                editDescriptionShow: false,
              });
              this.editIssue({ description: value });
            }}
          />
        </div>
      );
    } else {
      delta = delta2Html(description);
      return (
        <div className="c7ntest-content-wrapper">
          <div
            className="line-start mt-10 c7ntest-description"
            role="none"
            onClick={() => {
              this.setState({
                editDescriptionShow: true,
              });
            }}
          >
            <IssueDescription data={delta} />
          </div>
        </div>
      );
    }
  }

  /**
   * 加载可以转换的状态
   *
   * @memberof EditIssueNarrow
   */
  loadTransformsByStatusId = (statusId) => {
    const { issueInfo } = this.state;
    const { issueTypeDTO, issueId } = issueInfo;

    const typeId = issueTypeDTO.id;
    loadStatus(statusId, issueId, typeId).then((res) => {
      this.setState({
        StatusList: res,
        selectLoading: false,
      });
    });
  }

  createIssueStep = () => {
    const { issueInfo, testStepData } = this.state;
    const { issueId } = issueInfo;
    const lastRank = testStepData.length
      ? testStepData[testStepData.length - 1].rank : null;
    const testCaseStepDTO = {
      attachments: [],
      issueId,
      lastRank,
      nextRank: null,
      testStep: '测试步骤',
      testData: '测试数据',
      expectedResult: '预期结果',
    };
    createIssueStep(testCaseStepDTO).then(() => {
      this.reloadIssue();
    });
  }

  /**
   *左侧导航锚点
   *
   * @memberof EditIssueNarrow
   */
  renderNavs = () => navs.map(nav => (
    <Tooltip placement="right" title={nav.tooltip}>
      <li id="DETAILS-nav" className={`c7ntest-li ${this.state.currentNav === nav.code ? 'c7ntest-li-active' : ''}`}>
        <Icon
          type={`${nav.icon} c7ntest-icon-li`}
          role="none"
          onClick={() => {
            this.setState({ currentNav: nav.code });
            this.scrollToAnchor(nav.code);
          }}
        />
      </li>
    </Tooltip>
  ))

  /**
   *用例状态更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectStatus = () => {
    const { issueInfo, StatusList, selectLoading } = this.state;
    const { statusMapDTO } = issueInfo;
    const {
      name: statusName, id: statusId, colour: statusColor, icon: statusIcon,
    } = statusMapDTO || {};

    return (
      <TextEditToggle
        style={{ width: '100%' }}
        formKey="statusId"
        onSubmit={(value) => { this.editIssue({ statusId: value }); }}
        originData={StatusList.length
          ? statusId : statusName}
      >
        <Text>
          {(data) => {
            const targetStatus = _.find(StatusList, { endStatusId: data });
            return (
              <div>
                {
                  targetStatus ? (
                    <div
                      style={{
                        color: targetStatus.statusDTO.colour || 'black',
                        fontSize: '16px',
                        lineHeight: '18px',
                      }}
                    >
                      {targetStatus.statusDTO.name}
                    </div>
                  ) : statusName
                }
              </div>
            );
          }}
        </Text>
        <Edit>
          <Select
            style={{ width: 150 }}
            loading={selectLoading}
            autoFocus
            onFocus={() => { this.loadTransformsByStatusId(statusId); }}
          >
            {
              StatusList.map(transform => (
                <Option key={transform.id} value={transform.endStatusId}>
                  {transform.statusDTO.name}
                </Option>
              ))
            }
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  /**
   *用例优先级更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectPriority = () => {
    const { issueInfo, priorityList, selectLoading } = this.state;
    const { priorityDTO } = issueInfo;
    const { name: priorityName, id: priorityId, colour: priorityColor } = priorityDTO || {};
    const priorityOptions = priorityList.map(priority => (
      <Option key={priority.id} value={priority.id}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <PriorityTag priority={priority} />
        </div>
      </Option>
    ));
    return (
      <TextEditToggle
        style={{ width: '100%' }}
        formKey="priorityId"
        onSubmit={(value) => { this.editIssue({ priorityId: value }); }}
        originData={priorityList.length
          ? priorityId : priorityName}
      >
        <Text>
          {(data) => {
            const targetPriority = _.find(priorityList, { id: data });
            return (
              <div>
                {
                  targetPriority ? (
                    <PriorityTag priority={targetPriority} />
                  ) : <PriorityTag priority={priorityDTO || {}} />
                }
              </div>
            );
          }}
        </Text>
        <Edit>
          <Select
            style={{ width: 150 }}
            loading={selectLoading}
            autoFocus
            onFocus={() => {
              this.setState({
                selectLoading: true,
              });
              getPrioritys().then((res) => {
                this.setState({
                  priorityList: res,
                  selectLoading: false,
                });
              });
            }}
          >
            {priorityOptions}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  /**
   *模块更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectModule = () => {
    const { issueInfo, componentList, selectLoading } = this.state;
    const { componentIssueRelDTOList } = issueInfo;
    return (
      <TextEditToggle
        style={{ width: '100%' }}
        formKey="componentIssueRelDTOList"
        onSubmit={(value) => { this.editIssue({ componentIssueRelDTOList: value }); }}
        originData={this.transToArr(componentIssueRelDTOList, 'name', 'array')}
      >
        <Text>
          {data => (
            <div style={{ color: '#3f51b5' }}>
              <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
                {this.transToArr(data, 'name')}
              </p>
            </div>
          )}
        </Text>
        <Edit>
          <Select
            loading={selectLoading}
            mode="tags"
            autoFocus
            getPopupContainer={triggerNode => triggerNode.parentNode}
            tokenSeparators={[',']}
            style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
            onFocus={() => {
              this.setState({
                selectLoading: true,
              });
              getModules().then((res) => {
                this.setState({
                  componentList: res,
                  selectLoading: false,
                });
              });
            }}
          >
            {componentList.map(component => (
              <Option
                key={component.name}
                value={component.name}
              >
                {component.name}
              </Option>
            ))}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  /**
   *标签更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectLabel = () => {
    const { issueInfo, labelList, selectLoading } = this.state;
    const { labelIssueRelDTOList } = issueInfo;
    return (
      <TextEditToggle
        style={{ width: '100%' }}
        formKey="labelIssueRelDTOList"
        onSubmit={(value) => { this.editIssue({ labelIssueRelDTOList: value }); }}
        originData={this.transToArr(labelIssueRelDTOList, 'labelName', 'array')}
      >
        <Text>
          {data => (
            data.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {
                  this.transToArr(data, 'labelName', 'array').map(label => (
                    <div
                      key={label}
                      style={{
                        color: '#000',
                        borderRadius: '100px',
                        fontSize: '13px',
                        lineHeight: '24px',
                        padding: '2px 12px',
                        background: 'rgba(0, 0, 0, 0.08)',
                        marginRight: '8px',
                        marginBottom: 3,
                      }}
                    >
                      {label}
                    </div>
                  ))
                }
              </div>
            ) : '无'
          )}
        </Text>
        <Edit>
          <Select
            loading={selectLoading}
            mode="tags"
            autoFocus
            getPopupContainer={triggerNode => triggerNode.parentNode}
            tokenSeparators={[',']}
            style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
            onFocus={() => {
              this.setState({
                selectLoading: true,
              });
              getLabels().then((res) => {
                this.setState({
                  labelList: res,
                  selectLoading: false,
                });
              });
            }}
          >
            {labelList.map(label => (
              <Option
                key={label.labelName}
                value={label.labelName}
              >
                {label.labelName}
              </Option>
            ))}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  /**
   *报告人更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectPerson = (type) => {
    const { issueInfo, userList, selectLoading } = this.state;
    const { reporterId, reporterName, reporterImageUrl } = issueInfo;

    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ));
    return (
      <TextEditToggle
        formKey="reporterId"
        onSubmit={(id) => { this.editIssue({ reporterId: id || 0 }); }}
        originData={userList.length > 0 ? reporterId : (
          <UserHead
            user={{
              id: reporterId,
              loginName: '',
              realName: reporterName,
              avatar: reporterImageUrl,
            }}
          />
        )}
      >
        <Text>
          {(data) => {
            if (userList.length > 0) {
              const targetUser = _.find(userList, { id: data });
              return targetUser ? (
                <User user={targetUser} />
              ) : '无';
            } else {
              return (
                <UserHead
                  user={{
                    id: reporterId,
                    loginName: '',
                    realName: reporterName,
                    avatar: reporterImageUrl,
                  }}
                />
              );
            }
          }}
        </Text>
        <Edit>
          <Select
            filter
            allowClear
            autoFocus
            filterOption={false}
            onFilterChange={(value) => {
              this.setState({
                selectLoading: true,
              });
              getUsers(value).then((res) => {
                this.setState({
                  userList: res.content,
                  selectLoading: false,
                });
              });
            }}
            loading={selectLoading}
            style={{ width: 200 }}
            onFocus={() => {
              this.setState({
                selectLoading: true,
              });
              getUsers().then((res) => {
                this.setState({
                  userList: res.content,
                  selectLoading: false,
                });
              });
            }}
          >
            {userOptions}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  /**
   *指派人更改
   *
   * @memberof EditIssueNarrow
   */
  renderSelectAssign = () => {
    const { issueInfo, userList, selectLoading } = this.state;
    const { assigneeId, assigneeName, assigneeImageUrl } = issueInfo;
    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ));
    return (
      <TextEditToggle
        formKey="assigneeId"
        onSubmit={(id) => { this.editIssue({ assigneeId: id || 0 }); }}
        originData={userList.length > 0 ? assigneeId : (
          <UserHead
            user={{
              id: assigneeId,
              loginName: '',
              realName: assigneeName,
              avatar: assigneeImageUrl,
            }}
          />
        )}
      >
        <Text>
          {(data) => {
            if (userList.length > 0) {
              const targetUser = _.find(userList, { id: data });
              return targetUser ? (
                <User user={targetUser} />
              ) : '无';
            } else {
              return (
                <UserHead
                  user={{
                    id: assigneeId,
                    loginName: '',
                    realName: assigneeName,
                    avatar: assigneeImageUrl,
                  }}
                />
              );
            }
          }}
        </Text>
        <Edit>
          <Select
            filter
            allowClear
            autoFocus
            filterOption={false}
            onFilterChange={(value) => {
              this.setState({
                selectLoading: true,
              });
              getUsers(value).then((res) => {
                this.setState({
                  userList: res.content,
                  selectLoading: false,
                });
              });
            }}
            loading={selectLoading}
            style={{ width: 200 }}
            onFocus={() => {
              this.setState({
                selectLoading: true,
              });
              getUsers().then((res) => {
                this.setState({
                  userList: res.content,
                  selectLoading: false,
                });
              });
            }}
          >
            {userOptions}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  render() {
    const {
      issueInfo, issueLoading, FullEditorShow, createLinkTaskShow,
      copyIssueShow, currentNav, testStepData, testExecuteData,
      linkIssues, fileList,
    } = this.state;
    const {
      issueId, issueNum, summary, creationDate, lastUpdateDate, description,
      priorityDTO, issueTypeDTO, statusMapDTO, versionIssueRelDTOList,
      issueAttachmentDTOList,
    } = issueInfo;
    const {
      name: statusName, id: statusId, colour: statusColor, icon: statusIcon,
    } = statusMapDTO || {};
    const { colour: priorityColor } = priorityDTO || {};
    const typeCode = issueTypeDTO ? issueTypeDTO.typeCode : '';
    const typeColor = issueTypeDTO ? issueTypeDTO.colour : '#fab614';
    const typeIcon = issueTypeDTO ? issueTypeDTO.icon : 'help';


    const fixVersionsTotal = _.filter(versionIssueRelDTOList, { relationType: 'fix' }) || [];
    const fixVersionsFixed = _.filter(fixVersionsTotal, { statusCode: 'archived' }) || [];
    const fixVersions = _.filter(fixVersionsTotal, v => v.statusCode !== 'archived') || [];
    const menu = AppState.currentMenuType;
    const {
      type, id: projectId, organizationId: orgId, name,
    } = menu;
    const { mode } = this.props;
    const getMenu = () => (
      <Menu onClick={this.handleClickMenu.bind(this)}>
        {/* <Menu.Item key="add_worklog">
          <FormattedMessage id="issue_edit_addWworkLog" />
        </Menu.Item> */}
        <Menu.Item key="copy">
          <FormattedMessage id="issue_edit_copyIssue" />
        </Menu.Item>
        <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue.deleteIssue']}>
          <Menu.Item key="1">
            <FormattedMessage id="delete" />
          </Menu.Item>
        </Permission>
      </Menu>
    );
    return (
      <div className="choerodon-modal-editIssue">
        {
          issueLoading ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.65)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          ) : null
        }
        <div className="c7ntest-nav">
          <div>
            <div style={{
              height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0,0,0,0.26)',
            }}
            >
              <TypeTag type={issueTypeDTO} />
            </div>
          </div>
          <ul className="c7ntest-nav-ul">
            {this.renderNavs()}

          </ul>
        </div>
        <div className="c7ntest-content">
          <div className="c7ntest-content-top">
            <div className="c7ntest-header-editIssue">
              <div className="c7ntest-content-editIssue" style={{ overflowY: 'hidden' }}>
                <div
                  className="line-justify"
                  style={{
                    alignItems: 'center',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    marginLeft: '-20px',
                    marginRight: '-20px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.26)',
                    height: 44,
                  }}
                >
                  {/* issueNum 用例编号 */}
                  <div style={{ fontSize: 16, lineHeight: '28px', fontWeight: 500 }}>
                    <span>{issueNum}</span>
                  </div>
                  <div
                    style={{
                      cursor: 'pointer', fontSize: '13px', lineHeight: '20px', display: 'flex', alignItems: 'center',
                    }}
                    role="none"
                    onClick={() => this.props.onCancel()}
                  >
                    <Icon type="last_page" style={{ fontSize: '18px', fontWeight: '500' }} />
                    <FormattedMessage id="issue_edit_hide" />
                  </div>
                </div>
                <div className="line-justify" style={{ marginBottom: 5, alignItems: 'center', marginTop: 10 }}>

                  <TextEditToggle
                    style={{ width: '100%' }}
                    formKey="summary"
                    onSubmit={(value) => { this.editIssue({ summary: value }); }}
                    originData={summary}
                  >
                    <Text>
                      {data => (
                        <div className="c7ntest-summary">
                          {data}
                        </div>
                      )}
                    </Text>
                    <Edit>
                      <TextArea maxLength={44} size="small" autoFocus />
                    </Edit>
                  </TextEditToggle>
                  <div style={{ flexShrink: 0, color: 'rgba(0, 0, 0, 0.65)' }}>
                    <Dropdown overlay={getMenu()} trigger={['click']}>
                      <Button icon="more_vert" />
                    </Dropdown>
                  </div>
                </div>
                {/* 状态 */}
                {mode === 'wide' && (
                  <div className="line-start" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', flex: 1 }}>
                      <span
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          background: statusColor,
                          marginRight: 12,
                          flexShrink: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Icon
                          type={statusIcon}
                          style={{
                            fontSize: '24px',
                            color: statusColor || '#ffae02',
                          }}
                        />
                      </span>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                          <FormattedMessage id="issue_issueFilterByStatus" />
                        </div>
                        <div>
                          {this.renderSelectStatus()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flex: 1 }}>
                      <span
                        style={{
                          width: 30, height: 30, borderRadius: '50%', background: priorityColor ? color2rgba(priorityColor, 0.18) : 'rgba(77, 144, 254, 0.2)', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        }}
                      >
                        <Icon type="flag" style={{ fontSize: '24px', color: priorityColor || '#3575df' }} />
                      </span>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                          <FormattedMessage id="issue_issueFilterByPriority" />
                        </div>
                        <div>
                          {/* 优先级 */}
                          {this.renderSelectPriority()}
                        </div>
                      </div>
                    </div>
                    {/* 版本 */}
                    <div style={{ display: 'flex', flex: 1 }}>
                      <span
                        style={{
                          width: 30, height: 30, borderRadius: '50%', background: '#d8d8d8', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        }}
                      >
                        <Icon type="versionline" style={{ fontSize: '24px', color: 'black' }} />
                      </span>
                      <div>
                        <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.54)', marginBottom: 4 }}>
                          <FormattedMessage id="version" />
                        </div>
                        <div>
                          <div>
                            {
                              !fixVersionsFixed.length && !fixVersions.length ? '无' : (
                                <div>
                                  <div style={{ color: '#000' }}>
                                    {_.map(fixVersionsFixed, 'name').join(' , ')}
                                  </div>
                                  <p style={{ wordBreak: 'break-word', marginBottom: 0 }}>
                                    {_.map(fixVersions, 'name').join(' , ')}
                                  </p>
                                </div>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
                }
              </div>
            </div>
          </div>
          <div className="c7ntest-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
            <section className="c7ntest-body-editIssue">
              <div className="c7ntest-content-editIssue">
                <div className="c7ntest-details">
                  <div id="detail">
                    <div className="c7ntest-title-wrapper" style={{ marginTop: 0 }}>
                      <div className="c7ntest-title-left">
                        <Icon type="error_outline c7ntest-icon-title" />
                        <FormattedMessage id="detail" />
                      </div>
                      <div style={{
                        flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                      }}
                      />
                    </div>
                    <div className="c7ntest-content-wrapper" style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {/* 状态 */}
                      <div style={{ flex: 1 }}>
                        {mode === 'narrow'
                          && (
                            <div>
                              <div className="line-start mt-10 ht-20">
                                <div className="c7ntest-property-wrapper">
                                  <span className="c7ntest-property">
                                    {'状态：'}
                                  </span>
                                </div>
                                <div className="c7ntest-value-wrapper">
                                  {this.renderSelectStatus()}
                                </div>
                              </div>
                              {/* 优先级 */}
                              <div className="line-start mt-10 ht-20">
                                <div className="c7ntest-property-wrapper">
                                  <span className="c7ntest-property">优先级：</span>
                                </div>
                                <div className="c7ntest-value-wrapper">
                                  {this.renderSelectPriority()}
                                </div>
                              </div>
                            </div>
                          )
                        }
                        {/* 模块 */}
                        {
                          typeCode !== 'sub_task' ? (
                            <div className="line-start mt-10 ht-20">
                              <div className="c7ntest-property-wrapper">
                                <span className="c7ntest-property">
                                  <FormattedMessage id="summary_component" />
                                  {'：'}
                                </span>
                              </div>
                              <div className="c7ntest-value-wrapper">
                                {this.renderSelectModule()}
                              </div>
                            </div>
                          ) : null
                        }
                        {/* 标签 */}
                        <div className="line-start mt-10 ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="summary_label" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper">
                            {this.renderSelectLabel()}
                          </div>
                        </div>
                        {/* 版本 */}
                        {mode === 'narrow' && (
                          <div className="line-start mt-10 ht-20">
                            <div className="c7ntest-property-wrapper">
                              <span className="c7ntest-property">
                                <FormattedMessage id="issue_create_content_version" />
                                {'：'}
                              </span>
                            </div>
                            <div className="c7ntest-value-wrapper">
                              <div>
                                {
                                  !fixVersionsFixed.length && !fixVersions.length ? '无' : (
                                    <div>
                                      <div style={{ color: '#000' }}>
                                        {_.map(fixVersionsFixed, 'name').join(' , ')}
                                      </div>
                                      <p style={{ wordBreak: 'break-word', marginBottom: 0 }}>
                                        {_.map(fixVersions, 'name').join(' , ')}
                                      </p>
                                    </div>
                                  )
                                }
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="line-start mt-10">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-subtitle">
                              <FormattedMessage id="issue_edit_person" />
                            </span>
                          </div>
                        </div>
                        {/* 报告人 */}
                        <div className="line-start mt-10 assignee ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="issue_edit_reporter" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            {this.renderSelectPerson()}
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',  
                                marginTop: '-2px',
                                display: 'inline-block',           
                              }}
                              onClick={() => {
                                this.editIssue({ reporterId: AppState.userInfo.id });
                              }}
                            >
                              <FormattedMessage id="issue_edit_assignToMe" />
                            </span>
                          </div>
                        </div>
                        <div className="line-start mt-10 assignee ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="issue_edit_manager" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            {this.renderSelectAssign()}
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',
                                marginTop: '-2px',
                                display: 'inline-block',                         
                              }}
                              onClick={() => {
                                this.editIssue({ assigneeId: AppState.userInfo.id });
                              }}
                            >
                              <FormattedMessage id="issue_edit_assignToMe" />
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* --- */}
                      <div style={{ flex: 1, marginTop: mode === 'wide' && 62 }}>
                        {/* 日期 */}
                        <div className="line-start mt-10">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-subtitle">
                              <FormattedMessage id="issue_edit_date" />
                            </span>
                          </div>
                        </div>

                        <div className="line-start mt-10 ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="issue_edit_createDate" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper">
                            {formatDate(creationDate)}
                          </div>
                        </div>
                        <div className="line-start mt-10 ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="issue_edit_updateDate" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper">
                            {formatDate(lastUpdateDate)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="des">
                    <div className="c7ntest-title-wrapper">
                      <div className="c7ntest-title-left">
                        <Icon type="subject c7ntest-icon-title" />
                        <span><FormattedMessage id="execute_description" /></span>
                      </div>
                      <div style={{
                        flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                      }}
                      />
                      <div className="c7ntest-title-right" style={{ marginLeft: '14px', position: 'relative' }}>
                        <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ FullEditorShow: true })}>
                          <Icon type="zoom_out_map icon" style={{ marginRight: 2 }} />
                          <span><FormattedMessage id="execute_edit_fullScreen" /></span>
                        </Button>
                        <Icon
                          className="c7ntest-des-edit"
                          style={{ position: 'absolute', top: 8, right: -20 }}
                          role="none"
                          type="mode_edit mlr-3 pointer"
                          onClick={() => {
                            this.setState({
                              editDescriptionShow: true,
                            });
                          }}
                        />
                      </div>
                    </div>
                    {this.renderDescription()}
                  </div>

                </div>
                {/* 测试步骤 */}
                <div id="test1">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="compass c7ntest-icon-title" />
                      <FormattedMessage id="issue_edit_testDetail" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                    <div className="c7ntest-title-right" style={{ marginLeft: '14px', position: 'relative' }}>
                      <Button className="leftBtn" funcTyp="flat" onClick={this.createIssueStep}>
                        <Icon type="playlist_add icon" style={{ marginRight: 2 }} />
                        <FormattedMessage id="issue_edit_addTestDetail" />
                      </Button>
                    </div>
                  </div>
                  <div className="c7ntest-content-wrapper" style={{ paddingLeft: 0 }}>
                    <TestStepTable
                      mode={mode}
                      issueId={issueId}
                      data={testStepData}
                      enterLoad={() => {
                        this.setState({
                          issueLoading: true,
                        });
                      }}
                      leaveLoad={() => {
                        this.setState({
                          issueLoading: false,
                        });
                      }}
                      onOk={() => {
                        this.reloadIssue();
                      }}
                    />
                  </div>
                </div>
                {/* 测试执行 */}
                <div id="test2">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="explicit2 c7ntest-icon-title" />
                      <FormattedMessage id="execute_cycle_execute" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                  </div>
                  <div className="c7ntest-content-wrapper" style={{ paddingLeft: 0 }}>
                    <TestExecuteTable
                      mode={mode}
                      issueId={issueId}
                      data={testExecuteData}
                      enterLoad={() => {
                        this.setState({
                          issueLoading: true,
                        });
                      }}
                      leaveLoad={() => {
                        this.setState({
                          issueLoading: false,
                        });
                      }}
                      onOk={() => {
                        this.reloadIssue();
                      }}
                    />
                  </div>
                </div>

                {/* 附件 */}
                <div id="attachment">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="attach_file c7ntest-icon-title" />
                      <FormattedMessage id="attachment" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px', marginRight: '114.67px',
                    }}
                    />
                  </div>
                  <div className="c7ntest-content-wrapper" style={{ marginTop: '-47px' }}>
                    <UploadButtonNow
                      onRemove={this.setFileList}
                      onBeforeUpload={this.setFileList}
                      updateNow={this.onChangeFileList}
                      fileList={fileList}
                    />
                  </div>
                </div>
                {/* 评论 */}
                <div id="commit">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="sms_outline c7ntest-icon-title" />
                      <FormattedMessage id="issue_edit_comment" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                    <div className="c7ntest-title-right" style={{ marginLeft: '14px' }}>
                      <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ addingComment: true })}>
                        <Icon type="playlist_add icon" />
                        <FormattedMessage id="issue_edit_addComment" />
                      </Button>
                    </div>
                  </div>
                  {this.renderCommits()}
                </div>
                {/* 修改日志 */}
                <div id="data_log">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="insert_invitation c7ntest-icon-title" />
                      <FormattedMessage id="issue_edit_activeLog" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                  </div>
                  {this.renderDataLogs()}
                </div>

                {/* 关联用例 */}
                <div id="link_task">
                  <div className="c7ntest-title-wrapper">
                    <div className="c7ntest-title-left">
                      <Icon type="link c7ntest-icon-title" />
                      <FormattedMessage id="issue_edit_linkIssue" />
                    </div>
                    <div style={{
                      flex: 1, height: 1, borderTop: '1px solid rgba(0, 0, 0, 0.08)', marginLeft: '14px',
                    }}
                    />
                    <div className="c7ntest-title-right" style={{ marginLeft: '14px' }}>
                      <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ createLinkTaskShow: true })}>
                        <Icon type="playlist_add icon" />
                        <FormattedMessage id="issue_edit_addLinkIssue" />
                      </Button>
                    </div>
                  </div>
                  {this.renderLinkIssues()}
                </div>

              </div>
            </section>
          </div>
        </div>
        {
          <FullEditor
            initValue={description}
            visible={FullEditorShow}
            onCancel={() => this.setState({ FullEditorShow: false })}
            onOk={(value) => {
              this.setState({
                FullEditorShow: false,
              });
              this.editIssue({ description: value });
            }}
          />
        }
        {
          createLinkTaskShow ? (
            <CreateLinkTask
              issueId={issueId}
              visible={createLinkTaskShow}
              onCancel={() => this.setState({ createLinkTaskShow: false })}
              onOk={this.handleCreateLinkIssue.bind(this)}
            />
          ) : null
        }
        {
          copyIssueShow ? (
            <CopyIssue
              issueId={issueId}
              issueNum={issueNum}
              issue={issueInfo}
              issueLink={linkIssues}
              issueSummary={summary}
              visible={copyIssueShow}
              onCancel={() => this.setState({ copyIssueShow: false })}
              onOk={this.handleCopyIssue.bind(this)}
            />
          ) : null
        }
      </div>
    );
  }
}
export default EditIssueNarrow;
