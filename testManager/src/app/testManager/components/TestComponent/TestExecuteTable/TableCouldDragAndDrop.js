import React, { Component } from 'react';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import { Button, Icon, Tooltip, Dropdown, Menu, Popconfirm } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import TimeAgo from 'timeago-react';

const { AppState } = stores;

class TableCanDragAndDrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      expand: [],
      status: [],
    };
  }
  
  componentDidMount() {
    this.loadStatus();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.setState({ data: nextProps.data });
    }
  }

  loadStatus() {
    const obj = {
      projectId: AppState.currentMenuType.id,
      statusType: 'CYCLE_CASE',
    };
    axios.post(`/test/v1/projects/${AppState.currentMenuType.id}/status/query`, obj)
      .then((res) => {
        this.setState({
          status: res,
        });
      });
  }

  confirm(executeId, e) {
    this.handleDeleteCircle(executeId);
  }

  cancel(e) {
  }

  handleDeleteCircle(executeId) {
    axios.delete(`/test/v1/projects/${AppState.currentMenuType.id}/cycle/case?cycleCaseId=${executeId}`)
      .then((res) => {
        this.props.onOk();
      });
  }

  onDragEnd(result) {
    window.console.log(result);
    const arr = this.state.data.slice();
    const fromIndex = result.source.index;
    const toIndex = result.destination.index;
    const drag = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, drag);
    this.setState({ data: arr });
    // arr此时是有序的，取toIndex前后两个的rank
    const lastRank = toIndex === 0 ? null : arr[toIndex - 1].rank;
    const nextRank = toIndex === arr.length - 1 ? null : arr[toIndex + 1].rank;
    const testCaseStepDTO = {
      ...drag,
      lastRank,
      nextRank,
    };
    const projectId = AppState.currentMenuType.id;
    axios.post(`/test/v1/projects/${projectId}/cycle/case/update`, testCaseStepDTO)
      .then((res) => {
        // save success
      });
  }

  getMenu = () => (
    <Menu onClick={this.handleClickMenu.bind(this)}>
      <Menu.Item key="edit">
        编辑
      </Menu.Item>
      <Menu.Item key="clone">
        克隆
      </Menu.Item>
      <Menu.Item key="delete">
        删除
      </Menu.Item>
      <Menu.Item key="add">
        添加附件
      </Menu.Item>
    </Menu>
  );

  handleClickMenu(e) {
    if (e.key === 'edit') {
      window.console.log('edit');
    } else if (e.key === 'clone') {
      window.console.log('clone');
    } else if (e.key === 'delete') {
      window.console.log('delete');
    } else if (e.key === 'add') {
      window.console.log('add');
    }
  }

  handleChangeExpand(id) {
    let expand = this.state.expand.slice();
    if (_.find(expand, v => v === id)) {
      expand = _.remove(expand, id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = '34px';
    } else {
      expand.push(id);
      document.getElementsByClassName(`${id}-list`)[0].style.height = 'auto';
    }
    this.setState({ expand });
  }

  renderIssueOrIntro(issues) {
    if (issues) {
      if (issues.length >= 0) {
        return this.renderSprintIssue(issues);
      }
    }
    return '';
  }

  renderSprintIssue(data, sprintId) {
    const urlParams = AppState.currentMenuType;
    const result = [];
    _.forEach(data, (item, index) => {
      const status = _.find(this.state.status, { statusId: item.executionStatus }) || {};
      result.push(
        <div className={`${item.executeId}-list`} style={{ width: '100%', paddingLeft: 10, height: 34, borderBottom: '1px solid rgba(0, 0, 0, 0.12)', borderTop: '1px solid rgba(0, 0, 0, 0.12)', display: 'flex' }}>
          <span title={item.versionName} style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.versionName}
          </span>
          <Tooltip title={item.cycleName}>
            <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.cycleName}
            </span>
          </Tooltip>
          <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.folderName || ''}
          </span>
          <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ width: 60, height: 20, borderRadius: '100px', background: status.statusColor, display: 'inline-block', lineHeight: '20px', textAlign: 'center', color: '#fff' }}>
              {status && status.statusName}
            </span>
          </span>
          <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {
              item.defects.length ? (
                <span>
                  {_.map(item.defects, 'defectName').join(',')}
                </span>
              ) : '-'
            }
          </span>
          <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.assignedUserRealName}
          </span>
          <span style={{ flex: 2, lineHeight: '34px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <TimeAgo
              datetime={item.lastUpdateDate}
              locale={Choerodon.getMessage('zh_CN', 'en')}
            />
          </span>
          <span style={{ width: 70, lineHeight: '34px' }}>
            <Button
              icon="explicit2"
              shape="circle"
              onClick={() => {
                this.props.history.push(`/testManager/Cycle/execute/${item.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
              }}
            />
            <Popconfirm
              title="确认要删除该测试执行吗?"
              placement="left"
              onConfirm={this.confirm.bind(this, item.executeId)}
              onCancel={this.cancel}
              okText="删除"
              cancelText="取消"
              okType="danger"
            >
              <Icon type="delete_forever mlr-3 pointer" />
            </Popconfirm>
          </span>
        </div>);
    });
    return result;
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', paddingLeft: 10, height: 30, background: 'rgba(0, 0, 0, 0.04)', borderTop: '2px solid rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(0,0,0,0.12)', display: 'flex' }}>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            版本
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            测试循环
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            文件夹
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            状态
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            缺陷
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            执行方
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            执行时间
          </span>
          <span style={{ width: 70 }} />
        </div>
        {this.renderIssueOrIntro(this.state.data)}
      </div>
    );
  }
}

export default TableCanDragAndDrop;
