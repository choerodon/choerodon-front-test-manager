import React, { Component } from 'react';
import { Table, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import axios from 'axios';
import { TextEditToggle } from '../../../../components/CommonComponent';
import { getUsers, editCycle } from '../../../../../api/CycleExecuteApi';
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
    userList: [], // 用户列表
    statusList: [], // 状态列表
    testData: {
      executeId: null,
      cycleId: null, // 循环id
      // issueId: 1,              //
      reporterJobNumber: null,
      reporterRealName: null, // 已指定至         
      assignedUserJobNumber: null,
      assignedUserRealName: null, // 执行人
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
    this.getTestInfo();
    getUsers().then((data) => {
      const userList = data.content;
      this.setState({
        userList,
      });
      // console.log(userList);
    });
  }
  getTestInfo = () => {
    this.setState({ loading: true });
    axios.get('/test/v1/cycle/case/query/one/1').then((data) => {
      this.setState({ testData: data });
      this.getTestStatus();
    });
  }
  getTestStatus = () => {
    axios.post('/test/v1/status/query',
      {
        statusType: 'CYCLE_CASE',
      }).then((statusList) => {
      this.setStatusAndColor(this.state.testData.executionStatus, statusList);
      this.setState({
        loading: false,
        statusList,
      });
    });
  }

  setStatusAndColor = (status, statusList) => {
    for (let i = 0; i < statusList.length; i += 1) {
      if (statusList[i].statusName === status) {
        this.setState({
          testData: {
            ...this.state.testData,
            ...{
              executionStatus: status,
              executionStatusColor: statusList[i].statusColor,
            },
          },
        });
      }
    }
  }
  handleStatusChange = (status) => {
    this.setStatusAndColor(status, this.state.statusList);
  }
  handleReporterChange = (reporter) => {
    const { userList } = this.state;
    for (let i = 0; i < userList.length; i += 1) {
      if (userList[i].realName === reporter) {
        this.setState({
          testData: {
            ...this.state.testData,
            ...{
              reporterRealName: reporter,
              reporterJobNumber: userList[i].loginName,
            },
          },
        });
      }
    }
    window.console.log(reporter);
  }
  submit = (originData) => {
    window.console.log('submit', originData);
    editCycle(this.state.testData).then((data) => {
      window.console.log(data);
    });
  }
  handleUpload = (e) => {
    if (beforeUpload(e.target.files[0])) {
      // console.log(e.target.files[0]);
      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      this.setState({
        fileList: [...this.state.fileList, ...[{
          uid: Math.random(),
          name: e.target.files[0].name,
          status: 'done',
          url: 'response',
        }]],
      });
    }
  }
  cancelEdit = (originData) => {
    let { testData } = this.state;
    testData = { ...testData, ...originData };
    this.setState({ testData });
  }

  render() {
    const props = {
      onRemove: (file) => {
        // window.console.log(file);
        const fileList = this.state.fileList.slice();
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        if (file.url) {
          // 写服务端删除逻辑
          // IssueStore.deleteFile(file.uid).then((response) => {
          //   if (response) {
          //     newFileList.splice(index, 1);
          //     IssueStore.setStoreData('fileList', newFileList);
          //     HAP.prompt('删除成功');
          //   }
          // }).catch((error) => {
          //   if (error.response) {
          //     HAP.prompt(error.response.data.message);
          //   } else {
          //     HAP.prompt(error.message);
          //   }
          //   // window.console.log(error);
          // });
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
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '注释',
      dataIndex: 'comment',
      key: 'comment',
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
    // "testCycleCaseStepES": [
    //   {
    //     "caseAttachment": [
    //       {
    //         "attachmentLinkId": 0,
    //         "attachmentName": "string",
    //         "attachmentType": "string",
    //         "comment": "string",
    //         "id": 0,
    //         "url": "string"
    //       }
    //     ],
    //     "comment": "string",
    //     "defects": [
    //       {
    //         "defectLinkId": 0,
    //         "defectName": "string",
    //         "defectType": "string",
    //         "id": 0,
    //         "issueId": 0,
    //         "objectVersionNumber": 0,
    //         "testCycleCaseDefectRelRepository": {}
    //       }
    //     ],
    //     "executeId": 0,
    //     "executeStepId": 0,
    //     "expectedResult": "string",
    //     "objectVersionNumber": 0,
    //     "stepAttachment": [
    //       {
    //         "attachmentLinkId": 0,
    //         "attachmentName": "string",
    //         "attachmentType": "string",
    //         "comment": "string",
    //         "id": 0,
    //         "url": "string"
    //       }
    //     ],
    //     "stepId": 0,
    //     "testCycleCaseStepRepository": {},
    //     "testData": "string",
    //     "testStep": "string"
    //   }
    // ]
    const { fileList, userList, loading, testData,
      statusList } = this.state;
    const { executionStatus, executionStatusColor, reporterJobNumber, reporterRealName,
      assignedUserRealName, assignedUserJobNumber, lastUpdateDate, executeId,
      issueId, comment, caseAttachment, testCycleCaseStepES } = testData;
    const options = statusList.map((status) => {
      const { statusName, statusColor } = status;
      return (<Option value={statusName} key={statusName}>
        <div style={{ background: statusColor, width: 60, textAlign: 'center', borderRadius: '100px', display: 'inline-block', color: 'white' }}>
          {statusName}
        </div>
      </Option>);
    });
    const userOptions = userList.map(user =>
      (<Option key={user.id} value={user.realName}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <div
            style={{ background: '#c5cbe8', color: '#6473c3', width: '20px', height: '20px', textAlign: 'center', lineHeight: '20px', borderRadius: '50%', marginRight: '8px' }}
          >
            {user.imageUrl ? <img src={user.imageUrl} alt="" /> : user.loginName.slice(0, 1)}
          </div>
          <span>{`${user.loginName} ${user.realName}`}</span>
        </div>
      </Option>),
    );
    return (
      <div>
        <Header title="版本：1.0" backPath="/testManager/cycle">
          <Button onClick={this.getTestInfo}>
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
                          value={reporterRealName}
                          style={{ width: 200 }}
                          onSelect={this.handleReporterChange}
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
                  <div style={styles.cardContentItem}>
                    <div style={styles.carsContentItemPrefix}>
                      注释：
                    </div>
                    <div>
                      {comment}
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
              <Table dataSource={testCycleCaseStepES} columns={columns} />
            </Card>
          </div>
        </Spin>
      </div>
    );
  }
}


export default CycleExecute;
