import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import UserHead from '../UserHead';
import PriorityTag from '../PriorityTag';
import StatusTag from '../StatusTag';
import TypeTag from '../TypeTag';

const styles = {
  issueNum: {
    padding: '0 12px 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
};
export function renderType(issueTypeDTO) {
  const { name } = issueTypeDTO || {};
  return (
    <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${name}`}>
      <div>
        <TypeTag
          type={issueTypeDTO || {}}
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
export function renderPriority(priorityDTO) {
  if (!priorityDTO) {
    return null;
  }
  const { name } = priorityDTO;
  return (
    <div>
      <Tooltip mouseEnterDelay={0.5} title={`优先级： ${name}`}>
        <div style={{ margin: '0 5px' }}>
          <PriorityTag
            priority={priorityDTO}
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
        className="c7ntest-text-dot"
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
export function renderFolder(folderName) {
  return (
    folderName ? (
      <div
        style={{
          color: '#4D90FE',
          height: 22,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#4D90FE',
          borderRadius: '2px',
          fontSize: '13px',
          lineHeight: '20px',
          padding: '0 8px',
          margin: '0 5px',
        }}
        className="c7ntest-text-dot"
      >
        {folderName}
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
export function renderStatus(statusMapDTO) {
  const { name: statusName } = statusMapDTO;
  return (
    <div style={{ margin: '0 5px' }}>
      <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${statusName}`}>
        <div>
          <StatusTag
            status={statusMapDTO}
          />
        </div>
      </Tooltip>
    </div>
  );
}
