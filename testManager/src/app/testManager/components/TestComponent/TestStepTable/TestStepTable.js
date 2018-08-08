import React, { Component } from 'react';
import { Input, Icon, Dropdown, Menu, Modal, Tooltip, Form, Upload, Button } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import EditTestStep from '../EditTestStep';
import DragTable from '../../DragTable';
import { TextEditToggle, UploadInTable } from '../../CommonComponent';
import './TestStepTable.scss';

const { Text, Edit } = TextEditToggle;
const { AppState } = stores;
const confirm = Modal.confirm;
const FormItem = Form.Item;
function uploadFile(data, config) {
  const { bucketName, attachmentLinkId } = config;
  const projectId = AppState.currentMenuType.id;
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-datal' },
  };

  return axios.post(
    `/zuul/test/v1/projects/${projectId}/test/case/attachment?bucket_name=test&attachmentLinkId=${attachmentLinkId}&attachmentType=CASE_STEP`,
    data,
    axiosConfig,
  );
}
function deleteAttachment(id) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`test/v1/projects/${projectId}/test/case/attachment/delete/bucket/test/attach/${id}`);
}
class TestStepTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
      issueId: undefined,
      editTestStepShow: false,
      currentTestStepId: undefined,
      currentAttments: [],
    };
  }

  componentDidMount() {
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
    axios.put(`/test/v1/projects/${projectId}/case/step/change`, testCaseStepDTO)
      .then((res) => {
        // save success
        const a = this.state.data.slice();
        a[targetIndex] = res;
        this.setState({
          data: a,
        });
      });
  }


  // handleClickMenu = (e) => {
  //   const testStepId = this.state.currentTestStepId;
  //   if (e.key === 'edit') {
  //     this.setState({
  //       editTestStepShow: true,
  //     });
  //   } else if (e.key === 'delete') {
  //     this.handleDeleteTestStep();
  //   } else if (e.key === 'clone') {
  //     axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/case/step/clone`, {
  //       stepId: testStepId,
  //       issueId: this.props.issueId,
  //     })
  //       .then((res) => {
  //         this.props.onOk();
  //       })
  //       .catch((error) => {
  //       });
  //   }
  // }
  editStep = (record) => {
    this.props.form.validateFields((err, values) => {
      // window.console.log(values);
      const projectId = AppState.currentMenuType.id;
      // this.setState({ createLoading: true });
      axios.put(`/test/v1/projects/${projectId}/case/step/change`, { ...record, ...values })
        .then((res) => {
          this.setState({ createLoading: false });
          this.props.onOk();
        });
    });
  };
  cloneStep = (stepId) => {
    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/case/step/clone`, {
      stepId,
      issueId: this.props.issueId,
    })
      .then((res) => {
        this.props.onOk();
      })
      .catch((error) => {
      });
  }
  handleDeleteTestStep = (stepId) => {
    const that = this;
    confirm({
      width: 560,
      title: Choerodon.getMessage('确认删除吗？', 'Confirm delete'),
      content: <div style={{ marginBottom: 32 }}>
        {Choerodon.getMessage('当你点击删除后，该条数据将被永久删除，不可恢复!', 'When you click delete, after which the data will be permanently deleted and irreversible!')
        }
      </div>,
      onOk() {
        return axios.delete(`/test/v1/projects/${AppState.currentMenuType.id}/case/step`, { data: { stepId } })
          .then((res) => {
            that.props.onOk();
          });
      },
      onCancel() { },
      okText: Choerodon.getMessage('删除', 'Delete'),
      okType: 'danger',
    });
  }

  handleChangeExpand = (id) => {
    const expand = this.state.expand.slice();

    if (expand.includes(id)) {
      // window.console.log(id, 'remove');
      expand.splice(expand.indexOf(id), 1);
      document.getElementById(`${id}-list`).style.height = '34px';
    } else {
      // window.console.log(id, 'add');
      expand.push(id);
      document.getElementById(`${id}-list`).style.height = 'auto';
    }
    // window.console.log(expand);
    this.setState({ expand });
  }


  render() {
    const { getFieldDecorator } = this.props.form;
    const that = this;
    const { onOk, enterLoad, leaveLoad } = this.props;
    // const menus = (
    //   <Menu onClick={this.handleClickMenu.bind(this)}>
    //     <Menu.Item key="edit">
    //       <FormattedMessage id="edit" />
    //     </Menu.Item>
    //     <Menu.Item key="delete">
    //       <FormattedMessage id="delete" />
    //     </Menu.Item>
    //     <Menu.Item key="clone">
    //       <FormattedMessage id="clone" />
    //     </Menu.Item>
    //   </Menu>
    // );

    const columns = [{
      title: null,
      dataIndex: 'stepId',
      key: 'stepId',
      render(stepId, record, index) {
        return index + 1;
      },
    }, {
      title: <FormattedMessage id="execute_testStep" />,
      dataIndex: 'testStep',
      key: 'testStep',
      render(testStep, record) {
        return (
          <Tooltip title={testStep}>
            <TextEditToggle
              onSubmit={() => that.editStep(record)}
              originData={testStep}
            >
              <Text>
                <div className="c7n-text-dot">
                  {testStep}
                </div>
              </Text>
              <Edit>
                <FormItem style={{ margin: '5px 0 0 0' }}>
                  {getFieldDecorator('testStep', {
                    initialValue: testStep,
                  })(
                    <Input autoFocus />,
                  )}
                </FormItem>

              </Edit>
            </TextEditToggle>
          </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="execute_testData" />,
      dataIndex: 'testData',
      key: 'testData',
      render(testData, record) {
        return (
          <Tooltip title={testData}>
            <TextEditToggle
              onSubmit={() => that.editStep(record)}
              originData={testData}
            >
              <Text>
                <div className="c7n-text-dot">
                  {testData}
                </div>
              </Text>
              <Edit>
                <FormItem style={{ margin: '5px 0 0 0' }}>
                  {getFieldDecorator('testData', {
                    initialValue: testData,
                  })(
                    <Input autoFocus />,
                  )}
                </FormItem>

              </Edit>
            </TextEditToggle>
          </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="execute_expectedOutcome" />,
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      render(expectedResult, record) {
        return (
          <Tooltip title={expectedResult}>
            <TextEditToggle
              onSubmit={() => that.editStep(record)}
              originData={expectedResult}
            >
              <Text>
                <div className="c7n-text-dot">
                  {expectedResult}
                </div>
              </Text>
              <Edit>
                <FormItem style={{ margin: '5px 0 0 0' }}>
                  {getFieldDecorator('expectedResult', {
                    initialValue: expectedResult,
                  })(
                    <Input autoFocus />,
                  )}
                </FormItem>

              </Edit>
            </TextEditToggle>
          </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="execute_stepAttachment" />,
      dataIndex: 'attachments',
      key: 'attachments',
      render(attachments, record) {
        return (
          <TextEditToggle
            // onSubmit={() => that.editStep(record)}
            originData={attachments}
          >
            <Text>
              {/* <div id={`${record.stepId}-list`} style={{ overflow: 'hidden', height: 34 }} 
              onClick={that.handleChangeExpand.bind(this, record.stepId)} role="none">
                <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', 
                paddingRight: 15 }} id={`${record.stepId}-attachment`}>
                  {
                    attachments.map(attachment => (
                      <div style={{ padding: '0 12px', height: 23, 
                      lineHeight: '23px', maxWidth: 192, borderRadius: '100px',
                       background: 'rgba(0, 0, 0, 0.08)', margin: 5 }} className="c7n-text-dot">
                        {attachment.attachmentName}
                      </div>
                    ))
                  }
                  {
                    attachments && attachments.length && document.getElementById(
                      `${record.stepId}-attachment`) && parseInt(window.getComputedSty
                        le(document.getElementById(`${record.stepId}-attachment`)).height, 10) > 40
                      ? <span style={{ position: 'absolute', top: 10, right: 0 }}
                       className={_.indexOf(that.state.expand, record.stepId) 
                        !== -1 ? 'icon icon-keyboard_arrow_up' : 'icon icon-keyboard_arrow_down'} 
                        /> : null
                  }
                </div>
              </div> */}
              <div style={{ display: 'flex', overflow: 'hidden' }}>
                {attachments.map(attachment => (
                  <div style={{ fontSize: '12px', flexShrink: 0, margin: '0 2px' }} className="c7n-text-dot">
                    <Icon type="attach_file" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }} />
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
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

        );
      },
    }, {
      title: null,
      dataIndex: 'action',
      key: 'action',
      render(attachments, record) {
        return (
          <div>
            <Icon type="library_books" style={{ cursor: 'pointer', margin: '0 5px' }} onClick={() => that.cloneStep(record.stepId)} />
            <Icon type="delete_forever" style={{ cursor: 'pointer', margin: '0 5px' }} onClick={() => that.handleDeleteTestStep(record.stepId)} />
          </div>
          // <Dropdown overlay={menus} trigger={['click']} onClick={() => 
          // that.setState({ currentTestStepId: record.stepId,
          //  currentAttments: record.attachments })}>
          //   <Button icon="more_vert" shape="circle" />

          // </Dropdown>
        );
      },
    }];
    return (
      <div className="c7n-TestStepTable">
        <Form>
          <DragTable
            pagination={false}
            filterBar={false}
            dataSource={this.state.data}
            columns={columns}
            onDragEnd={this.onDragEnd}
            dragKey="stepId"
          />
          {
            this.state.editTestStepShow ? (
              <EditTestStep
                attachments={this.state.currentAttments}
                issueId={this.props.issueId}
                stepId={this.state.currentTestStepId}
                visible={this.state.editTestStepShow}
                onCancel={() => {
                  this.setState({ editTestStepShow: false });
                  this.props.onOk();
                }}
                onOk={() => {
                  this.setState({ editTestStepShow: false });
                  this.props.onOk();
                }}
              />
            ) : null
          }
        </Form>
      </div>
    );
  }
}

export default Form.create({})(TestStepTable);
