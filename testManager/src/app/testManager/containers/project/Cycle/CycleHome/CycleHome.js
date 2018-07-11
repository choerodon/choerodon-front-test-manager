import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Table, Button, Icon, Input, Tree, Spin, Modal } from 'choerodon-ui';
import _ from 'lodash';
import './CycleHome.scss';
import { getCycles, deleteExecute, getCycleById, editCycleExecute, clone, addFolder, getStatusList } from '../../../../../api/cycleApi';
import { TreeTitle, CreateCycle, EditCycle, CreateCycleExecute, ShowCycleData } from '../../../../components/CycleComponent';

const { AppState } = stores;
const { confirm } = Modal;
let currentDropOverItem;
let currentDropSide;
let dropItem;
const styles = {
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
};
const gData = [];
const dataList = [];
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
    treeData: [
      { title: '所有版本', key: '0' },
    ],
    expandedKeys: ['0'],
    leftVisible: true,
    sideVisible: false,
    dragData: null,
    testList: [{ cycleId: 1, defects: [] }, { cycleId: 2, defects: [] }],
    currentCycle: {},
    currentEditValue: {},
    autoExpandParent: true,
    searchValue: '',
    addingParent: null,
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
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  getParentKey = (key, tree) =>
    // let parentKey;    
    // for (let i = 0; i < tree.length; i += 1) {
    //   const node = tree[i];
    //   if (node.children) {
    //     if (node.children.some(item => item.key === key)) {
    //       parentKey = node.key;
    //     } else if (this.getParentKey(key, node.children)) {
    //       parentKey = this.getParentKey(key, node.children);
    //     }
    //   }
    // }
    key.split('-').slice(0, -1).join('-')

  addItemByParentKey = (key, item) => {
    const arr = key.split('-');
    let temp = this.state.treeData;
    arr.forEach((index, i) => {
      // window.console.log(temp);
      if (i === 0) {
        temp = temp[index];
      } else {
        temp = temp.children[index];
      }
    });
    // 添加测试
    temp.children.unshift(item);
    // window.console.log({ ...item, ...{ key: `${key}-add'`, type: 'add' } });
    this.setState({
      treeData: [...this.state.treeData],
      addingParent: temp,
    });
  }
  loadCycle = (selectedKeys, { selected, selectedNodes, node, event }) => {
    // window.console.log(selectedNodes, node, event);
    const { data } = node.props;
    const { executePagination } = this.state;
    if (data.cycleId) {
      this.setState({
        rightLoading: true,
        currentCycle: data,
      });
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
    e.dataTransfer.setData('text', 'choerodon');
    document.body.ondrop = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    this.setState({
      dragData,
    });
  }

  // 拖拽结束
  handleDragEnd = () => {
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
    e.preventDefault();

    dropItem = record;
    const { currentTarget, pageY, dataTransfer } = e;
    const { top, height } = currentTarget.getBoundingClientRect();
    let before = height / 2;
    let after = before;
    let dropSide;

    before = height / 3;
    after = before * 2;
    dropSide = 'in';
    dataTransfer.dropEffect = 'copy';

    const y = pageY - top;
    if (y < before) {
      dropSide = 'before';
      dataTransfer.dropEffect = 'move';
    } else if (y >= after) {
      dropSide = 'after';
      dataTransfer.dropEffect = 'move';
    }

    removeDragClass();
    addDragClass(currentTarget, dropSide);
  }

  // 拖放
  handleDrop(record) {
    // const { dragData, testList } = this.state;

    // this.setState({
    //   testList: [record, dragData],
    // });
    removeDragClass();
    const { dragData, testList } = this.state;
    const sourceIndex = _.findIndex(testList, { issueId: dragData.issueId });
    const targetIndex = _.findIndex(testList, { issueId: record.issueId });
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
    const [removed] = testList.splice(targetIndex, 1);
    testList.splice(sourceIndex, 0, removed);
    this.setState({
      testList,
      dragData: null,
    });
    const temp = { ...dragData };
    delete temp.defects;
    delete temp.caseAttachment;
    delete temp.testCycleCaseStepES;
    editCycleExecute({
      ...temp,
      ...{
        lastRank,
        nextRank,
      },
    }).then((res) => {

    });
    // window.console.log(record, dragData, currentDropSide);
  }

  handleRow = (record) => {
    // const droppable = this.checkDroppable(record);
    const rowProps = {
      draggable: true,
      onDragLeave: this.handleDragLeave,
      onDragOver: this.handleDragOver.bind(this, record),
      onDrop: this.handleDrop.bind(this, record),
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
      title: '删除执行',
      content: <div style={{ marginBottom: 32 }}>
        这个执行将会被彻底删除。包括所有附件和评论。
      </div>,
      onOk() {
        that.setState({
          rightLoading: true,
        });
        deleteExecute(executeId)
          .then((res) => {
            getCycleById({
              page: executePagination.current - 1,
              size: executePagination.pageSize,
            }, cycleId).then((cycle) => {
              that.setState({
                rightLoading: false,
                testList: cycle.content,
              });
              window.console.log(cycle);
            });
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
      this.setState({
        treeData: [
          { title: '所有版本', key: '0', children: data.versions },
        ],
        loading: false,
      });
      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);
      // window.console.log(dataList);
    });
  }
  filterCycle = (e) => {
    const value = e.target.value;
    const expandedKeys = dataList.map((item) => {
      if (item.title.indexOf(value) > -1) {
        return this.getParentKey(item.key, this.state.treeData);
      }
      return null;
    }).filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  }
  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        const parentKey = this.getParentKey(item.key, this.state.treeData);
        this.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
        break;
      }
      case 'CLONE_CYCLE': {
        const parentKey = this.getParentKey(item.key, this.state.treeData);
        this.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_CYCLE`, type: 'CLONE_CYCLE' } });
        break;
      }
      case 'ADD_FOLDER': {
        this.addItemByParentKey(item.key, { ...item, ...{ title: '新文件夹', key: `${item.key}-ADD_FOLDER`, type: 'ADD_FOLDER' } });
        // 自动展开当前项
        const { expandedKeys } = this.state;
        if (expandedKeys.indexOf(item.key) === -1) {
          expandedKeys.push(item.key);
        }
        this.setState({
          expandedKeys,
        });
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
  removeAdding = () => {
    this.state.addingParent.children.shift();
    this.setState({
      treeData: [...this.state.treeData],
    });
  }
  Clone = (item, e, type) => {
    const { value } = e.target;
    // window.console.log(item, value);
    // e.target.focus();
    if (value === item.title) {
      Choerodon.prompt('请更改名字');
      this.removeAdding();
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
          this.removeAdding();
        } else {
          this.setState({
            loading: false,
          });
          this.refresh();
        }

        // this.removeAdding();
      }).catch(() => {
        Choerodon.prompt('网络出错');
        this.setState({
          loading: false,
        });
        this.removeAdding();
      });
    }
  }
  addFolder = (item, e, type) => {
    const { value } = e.target;
    this.setState({
      loading: true,
    });
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
        this.removeAdding();
      } else {
        this.setState({
          loading: false,
        });
        this.refresh();
      }
      // this.removeAdding();
    }).catch(() => {
      Choerodon.prompt('网络出错');
      this.setState({
        loading: false,
      });
      this.removeAdding();
    });
  }
 
  handleExecuteTableChange=(pagination, filters, sorter) => {
    this.setState({
      executePagination: pagination,
    });
    getCycleById(pagination, this.state.currentCycle.cycleId).then((cycle) => {
      this.setState({
        rightLoading: false,
        testList: cycle.content,
      });
      // window.console.log(cycle);
    });
  }
  renderTreeNodes = data => data.map((item) => {
    const { children, key, cycleCaseList, type } = item;
    const { searchValue, expandedKeys } = this.state;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (<Icon
      style={{ color: '#00A48D' }}
      type={expandedKeys.includes(item.key) ? 'folder_open' : 'folder'}
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
      loading, currentCycle, currentEditValue, testList, expandedKeys, rightLoading, 
      searchValue,
      autoExpandParent,
      executePagination,
      statusList,
    } = this.state;
    const { cycleId, title } = currentCycle;
    const prefix = <Icon type="filter_list" />;
    const that = this;

    const columns = [{
      title: 'ID',
      dataIndex: 'issueId',
      key: 'issueId',
      onCell: this.handleCell,
    }, {
      title: '状态',
      dataIndex: 'executionStatus',
      key: 'executionStatus',
      render(executionStatus) {
        const statusColor = _.find(statusList, { statusId: executionStatus }) ?
          _.find(statusList, { statusId: executionStatus }).statusColor : '';
        return (<div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {_.find(statusList, { statusId: executionStatus }) &&
          _.find(statusList, { statusId: executionStatus }).statusName}
        </div>); 
      },
    }, {
      title: '摘要',
      dataIndex: 'comment',
      key: 'comment',
      render(comment) {
        return (<span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {comment}
        </span>);
      },
    },
    {
      title: '缺陷',
      dataIndex: 'defects',
      key: 'defects',
      render: defects => <div>{defects.map(defect => defect)}</div>,
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
      title: '执行方',
      dataIndex: 'assignedUserRealName',
      key: 'assignedUserRealName',
      render(assignedUserRealName, record) {
        const { assignedUserJobNumber } = record;
        return (<div style={{ width: 100 }}>
          {assignedUserRealName ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="c7n-avatar">
                {assignedUserRealName.slice(0, 1)}
              </span>
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {`${assignedUserJobNumber} ${assignedUserRealName}`}
              </span>
            </div>
          ) : '无'}
        </div>);
      },
    }, {
      title: '执行时间',
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
      render(lastUpdateDate) {
        return (<div style={{ width: 85, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {lastUpdateDate}
        </div>);
      },
    }, {
      title: '被指定人',
      dataIndex: 'reporterRealName',
      key: 'reporterRealName',
      render(reporterRealName, record) {
        const { reporterJobNumber } = record;
        return (<div style={{ width: 100 }}>
          {reporterRealName ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="c7n-avatar">
                {reporterRealName.slice(0, 1)}
              </span>
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {`${reporterJobNumber} ${reporterRealName}`}
              </span>
            </div>
          ) : '无'}
        </div>);
      },
    }, {
      title: '',
      key: 'action',
      render(text, record) {
        return (
          record.projectId !== 0 &&
          <div>
            <Icon
              type="explicit"
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
        <Header title="测试循环">
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          title={`项目"${AppState.currentMenuType.name}"的循环摘要`}
          description="循环摘要使用树状图查看本项目中不同版本锁对应的测试情况。"
        >
          <Spin spinning={loading}>
            <CreateCycleExecute
              data={currentCycle}             
              rank={testList.slice(-1)[0] && testList.slice(-1)[0].rank}
              visible={CreateCycleExecuteVisible}
              onCancel={() => { this.setState({ CreateCycleExecuteVisible: false }); }}
              onOk={() => {                
                this.setState({ CreateCycleExecuteVisible: false, rightLoading: true });               
                // window.console.log(data);
                getStatusList('CYCLE_CASE').then((statusList) => {
                  this.setState({ statusList });
                });
                getCycleById({
                  page: executePagination.current - 1,
                  size: executePagination.pageSize,
                }, currentCycle.cycleId).then((cycle) => {
                  this.setState({
                    rightLoading: false,
                    testList: cycle.content,
                  });
                  // window.console.log(cycle);
                }); 
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
                    >测试循环</p>
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
                    // loadData={this.onLoadData}
                    defaultExpandAll
                    expandedKeys={expandedKeys}
                    showIcon
                    onExpand={this.onExpand}
                    onSelect={this.loadCycle}
                    autoExpandParent={autoExpandParent}
                  >
                    {this.renderTreeNodes(this.state.treeData)}
                  </Tree>
                </div>
              </div>
              {cycleId && <div className="c7n-ch-right" >
                <div style={{ display: 'flex' }}>
                  <div>
                    循环名称：{title}
                  </div>
                  <div style={{ flex: 1, visiblity: 'hidden' }} />
                  <div>
                    <Button
                      style={{ color: '#3f51b5' }}
                      onClick={() => {
                        this.setState({ CreateCycleExecuteVisible: true });
                      }}
                    >
                      <Icon type="playlist_add" />
                      <span>添加执行</span>
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
              </div>}
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default CycleHome;

