import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Select, Input, Button, Modal, Tooltip, Dropdown, Menu, Spin, Icon, Upload,
} from 'choerodon-ui';
import _ from 'lodash';
import {
  delta2Html, handleFileUpload, text2Delta, beforeTextUpload, formatDate, returnBeforeTextUpload, color2rgba,
} from '../../../common/utils';
import LinkList from '../../IssueManageComponent/EditIssue/Component/LinkList';
import {
  WYSIWYGEditor, Upload as UploadButton, StatusTags, DateTimeAgo, User, RichTextShow, FullEditor,
} from '../../CommonComponent';
import './ExecuteDetailSide.scss';

const navs = [
  { code: 'detail', tooltip: '详情', icon: 'error_outline' },
  { code: 'des', tooltip: '描述', icon: 'subject' },
  { code: 'attachment', tooltip: '附件', icon: 'attach_file' },
  { code: 'bug', tooltip: '缺陷', icon: 'bug_report' },
];
let sign = true;
class ExecuteDetailSide extends Component {
  state = { currentNav: 'detail', FullEditorShow: false, editing: false }

  renderLinkIssues(linkIssues) {
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
            {/* <IssueDescription data={delta} /> */}
          </div>
        </div>
      );
    }
  }

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

  handleCommentCancel=() => {
    this.setState({
      editing: false,
    });
  }

  enterEditing=() => {
    this.setState({
      editing: true,
    });
  }

  render() {
    const {
      visible, issueInfosDTO, cycleData, fileList, onFileRemove, status, onClose, onUpload, onCommentSave,
    } = this.props;
    const { FullEditorShow, editing } = this.state;
    const { issueName, summary } = issueInfosDTO || {};
    const { statusColor, statusName } = status;
    const {
      lastUpdateDate, cycleName, lastUpdateUser, comment,
    } = cycleData;
    const props = {
      onRemove: onFileRemove,
    };
    return (visible
      && (
        <div className="c7ntest-ExecuteDetailSide">
          <FullEditor
            initValue={comment}
            visible={FullEditorShow}
            onCancel={this.HideFullEditor}
            onOk={onCommentSave}
          />
          <div className="c7ntest-nav">
            <ul className="c7ntest-nav-ul">
              {this.renderNavs()}
            </ul>
          </div>
          <div className="c7ntest-content">
            <div className="c7ntest-content-top">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: 500 }}>
                  相关用例:
                  <span style={{ color: '#3F51B5', marginLeft: 5 }}>{issueName}</span>
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
              <section>
                <div className="c7ntest-side-item-header">
                  <div className="c7ntest-side-item-header-left">
                    <Icon type="error_outline" />
                    <span>详情</span>
                  </div>
                  <div className="c7ntest-side-item-header-line" />
                  <div className="c7ntest-side-item-header-right" />
                </div>
                <div className="c7ntest-side-item-content">
                  {/* 状态 */}
                  <div className="c7ntest-item-one-line">
                    <div className="c7ntest-item-one-line-left">状态：</div>
                    <div className="c7ntest-item-one-line-right">
                      <StatusTags
                        style={{ height: 20, lineHeight: '20px', marginRight: 15 }}
                        color={statusColor}
                        name={statusName}
                      />
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
                  {/* 执行日期 */}
                  <div className="c7ntest-item-one-line">
                    <div className="c7ntest-item-one-line-left">执行日期：</div>
                    <div className="c7ntest-item-one-line-right">
                      <DateTimeAgo date={lastUpdateDate} />
                    </div>
                  </div>
                </div>
              </section>
              {/* 描述 */}
              <section>
                <div className="c7ntest-side-item-header">
                  <div className="c7ntest-side-item-header-left">
                    <Icon type="subject" />
                    <span>描述</span>
                  </div>
                  <div className="c7ntest-side-item-header-line" />
                  <div className="c7ntest-side-item-header-right">
                    <Button className="leftBtn" type="primary" funcType="flat" icon="zoom_out_map" onClick={this.ShowFullEditor}>
                      <FormattedMessage id="execute_edit_fullScreen" />
                    </Button>
                  </div>
                </div>
                <div className="c7ntest-side-item-content" style={{ padding: 0 }}>
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
                </div>
              </section>
              {/* 附件 */}
              <section>
                <div className="c7ntest-side-item-header">
                  <div className="c7ntest-side-item-header-left">
                    <Icon type="attach_file" />
                    <span>附件</span>
                  </div>
                  <div className="c7ntest-side-item-header-line" />
                  <div className="c7ntest-side-item-header-right">
                    <UploadButton handleUpload={onUpload}>
                      <Icon type="file_upload" />
                      <FormattedMessage id="upload_attachment" />
                    </UploadButton>
                  </div>
                </div>
                <div className="c7ntest-side-item-content">
                  <Upload
                    {...props}
                    fileList={fileList}
                    className="upload-button"
                  />
                </div>
              </section>
              {/* 缺陷 */}
              <section>
                <div className="c7ntest-side-item-header">
                  <div className="c7ntest-side-item-header-left">
                    <Icon type="bug_report" />
                    <span>缺陷</span>
                  </div>
                  <div className="c7ntest-side-item-header-line" />
                  <div className="c7ntest-side-item-header-right">
                    <Button className="leftBtn" type="primary" funcType="flat">
                      <Icon type="playlist_add" style={{ marginRight: 2 }} />
                      <span>创建缺陷</span>
                    </Button>
                  </div>
                </div>
                <div className="c7ntest-side-item-content" />
              </section>
            </div>
          </div>
        </div>
      )
    );
  }
}

ExecuteDetailSide.propTypes = {

};

export default ExecuteDetailSide;
