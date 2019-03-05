import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import {
  Button, Tooltip, Icon, Upload, Select,
} from 'choerodon-ui';
import _ from 'lodash';
import { delta2Html, issueLink } from '../../../common/utils';
import {
  WYSIWYGEditor, Upload as UploadButton, StatusTags, DateTimeAgo, User, RichTextShow, FullEditor,
  TextEditToggle,
} from '../../CommonComponent';
import { addDefects, removeDefect } from '../../../api/ExecuteDetailApi';
import ExecuteDetailStore from '../../../store/project/TestExecute/ExecuteDetailStore';
import TypeTag from '../../IssueManageComponent/TypeTag';
import DefectList from './DefectList';
import './ExecuteDetailSide.scss';


const { Edit, Text } = TextEditToggle;
const { Option } = Select;
const navs = [
  { code: 'detail', tooltip: '详情', icon: 'error_outline' },
  { code: 'des', tooltip: '描述', icon: 'subject' },
  { code: 'attachment', tooltip: '附件', icon: 'attach_file' },
  { code: 'bug', tooltip: '缺陷', icon: 'bug_report' },
];
let sign = true;
const Section = ({
  id,
  icon,
  title,
  action,
  children,
  style,
}) => (
  <section id={id}>
    <div className="c7ntest-side-item-header">
      <div className="c7ntest-side-item-header-left">
        <Icon type={icon} />
        <span>{title}</span>
      </div>
      <div className="c7ntest-side-item-header-line" />
      <div className="c7ntest-side-item-header-right">
        {action}
      </div>
    </div>
    <div className="c7ntest-side-item-content" style={style}>
      {children}
    </div>
  </section>
);
const defaultProps = {
  issueInfosDTO: { issueTypeDTO: {} },
};
const propTypes = {
  issueInfosDTO: PropTypes.shape({}),
  cycleData: PropTypes.shape({}).isRequired,
  fileList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onFileRemove: PropTypes.func.isRequired,
  status: PropTypes.shape({}).isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onCommentSave: PropTypes.func.isRequired,
  onRemoveDefect: PropTypes.func.isRequired,
  onCreateBugShow: PropTypes.func.isRequired,
};
@observer
class ExecuteDetailSide extends Component {
  state = { currentNav: 'detail', FullEditorShow: false, editing: false }

  componentDidMount() {
    document.getElementById('scroll-area').addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    if (document.getElementById('scroll-area')) {
      document.getElementById('scroll-area').removeEventListener('scroll', this.handleScroll);
    }
  }

  handleScroll = (e) => {
    if (sign) {
      const currentNav = this.getCurrentNav(e);
      if (this.state.currentNav !== currentNav && currentNav) {
        this.setState({
          currentNav,
        });
      }
    }
  }

  getCurrentNav(e) {
    return _.find(navs.map(nav => nav.code), i => this.isInLook(document.getElementById(i)));
  }

