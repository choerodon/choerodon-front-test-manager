import React, { Component } from 'react';
import {
  Page, Header, Content, WSHandler, stores,
} from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination, Modal, Progress, Card,
  Spin, Icon, Select, Divider, Tooltip,
} from 'choerodon-ui';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { importIssue } from '../../../../api/FileApi';
import { commonLink, humanizeDuration, getProjectName, testCaseDetailLink, getParams } from '../../../../common/utils';
import { SelectVersion } from '../../../../components/CommonComponent';
import {
    loadDatalogs, loadLinkIssues, loadIssue, updateStatus, updateIssue, createIssueStep,
    createCommit, deleteIssue, loadStatus, cloneIssue, getIssueSteps, getIssueExecutes, getAllIssues,
  } from '../../../../api/IssueManageApi';
import './TestCaseDetail.scss';
import IssueStore from '../../../../store/project/IssueManage/IssueStore';
import TestStepTable from '../../../../components/IssueManageComponent/TestStepTable/TestStepTable';
import TestExecuteTable from '../../../../components/IssueManageComponent/TestExecuteTable/TestExecuteTable'
import EditIssue from '../../../../components/IssueManageComponent/EditIssue/EditIssue';
import { toJS } from 'mobx';

const { AppState } = stores;
const { confirm } = Modal;
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
  
class TestCaseDetail extends Component {
    constructor(props) {
        super(props);
        this.state={
            issueIds: [],
            testCaseId: undefined,
            issueInfo: undefined,
            disabled: false,
            fileList: [],
            linkIssues: [],
            datalogs: [],
            testStepData: [],
            testExecuteData: [],
            loading: true,
            lasttestCaseId: null,
            nexttestCaseId: null,
            isExpand: false,
            folderName: '',
        }
    }


    componentDidMount() {
        const { id } = this.props.match.params;
        const Request = getParams(this.props.location.search);
        const { folderName } = Request;
        this.setState({
            testCaseId:id,
            folderName,
        })
        const  allIdValues = IssueStore.getIssueIds;
         let testCaseIdIndex;
         allIdValues.forEach((valueId, index) => {
            if(id == valueId) {
              testCaseIdIndex = index;
              return;
            }
          });
          this.setState({
            issueIds: allIdValues,
            lasttestCaseId: testCaseIdIndex >= 1 ? allIdValues[testCaseIdIndex -1] : null,
            nexttestCaseId: testCaseIdIndex <= allIdValues.length-2 ? allIdValues[testCaseIdIndex +1] : null,
        })

        this.reloadIssue(id);
        console.log('componentDidMount');
    }

    /**
   *加载issue以及相关信息
   *
   * @param {*}
   * @memberof EditIssueNarrow
   */
  reloadIssue = (issueId) => {
    this.setState({
      addingComment: false,
      editDescriptionShow: false,
      loading: true,
    });
    Promise.all([
      loadIssue(issueId),
      loadLinkIssues(issueId),
      loadDatalogs(issueId),
      getIssueSteps(issueId),
      getIssueExecutes(issueId),
    ]).then(([issue, linkIssues, datalogs, testStepData, testExecuteData]) => {
      const {
        issueAttachmentDTOList,
      } = issue;
      const fileList = _.map(issueAttachmentDTOList, issueAttachment => ({
        uid: issueAttachment.attachmentId,
        name: issueAttachment.fileName,
        url: issueAttachment.url,
      }));
      this.setState({
        issueInfo: issue,
        disabled: issue.typeCode === 'issue_auto_test',
        fileList,
        linkIssues,
        datalogs,
        // testStepData,
        testStepData: testStepData.map(step => {
          return {
            ...step,
            stepIsCreating: false,
          }
        }),
        testExecuteData,
        loading: false,
      });
    });
  }

    goTestCase=(mode) => {
    const { lasttestCaseId, nexttestCaseId } = this.state;
    const { disabled, history } = this.props;
    const toTestCaseId = mode === 'pre' ? lasttestCaseId : nexttestCaseId;

    const  allIdValues = IssueStore.getIssueIds;
    let toTestCaseIdIndex;
    allIdValues.forEach((valueId, index) => {
      if(toTestCaseId == valueId) {
        toTestCaseIdIndex = index;
        return;
      }
    });

    if (toTestCaseId) {
        history.replace(testCaseDetailLink(toTestCaseId, IssueStore.getIssueFolderNames[toTestCaseIdIndex]));
    }
    }

     // createIssueStep = () => {
  //   const { issueInfo, testStepData } = this.state;
  //   const { issueId } = issueInfo;
  //   const lastRank = testStepData.length
  //     ? testStepData[testStepData.length - 1].rank : null;
  //   const testCaseStepDTO = {
  //     attachments: [],
  //     issueId,
  //     lastRank,
  //     nextRank: null,
  //     testStep: '测试步骤',
  //     testData: '测试数据',
  //     expectedResult: '预期结果',
  //   };
  //   createIssueStep(testCaseStepDTO).then(() => {
  //     this.reloadIssue();
  //   });
  // }

