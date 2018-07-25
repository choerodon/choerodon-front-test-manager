/*eslint-disable */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Tooltip, Table, Button, Icon, Input, Tree, Spin, Modal } from 'choerodon-ui';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import './CycleHome.scss';
import { getCycles, deleteExecute, getCycleById, editCycleExecute, clone, addFolder, getStatusList } from '../../../../api/cycleApi';
import { TreeTitle, CreateCycle, EditCycle, CreateCycleExecute, ShowCycleData } from '../../../../components/CycleComponent';
import DragTable from '../../../../components/DragTable';
import { RichTextShow } from '../../../../components/CommonComponent';
import { delta2Html, delta2Text } from '../../../../common/utils';
import CycleStore from '../../../../store/project/cycle/CycleStore';

const { AppState } = stores;
const { confirm } = Modal;
let currentDropOverItem;
let currentDropSide;
let dropItem;
var draging = null;
const styles = {
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
};

const dataList = [];
function _animate(prevRect, target) {
  const ms = 300;

  if (ms) {
    const currentRect = target.getBoundingClientRect();

    if (prevRect.nodeType === 1) {
      prevRect = prevRect.getBoundingClientRect();
    }

    _css(target, 'transition', 'none');
    _css(target, 'transform', `translate3d(${
      prevRect.left - currentRect.left}px,${
      prevRect.top - currentRect.top}px,0)`,
    );

    target.offsetWidth; // 触发重绘
    // 放在timeout里面也可以
    // setTimeout(function() {
    //     _css(target, 'transition', 'all ' + ms + 'ms');
    //     _css(target, 'transform', 'translate3d(0,0,0)');
    // }, 0);
    _css(target, 'transition', `all ${ms}ms`);
    _css(target, 'transform', 'translate3d(0,0,0)');

    clearTimeout(target.animated);
    target.animated = setTimeout(() => {
      _css(target, 'transition', '');
      _css(target, 'transform', '');
      target.animated = false;
    }, ms);
  }
}
// 给元素添加style
function _css(el, prop, val) {
  const style = el && el.style;

  if (style) {
    if (val === void 0) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        val = document.defaultView.getComputedStyle(el, '');
      } else if (el.currentStyle) {
        val = el.currentStyle;
      }

      return prop === void 0 ? val : val[prop];
    } else {
      if (!(prop in style)) {
        prop = `-webkit-${prop}`;
      }

      style[prop] = val + (typeof val === 'string' ? '' : 'px');
    }
  }
}
function dropSideClassName(side) {
  return `drop-row-${side}`;
}
function addDragClass(currentTarget, dropSide) {
  if (dropSide) {
    currentDropOverItem = currentTarget;
    currentDropSide = dropSide;
    currentDropOverItem.classList.add(dropSideClassName(currentDropSide));
  }
}

function removeDragClass() {
  if (currentDropOverItem && currentDropSide) {
    currentDropOverItem.classList.remove(dropSideClassName(currentDropSide));
  }
}


const TreeNode = Tree.TreeNode;

@observer
class CycleHome extends Component {
  state = {
    CreateCycleExecuteVisible: false,
    CreateCycleVisible: false,
    EditCycleVisible: false,
    loading: true,
    leftVisible: true,
    sideVisible: false,
    dragData: null,
    testList: [],
    // currentCycle: {},
    currentEditValue: {},
    autoExpandParent: true,
    searchValue: '',
    executePagination: {
      current: 1,
      total: 0,
      pageSize: 5,
    },
    statusList: [],
  };
  componentDidMount() {
    this.refresh();
  }

