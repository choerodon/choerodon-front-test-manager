import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Table, Spin } from 'choerodon-ui';
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
    // 更新数据并避免拖动后的跳动
    if (!(this.props.loading === false && nextProps.loading === true)) {
      this.setState({ data: nextProps.dataSource });
    } 
  }

  onDragEnd(result) {
    window.console.log(result);
    const data = this.state.data.slice();
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    if (fromIndex === toIndex) {
      return;
    }
    const drag = data[fromIndex];
    data.splice(fromIndex, 1);
    data.splice(toIndex, 0, drag);
    this.setState({ data });
    const { onDragEnd } = this.props;
    if (onDragEnd) {
      onDragEnd(fromIndex, toIndex);
    }
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
    const { loading, pagination } = this.props;

    // ReactDOM.render(dragarea, document.getElementsByClassName('ant-table-placeholder')[0]);
    return (
      <div className="c7n-dragtable">
        <Spin spinning={loading}>
          <Table
            {...this.props}
            loading={false}
            dataSource={[]}
          />
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
        </Spin>
      </div>
    );
  }
}

export default DragTable;

