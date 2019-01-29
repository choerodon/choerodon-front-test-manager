import React, { Component } from 'react';
import {
  Table, Button, Icon, Card, Spin, Tooltip,
} from 'choerodon-ui';
import { Page, Header, Content } from 'choerodon-front-boot';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { RichTextShow, User, StatusTags } from '../../../../components/CommonComponent';
import {
  delta2Html, delta2Text, executeDetailLink, executeDetailShowLink, beforeTextUpload,
} from '../../../../common/utils';
import {
  addDefects, editCycle, removeDefect,
} from '../../../../api/ExecuteDetailApi';
import { uploadFile, deleteAttachment } from '../../../../api/FileApi';
import './ExecuteDetail.scss';
import { StepTable, TestExecuteInfo, ExecuteDetailSide } from '../../../../components/ExecuteComponent';
import ExecuteDetailStore from '../../../../store/project/TestExecute/ExecuteDetailStore';

function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < 30;
  if (!isLt2M) {
    // console.log('不能超过30MB!');
  }
  return isLt2M;
}
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
  quickOperate: {
    border: '1px solid #00BF96',
    borderRadius: '2px',
    marginLeft: 15,
    padding: '1px 5px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

@observer
class ExecuteDetail extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    ExecuteDetailStore.clearPagination();
    ExecuteDetailStore.getInfo(id);
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  goExecute = (mode) => {
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
      ExecuteDetailStore.clearPagination();
    }
  }

  handleToggleExecuteDetailSide = () => {
    const visible = ExecuteDetailStore.ExecuteDetailSideVisible;
    ExecuteDetailStore.setExecuteDetailSideVisible(!visible);
  }

  handleFileRemove = (file) => {
    if (file.url) {
      ExecuteDetailStore.enterloading();
      deleteAttachment(file.uid).then((data) => {
        // window.console.log(data);
        ExecuteDetailStore.getInfo();
      });
      // 写服务端删除逻辑
    }
  }

  handleUpload = (files) => {
    if (beforeUpload(files[0])) {
      const formData = new FormData();
      [].forEach.call(files, (file) => {
        formData.append('file', file);
      });
      const config = {
        bucketName: 'test',
        comment: '',
        attachmentLinkId: ExecuteDetailStore.getCycleData.executeId,
        attachmentType: 'CYCLE_CASE',
      };
      ExecuteDetailStore.enterloading();
      uploadFile(formData, config).then(() => {
        ExecuteDetailStore.getInfo();
      }).catch(() => {
        Choerodon.prompt('网络异常');
      });
    }
  }

  handleCommentSave = (value) => {
    beforeTextUpload(value, {}, this.handleSubmit, 'comment');
  }

  handleSubmit = (updateData) => {
    const cycleData = ExecuteDetailStore.getCycleData;
    const newData = { ...cycleData, ...updateData };
    newData.assignedTo = newData.assignedTo || 0;
    // 删除一些不必要字段
    delete newData.defects;
    delete newData.caseAttachment;
    delete newData.testCycleCaseStepES;
    delete newData.lastRank;
    delete newData.nextRank;

    editCycle(newData).then((Data) => {
      this.ExecuteDetailSide.HideFullEditor();
      ExecuteDetailStore.getInfo();
    }).catch((error) => {
      Choerodon.prompt('网络异常');
    });
  }

  quickPass=(e) => {
    e.stopPropagation();
    this.quickPassOrFail('通过');
  }

  quickFail=(e) => {
    e.stopPropagation();
    this.quickPassOrFail('失败');
  }

  quickPassOrFail=(text) => {
    const cycleData = { ...ExecuteDetailStore.getCycleData };
    const statusList = ExecuteDetailStore.statusList;
    if (_.find(statusList, { projectId: 0, statusName: text })) {
      cycleData.executionStatus = _.find(statusList, { projectId: 0, statusName: text }).statusId;
      delete cycleData.defects;
      delete cycleData.caseAttachment;
      delete cycleData.testCycleCaseStepES;
      delete cycleData.lastRank;
      delete cycleData.nextRank;
      cycleData.assignedTo = cycleData.assignedTo || 0;
      ExecuteDetailStore.enterloading();
      editCycle(cycleData).then((Data) => {
        ExecuteDetailStore.getInfo();
      }).catch((error) => {
        ExecuteDetailStore.unloading();
        Choerodon.prompt('网络错误');
      });
    } else {
      Choerodon.prompt('未找到对应状态');
    }
  }

  render() {
    const { disabled } = this.props;
    const loading = ExecuteDetailStore.loading;
    const detailList = ExecuteDetailStore.getDetailList;
    const historyList = ExecuteDetailStore.getHistoryList;
    const historyPagination = ExecuteDetailStore.getHistoryPagination;
    const cycleData = ExecuteDetailStore.getCycleData;
    const visible = ExecuteDetailStore.ExecuteDetailSideVisible;
    const fileList = ExecuteDetailStore.getFileList;
    const {
      nextExecuteId, lastExecuteId, issueInfosDTO, executionStatus,
    } = cycleData;
    const { statusColor, statusName } = ExecuteDetailStore.getStatusById(executionStatus);
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
      width: '25%',
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
            ExecuteDetailStore.getInfo();
          }}
          >
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>

          </Button>
        </Header>

        <Spin spinning={loading}>
          <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 107px)' }}>
            {/* 左边内容区域 */}
            <div style={{
              flex: 1, overflowX: 'hidden', overflowY: 'auto', padding: 20,
            }}
            >
              <div style={{ marginBottom: 24 }}>
                {issueInfosDTO && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <StatusTags
                      style={{ height: 20, lineHeight: '20px', marginRight: 15 }}
                      color={statusColor}
                      name={statusName}
                    />
                    <span style={{ fontSize: '20px' }}>{issueInfosDTO.summary}</span>
                    <Button funcType="flat" type="primary" onClick={this.handleToggleExecuteDetailSide}>
                      <Icon type={visible ? 'format_indent_decrease' : 'format_indent_increase'} />
                      {visible ? '隐藏详情' : '打开详情'}
                    </Button>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '14px' }}>
                快速操作:                
                <span
                  style={{
                    ...styles.quickOperate,
                    color: '#00BF96',
                    borderColor: '#00BF96',
                  }}
                  role="button"
                  onClick={this.quickPass}
                >
                  通过
                </span>
                <span
                  style={{
                    ...styles.quickOperate,
                    color: '#F44336',
                    borderColor: '#F44336',
                  }}
                  role="button"
                  onClick={this.quickFail}
                >
                  失败
                </span>
              </div>

              {/* <TestExecuteInfo disabled={disabled} /> */}
              <Card
                title={null}
                style={{ marginBottom: 24, marginTop: 24 }}
                bodyStyle={styles.cardBodyStyle}
              >
                <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                  <span style={styles.cardTitleText}><FormattedMessage id="execute_testDetail" /></span>
                  <span style={{ marginLeft: 5 }}>{`（${detailList.length}）`}</span>
                </div>
                <StepTable disabled={disabled} />

              </Card>
              <Card
                title={null}
                bodyStyle={styles.cardBodyStyle}
              >
                <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
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
            </div>
            {/* 右侧侧边栏 */}
            <ExecuteDetailSide
              ref={this.saveRef('ExecuteDetailSide')}
              visible={visible}
              issueInfosDTO={issueInfosDTO}
              cycleData={cycleData}
              fileList={fileList}
              onFileRemove={this.handleFileRemove}
              status={{ statusColor, statusName }}
              onClose={this.handleToggleExecuteDetailSide}
              onUpload={this.handleUpload}
              onSubmit={this.handleSubmit}
              onCommentSave={this.handleCommentSave}
            />
          </div>
        </Spin>
      </Page>
    );
  }
}


export default withRouter(ExecuteDetail);
