import React from 'react';
import {
  Table, Button, Tooltip, Input, Dropdown, Menu, Pagination,
  Spin, Icon, Select, Popover,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import UserHead from '../UserHead';
import PriorityTag from '../PriorityTag';
import StatusTag from '../StatusTag';
import TypeTag from '../TypeTag';
import { TYPE_NAME } from '../../../common/Constant';

const styles = {
  issueNum: {
    paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};
export function renderType(typeCode) {
  return (
    <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[typeCode]}`}>
      <div>
        <TypeTag
          type={{
            typeCode,
          }}
        />
      </div>
    </Tooltip>
  );
}
export function renderIssueNum(issueNum) {
  return (
    <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueNum" values={{ num: issueNum }} />}>
      <a style={styles.issueNum}>
        {issueNum}
      </a>
    </Tooltip>
  );
}
export function renderSummary(summary) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={<FormattedMessage id="issue_issueSummary" values={{ summary }} />}>
        <p style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset',
        }}
        >
          {summary}
        </p>
      </Tooltip>
    </div>
  );
}
export function renderPriority(priorityCode, priorityName) {
  return (
    <div>
      <Tooltip mouseEnterDelay={0.5} title={`优先级： ${priorityName}`}>
        <div style={{ margin: '0 5px' }}>
          <PriorityTag
            priority={{
              priorityCode,
              priorityName,
            }}
          />
        </div>
      </Tooltip>
    </div>
  );
}
export function renderVersions(versions, priorityName) {
  return (
    versions.map(version => (
      <div
        style={{
          color: 'rgba(0,0,0,0.36)',
          height: 22,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'rgba(0,0,0,0.36)',
          borderRadius: '2px',
          fontSize: '13px',
          lineHeight: '20px',
          padding: '0 8px',
          margin: '0 5px',
        }}
      >
        {version.name}
      </div>
    ))
  );
}
export function renderEpic(epicName, epicColor) {
  return (
    epicName ? (
      <div
        style={{
          color: epicColor,
          height: 22,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: epicColor,
          borderRadius: '2px',
          fontSize: '13px',
          lineHeight: '20px',
          padding: '0 8px',
          margin: '0 5px',
        }}
      >
        {epicName}
      </div>
    ) : null
  );
}
export function renderComponents(components) {
  return (
    components.length > 0 ? (
      <div style={{ margin: '0 5px', color: '#3F51B5', fontWeight: 500 }}>
        {
          components.map(component => component.name).join(',')
        }
      </div>
    ) : null
  );
}
export function renderLabels(labels) {
  return (
    labels.map(label => (
      <div
        style={{
          color: '#000',
          borderRadius: '100px',
          fontSize: '13px',
          lineHeight: '20px',
          padding: '2px 12px',
          background: 'rgba(0, 0, 0, 0.08)',
          margin: '0 5px',
          // marginBottom: 3,
        }}
      >
        {label.labelName}
      </div>
    ))
  );
}
export function renderAssigned(assigneeId, assigneeName, imageUrl) {
  return (
    assigneeId ? (
      <Tooltip mouseEnterDelay={0.5} title={`任务经办人： ${assigneeName}`}>
        <div style={{ margin: '0 5px' }}>
          <UserHead
            user={{
              id: assigneeId,
              loginName: '',
              realName: assigneeName,
              avatar: imageUrl,
            }}
          />
        </div>
      </Tooltip>
    ) : null
  );
}
export function renderStatus(statusName, statusColor) {
  return (
    <div style={{ margin: '0 5px' }}>
      <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${statusName}`}>
        <div>
          <StatusTag
            status={{
              statusColor,
              statusName,
            }}
          />
        </div>
      </Tooltip>
    </div>
  );
}
