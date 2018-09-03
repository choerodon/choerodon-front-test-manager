import React, { Component } from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import {
  Table, Button, Tooltip, Input, Dropdown, Menu, Pagination,
  Spin, Icon, Select,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import moment from 'moment';
import IssueStore from '../../../store/project/IssueStore';
import DragTable from '../../DragTable';
import UserHead from '../UserHead';
import PriorityTag from '../PriorityTag';
import StatusTag from '../StatusTag';
import TypeTag from '../TypeTag';
import { TYPE_NAME } from '../../../common/Constant';

@observer
class IssueTable extends Component {
  renderTestIssue(issue) {
    const {
      issueId,
      typeCode, issueNum, summary, assigneeId, assigneeName, assigneeImageUrl, reporterId,
      reporterName, reporterImageUrl, statusName, statusColor, priorityName, priorityCode,
      epicName, epicColor, componentIssueRelDTOList, labelIssueRelDTOList,
      versionIssueRelDTOList, creationDate, lastUpdateDate,
    } = issue;
    return (
      // <Draggable key={issueId} draggableId={issueId}>
      //   {(provided, snapshot) => (
      <div
        // ref={provided.innerRef}
        // {...provided.draggableProps}
        // {...provided.dragHandleProps}
        style={{
          display: 'flex', flex: 1, marginTop: '3px', flexDirection: 'column', marginBottom: '3px', cursor: 'pointer',
        }}
      >
        <div style={{
          display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer',
        }}
        >
          <div>
            {IssueStore.keyCode}
          </div>
          <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueType" values={{ type: TYPE_NAME[typeCode] }} />}>
            <div>
              <TypeTag
                type={{
                  typeCode,
                }}
              />
            </div>
          </Tooltip>
          <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueNum" values={{ num: issueNum }} />}>
            <a style={{
              paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            >
              {issueNum}
            </a>
          </Tooltip>
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
          <div className="c7n-flex-space" />
          {
            assigneeId && reporterName ? (
              <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueReport" values={{ report: reporterName }} />}>
                <div style={{ margin: '0 5px' }}>
                  <UserHead
                    user={{
                      id: reporterId,
                      loginName: '',
                      realName: reporterName,
                      avatar: reporterImageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }
          {
            assigneeId && reporterName
              ? (
                <div style={{ margin: '0 5px' }}>
                  <FormattedMessage id="issue_issueReportTo" />
                </div>
              ) : null
          }
          {
            assigneeId ? (
              <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueAssign" values={{ assign: assigneeName }} />}>
                <div style={{ margin: '0 5px' }}>
                  <UserHead
                    user={{
                      id: assigneeId,
                      loginName: '',
                      realName: assigneeName,
                      avatar: assigneeImageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }
          <div style={{ margin: '0 5px' }}>
            <FormattedMessage id="issue_issueUpdateOn" />
          </div>
          <Icon type="today" style={{ margin: '0 5px' }} />
          <div style={{ marginRight: 12 }}>
            {moment(lastUpdateDate).format('LL')}
          </div>
          <div style={{ flexShrink: '0', display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issueStatus" values={{ status: statusName }} />}>
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
        </div>
        {/* 第二行 */}
        <div style={{
          display: 'flex', flex: 1, marginTop: '3px', alignItems: 'center', marginBottom: '3px', cursor: 'pointer',
        }}
        >
          <div style={{ flexShrink: '0' }}>
            <Tooltip mouseEnterDelay={0.5} title={<FormattedMessage id="issue_issuePriority" values={{ priority: priorityName }} />}>
              <div style={{ marginRight: 5 }}>
                <PriorityTag
                  priority={{
                    priorityCode,
                    priorityName,
                  }}
                />
              </div>
            </Tooltip>
          </div>
          {
            versionIssueRelDTOList.map(version => (
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
          }
          {
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
          }
          {componentIssueRelDTOList.length > 0 ? (
            <div style={{ margin: '0 5px', color: '#3F51B5', fontWeight: 500 }}>
              {
                componentIssueRelDTOList.map(component => component.name).join(',')
              }
            </div>
          ) : null}
          <div style={{ margin: '0 5px', fontSize: '13px', color: 'rgba(0,0,0,0.65)' }}>
            <FormattedMessage id="issue_issueCreateAt" />
          </div>
          <Icon type="today" style={{ margin: '0 5px' }} />
          {moment(creationDate).format('LL')}
          <div className="c7n-flex-space" />
          {/* 标签 */}
          {
            labelIssueRelDTOList.map(label => (
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
          }
        </div>
      </div>
      // )
      //   }
      // </Draggable>
    );
  }

  renderWideIssue(issue) {
    return (
      <div style={{
        display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer',
      }}
      >
        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[issue.typeCode]}`}>
          <div>
            <TypeTag
              type={{
                typeCode: issue.typeCode,
              }}
            />
          </div>
        </Tooltip>
        <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${issue.issueNum}`}>
          <a style={{
            paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
          >
            {issue.issueNum}
          </a>
        </Tooltip>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
            <p style={{
              paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset',
            }}
            >
              {issue.summary}
            </p>
          </Tooltip>
        </div>

        <div style={{ flexShrink: '0' }}>
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
        <div style={{ flexShrink: '0' }}>
          {
            issue.assigneeId ? (
              <Tooltip mouseEnterDelay={0.5} title={`任务经办人： ${issue.assigneeName}`}>
                <div style={{ marginRight: 12 }}>
                  <UserHead
                    user={{
                      id: issue.assigneeId,
                      loginName: '',
                      realName: issue.assigneeName,
                      avatar: issue.imageUrl,
                    }}
                  />
                </div>
              </Tooltip>
            ) : null
          }
        </div>
        <div style={{ flexShrink: '0', display: 'flex', justifyContent: 'flex-end' }}>
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
      </div>
    );
  }

  renderNarrowIssue(issue) {
    return (
      <div style={{ marginTop: '5px', marginBottom: '5px', cursor: 'pointer' }}>
        <div style={{
          display: 'flex', marginBottom: '5px', width: '100%', flex: 1,
        }}
        >
          <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[issue.typeCode]}`}>
            <div>
              <TypeTag
                type={{
                  typeCode: issue.typeCode,
                }}
              />
            </div>
          </Tooltip>
          <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${issue.issueNum}`}>
            <a style={{
              paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
            >
              {issue.issueNum}
            </a>
          </Tooltip>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${issue.summary}`}>
              <p style={{
                paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset',
              }}
              >
                {issue.summary}
              </p>
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
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
            <div style={{ width: '140px', flexShrink: '0' }}>
              {
                issue.assigneeId ? (
                  <Tooltip mouseEnterDelay={0.5} title={`任务经办人： ${issue.assigneeName}`}>
                    <div style={{ marginRight: 12 }}>
                      <UserHead
                        user={{
                          id: issue.assigneeId,
                          loginName: '',
                          realName: issue.assigneeName,
                          avatar: issue.imageUrl,
                        }}
                      />
                    </div>
                  </Tooltip>
                ) : null
              }
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
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
        </div>
      </div>
    );
  }

  render() {
    const {
      expand, selectedIssue, setSelectIssue, setExpand,
    } = this.props;
    const columns = [
      {
        title: 'summary',
        dataIndex: 'summary',
        render: (summary, record) => (
          expand ? this.renderNarrowIssue(record) : this.renderTestIssue(record)
        ),
      },
    ];
    return (
      <Droppable droppableId="dropTable">
        {(provided, snapshot) => (
          <div ref={provided.innerRef}>
            {
              _.slice(IssueStore.issues).map((issue, i) => (
                <Draggable key={issue.issueId} draggableId={issue.issueId} index={i}>
                  {
                    (provided, snapshot) => (
                      <div
                        role="none"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}                        
                        className={issue.issueId === selectedIssue.issueId ? 'c7n-border-visible c7n-table-item' : 'c7n-border c7n-table-item'}
                        onClick={() => {
                          console.log('click');
                          setExpand(true);
                          setSelectIssue(issue);                
                        }}
                      >
                        {expand
                          ? this.renderNarrowIssue(issue)
                          : this.renderTestIssue(issue)}
                      </div>
                    )
                  }
                </Draggable>
              ))
            }
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      // <DragTable
      //   disableContext
      //   rowKey={record => record.issueId}
      //   columns={columns}
      //   dataSource={_.slice(IssueStore.issues)}
      //   filterBar={false}
      //   showHeader={false}
      //   scroll={{ x: true }}
      //   loading={IssueStore.loading}
      //   onChange={this.handleTableChange}
      //   pagination={false}
      //   onRow={record => ({
      //     onClick: () => {
      //       console.log('click');
      //       setExpand(true);
      //       setSelectedIssue(record);
      //       // IssueStore.setSelectedIssue(record);
      //       // IssueStore.setExpand(true);
      //       // this.setState({
      //       //   selectedIssue: record,
      //       //   expand: true,
      //       // });
      //     },
      //   })
      //   }
      //   rowClassName={(record, index) => (
      //     record.issueId === selectedIssue.issueId ? 'c7n-border-visible' : 'c7n-border')}
      //   dragKey="issueId"
      // />
    );
  }
}

IssueTable.propTypes = {

};

export default IssueTable;
