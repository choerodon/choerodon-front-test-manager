import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
  Modal, Form, Input, Checkbox, 
} from 'choerodon-ui';
import { cloneIssue, copyIssues } from '../../../api/IssueApi';
import './CopyIssue.scss';

const { AppState } = stores;
const FormItem = Form.Item;

class CopyIssue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
  }

  handleCopyIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const projectId = AppState.currentMenuType.id;
        const {
          visible, onCancel, onOk, issueId, issueNum, 
        } = this.props;
        const {
          issueSummary, copySubIssue, copyLinkIssue, sprint, 
        } = values;
        const copyConditionDTO = {
          issueLink: copyLinkIssue || false,
          sprintValues: sprint || false,
          subTask: copySubIssue || false,
          summary: issueSummary || false,
        };
        window.console.log(copyConditionDTO);
        this.setState({
          loading: true,
        });
        cloneIssue(issueId, copyConditionDTO).then((res) => {
          this.setState({
            loading: false,
          });
          this.props.onOk();
        });
      }
    });
  };

  render() {
    const {
      visible, onCancel, onOk, issueId, issueNum, issueSummary, 
    } = this.props;
    const { getFieldDecorator } = this.props.form;
  
    return (
      <Modal
        className="c7ntest-copyIssue"
        title={<FormattedMessage id="issue_copy_title" values={{ issueNum }} />}
        visible={visible || false}
        onOk={this.handleCopyIssue}
        onCancel={onCancel}
        okText={<FormattedMessage id="copy" />}
        cancelText={<FormattedMessage id="cancel" />}
        confirmLoading={this.state.loading}
      >
        <Form layout="vertical">
          {/* <FormItem>
            {getFieldDecorator('issueSummary', {
              rules: [{ required: true, message: '请输入概要' }],
              initialValue: issueSummary,
            })(
              <Input
                label={<FormattedMessage id="issue_issueFilterBySummary" />}
                prefix="CLONE - "
                maxLength={44}
              />,
            )}
          </FormItem> */}
          {/* {
            this.props.issue.closeSprint.length || this.props.issue.activeSprint ? (
              <FormItem>
                {getFieldDecorator('sprint', {})(
                  <Checkbox>
                    <FormattedMessage id="issue_copy_copySprint" />
                  </Checkbox>,
                )}
              </FormItem>
            ) : null
          } */}
          {/* {
            this.props.issue.subIssueDTOList.length ? (
              <FormItem>
                {getFieldDecorator('copySubIssue', {})(
                  <Checkbox>
                    是否复制子任务
                  </Checkbox>,
                )}
              </FormItem>
            ) : null
          } */}
          {/* {
            this.props.issueLink.length ? (
              <FormItem>
                {getFieldDecorator('copyLinkIssue', {})(
                  <Checkbox>
                    <FormattedMessage id="issue_copy_copyLinkIssue" />
                  </Checkbox>,
                )}
              </FormItem>
            ) : null
          } */}
        </Form>
      </Modal>
    );
  }
}
export default Form.create({})(withRouter(CopyIssue));
