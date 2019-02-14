import React, { PureComponent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Table, Tooltip } from 'choerodon-ui';
import { delta2Html, delta2Text } from '../../../common/utils';
import { RichTextShow } from '../../CommonComponent';
import { getCycleHistiorys } from '../../../api/ExecuteDetailApi';

class ExecuteHistoryTable extends PureComponent {
  state={
    historyList: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 5,
    },
  }

  componentDidMount() {
    this.getHistoryList(this.state.pagination);
  }

  getHistoryList = (pagination) => {
    const { id } = this.props.match.params;
    getCycleHistiorys({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, id).then((history) => {
      this.setState({
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: history.totalElements,
        },
        historyList: history.content,
      });
    });
  }

  render() {
    const { historyList, pagination } = this.state;
    const columns = [{
      title: <FormattedMessage id="execute_executive" />,
      dataIndex: 'user',
      key: 'user',
      render(user) {
        return (
          <div style={{ width: 200 }}>
            {user ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  className="c7ntest-avatar"
                >
                  {user.realName.slice(0, 1)}
                </span>
                <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {`${user.loginName} ${user.realName}`}
                </span>
              </div>
            ) : '无'}
          </div>
        );
      },
    }, {
      title: <FormattedMessage id="execute_executeTime" />,
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
    }, {
      title: '字段',
      dataIndex: 'field',
      key: 'field',
    }, {
      title: <FormattedMessage id="execute_history_oldValue" />,
      dataIndex: 'oldValue',
      key: 'oldValue',
      render(oldValue, record) {
        switch (record.field) {
          case '注释': {
            return (
              <Tooltip title={<RichTextShow data={delta2Html(oldValue)} />}>
                <div
                  title={delta2Text(oldValue)}
                  style={{
                    width: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {delta2Text(oldValue)}
                </div>
              </Tooltip>
            );
          }
          default: {
            return (
              <div
                style={{
                  width: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {oldValue}
              </div>
            );
          }
        }
      },
    }, {
      title: <FormattedMessage id="execute_history_newValue" />,
      dataIndex: 'newValue',
      key: 'newValue',
      render(newValue, record) {
        switch (record.field) {
          case '注释': {
            return (
              <Tooltip title={<RichTextShow data={delta2Html(newValue)} />}>
                <div
                  style={{
                    width: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {delta2Text(newValue)}
                </div>
              </Tooltip>
            );
          }
          default: {
            return (
              <div
                style={{
                  width: 100,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {newValue}
              </div>
            );
          }
        }
      },
    }];
    return (
      <Table
        filterBar={false}
        dataSource={historyList}
        columns={columns}
        pagination={pagination}
        onChange={this.getHistoryList}
      />
    );
  }
}


export default ExecuteHistoryTable;
