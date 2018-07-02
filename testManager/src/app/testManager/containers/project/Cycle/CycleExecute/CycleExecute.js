import React, { Component } from 'react';
import { Table, Button, Icon, Card } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import axios from 'axios';
const { AppState } = stores;
const styles = {
  cardTitle: {
    fontWeight: 'bold'
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px'
  },
  cardBodyStyle: {
    padding: 12
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
    marginTop:10,
  }
}
class CycleExecute extends Component {
  state = {
    assignedTo: null,           //指派给
    realName: 'realname',        //已指定至
    ObjectassignedTo: "user1",  //
    caseAttachment: [],         //
    comment: "string",          //注释
    cycleId: 1,                 //循环id
    defects: [],                //缺陷
    executeId: 1,               //执行id
    executionStatus: "status1", //执行状态
    executionStatusColor: 'GRAY',//状态颜色
    issueId: 1,                 //
    lastRank: null,             //
    nextRank: null,             //
    objectVersionNumber: 1,     //
    rank: "0|c00000:",          //
    testCycleCaseStepES: [],    //
  }
  componentDidMount() {
    this.getTestInfo();

  }
  getTestInfo = () => {
    axios.get('/test/v1/cycle/case/query/one/1').then(data => {
      this.setState(data);
      this.getTestStatus();
      console.log(data);
    })
  }
  getTestStatus = () => {
    axios.post('/test/v1/status/query',
      {
        "statusType": "CYCLE_CASE"
      }).then(status => {
        console.log(status)
        for (let i = 0; i < status.length; i += 1) {
          if (status.statusName === this.state.executionStatus) {
            this.setState({
              executionStatusColor: status.statusColor
            })
          }
        }
      })
  }
  render() {
    const dataSource = [{
      key: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号'
    }, {
      key: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号'
    }];

    const columns_history = [{
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
      key: 'address',
    }, {
      title: '新值',
      dataIndex: 'address',
      key: 'address',
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
    const { executionStatus, executionStatusColor, assignedTo, ObjectassignedTo, executeId, issueId, comment, caseAttachment, testCycleCaseStepES } = this.state;
    return (
      <div>
        <Header title="版本：1.0" backPath='/testManager/cycle'>
          <Button funcTyp="flat" onClick={this.getTestInfo}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <div style={{ display: 'flex', padding: 24 }}>
          <Card title={null} style={{ width: 561, height: 236 }} bodyStyle={styles.cardBodyStyle}>
            <div style={styles.cardTitle}>
              <Icon type="expand_more" />
              <span style={styles.cardTitleText}>测试执行</span>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.cardContentItem}>
                <div style={styles.carsContentItemPrefix}>
                  执行状态:
                </div>
                <div style={{ background: executionStatusColor, width: 60, textAlign: 'center', borderRadius: '100px', color: 'white' }}>
                  {executionStatus}
                </div>
              </div>
              <div style={styles.cardContentItem}>
                <div style={styles.carsContentItemPrefix}>
                  已指定至：
                </div>
                <div>
                  {assignedTo}
                </div>
              </div>
              <div style={styles.cardContentItem}>
                <div style={styles.carsContentItemPrefix}>
                  执行方：
                </div>
                <div>
                  {executeId}
                </div>
              </div>
              <div style={styles.cardContentItem}>
                <div style={styles.carsContentItemPrefix}>
                  执行时间：
                </div>
                <div>
                  {assignedTo}
                </div>
              </div>
              <div style={styles.cardContentItem}>
                <div style={styles.carsContentItemPrefix}>
                  缺陷：
                </div>
                <div>
                  {issueId}
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
            <Card title={null} style={{ width: 561, height: 124 }} bodyStyle={styles.cardBodyStyle}>
              <div style={styles.cardTitle}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}>描述</span>
              </div>
            </Card>
            <Card title={null} style={{ width: 561, height: 92, marginTop: 20 }} bodyStyle={styles.cardBodyStyle}>
              <div style={styles.cardTitle}>
                <Icon type="expand_more" />
                <span style={styles.cardTitleText}>附件</span>
              </div>
              <div>
                {caseAttachment}
              </div>
            </Card>
          </div>
        </div>
        <Card title={null} style={{ margin: 24, marginTop: 0 }} bodyStyle={styles.cardBodyStyle}>
          <div style={styles.cardTitle}>
            <Icon type="expand_more" />
            <span style={styles.cardTitleText}>执行历史记录</span>
          </div>
          <Table dataSource={dataSource} columns={columns_history} />
        </Card>
        <Card title={null} style={{ margin: 24 }} bodyStyle={styles.cardBodyStyle}>
          <div style={styles.cardTitle}>
            <Icon type="expand_more" />
            <span style={styles.cardTitleText}>测试详细信息</span>
          </div>
          <Table dataSource={testCycleCaseStepES} columns={columns} />
        </Card>

      </div>
    );
  }
}


export default CycleExecute;