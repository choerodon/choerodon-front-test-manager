import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { Draggable } from 'react-beautiful-dnd';
import IssueStore from '../../../store/project/IssueManage/IssueStore';

@observer
class TableDraggleItem extends Component {
  render() {
    const draggingTableItems = IssueStore.getDraggingTableItems;
    const {
      issue, index, selectedIssue, handleClickIssue, 
    } = this.props;

    return (
      <Draggable key={issue.issueId} draggableId={issue.issueId} index={index} isDragDisabled={issue.typeCode === 'issue_auto_test'}>
        {(provided, snapshotinner) => (
          <tr
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              background: !snapshotinner.isDragging && issue.typeCode !== 'issue_auto_test' && _.find(draggingTableItems, { issueId: issue.issueId }) && 'rgb(235, 242, 249)',
              position: 'relative',
              ...provided.draggableProps.style,
            }}
            onClick={(e) => { this.props.handleClickIssue(issue, index, e); }}
            className={issue.issueId === selectedIssue.issueId ? 'c7ntest-border-visible c7ntest-table-item' : 'c7ntest-border c7ntest-table-item'}
          >
            {snapshotinner.isDragging
              && (
                <div style={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  background: 'red',
                  textAlign: 'center',
                  color: 'white',
                  borderRadius: '50%',
                  top: 0,
                  left: 0,
                }}
                >
                  {draggingTableItems.length}
                </div>
              )
            }
            {snapshotinner.isDragging
              && (
                <div className="IssueTable-drag-prompt">
                  <div>
                    {'复制或移动测试用例'}
                  </div>
                  <div> 按下ctrl/command复制</div>
                  <div
                    ref={(instance) => { this.props.saveRef(instance); }}
                  >
                    <div>
                      {'当前状态：'}
                      <span style={{ fontWeight: 500 }}>移动</span>
                    </div>
                  </div>
                </div>
              )
            }
            {this.props.children}
          </tr>
        )
        }
      </Draggable>
    );
  }
}

TableDraggleItem.propTypes = {

};

export default TableDraggleItem;
