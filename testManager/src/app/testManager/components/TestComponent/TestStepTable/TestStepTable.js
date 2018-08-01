import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu, Modal } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import EditTestStep from '../EditTestStep';

const { AppState } = stores;
const confirm = Modal.confirm;

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

  onDragEnd(result) {
    window.console.log(result);
    const arr = this.state.data.slice();
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) {
      return;
    }
    const drag = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, drag);
    this.setState({ data: arr });
    // arr此时是有序的，取toIndex前后两个的rank
    const lastRank = toIndex === 0 ? null : arr[toIndex - 1].rank;
    const nextRank = toIndex === arr.length - 1 ? null : arr[toIndex + 1].rank;
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
        a[toIndex] = res;
        this.setState({
          data: a,
        });
      });
  }

  getMenu = () => (
    <Menu onClick={this.handleClickMenu.bind(this)}>
      <Menu.Item key="edit">
        <FormattedMessage id="edit" />
      </Menu.Item>
      <Menu.Item key="delete">
        <FormattedMessage id="delete" />
      </Menu.Item>
      <Menu.Item key="clone">
        <FormattedMessage id="clone" />
      </Menu.Item>
    </Menu>
  );

  handleClickMenu(e) {
    const testStepId = this.state.currentTestStepId;
    if (e.key === 'edit') {
      this.setState({
        editTestStepShow: true,
      });
    } else if (e.key === 'delete') {
      this.handleDeleteTestStep();
    } else if (e.key === 'clone') {
      axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/case/step/clone`, {
        stepId: testStepId,
        issueId: this.props.issueId,
      })
        .then((res) => {
          this.props.onOk();
        })
        .catch((error) => {
        });
    }
  }

  handleDeleteTestStep() {
    const testStepId = this.state.currentTestStepId;
    const that = this;
    confirm({
      width: 560,
      title: Choerodon.getMessage('确认删除吗？', 'Confirm delete'),
      content: <div style={{ marginBottom: 32 }}>
        {Choerodon.getMessage('当你点击删除后，该条数据将被永久删除，不可恢复!', 'When you click delete, after which the data will be permanently deleted and irreversible!')
        }
      </div>,
      onOk() {
        return axios.delete(`/test/v1/projects/${AppState.currentMenuType.id}/case/step`, { data: { stepId: testStepId } })
          .then((res) => {
            that.props.onOk();
          });
      },
      onCancel() {},
      okText: Choerodon.getMessage('删除', 'Delete'),
      okType: 'danger',
    });
  }

  handleChangeExpand(id) {
    const expand = this.state.expand.slice();

    if (expand.includes(id)) {
      // window.console.log(id, 'remove');
      expand.splice(expand.indexOf(id), 1);
      document.getElementsByClassName(`${id}-list`)[0].style.height = '34px';
    } else {
      // window.console.log(id, 'add');
      expand.push(id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = 'auto';
    }
    // window.console.log(expand);
    this.setState({ expand });
  }

  renderIssueOrIntro(issues) {
    if (issues) {
      if (issues.length >= 0) {
        return this.renderSprintIssue(issues);
      }
    }
    return '';
  }

  renderSprintIssue(data, sprintId) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
        <Draggable key={item.stepId} draggableId={item.stepId} index={index}>
          {(provided1, snapshot1) => 
            (
              <div
                ref={provided1.innerRef}
                {...provided1.draggableProps}
                {...provided1.dragHandleProps}
              >
                <div className={`${item.stepId}-list`} style={{ width: '100%', display: 'flex', height: 34, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  <span style={{ flex: 1, lineHeight: '34px' }}>
                    <span style={{ paddingLeft: 20, boxSizing: 'border-box' }}>
                      {/* {item.stepId} */}
                      {index + 1}
                    </span>
                  </span>
                  <span style={{ flex: 2, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.testStep}
                  </span>
                  <span style={{ flex: 2, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.testData}
                  </span>
                  <span style={{ flex: 2, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.expectedResult}
                  </span>
                  <span style={{ flex: 5, display: 'inline-block', overflow: 'hidden', position: 'relative' }} role="none" onClick={this.handleChangeExpand.bind(this, item.stepId)}>
                    <div className={`${item.stepId}-attachment`} style={{ }}>
                      {
                        item.attachments.map(attachment => (
                          <span style={{ padding: '3px 12px', display: 'inline-block', maxWidth: 192, marginTop: 4, lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', borderRadius: '100px', background: 'rgba(0, 0, 0, 0.08)', marginRight: 6 }}>
                            {attachment.attachmentName}
                          </span>
                        ))
                      }
                    </div>
                    {
                      item.attachments && item.attachments.length && document.getElementsByClassName(`${item.stepId}-attachment`)[0] && parseInt(window.getComputedStyle(document.getElementsByClassName(`${item.stepId}-attachment`)[0]).height, 10) > 34
                        ? <span style={{ position: 'absolute', top: 10, right: 0 }} className={_.indexOf(this.state.expand, item.stepId) !== -1 ? 'icon icon-keyboard_arrow_up' : 'icon icon-keyboard_arrow_down'} /> : null
                    }
                  </span>
                  <span style={{ width: 50, lineHeight: '34px' }}>
                    <Dropdown overlay={this.getMenu()} trigger={['click']} onClick={() => this.setState({ currentTestStepId: item.stepId, currentAttments: item.attachments })}>
                      <Button icon="more_vert" shape="circle" />
                    </Dropdown>
                  </span>
                </div>
              </div>
            )
          }
        </Draggable>,
      );
    });
    return result;
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
        <div style={{ width: '100%' }}>
          <div style={{ width: '100%', height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)', display: 'flex' }}>
            <span style={{ flex: 1, lineHeight: '30px' }} />
            <span style={{ flex: 2, lineHeight: '30px' }}>
              <FormattedMessage id="execute_testStep" />
            </span>
            <span style={{ flex: 2, lineHeight: '30px' }}>
              <FormattedMessage id="execute_testData" />
            </span>
            <span style={{ flex: 2, lineHeight: '30px' }}>
              <FormattedMessage id="execute_expectedOutcome" />
            </span>
            <span style={{ flex: 5, lineHeight: '30px' }}>
              <FormattedMessage id="execute_stepAttachment" />
            </span>
            <span style={{ width: 50, lineHeight: '30px' }} />
          </div>
          <Droppable droppableId="dropTable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                  padding: 'grid',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  marginBottom: 0,
                }}
              >
                {this.renderIssueOrIntro(this.state.data)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
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
      </DragDropContext>
    );
  }
}

export default TestStepTable;
