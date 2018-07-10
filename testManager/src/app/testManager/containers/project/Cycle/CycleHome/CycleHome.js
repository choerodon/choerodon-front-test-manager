import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Table, Button, Icon, Input, Tree, Spin } from 'choerodon-ui';
import _ from 'lodash';
import TreeTitle from '../../../../components/CycleComponent/TreeTitleComponent/TreeTitle';
import './CycleHome.scss';
import { getVersionCode, getProjectVersion } from '../../../../../api/agileApi.js';
import { getCycles, getCycleByVersionId, getFolderByCycleId, filterCycleWithBar, getCycleById, editCycleExecute } from '../../../../../api/cycleApi';
import { CreateCycle, CreateCycleExecute } from '../../../../components/CycleComponent';

const { AppState } = stores;
let currentDropOverItem;
let currentDropSide;
let dropItem;

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
const styles = {
  rightLabel: {
    fontWeight: 'bold',
    margin: '10px 0',
    fontSize: '13px',
  },
  rightText: {
    margin: '10px 0',
  },
};
@observer
class CycleHome extends Component {
  state = {
    CreateCycleExecuteVisible: false,
    CreateCycleVisible: false,
    loading: true,
    treeData: [
      { title: '所有版本', key: '0' },
    ],
    filter: '',
    icon: 'folder',
    expandedKeys: ['0'],
    leftVisible: true,
    sideVisible: false,
    dragData: null,
    testList: [{ cycleId: 1, defects: [] }, { cycleId: 2, defects: [] }],
    currentCycle: {},
    autoExpandParent: true,
    searchValue: '',
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
  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  }
  loadCycle = (selectedKeys) => {
    if (selectedKeys[0]) {
      // window.console.log(selectedKeys, this.state.treeData);
      const { treeData } = this.state;
      const indexs = selectedKeys[0].split('-');
      let temp = treeData;
      indexs.forEach((index, i) => {
        if (i === 0) {
          temp = temp[index];
        } else {
          temp = temp.children[index];
        }
      });
      if (temp.data && temp.data.cycleId) {
        this.setState({
          rightLoading: true,
          currentCycle: temp.data,
        });
        window.console.log(temp.data);
        getCycleById(temp.data.cycleId).then((cycle) => {
          this.setState({
            rightLoading: false,
            testList: cycle.content,
          });
          window.console.log(cycle);
        });
      }
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
      window.console.log(dataList);
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
  renderTreeNodes = data => data.map((item) => {
    const { searchValue } = this.state;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    if (item.children) {
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      return (
        <TreeNode
          title={title}
          // title={item.cycleId ?
          //   <TreeTitle
          //     data={item}
          //     text={item.title}
          //     type={item.type}
          //     processBar={{ '#00BFA5': 3, '#D50000': 5 }}
          //   /> : item.title}
          key={item.key}
          dataRef={item}
          showIcon
          icon={<Icon
            type={this.state.expandedKeys.includes(item.key) ? 'folder_open' : 'folder'}
          />}
        >
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return (<TreeNode
      icon={
        <Icon type={this.state.expandedKeys.includes(item.key) ?
          'folder_open' : 'folder'}
        />
      }
      {...item}
      dataRef={item}
    />);
  });

  render() {
    const { CreateCycleExecuteVisible, CreateCycleVisible,
      loading, currentCycle, testList, expandedKeys, rightLoading, searchValue,
      autoExpandParent,
    } = this.state;

    // const testList = [{ cycleId: 1, defects: [] }, { cycleId: 2, defects: [] }];
    const { build, versionName, cycleName,
      description, toDate, environment, fromDate } = currentCycle;
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
      render(statusColor) {
        return (
          <div style={{ width: 18, height: 18, background: statusColor }} />
        );
      },
    }, {
      title: '摘要',
      dataIndex: 'rank',
      key: 'comment',
    }, {
      title: '缺陷',
      dataIndex: 'defects',
      key: 'defects',
      render: defects => <div>{defects.map(defect => defect)}</div>,
    }, {
      title: '模块',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
    }, {
      title: '标签',
      dataIndex: 'statusName',
      key: 'statusName',
    }, {
      title: '执行方',
      dataIndex: 'assignedUserRealName',
      key: 'assignedUserRealName',
    }, {
      title: '执行时间',
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
    }, {
      title: '被指定人',
      dataIndex: 'reporterRealName',
      key: 'reporterRealName',
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
            // onClick={() => { that.deleteStatus(record); }} 
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
              visible={CreateCycleExecuteVisible}
              onCancel={() => { this.setState({ CreateCycleExecuteVisible: false }); }}
              onOk={() => { this.setState({ CreateCycleExecuteVisible: false }); }}
            />
            <CreateCycle
              visible={CreateCycleVisible}
              onCancel={() => { this.setState({ CreateCycleVisible: false }); }}
              onOk={() => { this.setState({ CreateCycleVisible: false }); }}
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
              {cycleName && <div className="c7n-ch-right" >
                <div style={{ display: 'flex' }}>
                  <div>
                    循环名称：{cycleName}
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
                <div className="c7n-right-card-container">
                  <div style={{ flex: 1, display: 'flex' }}>
                    <div style={{ width: 108 }}>
                      <div style={styles.rightLabel}>
                        版本：
                      </div>
                      <div style={styles.rightLabel}>
                        开始时间：
                      </div>
                      <div style={styles.rightLabel}>
                        全层级执行数：
                      </div>
                      <div style={styles.rightLabel}>
                        说明：
                      </div>
                    </div>
                    <div>
                      <div style={styles.rightText}>
                        {versionName}
                      </div>
                      <div style={styles.rightText}>
                        {fromDate}
                      </div>
                      <div style={styles.rightText}>
                        1.0
                      </div>
                      <div style={styles.rightText}>
                        {description}
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex' }}>
                    <div style={{ width: 108 }}>
                      <div style={styles.rightLabel}>
                        环境：
                      </div>
                      <div style={styles.rightLabel}>
                        循环层执行数：
                      </div>
                    </div>
                    <div>
                      <div style={styles.rightText}>
                        {environment}
                      </div>
                      <div style={styles.rightText}>
                        2
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex' }}>
                    <div style={{ width: 108 }}>
                      <div style={styles.rightLabel}>
                        创建人：
                      </div>
                      <div style={styles.rightLabel}>
                        结束时间：
                      </div>
                      <div style={styles.rightLabel}>
                        全层级已执行数：
                      </div>
                    </div>
                    <div>
                      <div style={styles.rightText}>
                        12321李红
                      </div>
                      <div style={styles.rightText}>
                        {toDate}
                      </div>
                      <div style={styles.rightText}>
                        3
                      </div>
                    </div>
                  </div>
                </div>
                <Table
                  // pagination={statusPagination}
                  loading={rightLoading}
                  columns={columns}
                  dataSource={testList}
                  onChange={this.handleStatusTableChange}
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