  onExpand = (expandedKeys) => {
    CycleStore.setExpandedKeys(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')


  loadCycle = (selectedKeys, { selected, selectedNodes, node, event }, flag) => {
    // window.console.log(selectedNodes, node, event);
    CycleStore.setSelectedKeys(selectedKeys);
    const { data } = node.props;
    const { executePagination } = this.state;
    if (data.cycleId) {
      if (!flag) {
        this.setState({
          rightLoading: true,
          // currentCycle: data,
        });
      }

      CycleStore.setCurrentCycle(data);
      // window.console.log(data);
      getStatusList('CYCLE_CASE').then((statusList) => {
        this.setState({ statusList });
      });
      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, data.cycleId).then((cycle) => {
        this.setState({
          rightLoading: false,
          testList: cycle.content,
          executePagination: {
            current: executePagination.current,
            pageSize: executePagination.pageSize,
            total: cycle.totalElements,
          },
        });
        // window.console.log(cycle);
      });
    }
  }
  // 拖拽离开目标
  handleDragLeave() {
    removeDragClass();
    dropItem = null;
  }

  // 拖拽开始
  handleDragtStart(dragData, e) {
    window.console.log('start');
    e.dataTransfer.setData('text', 'choerodon');
    document.body.ondrop = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    draging = e.target;
    this.setState({
      dragData,
    });
  }

  // 拖拽结束
  handleDragEnd = () => {
    window.console.log('dragEnd');
    removeDragClass();
    if (dropItem) {
      this.handleDrop(dropItem);
    }
    this.setState({
      dragData: null,
    });
  };

  // 拖拽目标位置
  handleDragOver(record, e) {
    // e.preventDefault();

    dropItem = record;
    //console.log("onDrop over");
    e.preventDefault();
    var target = e.target;
    window.console.log(draging, target)
    //因为dragover会发生在ul上，所以要判断是不是li
    if (target.nodeName === "TD") {
      target = target.parentNode;
      if (target !== draging) {
        var targetRect = target.getBoundingClientRect();
        var dragingRect = draging.getBoundingClientRect();
        if (target) {
          if (target.animated) {
            return;
          }
        }
        const { dragData, testList } = this.state;
        const sourceIndex = _.findIndex(testList, { executeId: dragData.executeId });
        const targetIndex = _.findIndex(testList, { executeId: record.executeId });
        if (sourceIndex < targetIndex) {
          target.parentNode.insertBefore(draging, target.nextSibling);
        } else {
          target.parentNode.insertBefore(draging, target);
        }
        _animate(dragingRect, draging);
        _animate(targetRect, target);
      }
    }
  }

  // 拖放
  handleDrop(record) {
    // const { dragData, testList } = this.state;
    window.console.log('drop');
    // this.setState({
    //   testList: [record, dragData],
    // });
    removeDragClass();
    const { dragData, testList } = this.state;
    const sourceIndex = _.findIndex(testList, { executeId: dragData.executeId });
    const targetIndex = _.findIndex(testList, { executeId: record.executeId });
    if (sourceIndex === targetIndex) {
      return;
    }
    let lastRank = null;
    let nextRank = null;
    if (sourceIndex < targetIndex) {
      lastRank = testList[targetIndex].rank;
      nextRank = testList[targetIndex + 1] ? testList[targetIndex + 1].rank : null;
    } else if (sourceIndex > targetIndex) {
      lastRank = testList[targetIndex - 1] ? testList[targetIndex - 1].rank : null;
      nextRank = testList[targetIndex].rank;
    }
    window.console.log(lastRank, nextRank);
    // const [removed] = testList.splice(targetIndex, 1);
    // testList.splice(sourceIndex, 0, removed);
    this.setState({
      // testList,
      dragData: null,
    });
    const temp = { ...dragData };
    delete temp.defects;
    delete temp.caseAttachment;
    delete temp.testCycleCaseStepES;
    delete temp.issueInfosDTO;
    this.setState({ rightLoading: true });
    editCycleExecute({
      ...temp,
      ...{
        lastRank,
        nextRank,
      },
    }).then((res) => {
      const { executePagination } = this.state;
      const currentCycle = CycleStore.getCurrentCycle;
      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, currentCycle.cycleId).then((cycle) => {
        this.setState({
          rightLoading: false,
          testList: cycle.content,
          executePagination: {
            current: executePagination.current,
            pageSize: executePagination.pageSize,
            total: cycle.totalElements,
          },
        });
        window.console.log(cycle);
      });
    });
    // window.console.log(record, dragData, currentDropSide);
  }

  handleRow = (record) => {
    // const droppable = this.checkDroppable(record);
    const rowProps = {
      draggable: true,
      onDragLeave: this.handleDragLeave,
      onDragOver: this.handleDragOver.bind(this, record),
      onDragEnd: this.handleDragEnd,
      onDrop: this.handleDrop.bind(this, record),
      onDragStart: this.handleDragtStart.bind(this, record),
    };
    return rowProps;
  };

  handleCell = (record) => {
    const cellProps = {
      onDragEnd: this.handleDragEnd,
    };
    Object.assign(cellProps, {
      draggable: true,
      onDragStart: this.handleDragtStart.bind(this, record),
      className: 'drag-cell',
    });

    return cellProps;
  };

