import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
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
  delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload, color2rgba, testCaseTableLink, commonLink,
} from '../../../common/utils';
import Timeago from '../../CommonComponent/DateTimeAgo/DateTimeAgo';
import {
  loadDatalogs, loadLinkIssues, loadIssue, updateStatus, updateIssue,
  createCommit, deleteIssue, loadStatus, cloneIssue, getIssueSteps, getIssueExecutes,
} from '../../../api/IssueManageApi';
import { getLabels, getPrioritys, getModules } from '../../../api/agileApi';
import { getUsers, getUpdateProjectInfoPermission } from '../../../api/IamApi';
import { FullEditor, WYSIWYGEditor } from '../../CommonComponent';
import CreateLinkTask from '../CreateLinkTask';
import UserHead from '../UserHead';
import Comment from './Component/Comment';
import DataLogs from './Component/DataLogs';
import LinkList from './Component/LinkList';
import PriorityTag from '../PriorityTag';
import StatusTag from '../StatusTag';
import CopyIssue from '../CopyIssue';
import TypeTag from '../TypeTag';
import IssueTreeStore from '../../../store/project/IssueManage/IssueTreeStore';

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
  // { code: 'test_step', tooltip: '测试详细信息', icon: 'compass' },
  // { code: 'test_execute', tooltip: '测试执行', icon: 'explicit2' },
  { code: 'attachment', tooltip: '附件', icon: 'attach_file' },
  { code: 'commit', tooltip: '评论', icon: 'sms_outline' },
  { code: 'data_log', tooltip: '活动日志', icon: 'insert_invitation' },
  { code: 'link_task', tooltip: '问题链接', icon: 'link' },
];
const STATUS_ICON = {
  done: {
    icon: 'check_circle',
    color: '#1bb06e',
    bgColor: '',
  },
  todo: {
    icon: 'watch_later',
    color: '#4a93fc',
    bgColor: '',
  },
  doing: {
    icon: 'timelapse',
    color: '#ffae02',
    bgColor: '',
  },
};
const ICON_COLOR = {
  todo: 'rgba(255, 177, 0, 0.2)',
  doing: 'rgba(77,144,254,0.2)',
  done: 'rgba(0,191,165,0.2)',
};
const STATUS = {
  todo: '#ffb100',
  doing: '#4d90fe',
  done: '#00bfa5',
};
let hasDeletePermission = true;
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
    linkIssues: [],
    StatusList: [],
    priorityList: [],
    componentList: [],
    labelList: [],
    userList: [],
  }


  componentDidMount() {
    const {loading} = this.props;
    if (this.props.onRef) {
      this.props.onRef(this);
    }
   
    getUpdateProjectInfoPermission().then(res => {
      hasDeletePermission = res[0].approve;
    });

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

  /**
   * Attachment
   */
  onChangeFileList = (arr) => {
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        // issueType: this.state.typeCode,
        issueId: this.props.issueInfo.issueId,
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
    this.props.reloadIssue();
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
  editIssue = (newValue, done) => {
    const key = Object.keys(newValue)[0];
    const value = newValue[key];
    const {
      StatusList, componentList, labelList,
    } = this.state;
    const { issueInfo } = this.props;
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
              this.props.reloadIssue();
              if (this.props.onUpdate) {
                this.props.onUpdate();
              }
            }).catch(() => {
              done();
            });
        }
        break;
      }
      case 'componentIssueRelDTOList': {
        issue.componentIssueRelDTOList = this.prepareMutilSelectValueBeforeSubmit(value, componentList, 'name');
        updateIssue(issue)
          .then((res) => {
            this.props.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          }).catch(() => {
            done();
          });
        break;
      }
      case 'labelIssueRelDTOList': {
        issue.labelIssueRelDTOList = this.prepareMutilSelectValueBeforeSubmit(value, labelList, 'labelName');
        updateIssue(issue)
          .then((res) => {
            this.props.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          }).catch(() => {
            done();
          });
        break;
      }
      case 'description': {
        if (value) {
          returnBeforeTextUpload(value, issue, updateIssue, 'description')
            .then((res) => {
              this.props.reloadIssue();
            }).catch(() => {
              done();
            });
        }
        break;
      }
      default: {
        if (key === 'summary' && value === '') {
          Choerodon.prompt('用例名不可为空！');
          done();
          break;
        }
        issue = { ...issue, ...newValue };
        updateIssue(issue)
          .then((res) => {
            this.props.reloadIssue();
            if (this.props.onUpdate) {
              this.props.onUpdate();
            }
          }).catch(() => {
            done();
          });
        break;
      }
    }
  }

  /**
   * Comment
   */
  handleCreateCommit(newComment) {
    const { issueInfo } = this.props;
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
      this.props.reloadIssue();
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
    this.props.reloadIssue();
    this.setState({
      createLinkTaskShow: false,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  handleCopyIssue() {
    this.props.reloadIssue();
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
    const { issueInfo } = this.props;
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
          Choerodon.prompt('复制成功');
          this.handleCopyIssue();
          this.setState({
            issueLoading: false,
          });
        }).catch((err) => {
          this.setState({
            issueLoading: false,
          });
          Choerodon.prompt('网络错误');
        });
        // this.setState({ copyIssueShow: true });
        break;
      }
      case 'delete': {
        this.handleDeleteIssue(issueId);
        break;
      }
      default: break;
    }
  }

  handleLinkToTestCase = () => {
    const { history } = this.props;
    history.push(testCaseTableLink());
  }

  handleDeleteIssue = (issueId) => {
    const { issueInfo, history } = this.props;
    const { issueNum } = issueInfo;
    const that = this;

    confirm({
      width: 560,
      title: `删除测试用例${issueNum}`,
      content: '这个测试用例将会被彻底删除。包括所有步骤和相关执行',
      onOk: () => deleteIssue(issueId)
        .then((res) => {      
          history.push(commonLink('/IssueManage'));
          this.handleLinkToTestCase();
        }),
      okText: '删除',
      okType: 'danger',
    });
  }

  /**
   * Comment
   */
  renderCommits() {
    const { addingComment } = this.state;
    const { issueCommentDTOList } = this.props.issueInfo;
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
              onDeleteComment={() => this.props.reloadIssue()}
              onUpdateComment={() => this.props.reloadIssue()}
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
    const { datalogs, issueInfo } = this.props;
    const {
      createdBy,
      createrImageUrl, createrEmail,
      createrName, creationDate, issueTypeDTO, 
    } = issueInfo;
    const createLog = {
      email: createrEmail,
      field: issueTypeDTO.typeCode,
      imageUrl: createrImageUrl,     
      name: createrName,
      lastUpdateDate: creationDate,
      lastUpdatedBy: createdBy, 
      newString: 'issueNum',
      newValue: 'issueNum',
    };
    
    return (
      <DataLogs
        datalogs={[...datalogs, createLog]}
      />
    );
  }

  renderLinkIssues() {
    const { linkIssues } = this.props;
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
    const { issueInfo } = this.props;
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
        //   // this.props.reloadIssue(issueId === this.state.issueId ? linkedIssueId : issueId);
        // }}
        onRefresh={() => {
          this.props.reloadIssue(issueId);
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
    const { editDescriptionShow } = this.state;
    const { issueInfo } = this.props;
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
    const { issueInfo } = this.props;
    const { issueTypeDTO, issueId } = issueInfo;

    const typeId = issueTypeDTO.id;
    loadStatus(statusId, issueId, typeId).then((res) => {
      this.setState({
        StatusList: res,
        selectLoading: false,
      });
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
    const {
      StatusList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
    const { mode } = this.props;
    const { statusMapDTO } = issueInfo;
    const {
      name: statusName, id: statusId, colour: statusColor, icon: statusIcon, type: statusCode,
    } = statusMapDTO || {};
    const Tag = StatusTag;
    return (
      <TextEditToggle
        style={{ width: '100%' }}
        // disabled={disabled}
        formKey="statusId"
        onSubmit={(value, done) => { this.editIssue({ statusId: value }, done); }}
        originData={StatusList.length ? statusId : (
          <Tag
            status={statusMapDTO}
          />
        )}
      >
        <Text>
          {(data) => {
            const targetStatus = _.find(StatusList, { endStatusId: data });
            return (
              <div>
                {<Tag status={targetStatus ? targetStatus.statusDTO : statusMapDTO} />
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
                  <Tag
                    status={transform.statusDTO}
                  />
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
    const {
      priorityList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
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
        // disabled={disabled}
        style={{ width: '100%' }}
        formKey="priorityId"
        onSubmit={(value, done) => { this.editIssue({ priorityId: value }, done); }}
        originData={priorityList.length
          ? priorityId : <PriorityTag priority={priorityDTO || {}} />}
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
    const {
      componentList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
    const { componentIssueRelDTOList } = issueInfo;
    return (
      <TextEditToggle
        // disabled={disabled}
        style={{ width: '100%' }}
        formKey="componentIssueRelDTOList"
        onSubmit={(value, done) => { this.editIssue({ componentIssueRelDTOList: value }, done); }}
        originData={this.transToArr(componentIssueRelDTOList, 'name', 'array')}
      >
        <Text>
          {data => (
            <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
              {this.transToArr(data, 'name')}
            </p>
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
    const {
      labelList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
    const { labelIssueRelDTOList } = issueInfo;
    return (
      <TextEditToggle
        // disabled={disabled}
        style={{ width: '100%' }}
        formKey="labelIssueRelDTOList"
        onSubmit={(value, done) => { this.editIssue({ labelIssueRelDTOList: value }, done); }}
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
                      className="c7ntest-text-dot"
                      style={{
                        color: '#000',
                        borderRadius: '100px',
                        fontSize: '13px',
                        lineHeight: '24px',
                        padding: '2px 12px',
                        maxWidth: 100,
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
    const {
      userList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
    const { reporterId, reporterName, reporterImageUrl } = issueInfo;

    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ));
    const targetUser = _.find(userList, { id: reporterId });
    let showUser = reporterId || '无';
    // 当存在用户且列表没找到
    if (reporterId && !targetUser) {
      showUser = (
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
    return (
      <TextEditToggle
        // disabled={disabled}
        formKey="reporterId"
        onSubmit={(id, done) => { this.editIssue({ reporterId: id || 0 }, done); }}
        originData={showUser}
      >
        <Text>
          {(data) => {
            if (data) {
              const tempShowUser = _.find(userList, { id: data });
              return tempShowUser ? (
                <User user={tempShowUser} />
              ) : data;
            } else {
              return '无';
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
    const {
      userList, selectLoading, disabled,
    } = this.state;
    const { issueInfo } = this.props;
    const { assigneeId, assigneeName, assigneeImageUrl } = issueInfo;
    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ));
    const targetUser = _.find(userList, { id: assigneeId });
    let showUser = assigneeId || '无';
    // 当存在用户且列表没找到
    if (assigneeId && !targetUser) {
      showUser = (
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
    return (
      <TextEditToggle
        // disabled={disabled}
        formKey="assigneeId"
        onSubmit={(id, done) => { this.editIssue({ assigneeId: id || 0 }, done); }}
        originData={showUser}
      >
        <Text>
          {(data) => {
            if (data) {
              const tempShowUser = _.find(userList, { id: data });
              return tempShowUser ? (
                <User user={tempShowUser} />
              ) : data;
            } else {
              return '无';
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
          >
            {userOptions}
          </Select>
        </Edit>
      </TextEditToggle>
    );
  }

  render() {
    const {
      issueLoading, FullEditorShow, createLinkTaskShow,
      copyIssueShow, currentNav,
    } = this.state;
    const {
      loading, issueId, issueInfo, fileList, disabled, linkIssues, folderName,  
    } = this.props;
    const {
      issueNum, summary, creationDate, lastUpdateDate, description,
      priorityDTO, issueTypeDTO, statusMapDTO, versionIssueRelDTOList,
      issueAttachmentDTOList,
    } = issueInfo || {};
    const {
      name: statusName, id: statusId, colour: statusColor, icon: statusIcon,
      type: statusCode,
    } = statusMapDTO || {};
    const { colour: priorityColor } = priorityDTO || {};
    const typeCode = issueTypeDTO ? issueTypeDTO.typeCode : '';
    const typeColor = issueTypeDTO ? issueTypeDTO.colour : '#fab614';
    const typeIcon = issueTypeDTO ? issueTypeDTO.icon : 'help';

    // const currentCycle = IssueTreeStore.currentCycle;
    // const { cycleId } = currentCycle;


    const fixVersionsTotal = _.filter(versionIssueRelDTOList, { relationType: 'fix' }) || [];
    const fixVersionsFixed = _.filter(fixVersionsTotal, { statusCode: 'archived' }) || [];
    const fixVersions = _.filter(fixVersionsTotal, v => v.statusCode !== 'archived') || [];
    const menu = AppState.currentMenuType;
    const loginUserId = AppState.userInfo.id;
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
        {
          <Menu.Item
            key="delete"
            disabled={loginUserId !== issueInfo.createdBy && !hasDeletePermission}
          >
            {'删除'}
          </Menu.Item>
        }
      </Menu>
    );
    return (
      <div className="c7ntest-editIssue">
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
                      onClick={() => this.props.onClose()}
                    >
                      <Icon type="last_page" style={{ fontSize: '18px', fontWeight: '500' }} />
                      <FormattedMessage id="issue_edit_hide" />
                    </div>
                  </div>
                  <div className="line-justify" style={{ marginBottom: 5, alignItems: 'center', marginTop: 10 }}>
  
                    <TextEditToggle
                      disabled={disabled}
                      style={{ width: '100%' }}
                      formKey="summary"
                      onSubmit={(value, done) => { this.editIssue({ summary: value }, done); }}
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
                      {!disabled && (
                        <Dropdown overlay={getMenu()} trigger={['click']}>
                          <Button icon="more_vert" />
                        </Dropdown>
                      )}
                    </div>
                  </div>
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
                      <div className="c7ntest-content-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* 状态 */}
                        <div style={{ flex: 1 }}>
                        
                          <div>
                            <div className="line-start mt-10">
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
                            <div className="line-start mt-10">
                              <div className="c7ntest-property-wrapper">
                                <span className="c7ntest-property">优先级：</span>
                              </div>
                              <div className="c7ntest-value-wrapper">
                                {this.renderSelectPriority()}
                              </div>
                            </div>
  
                            {/* 版本名称 */}
                            <div className="line-start mt-10">
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
  
                            {/* 文件夹名称 */}
                            <div className="line-start mt-10">
                              <div className="c7ntest-property-wrapper">
                                <span className="c7ntest-property">
                                  <FormattedMessage id="issue_create_content_folder" />
                                  {'：'}
                                </span>
                              </div>
                              <div className="c7ntest-value-wrapper">
                                {folderName}
                              </div>
                            </div>
  
                          
                          </div>
                          {/* 模块 */}
                          {
                            typeCode !== 'sub_task' ? (
                              <div className="line-start mt-10">
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
                          <div className="line-start mt-10">
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
                         
                          {/* 报告人 */}
                          <div className="line-start mt-10 assignee">
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
                          <div className="line-start mt-10 assignee">
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
                        <div style={{ flex: 1 }}>
                          {/* 日期 */}
                          <div className="line-start mt-10">
                            <div className="c7ntest-property-wrapper">
                              <span className="c7ntest-subtitle">
                                <FormattedMessage id="issue_edit_date" />
                              </span>
                            </div>
                          </div>
  
                          <div className="line-start mt-10">
                            <div className="c7ntest-property-wrapper">
                              <span className="c7ntest-property">
                                <FormattedMessage id="issue_edit_createDate" />
                                {'：'}
                              </span>
                            </div>
                            <div className="c7ntest-value-wrapper">
                              {/* {formatDate(creationDate)} */}
                              <Timeago date={creationDate} />
                            </div>
                          </div>
                          <div className="line-start mt-10">
                            <div className="c7ntest-property-wrapper">
                              <span className="c7ntest-property">
                                <FormattedMessage id="issue_edit_updateDate" />
                                {'：'}
                              </span>
                            </div>
                            <div className="c7ntest-value-wrapper">
                              {/* {formatDate(lastUpdateDate)} */}
                              <Timeago date={lastUpdateDate} />
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
                        <div style={{ marginLeft: '14px', position: 'relative' }}>
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
                      <div style={{ marginLeft: '14px' }}>
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
                      <div style={{ marginLeft: '14px' }}>
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
export default withRouter(EditIssueNarrow);
