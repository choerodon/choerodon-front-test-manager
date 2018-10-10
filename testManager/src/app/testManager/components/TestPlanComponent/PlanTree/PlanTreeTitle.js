import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Menu, Input, Dropdown, Button, Popover, Tooltip, Icon,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import './PlanTreeTitle.scss';
import { editFolder, deleteCycleOrFolder } from '../../../api/cycleApi';
import { syncFolder, syncFoldersInCycle, syncFoldersInVersion } from '../../../api/IssueManageApi';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';

@observer
class PlanTreeTitle extends Component {
  state = {
    editing: false,
  }

  sync=(item) => {
    const {
      type, cycleId, folderId, versionId, 
    } = item;
    TestPlanStore.enterLoading();
    if (type === 'folder') {      
      syncFolder(folderId, cycleId).then((res) => {
        TestPlanStore.getTree();
      });
    } else if (type === 'cycle') {
      syncFoldersInCycle(cycleId).then(() => {
        TestPlanStore.getTree();
      });
    } else {
      syncFoldersInVersion(versionId).then(() => {
        TestPlanStore.getTree();
      });
    }
  }

  handleItemClick = ({ item, key, keyPath }) => {
    const { data, refresh } = this.props;
    const { type, folderId, cycleId } = data;
    // window.console.log(this.props.data, { item, key, keyPath });
    switch (key) {
      case 'add': {
        this.props.callback(data, 'ADD_FOLDER');
        break;
      }
      case 'edit': {
        if (type === 'folder') {
          TestPlanStore.EditStage(data);
          // this.setState({
          //   editing: true,
          // });
        } else if (type === 'cycle') {
          TestPlanStore.EditCycle(data);
        }
        break;
      }
      case 'delete': {
        deleteCycleOrFolder(cycleId).then((res) => {
          if (res.failed) {
            Choerodon.prompt('删除失败');
          } else {
            TestPlanStore.setCurrentCycle({});
            refresh();
          }
        }).catch((err) => {

        });
        break;
      }
      case 'clone': {
        if (type === 'folder') {
          this.props.callback(data, 'CLONE_FOLDER');
          // cloneFolder(cycleId, data).then((data) => {

          // });
        } else if (type === 'cycle') {
          this.props.callback(data, 'CLONE_CYCLE');
        }
        // this.props.refresh();
        break;
      }
      case 'export': {
        this.props.callback(data, 'EXPORT_CYCLE');
        break;
      }
      case 'sync': {
        this.sync(data);
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

  render() {
    const getMenu = (type) => {
      let items = [];
      if (type === 'temp') {
        items.push(
          <Menu.Item key="export">
            {'导出循环'}
          </Menu.Item>,
        );
      } else if (type === 'folder' || type === 'cycle') {
        if (type === 'cycle') {
          items.push(
            <Menu.Item key="add">
              <FormattedMessage id="cycle_addFolder" />
            </Menu.Item>,
          );
        }
        items = items.concat([
          <Menu.Item key="edit">
            {type === 'folder' ? <FormattedMessage id="cycle_editFolder" /> : <FormattedMessage id="cycle_editCycle" />}
          </Menu.Item>,
          <Menu.Item key="delete">
            {type === 'folder' ? <FormattedMessage id="cycle_deleteFolder" /> : <FormattedMessage id="cycle_deleteCycle" />}
          </Menu.Item>,
          <Menu.Item key="clone">
            {type === 'folder' ? <FormattedMessage id="cycle_cloneFolder" /> : <FormattedMessage id="cycle_cloneCycle" />}
          </Menu.Item>,
          <Menu.Item key="export">
            {type === 'folder' ? <FormattedMessage id="cycle_exportFolder" /> : <FormattedMessage id="cycle_exportCycle" />}
          </Menu.Item>,
          <Menu.Item key="sync">
            <FormattedMessage id="cycle_sync" /> 
          </Menu.Item>,
          
        ]);
      }
      return <Menu onClick={this.handleItemClick} style={{ margin: '10px 0 0 28px' }}>{items}</Menu>;
    };

    const { editing } = this.state;
    const { title, data } = this.props;


    return (
      <div className="c7ntest-plan-tree-title">
        {editing
          ? (
            <Input
              style={{ width: 78 }}
              defaultValue={this.props.text}
              autoFocus
              onBlur={(e) => {
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
            <div className="c7ntest-plan-tree-title-text" style={{ width: !data.type && '120px' }}>
              <Tooltip title={title}>
                {title}
              </Tooltip>
            </div>
          )}   
        {
    
          <div role="none" className="c7ntest-plan-tree-title-actionButton" style={{ marginLeft: data.type === 'cycle' || data.type === 'temp' ? '18px' : 0 }} onClick={e => e.stopPropagation()}>
            {/* {data.type === 'temp'
              ? null : */}
            {data.type
              ? (
                <Dropdown overlay={getMenu(data.type)} trigger={['click']}>
                  <Button shape="circle" icon="more_vert" />
                </Dropdown>
              )
              : (
                <Tooltip title={<FormattedMessage id="cycle_sync" />}>
                  <Icon type="sync" className="c7ntest-add-folder" onClick={this.sync.bind(this, data)} />
                </Tooltip>
              )
                }
            {/* } */}
          </div>
            
          }     
        

      </div>
    );
  }
}

export default PlanTreeTitle;