  generateList = (data) => {
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }
  deleteExecute = (record) => {
    const that = this;
    const { executeId, cycleId } = record;
    const { executePagination } = this.state;
    confirm({
      width: 560,
      title: Choerodon.getMessage('确认删除吗?', 'Confirm delete'),
      content: <div style={{ marginBottom: 32 }}>
        {Choerodon.getMessage('当你点击删除后，该条数据将被永久删除，不可恢复!', 'When you click delete, after which the data will be permanently deleted and irreversible!')}
      </div>,
      onOk() {
        that.setState({
          rightLoading: true,
        });
        deleteExecute(executeId)
          .then((res) => {
            that.refresh();
            // getCycleById({
            //   page: executePagination.current - 1,
            //   size: executePagination.pageSize,
            // }, cycleId).then((cycle) => {
            //   that.setState({
            //     rightLoading: false,
            //     testList: cycle.content,
            //     executePagination: {
            //       current: executePagination.current,
            //       pageSize: executePagination.pageSize,
            //       total: cycle.totalElements,
            //     },
            //   });
            //   window.console.log(cycle);
            // });
          }).catch(() => {
            Choerodon.prompt('网络异常');
            that.setState({
              rightLoading: false,
            });
          });
      },
      onCancel() { },
      okText: '删除',
      okType: 'danger',
    });
  }
  refresh = () => {
    this.setState({
      loading: true,
    });
    getCycles().then((data) => {
      CycleStore.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);
      this.setState({
        // treeData: [
        //   { title: '所有版本', key: '0', children: data.versions },
        // ],
        loading: false,
      });
      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);
      // window.console.log(dataList);
    });
    // 如果选中了项，就刷新table数据
    const currentCycle = CycleStore.getCurrentCycle;
    const selectedKeys = CycleStore.getSelectedKeys;
    if (currentCycle.cycleId) {
      this.loadCycle(selectedKeys, { node: { props: { data: currentCycle } } }, true);
    }
  }
  filterCycle = (e) => {
    const value = e.target.value;
    const expandedKeys = dataList.map((item) => {
      if (item.title.indexOf(value) > -1) {
        return this.getParentKey(item.key, CycleStore.getTreeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    CycleStore.setExpandedKeys(expandedKeys);
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }
  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        const parentKey = this.getParentKey(item.key, CycleStore.getTreeData);
        CycleStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
        break;
      }
      case 'CLONE_CYCLE': {
        const parentKey = this.getParentKey(item.key, CycleStore.getTreeData);
        CycleStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_CYCLE`, type: 'CLONE_CYCLE' } });
        break;
      }
      case 'ADD_FOLDER': {
        CycleStore.addItemByParentKey(item.key, { ...item, ...{ title: Choerodon.getMessage('新文件夹', 'New folder'), key: `${item.key}-ADD_FOLDER`, type: 'ADD_FOLDER' } });
        // 自动展开当前项
        const expandedKeys = CycleStore.getExpandedKeys;
        if (expandedKeys.indexOf(item.key) === -1) {
          expandedKeys.push(item.key);
        }
        CycleStore.setExpandedKeys(expandedKeys);
        break;
      }
      case 'EDIT_CYCLE': {
        this.setState({
          EditCycleVisible: true,
          currentEditValue: item,
        });
        break;
      }
      default: break;
    }
  }

  Clone = (item, e, type) => {
    const { value } = e.target;
    // window.console.log(item, value);
    // e.target.focus();
    if (value === item.title) {
      Choerodon.prompt('请更改名字');
      CycleStore.removeAdding();
    } else {
      this.setState({
        loading: true,
      });
      clone(item.cycleId, { cycleName: value }, type).then((data) => {
        if (data.failed) {
          Choerodon.prompt('名字重复');
          this.setState({
            loading: false,
          });
          CycleStore.removeAdding();
        } else {
          this.setState({
            loading: false,
          });
          this.refresh();
        }
      }).catch(() => {
        Choerodon.prompt('网络出错');
        this.setState({
          loading: false,
        });
        CycleStore.removeAdding();
      });
    }
  }
  addFolder = (item, e, type) => {
    const { value } = e.target;
    this.setState({
      loading: true,
    });
    // window.console.log(this.state.currentCycle);

    addFolder({
      type: 'folder',
      cycleName: value,
      parentCycleId: item.cycleId,
      versionId: item.versionId,
    }).then((data) => {
      if (data.failed) {
        Choerodon.prompt('名字重复');
        this.setState({
          loading: false,
        });
        CycleStore.removeAdding();
      } else {
        this.setState({
          loading: false,
        });
        this.refresh();
      }
    }).catch(() => {
      Choerodon.prompt('网络出错');
      this.setState({
        loading: false,
      });
      CycleStore.removeAdding();
    });
  }

  handleExecuteTableChange = (pagination, filters, sorter) => {
    window.console.log(pagination, filters, sorter);
    if (pagination.current) {
      this.setState({
        executePagination: pagination,
      });
      const currentCycle = CycleStore.getCurrentCycle;
      getCycleById({
        size: pagination.pageSize,
        page: pagination.current - 1,
      }, currentCycle.cycleId).then((cycle) => {
        this.setState({
          rightLoading: false,
          testList: cycle.content,
          executePagination: {
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: cycle.totalElements,
          },
        });
        // window.console.log(cycle);
      });
    }
  }
  renderTreeNodes = data => data.map((item) => {
    const { children, key, cycleCaseList, type } = item;
    const { searchValue } = this.state;
    const expandedKeys = CycleStore.getExpandedKeys;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (<Icon
      style={{ color: '#00A48D' }}
      type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
    />);
    if (type === 'CLONE_FOLDER' || type === 'CLONE_CYCLE') {
      return (
        <TreeNode
          title={
            <div onClick={e => e.stopPropagation()} role="none">
              <Input
                defaultValue={item.title}
                autoFocus
                onBlur={(e) => {
                  this.Clone(item, e, type);
                }}
              />
            </div>
          }
          icon={icon}
          data={item}
        />);
    } else if (type === 'ADD_FOLDER') {
      return (
        <TreeNode
          title={
            <div onClick={e => e.stopPropagation()} role="none">
              <Input
                defaultValue={item.title}
                autoFocus
                onBlur={(e) => {
                  this.addFolder(item, e, type);
                }}
              />
            </div>
          }
          icon={icon}
          data={item}
        />);
    } else if (children) {
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      return (
        <TreeNode
          title={item.cycleId ?
            <TreeTitle
              refresh={this.refresh}
              callback={this.callback}
              text={item.title}
              key={key}
              data={item}
              title={title}
              processBar={cycleCaseList}
            /> : title}
          key={key}
          data={item}
          showIcon
          icon={icon}
        >
          {this.renderTreeNodes(children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        icon={icon}
        {...item}
        data={item}
      />);
  });

  render() {
    const { CreateCycleExecuteVisible, CreateCycleVisible, EditCycleVisible,
      loading, currentEditValue, testList, rightLoading,
      searchValue,
      autoExpandParent,
      executePagination,
      statusList,
    } = this.state;
    const treeData = CycleStore.getTreeData;
    const expandedKeys = CycleStore.getExpandedKeys;
    const selectedKeys = CycleStore.getSelectedKeys;
    const currentCycle = CycleStore.getCurrentCycle;
    const { cycleId, title } = currentCycle;
    const prefix = <Icon type="filter_list" />;
    const that = this;

    const columns = [{
      title: 'ID',
      dataIndex: 'issueId',
      key: 'issueId',
      // onCell: this.handleCell,
      width: '10%',
      // filters: [],   
      // onFilter: (value, record) => 
      //   record.issueInfosDTO && record.issueInfosDTO.issueName.indexOf(value) === 0,  
      render(issueId, record) {
        const { issueInfosDTO } = record;
        return (<div
          title={issueInfosDTO && issueInfosDTO.issueName}
          style={{
            width: 100,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {issueInfosDTO && issueInfosDTO.issueName}
        </div>);
      },
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'executionStatus',
      key: 'executionStatus',
      // filters: statusList.map(status => ({ text: status.statusName, value: status.statusId })),
      // onFilter: (value, record) => record.executionStatus === value,  
      width: '9%',
      render(executionStatus) {
        const statusColor = _.find(statusList, { statusId: executionStatus }) ?
          _.find(statusList, { statusId: executionStatus }).statusColor : '';
        return (<div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {_.find(statusList, { statusId: executionStatus }) &&
            _.find(statusList, { statusId: executionStatus }).statusName}
        </div>);
      },
    }, {
      title: <FormattedMessage id="cycle_comment" />,
      dataIndex: 'comment',
      key: 'comment',
      width: '10%',
      render(comment) {
        return (
          <Tooltip title={<RichTextShow data={delta2Html(comment)} />}>
            <div
              title={delta2Text(comment)}
              style={{
                width: 65,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {delta2Text(comment)}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: <FormattedMessage id="bug" />,
      dataIndex: 'defects',
      key: 'defects',
      width: '10%',
      render: defects =>
        (<Tooltip title={
          <div>
            {defects.map((defect, i) => (
              <div style={{
                fontSize: '13px',
                color: 'white',
              }}
              >                  
                {defect.issueInfosDTO.issueName}
              </div>))}
          </div>}
        >
          <div
            style={{
              width: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {defects.map((defect, i) => defect.issueInfosDTO.issueName).join(',')}
          </div>
        </Tooltip>),
    },
    // {
    //   title: '模块',
    //   dataIndex: 'assignedTo',
    //   key: 'assignedTo',
    // }, 
    // {
    //   title: '标签',
    //   dataIndex: 'statusName',
    //   key: 'statusName',
    // }, 
    {
      title: <FormattedMessage id="cycle_executeBy" />,
      dataIndex: 'assignedUserRealName',
      key: 'assignedUserRealName',
      width: '10%',
      render(assignedUserRealName) {
        return (<div style={{
          // width: 85, 
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        >
          {assignedUserRealName}
        </div>);
      },
      // render(assignedUserRealName, record) {
      //   const { assignedUserJobNumber } = record;
      //   return (<div style={{ width: 100 }}>
      //     {assignedUserRealName ? (
      //       <div style={{ display: 'flex', alignItems: 'center' }}>
      //         <span className="c7n-avatar">
      //           {assignedUserRealName.slice(0, 1)}
      //         </span>
      //         <span style={{ overflow: 'hidden', 
      // whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      //           {`${assignedUserJobNumber} ${assignedUserRealName}`}
      //         </span>
      //       </div>
      //     ) : '无'}
      //   </div>);
      // },
    }, {
      title: <FormattedMessage id="cycle_executeTime" />,
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
      width: '10%',
      render(lastUpdateDate) {
        return (<div style={{
          width: 85,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        >
          {lastUpdateDate && moment(lastUpdateDate).format('D/MMMM/YY')}
        </div>);
      },
    }, {
      title: <FormattedMessage id="cycle_assignedTo" />,
      dataIndex: 'reporterRealName',
      key: 'reporterRealName',
      width: '10%',
      render(reporterRealName) {
        return (<div style={{
          width: 60,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
        >
          {reporterRealName}
        </div>);
      },
      // render(reporterRealName, record) {
      //   const { reporterJobNumber } = record;
      //   return (<div style={{ width: 100 }}>
      //     {reporterRealName ? (
      //       <div style={{ display: 'flex', alignItems: 'center' }}>
      //         <span className="c7n-avatar">
      //           {reporterRealName.slice(0, 1)}
      //         </span>
      //         <span style={{ overflow: 'hidden',
      //  whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      //           {`${reporterJobNumber} ${reporterRealName}`}
      //         </span>
      //       </div>
      //     ) : '无'}
      //   </div>);
      // },
    }, {
      title: '',
      key: 'action',
      // width: '20%',
      render(text, record) {
        return (
          record.projectId !== 0 &&
          <div style={{ display: 'flex' }}>
            <Icon
              type="explicit2"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const { history } = that.props;
                const urlParams = AppState.currentMenuType;
                history.push(`/testManager/Cycle/execute/${record.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
              }}
            />
            <Icon
              type="delete"
              style={{ cursor: 'pointer', marginLeft: 10 }}
              onClick={() => {
                that.deleteExecute(record);
              }}
            />
          </div>
        );
      },
    }];
    return (
      <Page className="c7n-cycle">
        <Header title={<FormattedMessage id="cycle_name" />}>
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span>
              <FormattedMessage id="refresh" />
            </span>
          </Button>
        </Header>
        <Content
          title={<FormattedMessage id="cycle_title" />}
          description={<FormattedMessage id="cycle_description" />}
        >
          <Spin spinning={loading}>
            <CreateCycleExecute
              data={currentCycle}
              rank={testList.slice(-1)[0] && testList.slice(-1)[0].rank}
              visible={CreateCycleExecuteVisible}
              onCancel={() => { this.setState({ CreateCycleExecuteVisible: false }); }}
              onOk={() => {
                this.setState({
                  CreateCycleExecuteVisible: false,
                  rightLoading: true,
                });
                // window.console.log(data);
                getStatusList('CYCLE_CASE').then((List) => {
                  this.setState({ statusList: List });
                });
                this.refresh();
                // getCycleById({
                //   page: executePagination.current - 1,
                //   size: executePagination.pageSize,
                // }, currentCycle.cycleId).then((cycle) => {
                //   this.setState({
                //     rightLoading: false,
                //     testList: cycle.content,
                //     executePagination: {
                //       current: executePagination.current,
                //       pageSize: executePagination.pageSize,
                //       total: cycle.totalElements,
                //     },
                //   });
                //   // window.console.log(cycle);
                // });
              }}
            />
            <CreateCycle
              visible={CreateCycleVisible}
              onCancel={() => { this.setState({ CreateCycleVisible: false }); }}
              onOk={() => { this.setState({ CreateCycleVisible: false }); this.refresh(); }}
            />
            <EditCycle
              visible={EditCycleVisible}
              initialValue={currentEditValue}
              onCancel={() => { this.setState({ EditCycleVisible: false }); }}
              onOk={() => { this.setState({ EditCycleVisible: false }); this.refresh(); }}
            />

            <div className="c7n-cycleHome">
              <div className={this.state.sideVisible ? 'c7n-ch-side' : 'c7n-ch-hidden'}>
                <div className="c7n-chs-button">
                  <div
                    role="none"
                    className="c7n-cycleHome-button"
                    onClick={() => {
                      this.setState({
                        leftVisible: true,
                        sideVisible: false,
                      });
                    }}
                  >
                    <Icon type="navigate_next" />
                  </div>
                </div>
                <div className="c7n-chs-bar">
                  {this.state.versionVisible ? '' : (
                    <p
                      role="none"
                      onClick={() => {
                        this.setState({
                          leftVisible: true,
                          sideVisible: false,
                        });
                      }}
                    ><FormattedMessage id="cycle_name" />
                    </p>
                  )}
                </div>
              </div>
              <div className={this.state.leftVisible ? 'c7n-ch-left' : 'c7n-ch-hidden'}>
                <div className="c7n-chl-head">
                  <div className="c7n-chlh-search">
                    <Input prefix={prefix} placeholder="&nbsp;过滤" onChange={this.filterCycle} />
                  </div>
                  <div className="c7n-chlh-button">
                    <div
                      role="none"
                      className="c7n-cycleHome-button"
                      onClick={() => {
                        this.setState({
                          leftVisible: false,
                          sideVisible: true,
                        });
                      }}
                    >
                      <Icon type="navigate_before" />
                    </div>
                    <div
                      role="none"
                      className="c7n-cycleHome-button"
                    >
                      <Icon
                        type="add"
                        onClick={() => {
                          this.setState({
                            CreateCycleVisible: true,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="c7n-chlh-tree">
                  <Tree
                    selectedKeys={selectedKeys}
                    expandedKeys={expandedKeys}
                    showIcon
                    onExpand={this.onExpand}
                    onSelect={this.loadCycle}
                    autoExpandParent={autoExpandParent}
                  >
                    {this.renderTreeNodes(treeData)}
                  </Tree>
                </div>
              </div>
              {cycleId && <div className="c7n-ch-right" >
                <div style={{ display: 'flex' }}>
                  <div>
                    <FormattedMessage id="cycle_cycleName" />
                    ：<span style={{ color: '#3F51B5' }}>{title}</span>
                  </div>
                  <div style={{ flex: 1, visiblity: 'hidden' }} />
                  <div>
                    <Button
                      style={{ color: '#3f51b5', marginRight: '-15px' }}
                      onClick={() => {
                        this.setState({ CreateCycleExecuteVisible: true });
                      }}
                    >
                      <Icon type="playlist_add" />
                      <span>
                        <FormattedMessage id="cycle_addCycle" />
                      </span>
                    </Button>
                  </div>
                </div>
                <ShowCycleData data={currentCycle} />
                <Table
                  pagination={executePagination}
                  loading={rightLoading}
                  columns={columns}
                  dataSource={testList}
                  onChange={this.handleExecuteTableChange}
                  onRow={this.handleRow}
                />
                <DragTable
                  data={testList}
                  columns={columns}
                />
              </div>}
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default CycleHome;

