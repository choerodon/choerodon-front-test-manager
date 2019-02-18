import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button, Tooltip, Icon, Upload,  
} from 'choerodon-ui';
import _ from 'lodash';
import { delta2Html } from '../../../common/utils';
import {
  WYSIWYGEditor, Upload as UploadButton, StatusTags, DateTimeAgo, User, RichTextShow, FullEditor,
} from '../../CommonComponent';
import TypeTag from '../../IssueManageComponent/TypeTag';
import DefectList from './DefectList';
import './ExecuteDetailSide.scss';

const navs = [
  { code: 'detail', tooltip: '详情', icon: 'error_outline' },
  { code: 'des', tooltip: '描述', icon: 'subject' },
  { code: 'attachment', tooltip: '附件', icon: 'attach_file' },
  { code: 'bug', tooltip: '缺陷', icon: 'bug_report' },
];
let sign = true;
const propTypes = {
  issueInfosDTO: PropTypes.shape({}).isRequired,
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
  
  handleScroll=(e) => {
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
      issueInfosDTO, cycleData, fileList, onFileRemove, status, onClose, onUpload, 
      onCommentSave, onRemoveDefect, onCreateBugShow,
    } = this.props;
    const { FullEditorShow, editing } = this.state;
    const { issueNum, summary } = issueInfosDTO || {};
    const { statusColor, statusName } = status;
    const {
      lastUpdateDate, cycleName, lastUpdateUser, comment, defects,
    } = cycleData;
    const props = {
      onRemove: onFileRemove,
    };
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
                  <span style={{ color: '#3F51B5', marginLeft: 5 }} className="c7ntest-text-dot">{issueNum}</span>
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
              <section id="detail">
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
              <section id="des">
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
              <section id="attachment">
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
              <section id="bug">
                <div className="c7ntest-side-item-header">
                  <div className="c7ntest-side-item-header-left">
                    <Icon type="bug_report" />
                    <span>缺陷</span>
                  </div>
                  <div className="c7ntest-side-item-header-line" />
                  <div className="c7ntest-side-item-header-right">
                    <Button className="leftBtn" type="primary" funcType="flat" onClick={onCreateBugShow}>
                      <Icon type="playlist_add" style={{ marginRight: 2 }} />
                      <span>创建缺陷</span>
                    </Button>
                  </div>
                </div>
                <div className="c7ntest-side-item-content">                  
                  <DefectList
                    defects={defects}
                    onRemoveDefect={onRemoveDefect}
                  />
                </div>
              </section>
            </div>
          </div>
      </div>
     
    );
  }
}

ExecuteDetailSide.propTypes = propTypes;

export default ExecuteDetailSide;