  isInLook(ele) {
    const a = ele.offsetTop;
    const target = document.getElementById('scroll-area');
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


  renderNavs = () => navs.map(nav => (
    <Tooltip placement="right" title={nav.tooltip} key={nav.code}>
      <li className={`c7ntest-li ${this.state.currentNav === nav.code ? 'c7ntest-li-active' : ''}`}>
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


  ShowFullEditor = () => {
    this.setState({
      FullEditorShow: true,
    });
  }

  HideFullEditor = () => {
    this.setState({
      FullEditorShow: false,
    });
  }

  handleCommentSave = (comment) => {
    this.setState({
      editing: false,
    });
    this.props.onCommentSave(comment);
  }

  handleCommentCancel = () => {
    this.setState({
      editing: false,
    });
  }

  enterEditing = () => {
    this.setState({
      editing: true,
    });
  }

  addDefects = (issueList) => {
    const cycleData = ExecuteDetailStore.getCycleData;
    const defectIssueIds = ExecuteDetailStore.getDefectIssueIds;
    const { executeId } = cycleData;
    const needAdd = issueList.filter(issueId => !defectIssueIds.includes(issueId))
      .map(issueId => ({
        defectType: 'CYCLE_CASE',
        defectLinkId: executeId,
        issueId,
        // defectName: item.issueNum,
      }));
    if (needAdd.length > 0) {
      ExecuteDetailStore.enterloading();
      addDefects(needAdd).then((res) => {
        ExecuteDetailStore.getInfo();
      });
    }
  }

  handleRemoveDefect = (issueId) => {
    const cycleData = ExecuteDetailStore.getCycleData;
    if (_.find(cycleData.defects, { issueId: Number(issueId) })) {
      const defectId = _.find(cycleData.defects, { issueId: Number(issueId) }).id;
      removeDefect(defectId).then((res) => {
        ExecuteDetailStore.removeLocalDefect(defectId);
      });
    }
  }

  render() {
    const {
      issueInfosDTO, cycleData, fileList, onFileRemove, status, onClose, onUpload,
      onCommentSave, onRemoveDefect, onCreateBugShow, onSubmit, disabled,
    } = this.props;
    const issueList = ExecuteDetailStore.getIssueList;
    const defectIssueIds = ExecuteDetailStore.getDefectIssueIds;
    const userList = ExecuteDetailStore.getUserList;
    const selectLoading = ExecuteDetailStore.selectLoading;
    const { FullEditorShow, editing } = this.state;
    const {
      issueNum, summary, issueId, issueTypeDTO: { typeCode },
    } = issueInfosDTO || { issueTypeDTO: {} };
    const { statusColor, statusName } = status;
    const {
      lastUpdateDate, cycleName, lastUpdateUser, assigneeUser, comment, defects,
    } = cycleData;
    const props = {
      onRemove: onFileRemove,
    };
    const defectsOptions = issueList.map(issue => (
      <Option key={issue.issueId} value={issue.issueId.toString()}>
        {issue.issueNum}
        {' '}
        {issue.summary}
      </Option>
    ));
    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <User user={user} />
      </Option>
    ));
    return (
      <div className="c7ntest-ExecuteDetailSide">
        <FullEditor
          initValue={comment}
          visible={FullEditorShow}
          onCancel={this.HideFullEditor}
          onOk={onCommentSave}
        />
        <div className="c7ntest-nav">
          {/* 左上角类型图标 */}
          <div style={{
            height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          >
            <TypeTag type={{ colour: '#4D90FE', icon: 'table_chart' }} />
          </div>
          {/* 下方锚点列表 */}
          <ul className="c7ntest-nav-ul">
            {this.renderNavs()}
          </ul>
        </div>
        <div className="c7ntest-content">
          <div className="c7ntest-content-top">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>
                相关用例:
                <Link style={{ color: '#3F51B5', marginLeft: 5 }} className="c7ntest-text-dot" to={issueLink(issueId, typeCode, issueNum)}>{issueNum}</Link>
              </div>
              <div className="c7ntest-flex-space" />
              <Button className="leftBtn" funcType="flat" icon="last_page" onClick={onClose}>
                <span>隐藏详情</span>
              </Button>
            </div>
            <div style={{ fontSize: '20px' }}>
              {summary}
            </div>
          </div>
          <div className="c7ntest-content-bottom" id="scroll-area" style={{ position: 'relative' }}>
            {/* 详情 */}
            <Section
              id="detail"
              icon="error_outline"
              title="详情"
            >
              {/* 状态 */}
              <div className="c7ntest-item-one-line">
                <div className="c7ntest-item-one-line-left">状态：</div>
                <div className="c7ntest-item-one-line-right">
                  {statusColor && (
                    <StatusTags
                      style={{ height: 20, lineHeight: '20px', marginRight: 15 }}
                      color={statusColor}
                      name={statusName}
                    />
                  )}
                </div>
              </div>
              {/* 阶段名称 */}
              <div className="c7ntest-item-one-line">
                <div className="c7ntest-item-one-line-left">阶段名称：</div>
                <div className="c7ntest-item-one-line-right">
                  {cycleName}
                </div>
              </div>
              {/* 执行人 */}
              <div className="c7ntest-item-one-line">
                <div className="c7ntest-item-one-line-left">执行人：</div>
                <div className="c7ntest-item-one-line-right">
                  <User user={lastUpdateUser} />
                </div>
              </div>
              {/* 被指定人 */}
              <div className="c7ntest-item-one-line">
                <div className="c7ntest-item-one-line-left">被指定人：</div>
                <div className="c7ntest-item-one-line-right">
                  <TextEditToggle
                    disabled={!disabled}
                    formKey="assignedTo"
                    onSubmit={(id) => { onSubmit({ assignedTo: id || 0 }); }}
                    originData={assigneeUser ? _.find(userList, { id: assigneeUser.id }) ? assigneeUser.id : <User user={assigneeUser} /> : null}
                    onCancel={this.cancelEdit}
                  >
                    <Text>
                      {assigneeUser ? <User user={assigneeUser} />
                        : '无'}
                    </Text>
                    <Edit>
                      <Select
                        filter
                        allowClear
                        autoFocus
                        filterOption={false}
                        onFilterChange={(value) => { ExecuteDetailStore.loadUserList(value); }}
                        loading={selectLoading}
                        style={{ width: 200 }}
                      >
                        {userOptions}
                      </Select>
                    </Edit>
                  </TextEditToggle>
                </div>
              </div>

              {/* 执行日期 */}
              <div className="c7ntest-item-one-line">
                <div className="c7ntest-item-one-line-left">执行日期：</div>
                <div className="c7ntest-item-one-line-right">
                  <DateTimeAgo date={lastUpdateDate} />
                </div>
              </div>
            </Section>
            {/* 描述 */}
            <Section
              id="des"
              icon="subject"
              title="描述"
              style={{ padding: '0 15px 0 0' }}
              action={(
                <Button className="leftBtn" type="primary" funcType="flat" icon="zoom_out_map" onClick={this.ShowFullEditor}>
                  <FormattedMessage id="execute_edit_fullScreen" />
                </Button>
              )}
            >
              {comment && !editing
                ? (
                  <div
                    role="none"
                    style={{ padding: '15px 15px 15px 23px' }}
                    onClick={this.enterEditing}
                  >
                    <RichTextShow data={delta2Html(comment)} />
                  </div>
                )
                : (
                  <WYSIWYGEditor
                    bottomBar
                    value={comment}
                    style={{ height: 200, width: '100%' }}
                    handleSave={this.handleCommentSave}
                    handleDelete={this.handleCommentCancel}
                  />
                )}
            </Section>
            {/* 附件 */}
            <Section
              id="attachment"
              icon="attach_file"
              title="附件"
              action={(
                <UploadButton handleUpload={onUpload}>
                  <Icon type="file_upload" />
                  <FormattedMessage id="upload_attachment" />
                </UploadButton>
              )}
            >
              <Upload
                {...props}
                fileList={fileList}
                className="upload-button"
              />
            </Section>
            {/* 缺陷 */}
            <Section
              id="bug"
              icon="bug_report"
              title="缺陷"
              action={(
                <TextEditToggle
                  className="c7ntest-button-defect-select"
                  simpleMode
                  saveRef={(bugsToggle) => { this.bugsToggle = bugsToggle; }}
                  formKey="defects"
                  onSubmit={this.addDefects}
                  originData={defectIssueIds}
                  onCancel={this.cancelEdit}
                >
                  <Text>
                    <Button className="leftBtn" type="primary" funcType="flat">
                      <Icon type="playlist_add" style={{ marginRight: 2 }} />
                      <span>缺陷</span>
                    </Button>
                  </Text>
                  <Edit>
                    <Select
                      defaultOpen
                      filter
                      mode="multiple"
                      filterOption={false}
                      getPopupContainer={() => document.getElementById('scroll-area')}
                      dropdownMatchSelectWidth={false}
                      dropdownClassName="dropdown"
                      footer={(
                        <div
                          style={{ color: '#3f51b5', cursor: 'pointer' }}
                          role="none"
                          onClick={() => {
                            this.bugsToggle.handleSubmit();
                            ExecuteDetailStore.setCreateBugShow(true);
                            ExecuteDetailStore.setDefectType('CYCLE_CASE');
                            ExecuteDetailStore.setCreateDectTypeId(ExecuteDetailStore.id);
                          }}
                        >
                          <FormattedMessage id="issue_create_bug" />
                        </div>
                      )}
                      style={{ width: 300 }}
                      onDeselect={this.handleRemoveDefect}
                      onFilterChange={(value) => { ExecuteDetailStore.loadIssueList(value); }}
                    >
                      {defectsOptions}
                    </Select>
                  </Edit>
                </TextEditToggle>
              )}
            >
              <DefectList
                defects={defects}
                onRemoveDefect={onRemoveDefect}
              />
            </Section>
          </div>
        </div>
      </div>

    );
  }
}

ExecuteDetailSide.propTypes = propTypes;
ExecuteDetailSide.defaultProps = defaultProps;
export default ExecuteDetailSide;
