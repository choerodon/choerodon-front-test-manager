import React, { Component } from 'react';
import {
  Input, Icon, Modal, Tooltip, Button, Table,
} from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { cloneStep, updateStep, deleteStep } from '../../../api/IssueManageApi';
import { DragTable } from '../../CommonComponent';
import { TextEditToggle, UploadInTable } from '../../CommonComponent';
import './TestStepTable.scss';

const { confirm } = Modal;
const { Text, Edit } = TextEditToggle;
const { AppState } = stores;
const { TextArea } = Input;
class TestStepTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  onDragEnd = (sourceIndex, targetIndex) => {
    const arr = this.state.data.slice();
    if (sourceIndex === targetIndex) {
      return;
    }
    const drag = arr[sourceIndex];
    arr.splice(sourceIndex, 1);
    arr.splice(targetIndex, 0, drag);
    this.setState({ data: arr });
    // arr此时是有序的，取toIndex前后两个的rank
    const lastRank = targetIndex === 0 ? null : arr[targetIndex - 1].rank;
    const nextRank = targetIndex === arr.length - 1 ? null : arr[targetIndex + 1].rank;
    const dragCopy = { ...drag };
    delete dragCopy.attachments;
    const testCaseStepDTO = {
      ...dragCopy,
      lastRank,
      nextRank,
    };
    const projectId = AppState.currentMenuType.id;
    updateStep(testCaseStepDTO).then((res) => {
      // save success
      const Data = [...this.state.data];
      Data[targetIndex] = res;
      this.setState({
        data: Data,
      });
    });
  }


  editStep = (record) => {
    const { expectedResult, testStep } = record;
    if (expectedResult !== '' && testStep !== '') {
      const projectId = AppState.currentMenuType.id;     
      updateStep(record).then((res) => {    
        this.props.onOk();
      });
    } else {
      Choerodon.prompt('测试步骤和预期结果为必输项');
    }
  };

  cloneStep = (stepId, index) => {
    const { data } = this.state;
    const lastRank = data[index].rank;
    const nextRank = data[index + 1] ? data[index + 1].rank : null;
    this.props.enterLoad();
    cloneStep({
      lastRank,
      nextRank,
      stepId,
      issueId: this.props.issueId,
    }).then((res) => {
      this.props.onOk();
    })
      .catch((error) => {
        this.props.leaveLoad();
      });
  }

  handleDeleteTestStep = (stepId) => {
    const that = this;
    confirm({
      width: 560,
      title: Choerodon.getMessage('确认删除吗？', 'Confirm delete'),
      content:
  <div style={{ marginBottom: 32 }}>
    {Choerodon.getMessage('当你点击删除后，所有与之关联的测试步骤将删除!', 'When you click delete, after which the data will be permanently deleted and irreversible!')
          }
  </div>,
      onOk() {
        return deleteStep({ data: { stepId } })
          .then((res) => {
            that.props.onOk();
          });
      },
      onCancel() { },
      okText: Choerodon.getMessage('删除', 'Delete'),
      okType: 'danger',
    });
  }

  createStep() {

  }

  cancelStep() {

  }

  render() {
    const that = this;
    const {
      onOk, enterLoad, leaveLoad, disabled,
    } = this.props;

    const columns = [{
      title: null,
      dataIndex: 'stepId',
      key: 'stepId',
      flex: 1,
      width: 10,
      render(stepId, record, index) {
        return index + 1;
      },
    }, {
      title: <FormattedMessage id="execute_testStep" />,
      dataIndex: 'testStep',
      key: 'testStep',
      flex: 2,
      render(testStep, record) {
        return (
          <div className="item-container">
            <TextEditToggle
              disabled={disabled}
              formKey="testStep"
              onSubmit={value => that.editStep({ ...record, testStep: value })}
              originData={testStep}
              rules={[{
                required: true, message: '请输入步骤名!',
              }]}
            >
              <Text>
                {data => (
                  <div className="c7ntest-text-wrap">
                    {data}
                  </div>
                )}
              </Text>
              <Edit>
                <TextArea autoFocus autosize />
              </Edit>
            </TextEditToggle>
          </div>
        );
      },
    }, {
      title: <FormattedMessage id="execute_testData" />,
      dataIndex: 'testData',
      key: 'testData',
      flex: 2,
      render(testData, record) {
        return (
          <div className="item-container">
            <TextEditToggle
              disabled={disabled}
              // rules={[{ max: 30, message: '测试数据最长为30' }]}
              formKey="testData"
              onSubmit={value => that.editStep({ ...record, testData: value })}
              originData={testData}
            >
              <Text>
                {data => (
                  <div className="c7ntest-text-wrap">
                    {data}
                  </div>
                )}
              </Text>
              <Edit>
                <TextArea autoFocus autosize />
              </Edit>
            </TextEditToggle>
          </div>
        );
      },
    }];
    const wideColumns = [
      {
        title: <FormattedMessage id="execute_expectedOutcome" />,
        dataIndex: 'expectedResult',
        key: 'expectedResult',
        flex: 2,
        render(expectedResult, record) {
          return (
            <div className="item-container">
              <TextEditToggle
                disabled={disabled}
                formKey="expectedResult"
                onSubmit={value => that.editStep({ ...record, expectedResult: value })}
                originData={expectedResult}
                rules={[{
                  required: true, message: '请输入预期结果!',
                }]}
              >
                <Text>
                  {data => (
                    <div className="c7ntest-text-wrap">
                      {data}
                    </div>
                  )}
                </Text>
                <Edit>
                  <TextArea autoFocus autosize />
                </Edit>
              </TextEditToggle>
            </div>
          );
        },
      }, {
        title: <FormattedMessage id="execute_stepAttachment" />,
        dataIndex: 'attachments',
        key: 'attachments',
        flex: 2,
        render(attachments, record) {
          return (
            <div className="item-container">
              <TextEditToggle
                disabled={disabled}
                originData={attachments}
              >
                <Text>
                  <div style={{ minHeight: 20 }}>
                    {attachments.map(attachment => (
                      <div style={{
                        display: 'flex', fontSize: '12px', flexShrink: 0, margin: '5px 2px', alignItems: 'center',
                      }}
                      >
                        <Icon type="attach_file" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }} />
                        <a className="c7ntest-text-dot" style={{ margin: '2px 5px', fontSize: '13px' }} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
                      </div>
                    ))
                    }
                  </div>
                </Text>
                <Edit>
                  <UploadInTable
                    fileList={attachments}
                    onOk={onOk}
                    enterLoad={enterLoad}
                    leaveLoad={leaveLoad}
                    config={{
                      attachmentLinkId: record.stepId,
                      attachmentType: 'CASE_STEP',
                    }}
                  />
                </Edit>
              </TextEditToggle>
            </div>
          );
        },
      }, {
        title: null,
        dataIndex: 'action',
        key: 'action',
        flex: 2,
        render(attachments, record, index, provided, snapshot) {
          const {stepIsCreating} = record;

          return !stepIsCreating ? (
            <div>
               <Tooltip title={<FormattedMessage id="execute_copy" />}>
                <Icon type="format_indent_decrease" {...provided.dragHandleProps} />
              </Tooltip>
              <Tooltip title={<FormattedMessage id="execute_copy" />}>
                <Button disabled={disabled} shape="circle" funcType="flat" icon="library_books" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.cloneStep(record.stepId, index)} />
              </Tooltip>
              <Button disabled={disabled} shape="circle" funcType="flat" icon="delete_forever" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.handleDeleteTestStep(record.stepId)} />
            </div>
          ) : (
            <div>
              <Tooltip title={<FormattedMessage id="execute_copy" />}>
                <Icon type="format_indent_decrease" {...provided.dragHandleProps} />
              </Tooltip>
            <Tooltip title={<FormattedMessage id="execute_save" />}>
              <Button disabled={disabled} shape="circle" funcType="flat" icon="done" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.createStep(record.stepId, index)} />
            </Tooltip>
            <Tooltip title={<FormattedMessage id="excute_cancel" />}>
              <Button disabled={disabled} shape="circle" funcType="flat" icon="close" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.cancelStep(record.stepId)} />
            </Tooltip>
          </div>
          )
        },
      },
    ];
    const createColumn = [
     { title: null,
        dataIndex: 'createAction',
        key: 'createAction',
        // flex: 2,
        render(attachments, record, index) {
          const {stepIsCreating} = record;
          return stepIsCreating && (
            <div>
              <Tooltip title={<FormattedMessage id="execute_save" />}>
                <Button disabled={disabled} shape="circle" funcType="flat" icon="done" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.createStep(record.stepId, index)} />
              </Tooltip>
              <Tooltip title={<FormattedMessage id="excute_cancel" />}>
                <Button disabled={disabled} shape="circle" funcType="flat" icon="close" style={{ margin: '0 5px', color: 'black' }} onClick={() => that.cancelStep(record.stepId)} />
              </Tooltip>
            </div>
          );
        },}
    ]
    return (
      <div className="c7ntest-TestStepTable">
        <DragTable
          disabled={disabled}
          pagination={false}
          filterBar={false}
          dataSource={this.state.data}
          // columns={mode === 'narrow' ? columns.concat(createColumn) : columns.concat(wideColumns)}
          columns={columns.concat(wideColumns)}
          onDragEnd={this.onDragEnd}
          dragKey="stepId"
          customDragHandle
        />
      </div>
    );
  }
}

export default TestStepTable;
