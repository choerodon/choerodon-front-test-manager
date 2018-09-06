import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  Menu, Input, Dropdown, Button, Popover, Tooltip, Icon,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { IssueTreeStore } from '../../../store/project/treeStore';
import { editFolder, deleteFolder, moveIssues } from '../../../api/IssueApi';
import IssueStore from '../../../store/project/IssueStore';
import './IssueTreeTitle.scss';

@observer
class IssueTreeTitle extends Component {
  state = {
    editing: false,
    enter: false,
  }

  addFolder = (data) => {
    this.props.callback(data, 'ADD_FOLDER');
  }

  handleItemClick = ({ item, key, keyPath }) => {
    const { data, refresh } = this.props;
    const { type, cycleId } = data;
    switch (key) {
      case 'rename': {
        this.setState({
          editing: true,
        });
        break;
      }
      case 'delete': {
        deleteFolder(cycleId).then((res) => {
          if (res.failed) {
            Choerodon.prompt('删除失败');
          } else {
            refresh();
          }
        }).catch((err) => {
          Choerodon.prompt('网络异常');
        });
        break;
      }
      case 'copy': {
        // deleteCycleOrFolder(cycleId).then((res) => {
        //   if (res.failed) {
        //     Choerodon.prompt('删除失败');
        //   } else {
        //     IssueTreeStore.setCurrentCycle({});
        //     refresh();
        //   }
        // }).catch((err) => {

        // });
        break;
      }
      case 'paste': {
        // this.props.callback(data, 'CLONE_FOLDER');
        // cloneFolder(cycleId, data).then((data) => {
        // this.props.refresh();
        break;
      }
      default: break;
    }
  }

  handleEdit = (data) => {
    editFolder(data).then((res) => {
      if (res.failed) {
        Choerodon.prompt('文件夹名字重复');
      } else {
        this.props.refresh();
      }
    });
    this.setState({
      editing: false,
    });
  }


