import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Menu, Input, Dropdown, Button } from 'choerodon-ui';
import './TreeTitle.scss';
import { editFolder, deleteCycleOrFolder } from '../../../api/cycleApi';

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
          refresh();
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
      if (data.failed) {
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
          增加文件夹
          </Menu.Item>);
        }
        items = items.concat([
          <Menu.Item key="edit">
            {type === 'folder' ? '编辑文件夹' : '编辑循环'}
          </Menu.Item>,
          <Menu.Item key="delete">
            {type === 'folder' ? '删除文件夹' : '删除循环'}
          </Menu.Item>,
          <Menu.Item key="clone">
            {type === 'folder' ? '克隆文件夹' : '克隆循环'}
          </Menu.Item>,
          <Menu.Item key="export">
            {type === 'folder' ? '导出文件夹' : '导出循环'}
          </Menu.Item>,
        ]);
      } 
      return <Menu onClick={this.handleItemClick}>{items}</Menu>;
    };    

    const { editing } = this.state;
    const { title, processBar, data } = this.props;
    return (
      <div className="c7n-tree-title">

        {editing ?
          <Input
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
            {title}
          </div>}
        <div className="c7n-tt-processBar">
          <div className="c7n-process-bar">
            <span className="c7n-pb-unfill">
              <div className="c7n-pb-fill-parent">
                {this.creatProcessBar(processBar)}
              </div>
            </span>
          </div>
        </div>
        <div role="none" className="c7n-tt-actionButton" onClick={e => e.stopPropagation()}>
          <Dropdown overlay={getMenu(data.type)} trigger={['click']}>
            <Button shape="circle" icon="more_vert" />
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default observer(TreeTitle);
