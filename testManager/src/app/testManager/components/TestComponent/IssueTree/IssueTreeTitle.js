import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import {
  Menu, Input, Dropdown, Button, Popover, Tooltip, Icon,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { IssueTreeStore } from '../../../store/project/treeStore';
import { editFolder, deleteFolder } from '../../../api/IssueApi';
import IssueStore from '../../../store/project/IssueStore';
import './IssueTreeTitle.scss';

@observer
class IssueTreeTitle extends Component {
  state = {
    editing: false,   
    enter: false,
  }

  // componentWillReact() {
  //   if(IssueStore)
  //   document.addEventListener('keydown', this.enterCopy);
  //   document.addEventListener('keyup', this.leaveCopy);
  // }

  // componentWillUnmount() {
  //   document.removeEventListener('keydown', this.enterCopy);
  //   document.removeEventListener('keyup', this.leaveCopy);
  // }

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
    // if (e.keyCode === 17) {
    //   IssueStore.setCopy(true);
    // }
    this.instance.innerText = '复制';
    console.log(this.state.mode);
  }

  leaveCopy = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    // IssueStore.setCopy(false);
    this.instance.innerText = '移动';
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
                  cycleId: data.cycleId,
                  cycleName: e.target.value,
                  type: 'folder',
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
        <Droppable droppableId={data.key} data={data}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{ border: snapshot.isDraggingOver && '2px dashed green', height: 30 }}
            >
              {treeTitle}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    } else if (type === 'cycle') {
      return (
        <Droppable droppableId={data.key} data={data} isDropDisabled={!IssueStore.tableDraging}>
          {(provided, snapshot) => (
            <div
              role="none"
              ref={provided.innerRef}
              style={{ border: IssueStore.tableDraging && enter && '2px dashed green', height: 30 }}
              onMouseEnter={() => {
                this.setState({
                  enter: true,
                });
              }}
              onMouseLeave={() => {
                this.setState({
                  enter: false,
                });
              }}
              onMouseUp={() => {
                console.log(data.cycleId, IssueStore.getDraggingTableItems);
              }}
            >
              <Draggable key={data.key} draggableId={data.key} data={data}>
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
                      {treeTitle}
                      {snapshotinner.isDragging && (
                      <div
                        ref={(instance) => { this.instance = instance; }}
                      >
                        移动
                      </div>
                      )
                    }
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
        <Droppable droppableId={data.key} data={data} isDropDisabled>
          {(provided, snapshot) => (
            <div
              role="none"
              ref={provided.innerRef}
              style={{ border: IssueStore.tableDraging && enter && '2px dashed green', height: 30 }}
              onMouseEnter={() => {
                this.setState({
                  enter: true,
                });
              }}
              onMouseLeave={() => {
                this.setState({
                  enter: false,
                });
              }}
              onMouseUp={() => {
                console.log(data.cycleId, IssueStore.getDraggingTableItems);
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