  enterCopy = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.keyCode === 17) {
      const templateCopy = document.getElementById('template_folder_copy').cloneNode(true);
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
    const templateMove = document.getElementById('template_folder_move').cloneNode(true);
    templateMove.style.display = 'block';
    // IssueStore.setCopy(true);

    if (this.instance.firstElementChild) {
      this.instance.replaceChild(templateMove, this.instance.firstElementChild);
    } else {
      this.instance.appendChild(templateMove);
    }
  }

  moveIssues = (cycleId, versionId, e) => {
    this.setState({
      enter: false,
    });
    console.log(e.ctrlKey, cycleId, IssueStore.getDraggingTableItems);
    const isCopy = e.ctrlKey;
    const issueLinks = IssueStore.getDraggingTableItems.map(issue => ({
      issueId: issue.issueId,
      summary: issue.summary,
      objectVersionNumber: issue.objectVersionNumber,
    }));
    // debugger;
    if (!isCopy) {
      moveIssues(versionId, cycleId, issueLinks).then((res) => {
        IssueStore.setDraggingTableItems([]);
        IssueStore.loadIssues();
      }).catch((err) => {
        Choerodon.prompt('网络错误');
      });
    }
  }

  render() {
    const getMenu = (type) => {
      let items = [];
      // if (type === 'temp') {
      items.push(
        <Menu.Item key="rename">
          <FormattedMessage id="issue_tree_rename" />
        </Menu.Item>,
      );
      // } else {
      // if (type === 'cycle') {         
      items = items.concat([
        <Menu.Item key="delete">
          <FormattedMessage id="issue_tree_delete" />
        </Menu.Item>,
        <Menu.Item key="copy">
          <FormattedMessage id="issue_tree_copy" />
        </Menu.Item>,
        <Menu.Item key="paste">
          <FormattedMessage id="issue_tree_paste" />
        </Menu.Item>,
      ]);
      // }
      return <Menu onClick={this.handleItemClick} style={{ margin: '10px 0 0 28px' }}>{items}</Menu>;
    };
    const {
      editing, enter, mode,
    } = this.state;
    const { data, title } = this.props;
    // const { title } = data;
    let type = null;
    if (data.type === 'temp') {
      type = 'temp';
    } else if (data.versionId && data.type !== 'cycle') {
      type = 'version';
    } else if (data.type === 'cycle') {
      type = 'cycle';
    }
    const treeTitle = (
      <div
        className="c7n-issue-tree-title"
      >        
        {editing
          ? (
            <Input
              style={{ width: 100 }}
              defaultValue={data.title}
              autoFocus
              onBlur={(e) => {
                if (e.target.value === data.title) {
                  this.setState({
                    editing: false,
                  });
                  return;
                }
                this.handleEdit({
                  folderId: data.cycleId,
                  name: e.target.value,
                  type: 'cycle',
                  objectVersionNumber: data.objectVersionNumber,
                });
              }}
            />
          )
          : (
            <div className="c7n-issue-tree-title-text">
              <Tooltip title={title}>
                {title}
              </Tooltip>
            </div>
          )}
        <div role="none" className="c7n-issue-tree-title-actionButton" onClick={e => e.stopPropagation()}>
          {/* {data.type === 'temp'
        ? null : */}
          {
            type === 'version'
              ? <Icon type="folder_special" className="c7n-add-folder" onClick={this.addFolder.bind(this, data)} />
              : null
          }
          {
            type === 'cycle'
            && (
              <Dropdown overlay={getMenu(data.type)} trigger={['click']}>
                <Button shape="circle" icon="more_vert" />
              </Dropdown>
            )
          }
        </div>
      </div>
    );
    if (type === 'version') {
      return (
        <Droppable droppableId={data.versionId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{ border: snapshot.isDraggingOver && JSON.parse(snapshot.draggingOverWith).versionId !== data.versionId && '2px dashed green', height: 30 }}
            >
              {treeTitle}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    } else if (type === 'cycle') {
      return (
        <Droppable droppableId={data.key} isDropDisabled={!IssueStore.tableDraging}>
          {(provided, snapshot) => (
            <div
              role="none"
              ref={provided.innerRef}
              style={{ border: IssueStore.tableDraging && enter && '2px dashed green', height: 30 }}
              {...{
                onMouseEnter: IssueStore.tableDraging ? () => {
                  this.setState({
                    enter: true,
                  });
                } : null,
                onMouseLeave: IssueStore.tableDraging ? () => {
                  this.setState({
                    enter: false,
                  });
                } : null,
                onMouseUp:
                  IssueStore.tableDraging && this.moveIssues.bind(this, data.cycleId, data.versionId),
              }}
            >
              <Draggable key={data.key} draggableId={JSON.stringify({ folderId: data.cycleId, versionId: data.versionId, objectVersionNumber: data.objectVersionNumber })}>
                {(providedinner, snapshotinner) => {
                  if (snapshotinner.isDragging) {
                    document.addEventListener('keydown', this.enterCopy);
                    document.addEventListener('keyup', this.leaveCopy);
                  } else {
                    document.removeEventListener('keydown', this.enterCopy);
                    document.removeEventListener('keyup', this.leaveCopy);
                  }
                  return (
                    <div                      
                      ref={providedinner.innerRef}
                      {...providedinner.draggableProps}
                      {...providedinner.dragHandleProps}                      
                    >
                      <div
                        style={{
                          position: 'relative',
                          // background: snapshotinner.isDragging && 'white',
                        }}
                      >
                        {treeTitle}
                        {snapshotinner.isDragging
                        && (
                          <div className="IssueTree-drag-prompt">
                            <div>
                              复制或移动文件夹
                            </div>
                            <div>
                              按下ctrl/command复制
                            </div>
                            <div
                              ref={(instance) => { this.instance = instance; }}
                            >
                              <div>
                                当前状态：移动
                              </div>
                            </div>
                          </div>
                        )
                      }
                      </div>
                    </div>
                  );
                }

                }
              </Draggable>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    } else if (type === 'temp') {
      return (
        <Droppable droppableId={data.key} isDropDisabled={!IssueStore.tableDraging}>
          {(provided, snapshot) => (
            <div
              role="none"
              ref={provided.innerRef}
              style={{ border: IssueStore.tableDraging && enter && '2px dashed green', height: 30 }}
              {...{
                onMouseEnter: IssueStore.tableDraging ? (e) => {
                  this.setState({
                    enter: true,
                  });
                } : null,
                onMouseLeave: IssueStore.tableDraging ? () => {
                  this.setState({
                    enter: false,
                  });
                } : null,
                onMouseUp:
                  IssueStore.tableDraging && this.moveIssues.bind(this, data.cycleId, data.versionId),
              }}
            >
              {treeTitle}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    } else {
      return treeTitle;
    }
  }
}

IssueTreeTitle.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.element.isRequired,
};

export default IssueTreeTitle;
