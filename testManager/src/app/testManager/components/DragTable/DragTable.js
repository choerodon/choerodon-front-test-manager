import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Dropdown, Menu, Modal } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import './DragTable.scss';

class DragTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [], 
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

  renderThead=(data) => {
    const { columns } = this.props;
    const ths = columns.map(column => (<th>{column.title} </th>));
    return (<tr>{ths}</tr>);
  }
  renderTbody(data) {
    const result = [];
    const { columns } = this.props;
    _.forEach(data, (item, index) => {
      result.push(
        <Draggable key={item.executeId} draggableId={item.executeId} index={index}>
          {(provided, snapshot) =>
            (
              <tr
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}

              >             
                {columns.map((column) => {
                  let renderedItem = null;
                  const { dataIndex, key, render } = column;
                  if (render) {
                    renderedItem = render(data[index][dataIndex], data[index]);
                  } else {
                    renderedItem = (<span>
                      {data[index][dataIndex]}
                    </span>);
                  }
                  return (<td>
                    {renderedItem}
                  </td>);
                })}    
              </tr>
            )
          }
        </Draggable>,
      );
    });
    return result;
  }

  render() {
    const { data } = this.state;
    return (
      <div className="c7n-dragtable">
        <DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
          <table>
          
            <thead>
              {this.renderThead(data)}
            
            </thead>
            <Droppable droppableId="dropTable">
              {(provided, snapshot) => (
                <tbody
                  ref={provided.innerRef}
                  style={{
                    // background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                    padding: 'grid',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    marginBottom: 0,
                  }}
                >
                  {this.renderTbody(this.state.data)}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    );
  }
}

export default DragTable;
