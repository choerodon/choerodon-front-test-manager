import React, { Component } from 'react';
import {
  Table, Button, Icon, Card, Spin, Tooltip, 
} from 'choerodon-ui';
import { Page, Header, Content } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { RichTextShow, User } from '../../../../components/CommonComponent';
import {
  delta2Html, delta2Text, executeDetailLink, executeDetailShowLink, 
} from '../../../../common/utils';
import './ExecuteDetail.scss';
import { StepTable, TestExecuteInfo } from '../../../../components/ExecuteComponent';
import ExecuteDetailStore from '../../../../store/project/TestExecute/ExecuteDetailStore';

const styles = {
  cardTitle: {
    fontWeight: 500,
    display: 'flex',
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px',
  },
  cardBodyStyle: {
    // maxHeight: '100%',
    padding: 12,
    // overflow: 'hidden',
  },
};

@observer
class ExecuteDetail extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    ExecuteDetailStore.getInfo(id);
  }

  goExecute=(mode) => {
    const cycleData = ExecuteDetailStore.getCycleData;
    const { nextExecuteId, lastExecuteId } = cycleData;
    const { disabled, history } = this.props;
    const toExecuteId = mode === 'pre' ? lastExecuteId : nextExecuteId;
    if (toExecuteId) {
      if (disabled) {
        history.replace(executeDetailShowLink(toExecuteId));
      } else {
        history.replace(executeDetailLink(toExecuteId));
      }
    }
  }

  render() {
    const { disabled } = this.props;  
    const loading = ExecuteDetailStore.loading;
    const historyList = ExecuteDetailStore.getHistoryList;
    const historyPagination = ExecuteDetailStore.getHistoryPagination;
    const cycleData = ExecuteDetailStore.getCycleData;
    const { nextExecuteId, lastExecuteId, issueInfosDTO } = cycleData;
    const columnsHistory = [{
      title: <FormattedMessage id="execute_executive" />,
      dataIndex: 'user',
      key: 'user',
      render(user) {
        return (<User user={user} />);
      },
    }, {
      title: <FormattedMessage id="execute_executeTime" />,
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
    }, {
      title: 'Field',
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
                className="c7ntest-text-dot"
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
                className="c7ntest-text-dot"
              >
                {newValue}
              </div>
            );
          }
        }
      },
    }];

    return (
      <Page className="c7ntest-ExecuteDetail">
        <Header title={(
          <div className="c7ntest-center">
            <Tooltip
              title={Choerodon.getMessage('返回', 'return')}
              placement="bottom"
            >
              <Button
                type="primary"
                onClick={() => { this.props.history.goBack(); }}
                className="back-btn small-tooltip"
                shape="circle"
                size="large"
                icon="arrow_back"
              />
            </Tooltip>
            <span><FormattedMessage id="execute_detail" /></span>
            {/* <span 
              title={issueInfosDTO && issueInfosDTO.summary}
              style={{ display: 'inline-block', marginLeft: 15, width: 100 }}
              className="c7ntest-text-dot"
            >
              {issueInfosDTO && issueInfosDTO.summary}
            </span> */}
          </div>
        )}
        >
          <Button
            disabled={lastExecuteId === null}
            onClick={() => {
              this.goExecute('pre');
            }}
          >
            <Icon type="navigate_before" />
            <span><FormattedMessage id="execute_pre" /></span>
          </Button>
          <Button 
            disabled={nextExecuteId === null}
            onClick={() => {
              this.goExecute('next');
            }}
          >            
            <span><FormattedMessage id="execute_next" /></span>
            <Icon type="navigate_next" />
          </Button>
          <Button onClick={() => {
            // this.props.history.replace('55');
            ExecuteDetailStore.getInfo();
          }}
          >            
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
            
          </Button>
        </Header>

        <Spin spinning={loading}>
          <Content title={issueInfosDTO && `用例“${issueInfosDTO.summary}”的执行详情`}>
            <TestExecuteInfo disabled={disabled} />
            <Card
              title={null}
              style={{ marginBottom: 24 }}
              bodyStyle={styles.cardBodyStyle}
            >
              <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                {/* <Icon type="expand_more" /> */}
                <span style={styles.cardTitleText}><FormattedMessage id="execute_testDetail" /></span>
              </div>
              <StepTable disabled={disabled} />

            </Card>
            <Card
              title={null}
              // style={{ margin: 24 }}
              bodyStyle={styles.cardBodyStyle}
            >
              <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                {/* <Icon type="expand_more" /> */}
                <span style={styles.cardTitleText}><FormattedMessage id="execute_executeHistory" /></span>
              </div>
              <div style={{ padding: '0 20px' }}>
                <Table
                  filterBar={false}
                  dataSource={historyList}
                  columns={columnsHistory}
                  pagination={historyPagination}
                  onChange={ExecuteDetailStore.loadHistoryList}
                />
              </div>
            </Card>
          </Content>
        </Spin>
      </Page>
    );
  }
}


export default withRouter(ExecuteDetail);
