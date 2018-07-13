import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Modal, Form, Select } from 'choerodon-ui';
import { createLink, loadIssuesInLink } from '../../api/IssueApi';
import TypeTag from '../TypeTag';

import './TransformSubIssue.scss';
import '../../assets/main.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { Option } = Select;

class TransformSubIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
      selectLoading: true,

      originIssues: [],
      originStatus: [],
    };
  }

  componentDidMount() {
    this.getStatus();
  }

  getStatus() {
    this.setState({
      selectLoading: true,
    });
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_status/list`)
      .then((res) => {
        this.setState({
          selectLoading: false,
          originStatus: res,
        });
      });
  }

  setBackground(categoryCode) {
    let result;
    if (categoryCode === 'todo') {
      result = 'rgb(74, 103, 133)';
    } else if (categoryCode === 'doing') {
      result = 'rgb(246, 195, 66)';
    } else {
      result = 'rgb(20, 136, 44)';
    }
    return result;
  }

  handleTransformSubIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const projectId = AppState.currentMenuType.id;
        const { initValue, visible, onCancel, onOk, issueId, issueNum } = this.props;
        window.console.log(values);
        const parentIssueId = values.issues;
        const status = values.status;
        window.console.table({
          parentIssueId,
          status,
          issueId,
        });
        this.setState({
          loading: true,
        });
        // axios.post(`/agile/v1/projects/${projectId}/issues/${issueId}/copy_issue?summary=${values.issueSummary}`)
        //   .then((res) => {
        //     this.setState({
        //       loading: false,
        //     });
        //     this.props.onOk();
        //   });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk, issueId, issueNum } = this.props;

    return (
      <Sidebar
        className="c7n-transformSubIssue"
        title="转化为子问题"
        visible={visible || false}
        onOk={this.handleTransformSubIssue}
        onCancel={onCancel}
        okText="转化"
        cancelText="取消"
        confirmLoading={this.state.loading}
      >
        <Content
          style={{
            padding: 0,
            width: 520,
          }}
          title={`将问题“${issueNum}”转化为子任务`}
          description="请在下面输入环境编码、名称、描述，创建新环境。新环境默认新增在环境流水线的最后一个节点。"
          link="#"
        >
          <Form layout="vertical">
            <FormItem label="父任务" style={{ width: 520 }}>
              {getFieldDecorator('issues', {
                rules: [{ required: true, message: '请选择父任务' }],
              })(
                <Select
                  label="父任务"
                  loading={this.state.selectLoading}
                  filter
                  filterOption={false}
                  onFilterChange={(input) => {
                    this.setState({
                      selectLoading: true,
                    });
                    loadIssuesInLink(0, 20, this.props.issueId, input).then((res) => {
                      this.setState({
                        originIssues: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originIssues.map(issue =>
                    (<Option
                      key={issue.issueId}
                      value={issue.issueId}
                    >
                      <div style={{ display: 'inline-flex', width: '100%', flex: 1 }}>
                        <div>
                          <TypeTag
                            type={{
                              typeCode: issue.typeCode,
                            }}
                          />
                        </div>
                        <a style={{ paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.issueNum}
                        </a>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <p style={{ paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset' }}>
                            {issue.summary}
                          </p>
                        </div>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
            <FormItem label="状态" style={{ width: 520 }}>
              {getFieldDecorator('status', {
                rules: [{ required: true, message: '请选择状态' }],
              })(
                <Select
                  label="状态"
                  loading={this.state.selectLoading}
                >
                  {
                    this.state.originStatus.map(status => (
                      <Option key={status.id} value={status.id}>
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            style={{
                              width: 15,
                              height: 15,
                              background: this.setBackground(status.categoryCode),
                              marginRight: 6,
                              borderRadius: '2px',
                            }}
                          />
                          { status.name }
                        </div>
                      </Option>
                    ),
                    )
                  }
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(TransformSubIssue));
