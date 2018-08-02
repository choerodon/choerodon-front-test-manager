// 可拖动table
import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Table } from 'choerodon-ui';
import './DragTable.scss';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};
class DragTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }
  componentWillReceiveProps(nextProps) {
    // 更新数据并避免拖动后的跳动
    if (!(this.props.loading === false && nextProps.loading === true)) {
      this.setState({ data: nextProps.dataSource });
    }
  }
  onDragEnd(result) {
    if (result.destination) {
      const fromIndex = result.source.index;
      const toIndex = result.destination.index;
      if (fromIndex === toIndex) {
        return;
      }
      const data = reorder(
        this.state.data,
        fromIndex,
        toIndex,
      );
      this.setState({ data });
      const { onDragEnd } = this.props;
      if (onDragEnd) {
        onDragEnd(fromIndex, toIndex);
      }
    }
  }
  components = {
    table: () => (<DragDropContext onDragEnd={this.onDragEnd.bind(this)}>
      <table>
        <thead>
          {this.renderThead()}
        </thead>
        <Droppable droppableId="dropTable">
          {(provided, snapshot) => (
            <tbody
              ref={provided.innerRef}              
            >
              {this.renderTbody(this.state.data)}
              {provided.placeholder}
            </tbody>
          )}
        </Droppable>
      </table>
    </DragDropContext>),
  }
  renderThead = () => {
    const { columns } = this.props;
    const ths = columns.map(column => (
      <th style={{ flex: column.flex || 1 }}>{column.title} </th>
    ));
    return (<tr>{ths}</tr>);
  }
  renderTbody(data) {   
    const { columns, dragKey } = this.props;
    const rows = data.map((item, index) => 
      (<Draggable key={item[dragKey]} draggableId={item[dragKey]} index={index}>
        {(provided, snapshot) =>
          (
            <tr
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              {columns.map((column) => {
                let renderedItem = null;
                const { dataIndex, key, flex, render } = column;
                if (render) {
                  renderedItem = render(data[index][dataIndex], data[index], index);
                } else {
                  renderedItem = data[index][dataIndex];
                }
                return (<td style={{ flex: flex || 1 }} >
                  {renderedItem}
                </td>);
              })}
            </tr>
          )
        }
      </Draggable>),
    );
    return rows;
  }

  render() {
    const { data } = this.state;
    return (
      <div className="c7n-dragtable">        
        <Table
          {...this.props}   
          dataSource={data}
          components={this.components}
        />
      </div>
    );
  }
}

export default DragTable;