  createIssueStep = () => {
    const { issueInfo, testStepData } = this.state;
    const { issueId } = issueInfo;
    const lastRank = testStepData.length
      ? testStepData[testStepData.length - 1].rank : null;
    const testCaseStepDTO = {
      attachments: [],
      issueId,
      lastRank,
      nextRank: null,
      testStep: '',
      testData: '',
      expectedResult: '',
      stepIsCreating: true,
    };
    this.setState({
      testStepData: [...testStepData, testCaseStepDTO],
    });
   
  }


    render() {
        const {
            testCaseId,
            issueInfo,
            disabled,
            fileList,
            linkIssues,
            datalogs,
            testStepData,
            testExecuteData,
            loading,
            lasttestCaseId,
            nexttestCaseId,
            isExpand,
            folderName,
        } = this.state;

        return (
            <Page className="c7ntest-testCaseDetail">
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
                <span><FormattedMessage id="testCase_detail" /></span>
              </div>
            )}
            >
              <Button
                disabled={lasttestCaseId === null}
                onClick={() => {
                  this.goTestCase('pre');
                }}
              > 
                <Icon type="navigate_before" />
                <span><FormattedMessage id="testCase_pre" /></span>
              </Button>
              <Button 
                disabled={nexttestCaseId === null}
                onClick={() => {
                  this.goTestCase('next');
                }}
              >            
                <span><FormattedMessage id="testCase_next" /></span>
                <Icon type="navigate_next" />
              </Button>
              <Button onClick={() => {
                // this.props.history.replace('55');
                this.reloadIssue(testCaseId);
              }}
              >            
                <Icon type="refresh" />
                <span><FormattedMessage id="refresh" /></span>
              </Button>
            </Header>
    
            <Spin spinning={loading}>
              <div style={{display: 'flex', height: 'calc(100vh - 107px)'}}>
                <div style={{ overflowY: 'auto'}}>
                    {
                    !loading && (
                      <div style={{ display: 'flex', margin: '24px' }}>
                        <span style={{ fontSize: 20 }}>{issueInfo && issueInfo.summary}</span>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', marginLeft: 20, color: '#3F51B5', fontSize: 14, cursor: 'pointer'}}  
                          onClick={() => {
                            this.setState({
                              isExpand: !this.state.isExpand,
                            })
                        }}>
                          <Icon type={isExpand ? 'format_indent_increase' : 'format_indent_decrease'} style={{ verticalAlign: -2, fontSize: 15}} />
                          <span style={{ display: 'inline-block', marginLeft: 3 }}>{isExpand ? '隐藏详情' : '显示详情'}</span>
                        </div>
                      </div>
                    )
                  }
                  <Card
                    title={null}
                    style={{ marginBottom: 24, marginLeft: 24 }}
                    bodyStyle={styles.cardBodyStyle}
                  >
                    <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                      {/* <Icon type="expand_more" /> */}
                      <span style={styles.cardTitleText}><FormattedMessage id="testCase_testDetail" /></span>
                      <span style={{ marginLeft: 5 }}>{`（${testStepData.length}）`}</span>
                    </div>
                    <TestStepTable 
                        disabled={disabled}  
                        issueId={testCaseId}
                        data={testStepData}
                        enterLoad={() => {
                          this.setState({
                            loading: true,
                          });
                        }}
                        leaveLoad={() => {
                          this.setState({
                            loading: false,
                          });
                        }}
                        onOk={() => {
                          this.reloadIssue(testCaseId);
                        }} />
                        <div className="c7ntest-title-right" style={{ marginLeft: '3px', position: 'relative' }}>
                        <Button disabled={disabled} style={{ color: '#3F51B5'}} icon="playlist_add" className="leftBtn" funcTyp="flat" onClick={this.createIssueStep}>
                          <FormattedMessage id="issue_edit_addTestDetail" />
                        </Button>
                      </div>
                  </Card>
                  <Card
                    title={null}
                    style={{ margin: 24, marginRight: 0 }}
                    bodyStyle={styles.cardBodyStyle}
                  >
                    <div style={{ ...styles.cardTitle, marginBottom: 10 }}>
                      {/* <Icon type="expand_more" /> */}
                      <span style={styles.cardTitleText}><FormattedMessage id="testCase_testexecute" /></span>                
                    </div>
                    <div>
                      <TestExecuteTable
                        issueId={testCaseId}
                        data={testExecuteData}
                        enterLoad={() => {
                          this.setState({
                            loading: true,
                          });
                        }}
                        leaveLoad={() => {
                          this.setState({
                            loading: false,
                          });
                        }}
                        onOk={() => {
                          this.reloadIssue(testCaseId);
                        }}
                      />
                    </div>
                  </Card>
                </div>
               
                {
                  isExpand && (
                    <EditIssue 
                      issueId={testCaseId}
                      folderName={folderName}
                      issueInfo={issueInfo} 
                      fileList={fileList}
                      linkIssues={linkIssues}
                      datalogs={datalogs} 
                      disabled={disabled}
                      reloadIssue={this.reloadIssue.bind(this, testCaseId)}
                      onClose={() => {
                        this.setState({
                          isExpand: false,
                        })
                      }}
                      mode='wide'
                    />
                  )
                }
              </div>
            </Spin>
          </Page>
        )
    }
}

export default TestCaseDetail;