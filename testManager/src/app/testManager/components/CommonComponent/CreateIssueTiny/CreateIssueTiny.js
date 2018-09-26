import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { stores } from 'choerodon-front-boot';
import { Button, Input, Icon } from 'choerodon-ui';
import {
  STATUS, COLOR, TYPE, ICON, TYPE_NAME, 
} from '../../../common/Constant';
import { createIssue } from '../../../api/IssueApi';
import './CreateIssueTiny.scss';

const { AppState } = stores;
class CreateIssueTiny extends Component {
  state={
    create: false,
    createIssueValue: '',
    createLoading: false,
  }

  static defaultProps = {
    typeCode: 'issue_test',
  }

  handleBlurCreateIssue() {
    const { createIssueValue } = this.state;
    const { typeCode, onOk } = this.props;
    if (createIssueValue !== '') {
      const data = {
        priorityCode: 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: 0,
        summary: createIssueValue,
        typeCode,
        epicId: 0,
        parentIssueId: 0,
      };
      this.setState({
        createLoading: true,
      });
      createIssue(data)
        .then(() => {          
          this.setState({
            createIssueValue: '',
            createLoading: false,
          });
          if (onOk) {
            onOk();
          }
        }).catch((error) => {
          window.console.log(error);
        });
    }
  }

  render() {
    const { create, createLoading, createIssueValue } = this.state;
    const { typeCode } = this.props;
    return (create ? (
      <div className="c7n-CreateIssueTiny" style={{ display: 'block', width: '100%' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', alignItem: 'center' }}>
            <div
              className="c7n-sign"
              style={{
                backgroundColor: TYPE[typeCode],
                marginRight: 2,
              }}
            >
              <Icon
                style={{ fontSize: '14px' }}
                type={ICON[typeCode]}
              />
            </div>
          </div>
          <div style={{ marginLeft: 8, flexGrow: 1 }}>
            <Input
              autoFocus
              value={createIssueValue}
              placeholder={<FormattedMessage id="issue_whatToDo" />}
              onChange={(e) => {
                this.setState({
                  createIssueValue: e.target.value,
                });
              }}
              maxLength={44}
              onPressEnter={this.handleBlurCreateIssue.bind(this)}
            />
          </div>
        </div>
        <div style={{
          marginTop: 10, display: 'flex', marginLeft: 50, paddingRight: 70, 
        }}
        >
          <Button
            type="primary"
            onClick={() => {
              this.setState({
                create: false,
              });
            }}
          >
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            type="primary"
            loading={createLoading}
            onClick={this.handleBlurCreateIssue.bind(this)}
          >
            <FormattedMessage id="ok" />
          </Button>
        </div>
      </div>
    ) : (
      <Button
        className="leftBtn"
        style={{ color: '#3f51b5' }}
        funcType="flat"
        onClick={() => {
          this.setState({
            create: true,
            createIssueValue: '',
          });
        }}
      >
        <Icon type="playlist_add icon" />
        <span><FormattedMessage id="issue_issueCreate" /></span>
      </Button>
    ));
  }
}

CreateIssueTiny.propTypes = {

};

export default CreateIssueTiny;
