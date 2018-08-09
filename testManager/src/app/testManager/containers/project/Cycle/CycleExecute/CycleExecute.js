import React, { Component } from 'react';
import { Table, Button, Icon, Card, Spin, Tooltip } from 'choerodon-ui';
import { Page, Header, Content } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { RichTextShow, User } from '../../../../components/CommonComponent';
// import EditTestDetail from '../../../../components/EditTestDetail';
import { delta2Html, delta2Text } from '../../../../common/utils';
import './CycleExecute.less';
import { StepTable, TestExecuteInfo } from '../../../../components/ExecuteComponent';
import CycleExecuteStore from '../../../../store/project/cycle/CycleExecuteStore';

const styles = {
  cardTitle: {
    fontWeight: 'bold',
    display: 'flex',
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px',
  },
  cardBodyStyle: {
    // maxHeight: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  cardContent: {

  },

};

@observer
class CycleExecute extends Component {
  state = {
    editVisible: false,
    editing: null,
  }
  componentDidMount() {
    const { id } = this.props.match.params;
    CycleExecuteStore.getInfo(id);
  }
  render() {
    const { editVisible, editing } = this.state;
    const loading = CycleExecuteStore.loading;
    const cycleData = CycleExecuteStore.getCycleData;
    // const detailList = CycleExecuteStore.getDetailList;
    const historyList = CycleExecuteStore.getHistoryList;
    const historyPagination = CycleExecuteStore.getHistoryPagination;
    // const detailPagination = CycleExecuteStore.getDetailPagination;
    // const that = this;
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
            return (<div
              className="c7n-text-dot"
            >
              {oldValue}
            </div>);
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
            return (<div
              className="c7n-text-dot"
            >
              {newValue}
            </div>);
          }
        }
      },
    }];


    const { executionStatus, executionStatusName,
      executionStatusColor, assigneeUser, lastUpdateUser,
      lastUpdateDate, comment, defects } = cycleData;
    return (
      <Page className="c7n-cycleExecute">
        <Header title={<div>
          <Tooltip
            title={Choerodon.getMessage('返回', 'return')}
            placement="bottom"
          // getTooltipContainer={that => that}
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
        </div>}
        >

          <Button onClick={() => CycleExecuteStore.getInfo()}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>

        <Spin spinning={loading}>
          <Content>
            <TestExecuteInfo />
            <Card
              title={null}
              style={{ marginBottom: 24 }}
              bodyStyle={styles.cardBodyStyle}
            >
              <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}><FormattedMessage id="execute_testDetail" /></span>
              </div>
              <StepTable />

            </Card>
            <Card
              title={null}
              // style={{ margin: 24 }}
              bodyStyle={styles.cardBodyStyle}
            >
              <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}><FormattedMessage id="execute_executeHistory" /></span>
              </div>
              <div style={{ padding: '0 20px' }}>
                <Table
                  filterBar={false}
                  dataSource={historyList}
                  columns={columnsHistory}
                  pagination={historyPagination}
                  onChange={CycleExecuteStore.loadHistoryList}
                />
              </div>
            </Card>
          </Content>
        </Spin>
      </Page>
    );
  }
}


export default withRouter(CycleExecute);
