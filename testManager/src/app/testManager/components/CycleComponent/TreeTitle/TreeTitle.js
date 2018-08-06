import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Menu, Input, Dropdown, Button, Popover, Tooltip } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import './TreeTitle.scss';
import { editFolder, deleteCycleOrFolder } from '../../../api/cycleApi';
import CycleStore from '../../../store/project/cycle/CycleStore';

class TreeTitle extends Component {
  state = {
    editing: false,
  }
  creatProcessBar = (processBar) => {
    let count = 0;
    const processBarObject = Object.entries(processBar);
    for (let a = 0; a < processBarObject.length; a += 1) {
      count += processBarObject[a][1];
    }
    return processBarObject.map((item, i) => {
      const percentage = (item[1] / count) * 100;
      return (
        <span key={Math.random()} className="c7n-pb-fill" style={{ backgroundColor: item[0], width: `${percentage}%` }} />
      );
    });
  };
  handleItemClick = ({ item, key, keyPath }) => {
    const { data, refresh } = this.props;
    const { type, cycleId } = data;
    // window.console.log(this.props.data, { item, key, keyPath });
    switch (key) {
      case 'add': {
        this.props.callback(data, 'ADD_FOLDER');
        break;
      }
      case 'edit': {
        if (type === 'folder') {
          this.setState({
            editing: true,
          });
        } else {
          this.props.callback(data, 'EDIT_CYCLE');
        }
        break;
      }
      case 'delete': {
        deleteCycleOrFolder(cycleId).then((res) => {
          if (res.failed) {
            Choerodon.prompt('删除失败');
          } else {
            CycleStore.setCurrentCycle({});
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
        const iframe = document.getElementById('invisible');
        iframe.src = 'file.doc';
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
        items.push(<Menu.Item key="export">
          导出循环
        </Menu.Item>);
      } else if (type === 'folder' || type === 'cycle') {
        if (type === 'cycle') {
          items.push(<Menu.Item key="add">
            <FormattedMessage id="cycle_addFolder" />
          </Menu.Item>);
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
          // <Menu.Item key="export">
          //   {type === 'folder' ? '导出文件夹' : '导出循环'}
          // </Menu.Item>,
        ]);
      }
      return <Menu onClick={this.handleItemClick} style={{ margin: '10px 0 0 28px' }}>{items}</Menu>;
    };

    const { editing } = this.state;
    const { title, processBar, data, statusList } = this.props;
    const ProcessBar = {};
    const content = [];
    for (let i = 0; i < statusList.length; i += 1) {
      const status = statusList[i];
      if (processBar[status.statusColor]) {
        ProcessBar[status.statusColor] = processBar[status.statusColor];
        content.push(<div style={{ display: 'flex', width: 100 }}>
          <div>{status.statusName}</div>
          <div className="c7n-flex-space" />
          <div>{processBar[status.statusColor]}</div>
        </div>);
      }
    }    
    
    return (
      <div className="c7n-tree-title">        
        {editing ?
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
          : <div className="c7n-tt-text">
            <Tooltip title={title}>
              {title}
            </Tooltip>
          </div>}

        {Object.keys(ProcessBar).length > 0 ? 
          <Popover
            content={<div>{content}</div>}
            title={null}
          >
            <div className="c7n-tt-processBar" style={{ marginLeft: data.type === 'cycle' || data.type === 'temp' ? '18px' : 0 }}>
              <div className="c7n-process-bar">
                <span className="c7n-pb-unfill">
                  <div className="c7n-pb-fill-parent">
                    {this.creatProcessBar(ProcessBar)}
                  </div>
                </span>
              </div>
            </div>
          </Popover> :
          <div className="c7n-tt-processBar" style={{ marginLeft: data.type === 'cycle' || data.type === 'temp' ? '18px' : 0 }}>
            <div className="c7n-process-bar">
              <span className="c7n-pb-unfill">
                <div className="c7n-pb-fill-parent">
                  {this.creatProcessBar(ProcessBar)}
                </div>
              </span>
            </div>
          </div>}
        <div role="none" className="c7n-tt-actionButton" onClick={e => e.stopPropagation()}>
          {data.type === 'temp'
            ? null :
            <Dropdown overlay={getMenu(data.type)} trigger={['click']}>
              <Button shape="circle" icon="more_vert" />
            </Dropdown>
          }
        </div>
        
      </div>
    );
  }
}

export default observer(TreeTitle);
