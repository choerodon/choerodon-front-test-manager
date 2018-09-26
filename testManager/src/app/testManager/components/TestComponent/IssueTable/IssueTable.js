
import React, { Component } from 'react';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

import IssueStore from '../../../store/project/IssueStore';

import {
  renderType, renderIssueNum, renderSummary, renderPriority, renderVersions, renderFolder,
  renderComponents, renderLabels, renderAssigned, renderStatus,
} from './tags';
import './IssueTable.scss';


@observer
class IssueTable extends Component {
  state = {
    firstIndex: null,
  }

  renderTestIssue(issue) {
    const {
      issueId,
      typeCode, issueNum, summary, assigneeId, assigneeName, assigneeImageUrl, reporterId,
      reporterName, reporterImageUrl, statusName, statusColor, priorityName, priorityCode,
      folderName, epicColor, componentIssueRelDTOList, labelIssueRelDTOList,
      versionIssueRelDTOList, creationDate, lastUpdateDate,
    } = issue;
    return (
      <div style={{ marginTop: '5px', marginBottom: '5px', cursor: 'pointer' }}>
        <div style={{
          display: 'flex', marginBottom: '5px', width: '100%', flex: 1,
        }}
        >
          {/* {{renderType(typeCode)}} */}
          {renderIssueNum(issueNum)}
          {renderSummary(summary)}
        </div>
        <div style={{ display: 'flex' }}>
          {renderPriority(priorityCode, priorityName)}
          {renderVersions(versionIssueRelDTOList)}
          {renderFolder(folderName)}
          <div className="c7n-flex-space" />
          {renderAssigned(assigneeId, assigneeName, assigneeImageUrl)}
          {renderStatus(statusName, statusColor)}
        </div>
      </div>
    );
  }

  renderWideIssue(issue) {
    const {
      issueId,
      typeCode, issueNum, summary, assigneeId, assigneeName, assigneeImageUrl, reporterId,
      reporterName, reporterImageUrl, statusName, statusColor, priorityName, priorityCode,
      folderName, epicColor, componentIssueRelDTOList, labelIssueRelDTOList,
      versionIssueRelDTOList, creationDate, lastUpdateDate,
    } = issue;
    return (
      <div style={{
        display: 'flex', flex: 1, marginTop: '3px', marginBottom: '3px', cursor: 'pointer',
      }}
      >
        {/* {renderType(typeCode)} */}
        {renderIssueNum(issueNum)}
        {renderSummary(summary)}
        <div className="c7n-flex-space" />
        {renderPriority(priorityCode, priorityName)}
        {renderVersions(versionIssueRelDTOList)}
        {renderFolder(folderName)}
        {renderComponents(componentIssueRelDTOList)}
        {/* 标签 */}
        {renderLabels(labelIssueRelDTOList)}
        {renderAssigned(assigneeId, assigneeName, assigneeImageUrl)}
        {renderStatus(statusName, statusColor)}
      </div>
    );
  }

  renderNarrowIssue(issue) {
    const {
      issueId,
      typeCode, issueNum, summary, assigneeId, assigneeName, assigneeImageUrl, reporterId,
      reporterName, reporterImageUrl, statusName, statusColor, priorityName, priorityCode,
      folderName, epicColor, componentIssueRelDTOList, labelIssueRelDTOList,
      versionIssueRelDTOList, creationDate, lastUpdateDate,
    } = issue;
    return (
      <div style={{ marginTop: '5px', marginBottom: '5px', cursor: 'pointer' }}>
        <div style={{
          display: 'flex', marginBottom: '5px', width: '100%', flex: 1,
        }}
        >
          {/* {{renderType(typeCode)}} */}
          {renderIssueNum(issueNum)}
          {renderSummary(summary)}
        </div>
        <div style={{ display: 'flex' }}>

          {renderPriority(priorityCode, priorityName)}
          {renderFolder(folderName)}
          <div className="c7n-flex-space" />
          {renderAssigned(assigneeId, assigneeName, assigneeImageUrl)}
          {renderStatus(statusName, statusColor)}
        </div>
      </div>
    );
  }

  renderIssue = (issue) => {
    const { expand, treeShow } = this.props;
    if (!expand) {
      return this.renderWideIssue(issue);
    } else if (expand && !treeShow) {
      return this.renderNarrowIssue(issue);
    } else {
      return this.renderTestIssue(issue);
    }
  }

  onDragEnd = (result) => {
    // console.log('end', result);
    IssueStore.setTableDraging(false);
    document.removeEventListener('keydown', this.enterCopy);
    document.removeEventListener('keyup', this.leaveCopy);
  }

