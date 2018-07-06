import React, { Component } from 'react';
import { Table, Button, Icon, Card, Select, Spin, Upload, Tooltip } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { TextEditToggle, RichTextShow } from '../../../../components/CommonComponent';
import EditTestDetail from '../../../../components/EditTestDetail';
import FullEditor from '../../../../components/FullEditor';
import { getCycle, getCycleDetails, getStatusList, getUsers, editCycle, getCycleHistiorys, deleteAttachment } from '../../../../../api/CycleExecuteApi';
import { uploadFile } from '../../../../../api/CommonApi';
import { delta2Html, delta2Text } from '../../../../common/utils';

import './CycleExecute.less';

const { AppState } = stores;
const Option = Select.Option;
const Text = TextEditToggle.Text;
const Edit = TextEditToggle.Edit;

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
    maxHeight: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  cardContent: {

  },
  carsContentItemPrefix: {
    width: 105,
    color: 'rgba(0,0,0,0.65)',
    fontSize: 13,
  },
  cardContentItem: {
    display: 'flex',
    marginLeft: 24,
    marginTop: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
    lineHeight: '20px',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
  userOption: {
    background: '#c5cbe8',
    color: '#6473c3',
    width: '20px',
    height: '20px',
    textAlign: 'center',
    lineHeight: '20px',
    borderRadius: '50%',
    marginRight: '8px',
  },
};
function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < 30;
  if (!isLt2M) {
    // console.log('不能超过30MB!');
  }
  return isLt2M;
}
class CycleExecute extends Component {
  state = {
    fileList: [],
    loading: false,
    edit: false,
    selectLoading: false,
    editVisible: false,
    editing: null,
    userList: [], // 用户列表
    statusList: [], // 状态列表
    stepStatusList: [],
    detailList: [],
    detailPagination: {
      current: 1,
      total: 0,
      pageSize: 5,
    },
    historyList: [],
    historyPagination: {
      current: 1,
      total: 0,
      pageSize: 5,
    },
    cycleData: {
      executeId: null,
      cycleId: null, // 循环id
      // issueId: 1,              //
      reporterJobNumber: null,
      reporterRealName: null, //    
      assignedTo: null,
      assignedUserJobNumber: null,
      assignedUserRealName: null, // 
      lastUpdateDate: null, // 执行时间
      caseAttachment: [], //
      comment: null, // 注释

      defects: [], // 缺陷
      // statusId: null,
      // executeId: 1, // 执行id
      executionStatus: null, // 执行状态
      executionStatusColor: null, // 状态颜色
      executionStatusName: null,
      lastRank: null, //
      nextRank: null, //
      objectVersionNumber: 1, //
      rank: '0|c00000:', //
      // testCycleCaseStepES: [], //
    },
  }
  componentDidMount() {
    // this.getTestInfo();
    // this.getUserList();
    this.getInfo();
  }
  getInfo = () => {
    this.setState({ loading: true });
    const { historyPagination, detailPagination } = this.state;
    Promise.all([getCycle(), getStatusList('CYCLE_CASE'), getCycleDetails({
      page: detailPagination.current - 1,
      size: detailPagination.pageSize,
    }, 1),
    getStatusList('CASE_STEP'), getCycleHistiorys({
      page: historyPagination.current - 1,
      size: historyPagination.pageSize,
    }, 1)])
      .then(([cycleData, statusList, detailData, stepStatusList, historyData]) => {
        const { caseAttachment } = cycleData;
        const fileList = caseAttachment.map((attachment) => {
          const { url, attachmentName, id } = attachment;
          return {
            uid: id,
            name: attachmentName,
            status: 'done',
            url,
          };
        });
        this.setState({
          fileList,
          cycleData,
          statusList,
          detailList: detailData.content,
          detailPagination: {
            current: detailPagination.current,
            pageSize: detailPagination.pageSize,
            total: detailData.totalElements,
          },
          stepStatusList,
          historyPagination: {
            current: historyPagination.current,
            pageSize: historyPagination.pageSize,
            total: historyData.totalElements,
          },
          historyList: historyData.content,
          loading: false,
        });
        this.setStatusAndColor(this.state.cycleData.executionStatus, statusList);
      }).catch((error) => {
        Choerodon.prompt('网络异常');
        this.setState({
          loading: false,
        });
      });
  }
  getHistoryList = (pagination) => {
    getCycleHistiorys({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, 1).then((history) => {
      this.setState({
        historyPagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: history.totalElements,
        },
        historyList: history.content,
      });
    });
  }
  getDetailList = (pagination) => {
    getCycleDetails({
      page: pagination.current - 1,
      size: pagination.pageSize,
    }, 1).then((detail) => {
      this.setState({
        detailPagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: detail.totalElements,
        },
        detailList: detail.content,
      });
    });
  }
  setStatusAndColor = (status, statusList) => {
    this.setState({
      cycleData: {
        ...this.state.cycleData,
        ...{
          executionStatusName: _.find(statusList, { statusId: status }) &&
            _.find(statusList, { statusId: status }).statusName,
          executionStatus: status,
          executionStatusColor:
           _.find(statusList, { statusId: status }) && 
           _.find(statusList, { statusId: status }).statusColor,
        },
      },
    });
  }

  handleAssignedChange = (assigned) => {
    const { userList } = this.state;
    const target = _.find(userList, { realName: assigned });
    if (target) {
      this.setState({
        cycleData: {
          ...this.state.cycleData,
          ...{
            assignedTo: target.id,
            reporterRealName: assigned,
            reporterJobNumber: target.loginName,
          },
        },
      });
    } else {
      this.setState({
        cycleData: {
          ...this.state.cycleData,
          ...{
            assignedTo: 0,
            reporterRealName: null,
            reporterJobNumber: null,
          },
        },
      });
    }
  }
  submit = (originData) => {
    // window.console.log('submit', originData);
    const { cycleData } = this.state;
    // 删除一些不必要字段
    delete cycleData.defects;
    delete cycleData.caseAttachment;
    delete cycleData.testCycleCaseStepES;
    delete cycleData.lastRank;
    delete cycleData.nextRank;
    this.setState({ loading: true });
    editCycle(this.state.cycleData).then((Data) => {
      this.setState({
        cycleData: Data,
        edit: false,
      });
      this.setStatusAndColor(Data.executionStatus, this.state.statusList);
      // window.console.log(cycleData);
      this.getInfo();
    }).catch((error) => {
      Choerodon.prompt('网络异常');
      this.setState({
        originData,
      });
      this.setStatusAndColor(originData.executionStatus, this.state.statusList);
    });
  }
  handleUpload = (e) => {
    if (beforeUpload(e.target.files[0])) {
      // console.log(e.target.files);
      const formData = new FormData();
      [].forEach.call(e.target.files, (file) => {
        // file.name = encodeURI(encodeURI(file.name));
        formData.append('file', file);
      });

      // formData.append('file', e.target.files[0]);
      // this.setState({
      //   fileList: [...this.state.fileList, ...[{
      //     uid: Math.random(),
      //     name: e.target.files[0].name,
      //     status: 'done',
      //     url: 'response',
      //   }]],
      // });
      const config = {
        bucketName: 'test',
        // fileName: e.target.files[0].name,
        comment: '',
        attachmentLinkId: this.state.cycleData.executeId,
        attachmentType: 'CYCLE_CASE',
      };
      // this.setState({ loading: true });
      uploadFile(formData, config).then(() => {
        this.getInfo();
      }).catch(() => {
        Choerodon.prompt('网络异常');
      });
    }
  }
  cancelEdit = (originData) => {
    let { cycleData } = this.state;
    cycleData = { ...cycleData, ...originData };
    this.setState({ cycleData });
  }
  handleCommentSubmit = (value) => {
    const { cycleData } = this.state;
    // 删除一些不必要字段
    delete cycleData.defects;
    delete cycleData.caseAttachment;
    delete cycleData.testCycleCaseStepES;
    delete cycleData.lastRank;
    delete cycleData.nextRank;
    this.setState({ loading: true });
    editCycle({ ...this.state.cycleData, ...{ comment: JSON.stringify(value) } }).then((Data) => {
      this.setState({
        cycleData: Data,
        edit: false,
        loading: false,
      });
      this.setStatusAndColor(Data.executionStatus, this.state.statusList);
      // window.console.log(cycleData);
      this.getInfo();
    }).catch((error) => {
      Choerodon.prompt('网络异常');
      this.setState({ loading: false });
    });
  }
  handleStatusChange = (status) => {
    this.setStatusAndColor(status, this.state.statusList);
  }
  handleHistoryTableChange = (pagination, filters, sorter) => {
    this.getHistoryList(pagination);
  }
  handleDetailTableChange = (pagination, filters, sorter) => {
    this.getDetailList(pagination);
  }
  render() {
    const { fileList, userList, stepStatusList, detailList, historyList, loading, cycleData,
      statusList, selectLoading, historyPagination, detailPagination, editVisible, editing }
      = this.state;
    const that = this;
    const props = {
      onRemove: (file) => {
        // window.console.log(file);
        // const fileList = this.state.fileList.slice();
        // const index = fileList.indexOf(file);
        // const newFileList = fileList.slice();
        if (file.url) {
          this.setState({
            loading: true,
          });
          deleteAttachment(file.uid).then((data) => {
            // window.console.log(data);
            this.getInfo();
          }).then(() => {
            this.setState({
              loading: false,
            });
            Choerodon.prompt('网络异常');
          });
          // 写服务端删除逻辑
        }
      },
    };
    const columnsHistory = [{
      title: '执行方',
      dataIndex: 'user',
      key: 'user',
      render(user) {
        return (<div style={{ width: 100 }}>
          {user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                className="c7n-avatar"
              >
                {user.realName.slice(0, 1)}
              </span>
              <span>
                {`${user.loginName} ${user.realName}`}
              </span>
            </div>
          ) : '无'}
        </div>);
      },
    }, {
      title: '执行日期',
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
    }, {
      title: 'Field',
      dataIndex: 'field',
      key: 'field',
    }, {
      title: '原值',
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
              style={{
                width: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {oldValue}
            </div>);
          }
        }
      },
      // render(oldValue) {
      //   return (
      //     <div style={{
      //       background: _.find(statusList, { statusName: oldValue }).statusColor,
      //       width: 60,
      //       textAlign: 'center',
      //       borderRadius: '100px',
      //       display: 'inline-block',
      //       color: 'white',
      //     }}
      //     >
      //       {oldValue}
      //     </div>);
      // },
    }, {
      title: '新值',
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
              style={{
                width: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {newValue}
            </div>);
          }
        }
      },
      // render(newValue) {
      //   return (
      //     <div style={{
      //       background: _.find(statusList, { statusName: newValue }).statusColor,
      //       width: 60,
      //       textAlign: 'center',
      //       borderRadius: '100px',
      //       display: 'inline-block',
      //       color: 'white',
      //     }}
      //     >
      //       {newValue}
      //     </div>);
      // },
    }];
    const columns = [{
      title: '测试步骤',
      dataIndex: 'testStep',
      key: 'testStep',
    }, {
      title: '测试数据',
      dataIndex: 'testData',
      key: 'testData',
    }, {
      title: '预期结果',
      dataIndex: 'expectedResult',
      key: 'expectedResult',
    }, {
      title: '步骤附件',
      dataIndex: 'caseAttachment',
      key: 'caseAttachment',
      render(caseAttachment) {
        return caseAttachment.map(attachment => <div>{caseAttachment.attachmentName}</div>);
      },
    }, {
      title: '状态',
      dataIndex: 'stepStatus',
      key: 'stepStatus',
      render(stepStatus) {
        const statusColor = _.find(stepStatusList, { statusId: stepStatus }) ?
          _.find(stepStatusList, { statusId: stepStatus }).statusColor : '';
        return (<div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {_.find(stepStatusList, { statusId: stepStatus }) &&
          _.find(stepStatusList, { statusId: stepStatus }).statusName}
        </div>);
      },
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      render(comment, record) {
        return (
          <Tooltip title={<RichTextShow data={delta2Html(comment) || '空'} />}>
            <div
              style={{
                width: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {comment ? delta2Text(comment) : ''}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: '附件',
      dataIndex: 'stepAttachment',
      key: 'stepAttachment',
      render(stepAttachment) {
        return stepAttachment.map(attachment => <div>{attachment.attachmentName}</div>);
      },
    }, {
      title: '缺陷',
      dataIndex: 'defects',
      key: 'defects',
      render(defects) {
        return defects.map(defect => <div>{defect.defectName}</div>);
      },
    }, {
      title: null,
      dataIndex: 'executeId',
      key: 'executeId',
      render(executeId, recorder) {
        return (<Icon
          type="mode_edit"
          style={{ cursor: 'pointer' }}
          onClick={() => {
            that.setState({
              editVisible: true,
              editing: { ...recorder, ...{ stepStatusList } },
            });
          }}
        />);
      },
    }];

    const { executionStatus, executionStatusName, 
      executionStatusColor, reporterJobNumber, reporterRealName,
      assignedUserRealName, assignedUserJobNumber, lastUpdateDate, executeId,
      issueId, comment, caseAttachment, testCycleCaseStepES } = cycleData;
    const options = statusList.map((status) => {
      const { statusName, statusId, statusColor } = status;
      return (<Option value={statusId} key={statusId}>
        <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {statusName}
        </div>
      </Option>);
    });
    const userOptions = userList.map(user =>
      (<Option key={user.id} value={user.realName}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <div style={styles.userOption}>
            {user.imageUrl ? <img src={user.imageUrl} alt="" /> : user.realName.slice(0, 1)}
          </div>
          <span>{`${user.loginName} ${user.realName}`}</span>
        </div>
      </Option>),
    );
    return (
      <div>
        <Header title="版本：1.0" backPath="/testManager/cycle">
          <Button onClick={this.getInfo}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <EditTestDetail
          visible={editVisible}
          onCancel={() => { this.setState({ editVisible: false }); }}
          onOk={(data) => { this.setState({ editVisible: false }); this.getInfo(); }}
          editing={editing}
        />
        <Spin spinning={loading}>
          <div>
            <div style={{ display: 'flex', padding: 24 }}>
              <Card
                title={null}
                style={{ width: 561, height: 236 }}
                bodyStyle={styles.cardBodyStyle}
              >
                <div style={styles.cardTitle}>
                  <Icon type="expand_more" />
                  <span style={styles.cardTitleText}>测试执行</span>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      执行状态:
                    </div>
                    <TextEditToggle
                      onSubmit={this.submit}
                      originData={{ executionStatus, executionStatusColor }}
                      onCancel={this.cancelEdit}
                    >
                      <Text>
                        <div style={{ background: executionStatusColor, width: 60, textAlign: 'center', borderRadius: '100px', display: 'inline-block', color: 'white' }}>
                          {executionStatusName}
                        </div>
                      </Text>
                      <Edit>
                        <Select
                          autoFocus
                          value={executionStatus}
                          style={{ width: 200 }}
                          onSelect={this.handleStatusChange}
                        >
                          {options}
                        </Select>
                      </Edit>
                    </TextEditToggle>
                  </div>
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      已指定至：
                    </div>
                    <TextEditToggle
                      onSubmit={this.submit}
                      originData={{ reporterRealName, reporterJobNumber }}
                      onCancel={this.cancelEdit}
                    >
                      <Text>
                        {reporterRealName ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              className="c7n-avatar"
                            >
                              {reporterRealName.slice(0, 1)}
                            </span>
                            <span>
                              {`${reporterJobNumber} ${reporterRealName}`}
                            </span>
                          </div>
                        ) : '无'}
                      </Text>
                      <Edit>
                        <Select
                          filter
                          allowClear
                          autoFocus
                          filterOption={(input, option) =>
                            option.props.children.props.children[1].props.children.toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0}
                          loading={selectLoading}
                          value={reporterRealName}
                          style={{ width: 200 }}
                          onChange={this.handleAssignedChange}
                          onFocus={() => {
                            this.setState({
                              selectLoading: true,
                            });
                            getUsers().then((userData) => {
                              this.setState({
                                userList: userData.content,
                                selectLoading: false,
                              });
                            });
                          }}
                        >
                          {userOptions}
                        </Select>
                      </Edit>
                    </TextEditToggle>
                  </div>
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      执行方：
                    </div>
                    {assignedUserRealName ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          className="c7n-avatar"
                        >
                          {assignedUserRealName.slice(0, 1)}
                        </span>
                        <span>
                          {`${assignedUserJobNumber} ${assignedUserRealName}`}
                        </span>
                      </div>
                    ) : '无'}
                  </div>
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      执行时间：
                    </div>
                    <div>
                      {lastUpdateDate}
                    </div>
                  </div>
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      缺陷：
                    </div>
                    <div>
                      {/* {issueId} */}
                    </div>
                  </div>
                </div>
              </Card>
              <div style={{ marginLeft: 20 }}>
                <Card
                  title={null}
                  style={{ width: 561, height: 124 }}
                  bodyStyle={{ ...styles.cardBodyStyle, ...{ display: 'flex', flexDirection: 'column' } }}
                >
                  <div style={styles.cardTitle}>
                    <Icon type="expand_more" />
                    <span style={styles.cardTitleText}>描述</span>
                    <div style={{ flex: 1, visibility: 'hidden' }} />
                    <Button className="c7n-upload-button" onClick={() => { this.setState({ edit: true }); }}>
                      <Icon type="zoom_out_map" /> 全屏编辑
                    </Button>
                    <FullEditor
                      initValue={comment}
                      visible={this.state.edit}
                      onCancel={() => this.setState({ edit: false })}
                      onOk={this.handleCommentSubmit}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: '20px', marginTop: 20, padding: '0 20px 18px', flex: 1, overflow: 'auto' }}>
                    <RichTextShow data={delta2Html(comment)} />
                  </div>
                </Card>
                <Card
                  title={null}
                  style={{ width: 561, height: 92, marginTop: 20 }}
                  bodyStyle={styles.cardBodyStyle}
                >
                  <div style={styles.cardTitle}>
                    <div>
                      <Icon type="expand_more" />
                      <span style={styles.cardTitleText}>附件</span>
                    </div>
                    <div style={{ flex: 1, visibility: 'hidden' }} />
                    <Button className="c7n-upload-button">
                      <Icon type="file_upload" /> 上传附件
                      <input
                        type="file"
                        multiple
                        title="更换头像"
                        onChange={this.handleUpload}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          cursor: 'pointer',
                          opacity: 0,
                        }}
                      />
                    </Button>
                  </div>
                  <div>
                    {/* {caseAttachment} */}
                    <Upload
                      {...props}
                      fileList={fileList}
                      className="upload-button"
                    />
                  </div>
                </Card>
              </div>
            </div>
            <Card
              title={null}
              style={{ margin: 24, marginTop: 0 }}
              bodyStyle={styles.cardBodyStyle}
            >
              <div style={styles.cardTitle}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}>执行历史记录</span>
              </div>
              <Table
                dataSource={historyList}
                columns={columnsHistory}
                pagination={historyPagination}
                onChange={this.handleHistoryTableChange}
              />
            </Card>
            <Card title={null} style={{ margin: 24 }} bodyStyle={styles.cardBodyStyle}>
              <div style={styles.cardTitle}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}>测试详细信息</span>
              </div>
              <Table
                dataSource={detailList}
                columns={columns}
                pagination={detailPagination}
                onChange={this.handleDetailTableChange}
              />
            </Card>
          </div>
        </Spin>
      </div>
    );
  }
}


export default CycleExecute;
