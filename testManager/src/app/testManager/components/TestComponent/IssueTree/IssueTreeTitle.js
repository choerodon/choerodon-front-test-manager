import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Menu, Input, Dropdown, Button, Popover, Tooltip, Icon,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { IssueTreeStore } from '../../../store/project/treeStore';
import { editFolder, deleteFolder } from '../../../api/IssueApi';
import './IssueTreeTitle.scss';

class IssueTreeTitle extends Component {
  state = {
    editing: false,
    over: false,
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

  onDragEnter=() => {
    this.setState({
      over: true,
    });
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
    const { editing, over } = this.state;
    const { data, title } = this.props;
    // const { title } = data;
    let type = null;
    if (data.versionId && data.type !== 'cycle') {
      type = 'version';
    } else if (data.type === 'cycle') {
      type = 'cycle';
    }
    return (
      <div
        className="c7n-issue-tree-title"
        // ref={instance => this.instance = instance}
        style={{
          background: over && 'green',
        }}
        // draggable={type === 'cycle'}
        // draggable
        // onDragStart={() => {
        //   console.log('start');
        // }}
        // onDrop={() => {
        //   console.log('drop');
        // }}
        // onDragEnter={() => {
        //   console.log('enter');
        //   this.instance.style.background = 'green';
        //   // this.setState({
        //   //   over: true,
        //   // });
        // }}
        // onDragLeave={() => {
        //   console.log('leave');
        //   // this.setState({
        //   //   over: false,
        //   // });
        //   this.instance.style.background = 'red';
        // }}
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
  }
}

IssueTreeTitle.propTypes = {
  data: PropTypes.object.isRequired,
  title: PropTypes.element.isRequired,
};

export default IssueTreeTitle;
