import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import debounce from 'lodash/debounce';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Table, Button, Icon, Input, Tree, Spin } from 'choerodon-ui';
import _ from 'lodash';
import TreeTitle from '../../../../components/CycleComponent/TreeTitleComponent/TreeTitle';
import './CycleHome.scss';
import { adjustSort, canDelete, defineLevel, deleteNode, findParent, hasDirChild, isChild, normalizeMenus } from './util';
import { getVersionCode, getProjectVersion } from '../../../../../api/agileApi.js';
import { getCycleByVersionId, getFolderByCycleId, filterCycleWithBar, getCycleById } from '../../../../../api/cycleApi';


let currentDropOverItem;
let currentDropSide;
let dropItem;
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


const { AppState } = stores;
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
  };
  componentDidMount() {
    this.refresh();
  }


  onLoadData = tree => new Promise((resolve) => {
    const treeNode = tree;
    window.console.log(tree);
    // if (treeNode.props.children) {
    //   this.setState({
    //     loading: false,
    //   });
    //   resolve();
    //   return;
    // }
    const deep = treeNode.props.eventKey.split('-').length - 1;
    window.console.log(treeNode.props.eventKey, deep);
    switch (deep) {
      case 0: {
        this.setState({
          loading: true,
        });
        getVersionCode().then((res) => {
          const versionCodes = [];
          for (let i = 0; i < res.lookupValues.length; i += 1) {
            const versionName = res.lookupValues[i].name;
            versionCodes.push({
              title: `${versionName}`,
              key: `${treeNode.props.eventKey}-${i}`,
            });
          }
          treeNode.props.dataRef.children = versionCodes;
          this.setState({
            loading: false,
            treeData: [...this.state.treeData],
          });
        });
        break;
      }
      case 1: {
        this.setState({
          loading: true,
        });
        getProjectVersion().then((res) => {
          const projectVersions = [];
          for (let i = 0; i < res.length; i += 1) {
            if (res[i].statusName === treeNode.props.title) {
              projectVersions.push({
                title: `${res[i].name}`,
                key: `${treeNode.props.eventKey}-${i}`,
                label: `${res[i].versionId}`,
                data: res[i],
              });
            }
          }
          treeNode.props.dataRef.children = projectVersions;
          this.setState({
            loading: false,
            treeData: [...this.state.treeData],
          });
        });
        break;
      }
      case 2: {
        this.setState({
          loading: true,
        });
        getCycleByVersionId(treeNode.props.label).then((res) => {
          const cycles = [];
          let j = 0;
          for (let i = 0; i < res.length; i += 1) {
            if (res[i].parentCycleId === 0) {
              if (res[i].type === 'temp') {
                cycles.push({
                  title: <TreeTitle
                    index={`${treeNode.props.eventKey}-${j}`}
                    refresh={this.setTreeData}
                    data={res[i]}
                    text={res[i].cycleName}
                    type={res[i].type}
                    processBar={{ '#00BFA5': 3, '#D50000': 5 }}
                  />,
                  key: `${treeNode.props.eventKey}-${j}`,
                  label: `${res[i].cycleId}`,
                  type: `${res[i].type}`,
                  versionId: `${res[i].versionId}`,
                  data: res[i],
                  isLeaf: true,
                });
              } else {
                cycles.push({
                  title: <TreeTitle
                    index={`${treeNode.props.eventKey}-${j}`}
                    refresh={this.setTreeData}
                    data={res[i]}
                    text={res[i].cycleName}
                    type={res[i].type}
                    processBar={{ '#00BFA5': 3, '#D50000': 5 }}
                  />,
                  key: `${treeNode.props.eventKey}-${j}`,
                  label: res[i].cycleId,
                  type: res[i].type,
                  versionId: res[i].versionId,
                  data: res[i],
                });
              }
              j += 1;
            }
          }
          treeNode.props.dataRef.children = cycles;
          this.setState({
            loading: false,
            treeData: [...this.state.treeData],
          });
          const storage = window.localStorage;
          storage.removeItem('cycleData');
          storage.setItem('cycleData', JSON.stringify(res));
        });
        break;
      }
      case 3:
      {
        this.setState({
          loading: true,
        });
        const storage = window.localStorage;
        const res = JSON.parse(storage.getItem('cycleData'));
        const folders = [];
        let j = 0;
        for (let i = 0; i < res.length; i += 1) {
          if (res[i].parentCycleId === treeNode.props.label) {
            folders.push({
              title: <TreeTitle
                index={`${treeNode.props.eventKey}-${j}`}
                refresh={this.setTreeData}
                data={res[i]}
                text={res[i].cycleName}
                type={res[i].type}
                processBar={{ '#00BFA5': 3, '#D50000': 5 }}
              />,
              key: `${treeNode.props.eventKey}-${j}`,
              label: res[i].cycleId,
              data: res[i],
              isLeaf: true,
            });
            j += 1;
          }
        }
        treeNode.props.dataRef.children = folders;
        this.setState({
          loading: false,
          treeData: [...this.state.treeData],
        });
        break;
      }

      default:
        break;
    }
    resolve();
  });
  onExpand = (expandedKeys, { expanded, node }) => {
    window.console.log({ expanded, node });
    this.setState({
      expandedKeys,
    });
    // if (expanded) {
    //   this.onLoadData(node);
    // }
  };
  setTreeData = (key) => {
    window.console.log(key);

    const { treeData } = this.state;
    const indexs = key.split('-');
    let temp = treeData;
    indexs.pop();
    indexs.forEach((index, i) => {
      if (i === 0) {
        temp = temp[index];
      } else {
        temp = temp.children[index];
      }
    });
    temp.children = [];
    // this.state
    this.setState({
      // loading: false,
      treeData: [...this.state.treeData],
    });
  }
  refresh = () => {
    this.setState({
      loading: true,
    });
    getVersionCode().then((res) => {
      const versionCodes = [];
      for (let i = 0; i < res.lookupValues.length; i += 1) {
        const versionName = res.lookupValues[i].name;
        versionCodes.push({
          title: `${versionName}`,
          key: `${0}-${i}`,
          isLeaf: false,
          children: [{}],
        });
      }
      this.setState({
        loading: false,
        expandedKeys: ['0'],
        treeData: [
          { title: '所有版本', key: '0', children: versionCodes },
        ],

      });
    });
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
  filterCycle = (e) => {
    filterCycleWithBar(e.target.value).then((data) => {
      window.console.log(data);
      const versions = [];
      const expandedKeys = ['0'];
      data.forEach((item) => {
        if (item.type === 'cycle') {
          const index = _.findIndex(versions, { title: item.versionStatusName });
          window.console.log(index);
          if (index !== -1) {
            const index2 = _.findIndex(versions[index].children, { title: item.versionName });
            if (index2 !== -1) {
              versions[index].children[index2].children.push({
                cycleId: item.cycleId,
                title: item.cycleName,
                key: `${versions[index].children[index2].key}-${versions[index].children[index2].children.length}`,
                children: [],
              });
              expandedKeys.push(`${versions[index].children[index2].key}-${versions[index].children[index2].children.length - 1}`);
            } else {
              versions[index].children.push({
                title: item.versionName,
                key: `${versions[index].key}-${versions[index].children.length}`,
                children: [],
              });
              expandedKeys.push(`${versions[index].key}-${versions.length - 1}`);
            }
          } else {
            const len = versions.length;
            versions.push({
              title: item.versionStatusName,
              key: `${0}-${len}`,
              children: [],
            });
            expandedKeys.push(`${0}-${len}`);

            versions[0].children.push({
              title: item.versionName,
              key: `${versions[0].key}-${versions[0].children.length}`,
              children: [],
            });
            expandedKeys.push(`${versions[0].key}-${versions[0].children.length - 1}`);
            versions[0].children[0].children.push({
              cycleId: item.cycleId,
              title: item.cycleName,
              key: `${versions[0].children[0].key}-${versions[0].children[0].children.length}`,
              children: [],
            });
            expandedKeys.push(`${versions[0].children[0].key}-${versions[0].children[0].children.length - 1}`);
          }
        } 
      });
      data.forEach((item) => {
        if (item.type === 'folder') {
          const index1 = _.findIndex(versions, { title: item.versionStatusName });
          const index2 = _.findIndex(versions[index1].children, { title: item.versionName });          
          const index3 = _.findIndex(versions[index1].children[index2].children, 
            { cycleId: item.parentCycleId });            
          versions[index1].children[index2].children[index3].children.push({
            title: item.cycleName,
            key: `${versions[index1].children[index2].children[index3].key}-${versions[index1].children[index2].children[index3].children.length}`,
          });
          expandedKeys.push(`${versions[index1].children[index2].children[index3].key}-${versions[index1].children[index2].children[index3].children.length - 1}`);
        }
      });
      window.console.log(versions, expandedKeys);
      this.setState({
        treeData: [{ title: '所有版本', key: '0', children: versions }],
        expandedKeys,
      });
    });
  };
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
    const sourceIndex = _.findIndex(testList, { cycleId: record.cycleId });
    const targetIndex = _.findIndex(testList, { cycleId: dragData.cycleId });
    const [removed] = testList.splice(sourceIndex, 1);
    testList.splice(targetIndex, 0, removed);
    this.setState({
      testList,
      dragData: null,
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
  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode
          title={item.title}
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
    const { loading, currentCycle, testList, expandedKeys } = this.state;
    // const testList = [{ cycleId: 1, defects: [] }, { cycleId: 2, defects: [] }];
    const { build, cycleName, description, toDate, environment, fromDate } = currentCycle;
    const prefix = <Icon type="filter_list" />;
    const columns = [{
      title: 'ID',
      dataIndex: 'cycleId',
      key: 'cycleId',
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
      dataIndex: 'comment',
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
              type="mode_edit"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                // window.console.log(record);
                // that.setState({
                //   editVisible: true,
                //   editing: record,
                // });
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
            <div className="c7n-cycleHome">
              <div className={this.state.sideVisible ? 'c7n-ch-side' : 'c7n-ch-hidden'}>
                <div className="c7n-chs-button">
                  <Button
                    icon="navigate_next"
                    className="c7n-cycleHome-button"
                    onClick={() => {
                      this.setState({
                        leftVisible: true,
                        sideVisible: false,
                      });
                    }}
                  />
                </div>
                <div className="c7n-chs-bar">
                  {this.state.versionVisible ? '' : (
                    <p
                      role="none"
                      onClick={() => {
                        this.setState({});
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
                    <Button
                      icon="navigate_before"
                      className="c7n-cycleHome-button"
                      onClick={() => {
                        this.setState({
                          leftVisible: false,
                          sideVisible: true,
                        });
                      }}
                    />
                    <Button
                      icon="add"
                      className="c7n-cycleHome-button"
                    />
                  </div>
                </div>
                <div className="c7n-chlh-tree">
                  <Tree
                    loadData={this.onLoadData}
                    // defaultExpandAll
                    expandedKeys={expandedKeys}
                    showIcon
                    onExpand={this.onExpand}
                    onSelect={this.loadCycle}
                  >
                    {this.renderTreeNodes(this.state.treeData)}
                  </Tree>
                </div>
              </div>
              <div className="c7n-ch-right" >
                <div style={{ display: 'flex' }}>
                  <div>
                    循环名称：{cycleName}
                  </div>
                  <div style={{ flex: 1, visiblity: 'hidden' }} />
                  <div>
                    <Button
                      style={{ color: '#3f51b5' }}
                      onClick={() => {
                        this.setState({ createVisible: true, createType: 'CYCLE_CASE' });
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
                        {build}
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
                  columns={columns}
                  dataSource={testList}
                  onChange={this.handleStatusTableChange}
                  onRow={this.handleRow}
                />
              </div>
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default CycleHome;

