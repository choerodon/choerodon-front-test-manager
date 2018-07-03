import React, { Component } from 'react';
import { Table, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { TextEditToggle } from '../../../../components/CommonComponent';
import FullEditor from '../../../../components/FullEditor';
import { getCycle, getCycleDetails, getStatusList, getUsers, editCycle } from '../../../../../api/CycleExecuteApi';
import { uploadFile } from '../../../../../api/CommonApi';
import { delta2Html } from '../../../../common/utils';

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
    fileList: [{
      uid: -1,
      name: 'sss',
      status: 'done',
      url: 'response',
    }],
    loading: false,
    edit: false,
    selectLoading: false,
    userList: [], // 用户列表
    statusList: [], // 状态列表
    stepStatusList: [],
    detailList: [],
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
      // executeId: 1,            //执行id
      executionStatus: null, // 执行状态
      executionStatusColor: null, // 状态颜色

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
    Promise.all([getCycle(), getStatusList('CYCLE_CASE'), getCycleDetails(1), getStatusList('CASE_STEP')])
      .then(([cycleData, statusList, detailList, stepStatusList]) => {
        window.console.log(detailList);
        this.setState({ 
          cycleData,
          statusList, 
          detailList: detailList.content,
          stepStatusList,
          loading: false,
        });
        this.setStatusAndColor(this.state.cycleData.executionStatus, statusList);
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
  }
  setStatusAndColor = (status, statusList) => {
    this.setState({
      cycleData: {
        ...this.state.cycleData,
        ...{
          executionStatus: status,
          executionStatusColor: _.find(statusList, { statusName: status }).statusColor,
        },
      },
    });
  }
  handleStatusChange = (status) => {
    this.setStatusAndColor(status, this.state.statusList);
  }
  handleAssignedChange = (assigned) => {
    const { userList } = this.state;
    for (let i = 0; i < userList.length; i += 1) {
      if (userList[i].realName === assigned) {
        this.setState({
          cycleData: {
            ...this.state.cycleData,
            ...{
              assignedTo: userList[i].id,
              reporterRealName: assigned,
              reporterJobNumber: userList[i].loginName,
            },
          },
        });
      }
    }
    window.console.log(assigned);
  }
  submit = (originData) => {
    window.console.log('submit', originData);
    const { cycleData } = this.state;
    // 删除一些不必要字段
    delete cycleData.defects;
    delete cycleData.caseAttachment;
    delete cycleData.testCycleCaseStepES;
    delete cycleData.lastRank;
    delete cycleData.nextRank;
    editCycle(this.state.cycleData).then((Data) => {
      this.setState({
        cycleData: Data,
      });
      this.setStatusAndColor(Data.executionStatus, this.state.statusList);
      window.console.log(cycleData);
    });
  }
  handleUpload = (e) => {
    if (beforeUpload(e.target.files[0])) {
      // console.log(e.target.files[0]);
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      // this.setState({
      //   fileList: [...this.state.fileList, ...[{
      //     uid: Math.random(),
      //     name: e.target.files[0].name,
      //     status: 'done',
      //     url: 'response',
      //   }]],
      // });
      const a = {
        bucketName: 'test',
        fileName: e.target.files[0].name,
        comment: '',
        attachmentLinkId: this.state.cycleData.executeId,
        attachmentType: 'CYCLE_CASE',
      };
      uploadFile(formData, a);
    }
  }
  cancelEdit = (originData) => {
    let { cycleData } = this.state;
    cycleData = { ...cycleData, ...originData };
    this.setState({ cycleData });
  }

  render() {
    const { fileList, userList, stepStatusList, detailList, loading, cycleData,
      statusList, selectLoading } = this.state;
    const props = {
      onRemove: (file) => {
        window.console.log(file);
        // const fileList = this.state.fileList.slice();
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        if (file.url) {
          // 写服务端删除逻辑
        }
      },
    };
    const dataSource = [{
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    }, {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    }];

    const columnsHistory = [{
      title: '执行方',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '执行日期',
      dataIndex: 'age',
      key: 'age',
    }, {
      title: 'Field',
      dataIndex: 'address',
      key: 'address',
    }, {
      title: '原值',
      dataIndex: 'address',
      key: 'address2',
    }, {
      title: '新值',
      dataIndex: 'address',
      key: 'address3',
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
      dataIndex: 'stepAttachment',
      key: 'stepAttachment',
    }, {
      title: '状态',
      dataIndex: 'stepStatus',
      key: 'stepStatus',
      render(stepStatus) {   
        const statusColor = _.find(stepStatusList, { statusName: stepStatus }).statusColor;
        return (<div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {stepStatus}
        </div>);
      },
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
      render(comment) {
        return (
          <div>
            {comment || '无'}
          </div>
        );
      },
    },
    {
      title: '附件',
      dataIndex: 'caseAttachment',
      key: 'caseAttachment',
    }, {
      title: '缺陷',
      dataIndex: 'defects',
      key: 'defects',
    }];
    
    const { executionStatus, executionStatusColor, reporterJobNumber, reporterRealName,
      assignedUserRealName, assignedUserJobNumber, lastUpdateDate, executeId,
      issueId, comment, caseAttachment, testCycleCaseStepES } = cycleData;
    const options = statusList.map((status) => {
      const { statusName, statusColor } = status;
      return (<Option value={statusName} key={statusName}>
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
                          {executionStatus}
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
                          allowClear
                          autoFocus
                          loading={selectLoading}
                          value={reporterRealName}
                          style={{ width: 200 }}
                          onSelect={this.handleAssignedChange}
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
                  bodyStyle={styles.cardBodyStyle}
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
                      onOk={(value) => { window.console.log(value); }}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: '20px', padding: '20px 20px 18px' }}>
                    {delta2Html(comment)}
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
                    {caseAttachment}
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
              <Table dataSource={dataSource} columns={columnsHistory} />
            </Card>
            <Card title={null} style={{ margin: 24 }} bodyStyle={styles.cardBodyStyle}>
              <div style={styles.cardTitle}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}>测试详细信息</span>
              </div>
              <Table dataSource={detailList} columns={columns} />
            </Card>
          </div>
        </Spin>
      </div>
    );
  }
}


export default CycleExecute;
