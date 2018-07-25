import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu, Modal } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';

const { AppState } = stores;
const confirm = Modal.confirm;

class DragTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
      issueId: undefined,
      editTestStepShow: false,
      currentTestStepId: undefined,
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
    // const testCaseStepDTO = {
    //   ...drag,
    //   lastRank: arr[toIndex].rank,
    // };
    // const projectId = AppState.currentMenuType.id;
    // axios.put(`/test/v1/projects/${projectId}/case/step/change`, testCaseStepDTO)
    //   .then((res) => {
    //     // save success
    //   });
  }

  getMenu = () => (
    <Menu onClick={this.handleClickMenu.bind(this)}>
      <Menu.Item key="edit">
        编辑
      </Menu.Item>
      <Menu.Item key="delete">
        删除
      </Menu.Item>
      <Menu.Item key="add">
        添加附件
      </Menu.Item>
    </Menu>
  );


  handleChangeExpand(id) {
    let expand = this.state.expand.slice();
    if (_.find(expand, v => v === id)) {
      expand = _.remove(expand, id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = '34px';
    } else {
      expand.push(id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = 'auto';
    }
    this.setState({ expand });
  }


  renderItem(data) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
        <Draggable key={item.executeId} draggableId={item.executeId} index={index}>
          {(provided, snapshot) =>
            (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}

              >
                <tr
                  // className={`${item.id}-list`}
                  style={{ width: '100%', display: 'flex', height: 34, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
                >
                  <td style={{ width: 50, display: 'inline-block', lineHeight: '34px', paddingLeft: 20 }}>
                    {item.executeId}
                  </td>
                  <td style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.executeId}
                  </td>
                  <td style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.executeId}
                  </td>
                  <td style={{ width: 115, display: 'inline-block', lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 15 }}>
                    {item.executeId}
                  </td>
                </tr>
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
        <table style={{ width: 680 }}>
          <thead>
            <tr style={{ width: '100%', height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
              <th style={{ width: 50, display: 'inline-block', lineHeight: '30px' }} />
              <th style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>
                测试步骤
              </th>
              <th style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>测试数据</th>
              <th style={{ width: 115, display: 'inline-block', lineHeight: '30px' }}>预期结果</th>
              <th style={{ width: 250, display: 'inline-block', lineHeight: '30px' }}>分步附件</th>
              <th />
            </tr>
          </thead>
          <Droppable droppableId="dropTable">
            {(provided, snapshot) => (
              <tbody
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                  padding: 'grid',
                  borderBottom: '1px solid rgba(0,0,0,0.12)',
                  marginBottom: 0,
                }}
              >
                {this.renderItem(this.state.data)}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
    );
  }
}

export default DragTable;
