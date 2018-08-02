import React, { Component } from 'react';
import { Button, Icon, Tooltip, Menu, Popconfirm } from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import TimeAgo from 'timeago-react';
import './TestExecuteTable.scss';

const { AppState } = stores;

class TestExecuteTable extends Component {
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
        <FormattedMessage id="edit" />
      </Menu.Item>
      <Menu.Item key="clone">
        <FormattedMessage id="clone" />
      </Menu.Item>
      <Menu.Item key="delete">
        <FormattedMessage id="delete" />
      </Menu.Item>
      <Menu.Item key="add">
        <FormattedMessage id="upload_attachment" />
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
        <div className={`${item.executeId}-list`} style={{ width: '100%', paddingLeft: 10, height: 34, boxShadow: '0 1px 0 0 #e8e8e8, 0 1px 0 0 #e8e8e8 inset', display: 'flex' }}>
          <span title={item.versionName} style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            {item.versionName}
          </span>
          <Tooltip title={item.cycleName}>
            <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
              {item.cycleName}
            </span>
          </Tooltip>
          <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            {item.folderName || ''}
          </span>
          <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            <span style={{ width: 60, height: 20, borderRadius: '100px', background: status.statusColor, display: 'inline-block', lineHeight: '20px', textAlign: 'center', color: '#fff' }}>
              {status && status.statusName}
            </span>
          </span>
          <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            {
              item.defects.length ? (
                <span>
                  <Tooltip
                    placement="topLeft"
                    title={
                      <div>
                        {item.defects.map((defect, i) => (
                          <div style={{
                            fontSize: '13px',
                            color: 'white',
                          }}
                          >
                            {defect.issueInfosDTO.issueName}
                          </div>))}
                      </div>}
                  >
                    {item.defects.map((defect, i) => defect.issueInfosDTO.issueName).join(',')}
                  </Tooltip>),
                </span>
              ) : '-'
            }
          </span>
          <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            {item.lastUpdateUser && item.lastUpdateUser.realName}

          </span>
          <span style={{ flex: 2, lineHeight: '34px' }} className="c7n-text-dot">
            <TimeAgo
              datetime={item.lastUpdateDate}
              locale={Choerodon.getMessage('zh_CN', 'en')}
            />
          </span>
          <span style={{ width: 70, lineHeight: '34px' }}>
            <Icon
              type="explicit2 mlr-3 pointer"
              onClick={() => {
                this.props.history.push(`/testManager/Cycle/execute/${item.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
              }}
            />            
            <Popconfirm
              title={Choerodon.getMessage('确认删除吗?', 'Confirm delete')}
              placement="left"
              onConfirm={this.confirm.bind(this, item.executeId)}
              onCancel={this.cancel}
              okText={Choerodon.getMessage('删除', 'delete')}
              cancelText={Choerodon.getMessage('取消', 'Cancel')}
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
        <div style={{ width: '100%', paddingLeft: 10, height: 30, background: 'rgba(0, 0, 0, 0.04)', display: 'flex' }}>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="version" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="cycle_name" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="cycle_createExecute_folder" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="status" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }} >
            <FormattedMessage id="bug" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="execute_executive" />
          </span>
          <span style={{ flex: 2, lineHeight: '30px' }}>
            <FormattedMessage id="execute_executeTime" />
          </span>
          <span style={{ width: 70 }} />
        </div>
        {this.renderIssueOrIntro(this.state.data)}
      </div>
    );
  }
}

export default TestExecuteTable;
