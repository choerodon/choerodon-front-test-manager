import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Modal, Form, Radio, Input, Select, Tooltip, Icon } from 'choerodon-ui';
import { stores, Content, axios } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './CreateBranch.scss';
import './commom.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
const { Option, OptGroup } = Select;
const FormItem = Form.Item;

class CreateBranch extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      name: 'feature',
      value: '',
      projectId: menu.id,
      confirmLoading: false,
      initValue: null,
      type: 'custom',

      selectLoading: false,
      originApps: [],
      originBranchs: [],
      branchs: [],
      tags: [],
      branchsExpand: false,
      tagsExpand: false,
    };
  }

  componentDidMount() {
    const { store } = this.props;
    // store.loadIssue();
  }

  getOptionContent =(s) => {
    const { formatMessage } = this.props.intl;
    let mes = '';
    let icon = '';
    let color = '';
    switch (s.typeCode) {
      case 'story':
        mes = formatMessage({ id: 'branch.issue.story' });
        icon = 'turned_in';
        color = '#00bfa5';
        break;
      case 'bug':
        mes = formatMessage({ id: 'branch.issue.bug' });
        icon = 'bug_report';
        color = '#f44336';
        break;
      case 'issue_epic':
        mes = formatMessage({ id: 'branch.issue.epic' });
        icon = 'priority';
        color = '#743be7';
        break;
      case 'sub_task':
        mes = formatMessage({ id: 'branch.issue.subtask' });
        icon = 'relation';
        color = '#4d90fe';
        break;
      default:
        mes = formatMessage({ id: 'branch.issue.task' });
        icon = 'assignment';
        color = '#4d90fe';
    }
    return (<span>
      <Tooltip title={mes}>
        <div style={{ background: color }} className="branch-issue"><i className={`icon icon-${icon}`} /></div>
      </Tooltip>
      <span className="branch-issue-content">{`${s.issueNum}    ${s.summary}`}</span>
    </span>);
  };

  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  getIcon =(name) => {
    let icon;
    let type;
    if (name) {
      type = name.split('-')[0];
    }
    switch (type) {
      case 'feature':
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case 'bugfix':
        icon = <span className="c7n-branch-icon icon-develop">B</span>;
        break;
      case 'hotfix':
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case 'master':
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      case 'release':
        icon = <span className="c7n-branch-icon icon-release">R</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-custom">C</span>;
    }
    return icon;
  };

  /**
   * 提交分支数据
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      window.console.log(values);
      if (!err) {
        const devopsBranchDTO = {
          branchName: values.type === 'custom' ? values.name : `${values.type}-${values.name}`,
          issueId: this.props.issueId,
          originBranch: values.branch,
        };
        const applicationId = values.app;
        const projectId = AppState.currentMenuType.id;
        this.setState({
          confirmLoading: true,
        });
        axios.post(`/devops/v1/projects/${projectId}/apps/${applicationId}/git/branch`, devopsBranchDTO)
          .then((res) => {
            this.setState({
              confirmLoading: false,
            });
            this.props.onOk();
          })
          .catch((error) => {
            window.console.error('create branch failed');
            this.setState({
              confirmLoading: false,
            });
          });
      }
    });
  };
  /**
   * 验证分支名的正则
   * @param rule
   * @param value
   * @param callback
   */
  checkName =(rule, value, callback) => {
    // eslint-disable-next-line no-useless-escape
    const endWith = /(\/|\.|\.lock)$/;
    const contain = /(\s|~|\^|:|\?|\*|\[|\\|\.\.|@\{|\/{2,}){1}/;
    const single = /^@+$/;
    const { intl } = this.props;
    if (endWith.test(value)) {
      callback(intl.formatMessage({ id: 'branch.checkNameEnd' }));
    } else if (contain.test(value) || single.test(value)) {
      callback(intl.formatMessage({ id: 'branch.check' }));
    } else {
      callback();
    }
  };

  handleClose = () => {
    this.props.form.resetFields();
    this.props.onClose();
  };

  changeType =(value) => {
    let type = '';
    if (value !== 'custom') {
      type = `${value}-`;
    }
    this.setState({ type });
  };

  changeIssue =(value, options) => {
    const key = options.key;
    let type = '';
    switch (key) {
      case 'story':
        type = 'feature';
        break;
      case 'bug':
        type = 'bugfix';
        break;
      case 'issue_epic':
        type = 'custom';
        break;
      case 'sub_task':
        type = 'custom';
        break;
      default:
        type = 'custom';
    }
    this.setState({ type });
  };

  // getBranchs() {
  //   const branchs = this.state.branchs.slice();
  //   const branchsExpand = this.state.branchsExpand;
  //   if (branchs.length > 5 && !branchsExpand) {
  //     return branchs.slice(0, 5);
  //   }
  //   return branchs;
  // }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, intl, store } = this.props;
    // const issue = store.issue.slice();
    const branches = [];
    const tags = [];
    return (
      <Sidebar
        className="c7n-createBranch"
        title="创建分支"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.confirmLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title="对问题“C7NCD-112”创建分支"
          description="采用Git flow工作流模式，自动创建分支模式所特有的流水线，持续交付过程中对feature、release、hotfix等分支进行管理。"
          link="#"
        >
          <Form layout="vertical" className="c7n-sidebar-form">
            <div className="branch-formItem-icon">
              <span className="icon icon-widgets" />
            </div>
            <FormItem
              className="branch-formItem"
            >
              {getFieldDecorator('app', {
                rules: [{
                  required: true,
                }],
              })(
                <Select
                  label="应用名称"
                  allowClear
                  onFocus={() => {
                    this.setState({ selectLoading: true });
                    axios.get(`/devops/v1/projects/${AppState.currentMenuType.id}/apps`)
                      .then((res) => {
                        this.setState({
                          originApps: res,
                          selectLoading: false,
                        });
                      });
                  }}
                  filter
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  loading={this.state.selectLoading}
                >
                  {this.state.originApps.map(app => (
                    <Option value={app.id} key={app.id}>
                      {app.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem> 
            <div className="branch-formItem-icon">
              <span className="icon icon-wrap_text" />
            </div>
            <FormItem
              className="branch-formItem"
            >
              {getFieldDecorator('branch', {
                rules: [{
                  required: true,
                }],
              })(
                <Select
                  label="分支来源"
                  allowClear
                  disabled={!this.props.form.getFieldValue('app')}
                  onFocus={() => {
                    this.setState({ selectLoading: true });
                    let sign = 2;
                    axios.get(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/branches`)
                      .then((res) => {
                        sign -= 1;
                        this.setState({
                          branchs: res,
                          selectLoading: sign !== 0,
                        });
                      });
                    axios.get(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/tags?page=0&size=9999`)
                      .then((res) => {
                        sign -= 1;
                        this.setState({
                          tags: res.content,
                          selectLoading: sign !== 0,
                        });
                      });
                  }}
                  filter
                  optionLabelProp="value"
                  // optionFilterProp="children"
                  // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  loading={this.state.selectLoading}
                >
                  <OptGroup label="分支" key="proGroup">
                    {this.state.branchs.map(s => (
                      <Option value={s.name}><Icon type="branch" />{s.name}</Option>
                    ))}
                    {/* {
                      this.state.branchs.length > 5 ? (
                        <Option key="more">
                          <div
                            role="none"
                            style={{
                              margin: '-4px -20px',
                              padding: '4px 20px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Icon type="branch" />展开所有
                          </div>
                        </Option>
                      ) : null
                    } */}
                  </OptGroup>
                  <OptGroup label="标记" key="pubGroup">
                    {this.state.tags.map(s => (
                      <Option value={s.name}><Icon type="local_offer" />{s.name}</Option>
                    ))}
                  </OptGroup>
                </Select>,
              )}
            </FormItem>
            <div className="branch-formItem-icon">
              <span className="icon icon-branch" />
            </div>
            <FormItem
              className={'c7n-formItem_180'}
            >
              {getFieldDecorator('type', {
                rules: [{
                  required: true,
                }],
              })(
                <Select
                  allowClear
                  label="分支类型"
                  disabled={!(this.props.form.getFieldValue('app') && this.props.form.getFieldValue('branch'))}
                >
                  {['feature', 'bugfix', 'release', 'hotfix', 'custom'].map(s => (
                    <Option value={s} key={s}>{this.getIcon(s)}<span>{s}</span></Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-formItem_281"
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }, {
                  validator: this.checkName,
                }],
              })(
                <Input
                  label="分支名称"
                  autoFocus
                  prefix={this.props.form.getFieldValue('type') === 'custom' || !this.props.form.getFieldValue('type') ? '' : `${this.props.form.getFieldValue('type')}-`}
                  maxLength={30}
                  disabled={!(this.props.form.getFieldValue('app') && this.props.form.getFieldValue('branch'))}
                />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(injectIntl(CreateBranch)));
