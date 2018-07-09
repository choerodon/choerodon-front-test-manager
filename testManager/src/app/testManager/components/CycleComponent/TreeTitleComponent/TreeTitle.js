import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Menu, Input, Dropdown, Button } from 'choerodon-ui';
import './TreeTitle.scss';

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
        <span className="c7n-pb-fill" style={{ backgroundColor: item[0], width: `${percentage}%` }} />
      );
    });
  };
  handleItemClick = ({ item, key, keyPath }) => {
    window.console.log(this.props.data, { item, key, keyPath });
    switch (key) {
      case 'add': {
        break;
      }
      case 'edit': {
        this.setState({
          editing: true,
        });
        break;
      }
      case 'delete': {
        this.setState({
          editing: true,
        });
        break;
      }
      case 'clone': {
        this.props.refresh(this.props.index);
        break;
      }
      case 'export': {
        this.setState({
          editing: true,
        });
        break;
      }
      default: break;
    }
  }
  handleEdit = (e) => {
    window.console.log(e.target.value);
    this.setState({
      editing: false,
    });
  }
  render() {
    const getMenu = record => (
      <Menu onClick={this.handleItemClick}>
        {
          record === 'folder' ? '' : (
            <Menu.Item key="add">
              增加文件夹
            </Menu.Item>
          )
        }
        <Menu.Item key="edit">
          {record === 'folder' ? '编辑文件夹' : '编辑循环'}
        </Menu.Item>
        <Menu.Item key="delete">
          {record === 'folder' ? '删除文件夹' : '删除循环'}
        </Menu.Item>
        <Menu.Item key="clone">
          {record === 'folder' ? '克隆文件夹' : '克隆循环'}
        </Menu.Item>
        <Menu.Item key="export">
          {record === 'folder' ? '导出文件夹' : '导出循环'}
        </Menu.Item>
      </Menu>
    );
    const { editing } = this.state;
    return (
      <div className="c7n-tree-title">

        {editing ?
          <Input defaultValue={this.props.text} autoFocus onBlur={this.handleEdit} />
          : <div className="c7n-tt-text">
            {this.props.text}
          </div>}
        <div className="c7n-tt-processBar">
          <div className="c7n-process-bar">
            <span className="c7n-pb-unfill">
              <div className="c7n-pb-fill-parent">
                {this.creatProcessBar(this.props.processBar)}
              </div>
            </span>
          </div>
        </div>
        <div className="c7n-tt-actionButton">
          <Dropdown overlay={getMenu(this.props.type)} trigger={['click']}>
            <Button shape="circle" icon="more_vert" />
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default observer(TreeTitle);
