import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Popconfirm, Tooltip } from 'choerodon-ui';
import _ from 'lodash';

import {
  delta2Html, text2Delta, beforeTextUpload, formatDate, 
} from '../../../../common/utils';
import { deleteLink } from '../../../../api/IssueApi';
import PriorityTag from '../../PriorityTag';
import StatusTag from '../../StatusTag';
import TypeTag from '../../TypeTag';
import { issueLink } from '../../../../common/utils';

class LinkList extends Component {
  confirm(issueId, e) {
    this.handleDeleteIssue(issueId);
  }

  handleDeleteIssue(linkId) {
    deleteLink(linkId)
      .then((res) => {
        this.props.onRefresh();
      });
  }

  render() {
    const { issue, i } = this.props;
    const Reg = /被/g;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 10px',
          cursor: 'pointer',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          borderTop: !i ? '1px solid rgba(0, 0, 0, 0.12)' : '',
        }}
      >
        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${issue.typeCode}`}>
          <div>
            <TypeTag
              type={{
                typeCode: issue.typeCode,
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title={`编号概要： ${issue.issueNum} ${issue.summary}`}>
          <div style={{ marginLeft: 8, flex: 1, overflow: 'hidden' }}>
            <p
              style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, color: 'rgb(63, 81, 181)', 
              }}
              role="none"
              // onClick={() => {
              //   this.props.onOpen(issue.issueId, issue.linkedIssueId);
              // }}
            >
              <Link to={issueLink(Reg.test(issue.ward) ? issue.issueId : issue.linkedIssueId, issue.typeCode)} target="_blank">
                {`${issue.issueNum} ${issue.summary}`}
              </Link>
            </p>
          </div>
        </Tooltip>
        <div style={{ width: '34px', marginRight: '15px', overflow: 'hidden' }}>
          <Tooltip mouseEnterDelay={0.5} title={`优先级： ${issue.priorityName}`}>
            <div style={{ marginRight: 12 }}>
              <PriorityTag
                priority={{
                  priorityCode: issue.priorityCode,
                  priorityName: issue.priorityName,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div style={{
          width: '48px', marginRight: '15px', display: 'flex', justifyContent: 'flex-end', 
        }}
        >
          <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${issue.statusName}`}>
            <div>
              <StatusTag
                status={{
                  statusColor: issue.statusColor,
                  statusName: issue.statusName,
                }}
              />
            </div>
          </Tooltip>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px',
          }}
        >
          <Popconfirm
            title="确认要删除该问题链接吗?"
            placement="left"
            onConfirm={this.confirm.bind(this, issue.linkId)}
            onCancel={this.cancel}
            okText="删除"
            cancelText="取消"
            okType="danger"
          >
            <Icon type="delete_forever mlr-3 pointer" />
          </Popconfirm>
        </div>
      </div>
    );
  }
}

export default LinkList;
