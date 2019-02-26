import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import {
  Tooltip, Table, Button, Icon, 
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { renderPriority } from '../../../../../../components/IssueManageComponent/IssueTable/tags';
import {
  SelectFocusLoad, StatusTags, SmartTooltip,
} from '../../../../../../components/CommonComponent';
import { getUsers } from '../../../../../../api/IamApi';

class TestExecuteTable extends Component {
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    const {
      prioritys,
      currentCycle,
      statusList,
      onExecuteByChange,
      onAssignedToChange,
      treeAssignedTo,
      testList,
      quickPass,
      quickFail,
      onTableRowClick, 
      onExecuteTableChange,
      executePagination,
      tableLoading,
    } = this.props;
    const {
      cycleId, title, type, cycleCaseList,
    } = currentCycle;
    const prefix = <Icon type="filter_list" />;
    

    const columns = [
      //   {
      //   title: <span>ID</span>,
      //   dataIndex: 'issueNum',
      //   key: 'issueNum',
      //   flex: 1,
      //   render(issueId, record) {
      //     const { issueInfosDTO } = record;
      //     return (
      //       <div>
      //         {issueInfosDTO && (
      //         <Tooltip
      //           title={(
      //             <div>
      //               <div>{issueInfosDTO.issueNum}</div>
      //               {/* <div>{issueInfosDTO.summary}</div> */}
      //             </div>
      //           )}
      //         >
      //           <div
      //             className="c7ntest-text-dot"
      //             style={{
      //               width: 100, color: '#3F51B5',
      //             }}                
      //           >
      //             {issueInfosDTO.issueNum}
      //           </div>
      //         </Tooltip>
      //         )}
      //       </div>
      //     );
      //   },
      // }, 
      {
        title: <span>用例名称</span>,
        dataIndex: 'summary',
        key: 'summary',
        filters: [],
        flex: 2,
        render(issueId, record) {
          const { issueInfosDTO } = record;
          return (
            issueInfosDTO && (
              <SmartTooltip style={{ color: '#3F51B5' }}>
                {issueInfosDTO.summary}
              </SmartTooltip>
            )
          );
        },
      },
      // {
      //   title: <FormattedMessage id="bug" />,
      //   dataIndex: 'defects',
      //   key: 'defects',
      //   flex: 1,
      //   render: defects => (
      //     <Tooltip
      //       placement="topLeft"
      //       title={(
      //         <div>
      //           {defects.map((defect, i) => (
      //             defect.issueInfosDTO && (
      //               <div>
      //                 <Link
      //                   style={{
      //                     color: 'white',
      //                   }}
      //                   to={issueLink(defect.issueInfosDTO.issueId, defect.issueInfosDTO.typeCode, defect.issueInfosDTO.issueNum)}
      //                   target="_blank"
      //                 >
      //                   {defect.issueInfosDTO.issueNum}
      //                 </Link>
      //                 <div>{defect.issueInfosDTO.summary}</div>
      //               </div>
      //             )
      //           ))}
      //         </div>
      //       )}
      //     >
      //       {defects.map((defect, i) => defect.issueInfosDTO && defect.issueInfosDTO.issueNum).join(',')}
      //     </Tooltip>
      //   ),
      // },
      {
        title: <FormattedMessage id="cycle_executeBy" />,
        dataIndex: 'lastUpdateUser',
        key: 'lastUpdateUser',
        flex: 1,
        render(lastUpdateUser) {
          return (
            <div
              className="c7ntest-text-dot"
            >
              {lastUpdateUser && lastUpdateUser.realName}
            </div>
          );
        },
      },
      //  {
      //   title: <FormattedMessage id="cycle_executeTime" />,
      //   dataIndex: 'lastUpdateDate',
      //   key: 'lastUpdateDate',
      //   flex: 1,
      //   render(lastUpdateDate) {
      //     return (
      //       <div
      //         className="c7ntest-text-dot"
      //       >
      //         {lastUpdateDate && moment(lastUpdateDate).format('YYYY-MM-DD')}
      //       </div>
      //     );
      //   },
      // },
      {
        title: <FormattedMessage id="cycle_assignedTo" />,
        dataIndex: 'assigneeUser',
        key: 'assigneeUser',
        flex: 1,
        render(assigneeUser) {
          return (
            <div
              className="c7ntest-text-dot"
            >
              {assigneeUser && assigneeUser.realName}
            </div>
          );
        },
      }, {
        title: <span>用例优先级</span>,
        dataIndex: 'priorityId',
        key: 'priorityId',
        filters: prioritys.map(priority => ({ text: priority.name, value: priority.id.toString() })),
        flex: 1,
        render(issueId, record) {
          const { issueInfosDTO } = record;
          return (
            issueInfosDTO && renderPriority(issueInfosDTO.priorityDTO)
          );
        },
      }, {
        title: <FormattedMessage id="status" />,
        dataIndex: 'executionStatus',
        key: 'executionStatus',
        filters: statusList.map(status => ({ text: status.statusName, value: status.statusId.toString() })),
        flex: 1,
        render(executionStatus) {
          const statusColor = _.find(statusList, { statusId: executionStatus })
            ? _.find(statusList, { statusId: executionStatus }).statusColor : '';
          return (
            _.find(statusList, { statusId: executionStatus }) && (
              <StatusTags
                color={statusColor}
                name={_.find(statusList, { statusId: executionStatus }).statusName}
              />
            )
          );
        },
      },
      // {
      //   title: <span>执行描述</span>,
      //   dataIndex: 'comment',
      //   key: 'comment',
      //   filters: [],
      //   flex: 1,
      //   render(comment) {
      //     return (
      //       <Tooltip title={<RichTextShow data={delta2Html(comment)} />}>
      //         <div
      //           className="c7ntest-text-dot"
      //         >
      //           {delta2Text(comment)}
      //         </div>
      //       </Tooltip>
      //     );
      //   },
      // },
      {
        title: '',
        key: 'action',
        width: 90,
        render: (text, record) => (
          record.projectId !== 0
          && (
            <div style={{ display: 'flex' }}>
              <Tooltip title={<FormattedMessage id="execute_quickPass" />}>
                <Button shape="circle" funcType="flat" icon="check_circle" onClick={quickPass.bind(this, record)} />
              </Tooltip>
              <Tooltip title={<FormattedMessage id="execute_quickFail" />}>
                <Button shape="circle" funcType="flat" icon="cancel" onClick={quickFail.bind(this, record)} />
              </Tooltip>
            </div>
          )
        ),
      }];
    const nameColumn = {
      title: <FormattedMessage id="cycle_stageName" />,
      dataIndex: 'cycleName',
      key: 'cycleName',
      flex: 1,
      render(cycleName) {
        return (
          <div
            className="c7ntest-text-dot"
          >
            {cycleName}
          </div>
        );
      },
    };
    if (type === 'cycle') {
      columns.splice(4, 0, nameColumn);
    }
    return (
      <div>
        <div style={{ display: 'flex', marginBottom: 20, alignItems: 'center' }}>
          <div style={{
            fontWeight: 600,
            marginRight: 10,
            fontSize: '14px',
          }}
          >
          快速筛选:
          </div>
          <SelectFocusLoad
            className="c7ntest-select"
            placeholder={<FormattedMessage id="cycle_executeBy" />}
            request={getUsers}
            onChange={onExecuteByChange}
          />
          {treeAssignedTo === 0 && (
          <SelectFocusLoad
            style={{ marginLeft: 20, width: 200 }}
            className="c7ntest-select"
            placeholder={<FormattedMessage id="cycle_assignedTo" />}
            request={getUsers}
            onChange={onAssignedToChange}
          />
          )}
        </div>
        <Table
          rowKey={record => record.executeId}
          pagination={executePagination}
          loading={tableLoading}
          onChange={onExecuteTableChange}
          dataSource={testList}
          columns={columns}
          onRow={record => ({
            onClick: (event) => { onTableRowClick(record); },
          })}
        />
      </div>
    );
  }
}

TestExecuteTable.propTypes = {

};

export default TestExecuteTable;
