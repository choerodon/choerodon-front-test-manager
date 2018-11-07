import React, { Component } from 'react';
import { stores, Permission } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Select, Input, Button, Modal, Tooltip, Dropdown, Menu, Spin, Icon,
} from 'choerodon-ui';
import './EditIssue.scss';
import '../../../assets/main.scss';
import {
  UploadButtonNow, ReadAndEdit, IssueDescription,
} from '../CommonComponent';
import {
  delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload,
} from '../../../common/utils';
import {
  loadDatalogs, loadLinkIssues, loadIssue, updateStatus, updateIssue, createIssueStep,
  createCommit, deleteIssue, loadStatus, cloneIssue, getIssueSteps, getIssueExecutes,
} from '../../../api/IssueManageApi';
import { getLabels, getPrioritys, getModules } from '../../../api/agileApi';
import { getSelf, getUsers, getUser } from '../../../api/IamApi';
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

class EditIssueNarrow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issueLoading: false,
      flag: undefined,
      selectLoading: true,
      edit: false,
      addCommit: false,
      addCommitDes: '',
      createLinkTaskShow: false,

      editDesShow: false,
      origin: {},
      nav: 'detail',
      editDes: undefined,
      currentRae: undefined,
      issueId: undefined,
      assigneeId: undefined,
      assigneeName: '',
      assigneeImageUrl: undefined,
      epicId: undefined,
      estimateTime: undefined,
      remainingTime: undefined,
      epicName: '',
      issueNum: undefined,
      issueTypeDTO: {},
      parentIssueId: undefined,

      reporterId: undefined,
      reporterImageUrl: undefined,
      sprintId: undefined,
      sprintName: '',
      statusId: undefined,
      statusCode: undefined,
      storyPoints: undefined,
      creationDate: undefined,
      lastUpdateDate: undefined,
      statusName: '',
      priorityDTO: null,
      reporterName: '',
      summary: '',
      description: '',
      versionIssueRelDTOList: [],
      componentIssueRelDTOList: [],
      activeSprint: {},
      closeSprint: [],
      datalogs: [],
      fileList: [],
      testStepData: [],
      testExecute: [],
      branchs: {},
      issueCommentDTOList: [],
      issueLinkDTOList: [],
      labelIssueRelDTOList: [],
      subIssueDTOList: [],
      linkIssues: [],
      fixVersions: [],
      influenceVersions: [],
      fixVersionsFixed: [],
      influenceVersionsFixed: [],

      originStatus: [],
      originpriorities: [],
      originComponents: [],

      originLabels: [],
      originUsers: [],


    };
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.reloadIssue(this.props.issueId);
    document.getElementById('scroll-area').addEventListener('scroll', (e) => {
      if (sign) {
        const currentNav = this.getCurrentNav(e);
        if (this.state.nav !== currentNav && currentNav) {
          this.setState({
            nav: currentNav,
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.issueId !== this.props.issueId) {
      this.setState({
        currentRae: undefined,
      });
      this.reloadIssue(nextProps.issueId);
    }
  }

  /**
   * Attachment
   */
  onChangeFileList = (arr) => {
    if (arr.length > 0 && arr.some(one => !one.url)) {
      const config = {
        issueType: this.state.origin.typeCode,
        issueId: this.state.origin.issueId,
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

  setAnIssueToState = (issue = this.state.origin) => {
    const {
      activeSprint,
      assigneeId,
      assigneeName,
      assigneeImageUrl,
      closeSprint,
      componentIssueRelDTOList,
      creationDate,
      description,
      epicId,
      epicName,
      epicColor,
      estimateTime,
      issueCommentDTOList,
      issueId,
      issueLinkDTOList,
      issueNum,
      labelIssueRelDTOList,
      lastUpdateDate,
      objectVersionNumber,
      parentIssueId,
      parentIssueNum,
      priorityDTO,
      projectId,
      remainingTime,
      reporterId,
      reporterName,
      reporterImageUrl,
      sprintId,
      sprintName,
      statusMapDTO,
      storyPoints,
      summary,
      issueTypeDTO,
      versionIssueRelDTOList,
      subIssueDTOList,
    } = issue;
    const fileList = _.map(issue.issueAttachmentDTOList, issueAttachment => ({
      uid: issueAttachment.attachmentId,
      name: issueAttachment.fileName,
      url: issueAttachment.url,
    }));
    const fixVersionsTotal = _.filter(versionIssueRelDTOList, { relationType: 'fix' }) || [];
    const fixVersionsFixed = _.filter(fixVersionsTotal, { statusCode: 'archived' }) || [];
    const fixVersions = _.filter(fixVersionsTotal, v => v.statusCode !== 'archived') || [];
    const influenceVersionsTotal = _.filter(versionIssueRelDTOList, { relationType: 'influence' }) || [];
    const influenceVersionsFixed = _.filter(influenceVersionsTotal, { statusCode: 'archived' }) || [];
    const influenceVersions = _.filter(influenceVersionsTotal, v => v.statusCode !== 'archived') || [];
    this.setState({
      origin: issue,
      activeSprint: activeSprint || {},
      assigneeId,
      assigneeName,
      assigneeImageUrl,
      closeSprint,
      componentIssueRelDTOList,
      creationDate,
      editDes: description,
      description,
      epicId,
      epicName,
      epicColor,
      estimateTime,
      fileList,
      issueCommentDTOList,
      issueId,
      issueLinkDTOList,
      issueNum,
      labelIssueRelDTOList,
      lastUpdateDate,
      objectVersionNumber,
      parentIssueId,
      parentIssueNum,
      priorityDTO,
      priorityId: priorityDTO.id,
      priorityName: priorityDTO.name,
      priorityColor: priorityDTO.colour,
      projectId,
      remainingTime,
      reporterId,
      reporterName,
      reporterImageUrl,
      sprintId,
      sprintName,
      statusMapDTO,
      summary,
      issueTypeDTO,
      versionIssueRelDTOList,
      subIssueDTOList,
      fixVersions,
      influenceVersions,
      fixVersionsFixed,
      influenceVersionsFixed,
      issueLoading: false,
    });
  }

  getCurrentNav(e) {
    const eles = ['detail', 'des', 'test1', 'test2', 'attachment', 'commit', 'data_log', 'link_task'];
    return _.find(eles, i => this.isInLook(document.getElementById(i)));
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
          originUsers: res.content,
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
        originUsers: res.content,
        selectLoading: false,
      });
    });
  }, 500);

  handleTitleChange = (e) => {
    this.setState({ summary: e.target.value });
  }

  handleEpicNameChange = (e) => {
    this.setState({ epicName: e.target.value });
  }

  handleStoryPointsChange = (e) => {
    this.setState({ storyPoints: e });
  }

  handleRemainingTimeChange = (e) => {
    this.setState({ remainingTime: e });
  }

  resetStoryPoints(value) {
    this.setState({ storyPoints: value });
  }

  resetRemainingTime(value) {
    this.setState({ remainingTime: value });
  }

  resetAssigneeId(value) {
    this.setState({ assigneeId: value });
  }

  resetReporterId(value) {
    this.setState({ reporterId: value });
  }

  resetSummary(value) {
    this.setState({ summary: value });
  }

  resetEpicName(value) {
    this.setState({ epicName: value });
  }

  resetPriorityId(value) {
    this.setState({ priorityId: value });
  }

  resetStatusId(value) {
    this.setState({ statusId: value });
  }

  resetEpicId(value) {
    this.setState({ epicId: value });
  }

  resetSprintId(value) {
    this.setState({ sprintId: value });
  }

  resetComponentIssueRelDTOList(value) {
    this.setState({ componentIssueRelDTOList: value });
  }

  resetInfluenceVersions(value) {
    this.setState({ influenceVersions: value });
  }

  resetFixVersions(value) {
    this.setState({ fixVersions: value });
  }

  resetlabelIssueRelDTOList(value) {
    this.setState({ labelIssueRelDTOList: value });
  }


  reloadIssue(issueId = this.state.origin.issueId) {
    this.setState({
      addCommit: false,
      addCommitDes: '',
      editDesShow: undefined,
      editDes: undefined,


      issueLoading: true,
    }, () => {
      loadIssue(issueId).then((res) => {
        this.setAnIssueToState(res);
      });
      loadLinkIssues(issueId).then((res) => {
        this.setState({
          linkIssues: res,
        });
      });
      loadDatalogs(issueId).then((res) => {
        this.setState({
          datalogs: res,
        });
      });
      getIssueSteps(issueId).then((res) => {
        this.setState({ testStepData: res }, () => {
          this.setState({ testStepData: res });
        });
      });
      getIssueExecutes(issueId).then((res) => {
        this.setState({ testExecuteData: res }, () => {
          this.setState({ testExecuteData: res });
        });
      });
      this.setState({
        editDesShow: false,
      });
    });
  }

  refresh = () => {
    loadIssue(this.state.origin.issueId).then((res) => {
      this.setAnIssueToState(res);
    });
  }

  updateIssue = (pro) => {
    const {
      origin,
      issueId,
      transformId,
    } = this.state;
    const obj = {
      issueId,
      objectVersionNumber: origin.objectVersionNumber,
    };
    if ((pro === 'description') || (pro === 'editDes')) {
      if (this.state[pro]) {
        returnBeforeTextUpload(this.state[pro], obj, updateIssue, 'description')
          .then((res) => {
            this.reloadIssue(this.state.origin.issueId);
          });
      }
    } else if (pro === 'assigneeId' || pro === 'reporterId') {
      obj[pro] = this.state[pro] ? JSON.parse(this.state[pro]).id || 0 : 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    } else if (pro === 'storyPoints' || pro === 'remainingTime') {
      obj[pro] = this.state[pro] === '' ? null : this.state[pro];
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    } else if (pro === 'statusId') {
      updateStatus(transformId, issueId, origin.objectVersionNumber)
        .then((res) => {
          this.reloadIssue();
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    } else {
      obj[pro] = this.state[pro] || 0;
      updateIssue(obj)
        .then((res) => {
          this.reloadIssue();
          if (this.props.onUpdate) {
            this.props.onUpdate();
          }
        });
    }
  }

  updateIssueSelect = (originPros, pros) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
    };
    const origin = this.state[originPros];
    let target;
    let transPros;
    if (originPros === 'originLabels') {
      if (!this.state[pros].length) {
        transPros = [];
      } else if (typeof this.state[pros][0] !== 'string') {
        transPros = this.transToArr(this.state[pros], 'labelName', 'array');
      } else {
        transPros = this.state[pros];
      }
    } else if (!this.state[pros].length) {
      transPros = [];
    } else if (typeof this.state[pros][0] !== 'string') {
      transPros = this.transToArr(this.state[pros], 'name', 'array');
    } else {
      transPros = this.state[pros];
    }
    const out = _.map(transPros, (pro) => {
      if (origin.length && origin[0].name) {
        target = _.find(origin, { name: pro });
      } else {
        target = _.find(origin, { labelName: pro });
      }
      // const target = _.find(origin, { name: pro });
      if (target) {
        return target;
      } else if (originPros === 'originLabels') {
        return ({
          labelName: pro,
          // created: true,
          projectId: AppState.currentMenuType.id,
        });
      } else {
        return ({
          name: pro,
          // created: true,
          projectId: AppState.currentMenuType.id,
        });
      }
    });
    obj[pros] = out;
    updateIssue(obj)
      .then((res) => {
        this.reloadIssue();
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  updateVersionSelect = (originPros, pros) => {
    const obj = {
      issueId: this.state.issueId,
      objectVersionNumber: this.state.origin.objectVersionNumber,
      versionType: pros === 'fixVersions' ? 'fix' : 'influence',
    };
    const origin = this.state[originPros];
    let target;
    let transPros;
    if (!this.state[pros].length) {
      transPros = [];
    } else if (typeof this.state[pros][0] !== 'string') {
      transPros = this.transToArr(this.state[pros], 'name', 'array');
    } else {
      transPros = this.state[pros];
    }
    const out = _.map(transPros, (pro) => {
      if (origin.length && origin[0].name) {
        target = _.find(origin, { name: pro });
      }
      if (target) {
        return ({
          ...target,
          relationType: pros === 'fixVersions' ? 'fix' : 'influence',
        });
      } else {
        return ({
          name: pro,
          relationType: pros === 'fixVersions' ? 'fix' : 'influence',
          projectId: AppState.currentMenuType.id,
        });
      }
    });
    obj.versionIssueRelDTOList = out;
    // obj.versionIssueRelDTOList = out.concat(this.state[pros === 'fixVersions' 
    // ? 'influenceVersions' : 'fixVersions']);
    updateIssue(obj)
      .then((res) => {
        this.reloadIssue();
        if (this.props.onUpdate) {
          this.props.onUpdate();
        }
      });
  }

  /**
   * Comment
   */
  handleCreateCommit() {
    const extra = {
      issueId: this.state.origin.issueId,
    };
    const { addCommitDes } = this.state;
    if (addCommitDes) {
      beforeTextUpload(addCommitDes, extra, this.createCommit, 'commentText');
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
        addCommit: false,
        addCommitDes: '',
      });
    });
  }

  transToArr(arr, pro, type = 'string') {
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
    // console.log(e.key);
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
        cloneIssue(this.state.origin.issueId, copyConditionDTO).then((res) => {
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
        this.handleDeleteIssue(this.state.origin.issueId);
        break;
      }
      default: break;
    }
  }

  changeRae(currentRae) {
    this.setState({
      currentRae,
    });
  }

  handleDeleteIssue = (issueId) => {
    // console.log(issueId);
    const that = this;
    confirm({
      width: 560,
      title: `删除测试用例${this.state.issueNum}`,
      content:
        <div style={{ marginBottom: 32 }}>
          <p style={{ marginBottom: 10 }}>请确认您要删除这个测试用例。</p>
          <p style={{ marginBottom: 10 }}>这个测试用例将会被彻底删除。包括所有步骤和相关执行。</p>
        </div>,
      onOk() {
        return deleteIssue(issueId)
          .then((res) => {
            that.props.onDeleteIssue();
          });
      },
      onCancel() { },
      okText: '删除',
      okType: 'danger',
    });
  }

  /**
   * Comment
   */
  renderCommits() {
    const delta = text2Delta(this.state.addCommitDes);
    return (
      <div>
        {
          this.state.addCommit && (
            <div className="line-start mt-10">
              <WYSIWYGEditor
                bottomBar
                value={delta}
                style={{ height: 200, width: '100%' }}
                onChange={(value) => {
                  this.setState({ addCommitDes: value });
                }}
                handleDelete={() => {
                  this.setState({
                    addCommit: false,
                    addCommitDes: '',
                  });
                }}
                handleSave={() => this.handleCreateCommit()}
              />
            </div>
          )
        }
        {
          this.state.issueCommentDTOList.map(comment => (
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
    return (
      <DataLogs
        datalogs={this.state.datalogs}
      />
    );
  }

  renderLinkIssues() {
    const group = _.groupBy(this.state.linkIssues, 'ward');
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
        //   // this.reloadIssue(issueId === this.state.origin.issueId ? linkedIssueId : issueId);
        // }}
        onRefresh={() => {
          this.reloadIssue(this.state.origin.issueId);
        }}
      />

    );
  }

  /**
   * Des
   */
  renderDes() {
    let delta;
    if (this.state.editDesShow === undefined) {
      return null;
    }
    if (!this.state.description || this.state.editDesShow) {
      delta = text2Delta(this.state.editDes);
      return (
        <div className="line-start mt-10">
          <WYSIWYGEditor
            bottomBar
            value={text2Delta(this.state.editDes)}
            style={{ height: 200, width: '100%' }}
            onChange={(value) => {
              this.setState({ editDes: value });
            }}
            handleDelete={() => {
              this.setState({
                editDesShow: false,
                editDes: this.state.description,
              });
            }}
            handleSave={() => {
              this.setState({
                editDesShow: false,
                description: this.state.editDes || '',
              });
              this.updateIssue('editDes');
            }}
          />
        </div>
      );
    } else {
      delta = delta2Html(this.state.description);
      return (
        <div className="c7ntest-content-wrapper">
          <div
            className="line-start mt-10 c7ntest-description"
            role="none"
            onClick={() => {
              this.setState({
                // editDesShow: true,
                // editDes: this.state.description,
              });
            }}
          >
            <IssueDescription data={delta} />
          </div>
        </div>
      );
    }
  }

  loadIssueStatus = () => {
    const {
      issueTypeDTO,
      issueId,
      origin,
    } = this.state;
    const typeId = issueTypeDTO.id;
    this.setAnIssueToState();
    loadStatus(origin.statusId, issueId, typeId).then((res) => {
      this.setState({
        originStatus: res,
        selectLoading: false,
      });
    });
  }

  createIssueStep = () => {
    const issueId = this.state.origin.issueId;
    const lastRank = this.state.testStepData.length
      ? this.state.testStepData[this.state.testStepData.length - 1].rank : null;
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

  render() {
    const {
      priorityDTO, priorityId, priorityName, priorityColor, originpriorities, originStatus, issueTypeDTO, statusMapDTO,
    } = this.state;
    // const { name: priorityName, id: priorityId, colour: priorityColor } = priorityDTO || {};
    const {
      name: statusName, id: statusId, colour: statusColor, icon: statusIcon,
    } = statusMapDTO || {};
    const typeCode = issueTypeDTO ? issueTypeDTO.typeCode : '';
    const typeColor = issueTypeDTO ? issueTypeDTO.colour : '#fab614';
    const typeIcon = issueTypeDTO ? issueTypeDTO.icon : 'help';

    const menu = AppState.currentMenuType;
    const {
      type, id: projectId, organizationId: orgId, name,
    } = menu;
    const {
      initValue, visible, onCancel, onOk, mode,
    } = this.props;
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
    const callback = (value) => {
      this.setState({
        description: value,
        edit: false,
      }, () => {
        this.updateIssue('description');
      });
    };
    const priorityOptions = originpriorities.map(priority => (
      <Option key={priority.id} value={priority.id}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <PriorityTag priority={priority} />
        </div>
      </Option>
    ));
    return (
      <div className="choerodon-modal-editIssue">
        {
          this.state.issueLoading ? (
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
            <Tooltip placement="right" title="详情">
              <li id="DETAILS-nav" className={`c7ntest-li ${this.state.nav === 'detail' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="error_outline c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'detail' });
                    this.scrollToAnchor('detail');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="描述">
              <li id="DESCRIPTION-nav" className={`c7ntest-li ${this.state.nav === 'des' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="subject c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'des' });
                    this.scrollToAnchor('des');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="测试详细信息">
              <li id="DESCRIPTION-test1" className={`c7ntest-li ${this.state.nav === 'test1' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="compass c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'test1' });
                    this.scrollToAnchor('test1');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="测试执行">
              <li id="DESCRIPTION-test2" className={`c7ntest-li ${this.state.nav === 'test2' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="explicit2 c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'test2' });
                    this.scrollToAnchor('test2');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="附件">
              <li id="COMMENT-nav" className={`c7ntest-li ${this.state.nav === 'attachment' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="attach_file c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'attachment' });
                    this.scrollToAnchor('attachment');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="评论">
              <li id="ATTACHMENT-nav" className={`c7ntest-li ${this.state.nav === 'commit' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="sms_outline c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'commit' });
                    this.scrollToAnchor('commit');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="活动日志">
              <li id="DATA_LOG-nav" className={`c7ntest-li ${this.state.nav === 'data_log' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="insert_invitation c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'data_log' });
                    this.scrollToAnchor('data_log');
                  }}
                />
              </li>
            </Tooltip>
            <Tooltip placement="right" title="相关任务">
              <li id="LINK_TASKS-nav" className={`c7ntest-li ${this.state.nav === 'link_task' ? 'c7ntest-li-active' : ''}`}>
                <Icon
                  type="link c7ntest-icon-li"
                  role="none"
                  onClick={() => {
                    this.setState({ nav: 'link_task' });
                    this.scrollToAnchor('link_task');
                  }}
                />
              </li>
            </Tooltip>
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
                  <div style={{ fontSize: 16, lineHeight: '28px', fontWeight: 500 }}>
                    {
                      typeCode === 'sub_task' ? (
                        <span>
                          <span
                            role="none"
                            style={{ color: 'rgb(63, 81, 181)', cursor: 'pointer' }}
                            onClick={() => {
                              this.reloadIssue(this.state.parentIssueId);
                            }}
                          >
                            {this.state.parentIssueNum}
                          </span>
                          <span style={{ paddingLeft: 10, paddingRight: 10 }}>/</span>
                        </span>
                      ) : null
                    }
                    <span>{this.state.issueNum}</span>
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
                  <ReadAndEdit
                    callback={this.changeRae.bind(this)}
                    thisType="summary"
                    line
                    current={this.state.currentRae}
                    handleEnter
                    origin={this.state.summary}
                    onInit={() => this.setAnIssueToState()}
                    onOk={this.updateIssue.bind(this, 'summary')}
                    onCancel={this.resetSummary.bind(this)}
                    readModeContent={(
                      <div className="c7ntest-summary">
                        {this.state.summary}
                      </div>
                    )}
                  >
                    <TextArea
                      // style={{ width: 290 }}
                      maxLength={44}
                      value={this.state.summary}
                      size="small"
                      autoFocus
                      onChange={this.handleTitleChange.bind(this)}
                      // autosize
                      onPressEnter={() => {
                        this.updateIssue('summary');
                        this.setState({
                          currentRae: undefined,
                        });
                      }}
                    />
                  </ReadAndEdit>
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
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="statusId"
                            current={this.state.currentRae}
                            origin={statusId}
                            onOk={this.updateIssue.bind(this, 'statusId')}
                            onCancel={this.resetStatusId.bind(this)}
                            onInit={this.loadIssueStatus}
                            readModeContent={(
                              <div>
                                {
                                  statusId ? (
                                    <div
                                      style={{
                                        color: statusColor || 'black',
                                        fontSize: '16px',
                                        lineHeight: '18px',
                                      }}
                                    >
                                      {statusName}
                                    </div>
                                  ) : '无'
                                }
                              </div>
                            )}
                          >
                            <Select
                              value={originStatus.length
                                ? statusId : statusName}
                              style={{ width: 150 }}
                              loading={this.state.selectLoading}
                              autoFocus
                              // getPopupContainer={triggerNode => triggerNode.parentNode}
                              onFocus={() => {
                                // this.setState({
                                //   selectLoading: true,
                                // });
                                // loadStatus().then((res) => {
                                //   this.setState({
                                //     originStatus: res,
                                //     selectLoading: false,
                                //   });
                                // });
                              }}
                              onChange={(value, item) => {
                                this.setState({
                                  statusId: value,
                                  transformId: item.key,
                                });
                              }}
                            >
                              {
                                originStatus.map(transform => (
                                  <Option key={transform.id} value={transform.endStatusId}>
                                    {transform.statusDTO.name}
                                  </Option>
                                ))
                              }
                            </Select>
                          </ReadAndEdit>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flex: 1 }}>
                      <span
                        style={{
                          width: 30, height: 30, borderRadius: '50%', background: 'rgba(77, 144, 254, 0.2)', marginRight: 12, flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center',
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
                          <ReadAndEdit
                            callback={this.changeRae.bind(this)}
                            thisType="priorityId"
                            current={this.state.currentRae}
                            origin={priorityId}
                            onOk={this.updateIssue.bind(this, 'priorityId')}
                            onCancel={this.resetPriorityId.bind(this)}
                            onInit={() => {
                              this.setAnIssueToState();
                              getPrioritys().then((res) => {
                                this.setState({
                                  originpriorities: res,
                                });
                              });
                            }}
                            readModeContent={(
                              <div>
                                {
                                  priorityId ? <PriorityTag priority={priorityDTO} /> : '无'
                                }
                              </div>
                            )}
                          >
                            <Select
                              value={originpriorities.length
                                ? priorityId : priorityName}
                              style={{ width: '150px' }}
                              loading={this.state.selectLoading}
                              autoFocus
                              // getPopupContainer={triggerNode => triggerNode.parentNode}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getPrioritys().then((res) => {
                                  this.setState({
                                    originpriorities: res,
                                    selectLoading: false,
                                  });
                                });
                              }}
                              onChange={(value) => {
                                const priority = _.find(originpriorities,
                                  { id: value });
                                this.setState({
                                  priorityId: value,
                                  priorityName: priority.name,
                                });
                              }}
                            >
                              {priorityOptions}
                            </Select>
                          </ReadAndEdit>
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
                              !this.state.fixVersionsFixed.length && !this.state.fixVersions.length ? '无' : (
                                <div>
                                  <div style={{ color: '#000' }}>
                                    {_.map(this.state.fixVersionsFixed, 'name').join(' , ')}
                                  </div>
                                  <p style={{ wordBreak: 'break-word', marginBottom: 0 }}>
                                    {_.map(this.state.fixVersions, 'name').join(' , ')}
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
                                  <ReadAndEdit
                                    callback={this.changeRae.bind(this)}
                                    thisType="statusId"
                                    current={this.state.currentRae}
                                    origin={statusId}
                                    onOk={this.updateIssue.bind(this, 'statusId')}
                                    onCancel={this.resetStatusId.bind(this)}
                                    onInit={this.loadIssueStatus}
                                    readModeContent={(
                                      <div>
                                        {
                                          statusId ? (
                                            <div
                                              style={{
                                                background: statusColor || 'black',
                                                color: '#fff',
                                                borderRadius: '2px',
                                                padding: '0 8px',
                                                display: 'inline-block',
                                                margin: '2px auto 2px 0',
                                              }}
                                            >
                                              {statusName}
                                            </div>
                                          ) : '无'
                                        }
                                      </div>
                                    )}
                                  >
                                    <Select
                                      value={originStatus.length
                                        ? this.state.statusId : this.state.statusName}
                                      style={{ width: 150 }}
                                      loading={this.state.selectLoading}
                                      autoFocus
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      onFocus={() => {
                                        // this.setState({
                                        //   selectLoading: true,
                                        // });
                                        // loadStatus().then((res) => {
                                        //   this.setState({
                                        //     originStatus: res,
                                        //     selectLoading: false,
                                        //   });
                                        // });
                                      }}
                                      onChange={(value, item) => {
                                        this.setState({
                                          statusId: value,
                                          transformId: item.key,
                                        });
                                      }}
                                    >
                                      {
                                        originStatus.map(transform => (
                                          <Option key={transform.id} value={transform.endStatusId}>
                                            {transform.statusDTO.name}
                                          </Option>
                                        ))
                                      }
                                    </Select>
                                  </ReadAndEdit>
                                </div>
                              </div>
                              {/* 优先级 */}
                              <div className="line-start mt-10 ht-20">
                                <div className="c7ntest-property-wrapper">
                                  <span className="c7ntest-property">优先级：</span>
                                </div>
                                <div className="c7ntest-value-wrapper">
                                  <ReadAndEdit
                                    callback={this.changeRae.bind(this)}
                                    thisType="priorityId"
                                    current={this.state.currentRae}
                                    origin={priorityId}
                                    onOk={this.updateIssue.bind(this, 'priorityId')}
                                    onCancel={this.resetPriorityId.bind(this)}
                                    onInit={() => {
                                      this.setAnIssueToState();
                                      getPrioritys().then((res) => {
                                        this.setState({
                                          originpriorities: res,
                                        });
                                      });
                                    }}
                                    readModeContent={(
                                      <div>
                                        {
                                          priorityId ? <PriorityTag priority={priorityDTO} /> : '无'
                                        }
                                      </div>
                                    )}
                                  >
                                    <Select
                                      value={originpriorities.length
                                        ? priorityId : priorityName}
                                      style={{ width: '150px' }}
                                      loading={this.state.selectLoading}
                                      autoFocus
                                      getPopupContainer={triggerNode => triggerNode.parentNode}
                                      onFocus={() => {
                                        this.setState({
                                          selectLoading: true,
                                        });
                                        getPrioritys().then((res) => {
                                          this.setState({
                                            originpriorities: res,
                                            selectLoading: false,
                                          });
                                        });
                                      }}
                                      onChange={(value) => {
                                        const priority = _.find(originpriorities,
                                          { id: value });
                                        this.setState({
                                          priorityId: value,
                                          priorityName: priority.name,
                                        });
                                      }}
                                    >
                                      {priorityOptions}
                                    </Select>
                                  </ReadAndEdit>
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
                                <ReadAndEdit
                                  callback={this.changeRae.bind(this)}
                                  thisType="componentIssueRelDTOList"
                                  current={this.state.currentRae}
                                  origin={this.state.componentIssueRelDTOList}
                                  onInit={() => this.setAnIssueToState(this.state.origin)}
                                  onOk={this.updateIssueSelect.bind(this, 'originComponents', 'componentIssueRelDTOList')}
                                  onCancel={this.resetComponentIssueRelDTOList.bind(this)}
                                  readModeContent={(
                                    <div style={{ color: '#3f51b5' }}>
                                      <p style={{ color: '#3f51b5', wordBreak: 'break-word', marginBottom: 0 }}>
                                        {this.transToArr(this.state.componentIssueRelDTOList, 'name')}
                                      </p>
                                    </div>
                                  )}
                                >
                                  <Select
                                    value={this.transToArr(this.state.componentIssueRelDTOList, 'name', 'array')}
                                    loading={this.state.selectLoading}
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
                                          originComponents: res,
                                          selectLoading: false,
                                        });
                                      });
                                    }}
                                    onChange={value => this.setState({
                                      componentIssueRelDTOList: value,
                                    })}
                                  >
                                    {this.state.originComponents.map(component => (
                                      <Option
                                        key={component.name}
                                        value={component.name}
                                      >
                                        {component.name}
                                      </Option>
                                    ))}
                                  </Select>
                                </ReadAndEdit>
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

                            <ReadAndEdit
                              callback={this.changeRae.bind(this)}
                              thisType="labelIssueRelDTOList"
                              current={this.state.currentRae}
                              origin={this.state.labelIssueRelDTOList}
                              onInit={() => this.setAnIssueToState(this.state.origin)}
                              onOk={this.updateIssueSelect.bind(this, 'originLabels', 'labelIssueRelDTOList')}
                              onCancel={this.resetlabelIssueRelDTOList.bind(this)}
                              readModeContent={(
                                <div>
                                  {
                                    this.state.labelIssueRelDTOList.length > 0 ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {
                                          this.transToArr(this.state.labelIssueRelDTOList, 'labelName', 'array').map(label => (
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
                                  }
                                </div>
                              )}
                            >
                              <Select
                                value={this.transToArr(this.state.labelIssueRelDTOList, 'labelName', 'array')}
                                mode="tags"
                                autoFocus
                                loading={this.state.selectLoading}
                                tokenSeparators={[',']}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                style={{ width: '200px', marginTop: 0, paddingTop: 0 }}
                                onFocus={() => {
                                  this.setState({
                                    selectLoading: true,
                                  });
                                  getLabels().then((res) => {
                                    this.setState({
                                      originLabels: res,
                                      selectLoading: false,
                                    });
                                  });
                                }}
                                onChange={value => this.setState({ labelIssueRelDTOList: value })}
                              >
                                {this.state.originLabels.map(label => (
                                  <Option
                                    key={label.labelName}
                                    value={label.labelName}
                                  >
                                    {label.labelName}
                                  </Option>
                                ))}
                              </Select>
                            </ReadAndEdit>
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
                                  !this.state.fixVersionsFixed.length && !this.state.fixVersions.length ? '无' : (
                                    <div>
                                      <div style={{ color: '#000' }}>
                                        {_.map(this.state.fixVersionsFixed, 'name').join(' , ')}
                                      </div>
                                      <p style={{ wordBreak: 'break-word', marginBottom: 0 }}>
                                        {_.map(this.state.fixVersions, 'name').join(' , ')}
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
                        <div className="line-start mt-10 assignee ht-20">
                          <div className="c7ntest-property-wrapper">
                            <span className="c7ntest-property">
                              <FormattedMessage id="issue_edit_reporter" />
                              {'：'}
                            </span>
                          </div>
                          <div className="c7ntest-value-wrapper" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                            <ReadAndEdit
                              style={{ marginBottom: 5 }}
                              callback={this.changeRae.bind(this)}
                              thisType="reporterId"
                              current={this.state.currentRae}
                              origin={this.state.reporterId}
                              onOk={this.updateIssue.bind(this, 'reporterId')}
                              onCancel={this.resetReporterId.bind(this)}
                              onInit={() => {
                                this.setAnIssueToState(this.state.origin);
                                if (this.state.reporterId) {
                                  this.setState({
                                    flag: 'loading',
                                  });
                                  getUser(this.state.reporterId).then((res) => {
                                    this.setState({
                                      reporterId: JSON.stringify(res.content[0]),
                                      originUsers: res.content,
                                      flag: 'finish',
                                    });
                                  });
                                } else {
                                  this.setState({
                                    reporterId: undefined,
                                    originUsers: [],
                                  });
                                }
                              }}
                              readModeContent={(
                                <div>
                                  {
                                    this.state.reporterId && this.state.reporterName ? (
                                      <UserHead
                                        user={{
                                          id: this.state.reporterId,
                                          loginName: '',
                                          realName: this.state.reporterName,
                                          avatar: this.state.reporterImageUrl,
                                        }}
                                      />
                                    ) : '无'
                                  }
                                </div>
                              )}
                            >
                              <Select
                                value={this.state.flag === 'loading' ? undefined : this.state.reporterId || undefined}
                                style={{ width: 150 }}
                                loading={this.state.selectLoading}
                                allowClear
                                autoFocus
                                filter
                                onFilterChange={this.onFilterChange.bind(this)}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                onChange={(value) => {
                                  this.setState({ reporterId: value });
                                }}
                              >
                                {this.state.originUsers.map(user => (
                                  <Option key={JSON.stringify(user)} value={JSON.stringify(user)}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
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
                              </Select>
                            </ReadAndEdit>
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',
                                marginTop: '-5px',
                                display: 'inline-block',
                                marginBottom: 5,
                              }}
                              onClick={() => {
                                getSelf().then((res) => {
                                  if (res.id !== this.state.reporterId) {
                                    this.setState({
                                      currentRae: undefined,
                                      reporterId: JSON.stringify(res),
                                      reporterName: `${res.loginName}${res.realName}`,
                                      reporterImageUrl: res.imageUrl,
                                    }, () => {
                                      this.updateIssue('reporterId');
                                    });
                                  }
                                });
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
                            <ReadAndEdit
                              style={{ marginBottom: 5 }}
                              callback={this.changeRae.bind(this)}
                              thisType="assigneeId"
                              current={this.state.currentRae}
                              origin={this.state.assigneeId}
                              onOk={this.updateIssue.bind(this, 'assigneeId')}
                              onCancel={this.resetAssigneeId.bind(this)}
                              onInit={() => {
                                this.setAnIssueToState(this.state.origin);
                                if (this.state.assigneeId) {
                                  this.setState({
                                    flag: 'loading',
                                  });
                                  getUser(this.state.assigneeId).then((res) => {
                                    this.setState({
                                      assigneeId: JSON.stringify(res.content[0]),
                                      originUsers: [res.content[0]],
                                      flag: 'finish',
                                    });
                                  });
                                } else {
                                  this.setState({
                                    assigneeId: undefined,
                                    originUsers: [],
                                  });
                                }
                              }}
                              readModeContent={(
                                <div>
                                  {
                                    this.state.assigneeId && this.state.assigneeName ? (
                                      <UserHead
                                        user={{
                                          id: this.state.assigneeId,
                                          loginName: '',
                                          realName: this.state.assigneeName,
                                          avatar: this.state.assigneeImageUrl,
                                        }}
                                      />
                                    ) : '无'
                                  }
                                </div>
                              )}
                            >
                              <Select
                                value={this.state.flag === 'loading' ? undefined : this.state.assigneeId || undefined}
                                style={{ width: 150 }}
                                loading={this.state.selectLoading}
                                allowClear
                                autoFocus
                                filter
                                onFilterChange={this.onFilterChange.bind(this)}
                                getPopupContainer={triggerNode => triggerNode.parentNode}
                                onChange={(value) => {
                                  this.setState({ assigneeId: value });
                                }}
                              >
                                {this.state.originUsers.map(user => (
                                  <Option key={JSON.stringify(user)} value={JSON.stringify(user)}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
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
                              </Select>
                            </ReadAndEdit>
                            <span
                              role="none"
                              style={{
                                color: '#3f51b5',
                                cursor: 'pointer',
                                marginTop: '-5px',
                                display: 'inline-block',
                                marginBottom: 5,
                              }}
                              onClick={() => {
                                getSelf().then((res) => {
                                  if (res.id !== this.state.assigneeId) {
                                    this.setState({
                                      currentRae: undefined,
                                      assigneeId: JSON.stringify(res),
                                      assigneeName: `${res.loginName}${res.realName}`,
                                      assigneeImageUrl: res.imageUrl,
                                    }, () => {
                                      this.updateIssue('assigneeId');
                                    });
                                  }
                                });
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
                            {formatDate(this.state.creationDate)}
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
                            {formatDate(this.state.lastUpdateDate)}
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
                        <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ edit: true })}>
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
                              editDesShow: true,
                              editDes: this.state.description,
                            });
                          }}
                        />
                      </div>
                    </div>
                    {this.renderDes()}
                  </div>

                </div>

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
                      issueId={this.state.origin.issueId}
                      data={this.state.testStepData}
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
                      issueId={this.state.origin.issueId}
                      data={this.state.testExecuteData}
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
                      fileList={this.state.fileList}
                    />
                  </div>
                </div>

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
                      <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ addCommit: true })}>
                        <Icon type="playlist_add icon" />
                        <FormattedMessage id="issue_edit_addComment" />
                      </Button>
                    </div>
                  </div>
                  {this.renderCommits()}
                </div>
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

                {
                  this.state.origin.typeCode !== 'sub_task' && (
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
                  )
                }
              </div>
            </section>
          </div>
        </div>
        {
          this.state.edit ? (
            <FullEditor
              initValue={text2Delta(this.state.editDes)}
              visible={this.state.edit}
              onCancel={() => this.setState({ edit: false })}
              onOk={callback}
            />
          ) : null
        }
        {
          this.state.createLinkTaskShow ? (
            <CreateLinkTask
              issueId={this.state.origin.issueId}
              visible={this.state.createLinkTaskShow}
              onCancel={() => this.setState({ createLinkTaskShow: false })}
              onOk={this.handleCreateLinkIssue.bind(this)}
            />
          ) : null
        }
        {
          this.state.copyIssueShow ? (
            <CopyIssue
              issueId={this.state.origin.issueId}
              issueNum={this.state.origin.issueNum}
              issue={this.state.origin}
              issueLink={this.state.linkIssues}
              issueSummary={this.state.origin.summary}
              visible={this.state.copyIssueShow}
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