  onDragStart = (monitor) => {
    const draggingTableItems = IssueStore.getDraggingTableItems;
    if (draggingTableItems.length < 1 || _.findIndex(draggingTableItems, { issueId: monitor.draggableId }) < 0) {
      const index = monitor.source.index;
      this.setState({
        firstIndex: index,
      });
      IssueStore.setDraggingTableItems([IssueStore.getIssues[index]]);
    }
    IssueStore.setTableDraging(true);
    document.addEventListener('keydown', this.enterCopy);
    document.addEventListener('keyup', this.leaveCopy);
  }

  enterCopy = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.keyCode === 17 || e.keyCode === 93 || e.keyCode === 91 || e.keyCode === 224) {
      const templateCopy = document.getElementById('template_copy').cloneNode(true);
      templateCopy.style.display = 'block';
      // IssueStore.setCopy(true);
      if (this.instance.firstElementChild) {
        this.instance.replaceChild(templateCopy, this.instance.firstElementChild);
      } else {
        this.instance.appendChild(templateCopy);
      }
      // this.instance.innerText = '复制';
    }
  }

  leaveCopy = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const templateMove = document.getElementById('template_move').cloneNode(true);
    templateMove.style.display = 'block';
    // IssueStore.setCopy(true);

    if (this.instance.firstElementChild) {
      this.instance.replaceChild(templateMove, this.instance.firstElementChild);
    } else {
      this.instance.appendChild(templateMove);
    }
  }

  handleClickIssue(issue, index, e) {
    const { setSelectIssue, setExpand } = this.props;
    const { firstIndex } = this.state;
    // console.log(e.shiftKey, e.ctrlKey, issue, index, firstIndex);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      if (e.shiftKey) {
        if (firstIndex !== null) {
          const start = Math.min(firstIndex, index);
          const end = Math.max(firstIndex, index);
          // debugger;
          const draggingTableItems = IssueStore.getIssues.slice(start, end + 1);
          console.log(draggingTableItems);
          IssueStore.setDraggingTableItems(draggingTableItems);
        }
      } else {
        // 是否已经选择
        const old = IssueStore.getDraggingTableItems;
        const hasSelected = _.findIndex(old, { issueId: issue.issueId });

        // 已选择就去除
        if (hasSelected >= 0) {
          old.splice(hasSelected, 1);
        } else {
          old.push(issue);
        }
        console.log(hasSelected, old);
        IssueStore.setDraggingTableItems(old);
      }
    } else {
      IssueStore.setDraggingTableItems([]);
      setExpand(true);
      setSelectIssue(issue);
    }
    this.setState({
      firstIndex: index,
    });
  }

  render() {
    const {
      expand, selectedIssue, setSelectIssue, setExpand,
    } = this.props;
    const draggingTableItems = IssueStore.getDraggingTableItems;
    // console.log('render', draggingTableItems);
    // const columns = [
    //   {
    //     title: 'summary',
    //     dataIndex: 'summary',
    //     render: (summary, record) => (
    //       expand ? this.renderNarrowIssue(record) : this.renderTestIssue(record)
    //     ),
    //   },
    // ];
    return (
      <Spin spinning={IssueStore.loading}>
        <div id="template_copy" style={{ display: 'none' }}>
          {'当前状态：'}
          <span style={{ fontWeight: 500 }}>复制</span>
        </div>
        <div id="template_move" style={{ display: 'none' }}>
          {'当前状态：'}
          <span style={{ fontWeight: 500 }}>移动</span>
        </div>
        <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
          <Droppable droppableId="dropTable" isDropDisabled>
            {(provided, snapshot) => (
              <div ref={provided.innerRef}>
                {
                  _.slice(IssueStore.getIssues).map((issue, i) => (
                    <Draggable key={issue.issueId} draggableId={issue.issueId} index={i}>
                      {
                        (providedinner, snapshotinner) => (
                          <div
                            ref={providedinner.innerRef}
                            {...providedinner.draggableProps}
                            {...providedinner.dragHandleProps}
                          >
                            <div
                              role="none"
                              onClick={this.handleClickIssue.bind(this, issue, i)}
                              className={issue.issueId === selectedIssue.issueId ? 'c7n-border-visible c7n-table-item' : 'c7n-border c7n-table-item'}
                              style={{
                                background: !snapshotinner.isDragging && _.find(draggingTableItems, { issueId: issue.issueId }) && 'rgb(235, 242, 249)',
                                position: 'relative',
                              }}
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
                                      ref={(instance) => { this.instance = instance; }}
                                    >
                                      <div>
                                        {'当前状态：'}
                                        <span style={{ fontWeight: 500 }}>移动</span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              {this.renderIssue(issue)}
                            </div>
                          </div>
                        )
                      }
                    </Draggable>
                  ))
                }
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Spin>
    );
  }
}

IssueTable.propTypes = {

};

export default IssueTable;
