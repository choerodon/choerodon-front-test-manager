
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Tooltip, Table, Button, Icon, Input, Tree, Spin, Modal } from 'choerodon-ui';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import FileSaver from 'file-saver';
import moment from 'moment';
import './CycleHome.scss';
import { getUsers } from '../../../../api/CommonApi';
import { getCycles, deleteExecute, getCycleById, editCycleExecute, clone, addFolder, getStatusList, exportCycle } from '../../../../api/cycleApi';
import { editCycle } from '../../../../api/CycleExecuteApi';
import { TreeTitle, CreateCycle, EditCycle, CreateCycleExecute, ShowCycleData, CloneCycle } from '../../../../components/CycleComponent';
import DragTable from '../../../../components/DragTable';
import { RichTextShow, SelectFocusLoad } from '../../../../components/CommonComponent';
import { delta2Html, delta2Text, issueLink, getParams } from '../../../../common/utils';
import CycleStore from '../../../../store/project/cycle/CycleStore';
import noRight from './noright.svg';

const { AppState } = stores;
const { confirm } = Modal;
const styles = {
  statusOption: {
    lineHeight: '22px',
    height: 22,
    width: 60,
    textAlign: 'center',
    borderRadius: '2px',
    display: 'inline-block',
    color: 'white',
  },
};

const dataList = [];

const TreeNode = Tree.TreeNode;
@observer
class CycleHome extends Component {
  state = {
    CreateCycleExecuteVisible: false,
    CreateCycleVisible: false,
    EditCycleVisible: false,
    CloneCycleVisible: false,
    currentCloneCycle: null,
    loading: true,
    leftVisible: true,
    rightLoading: false,
    sideVisible: false,
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
    filters: {},
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
  onDragEnd = (sourceIndex, targetIndex) => {
    let lastRank = null;
    let nextRank = null;
    const { testList } = this.state;
    if (sourceIndex < targetIndex) {
      lastRank = testList[targetIndex].rank;
      nextRank = testList[targetIndex + 1] ? testList[targetIndex + 1].rank : null;
    } else if (sourceIndex > targetIndex) {
      lastRank = testList[targetIndex - 1] ? testList[targetIndex - 1].rank : null;
      nextRank = testList[targetIndex].rank;
    }
    // window.console.log(sourceIndex, targetIndex, lastRank, nextRank);
    const source = testList[sourceIndex];
    const temp = { ...source };
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
        // window.console.log(cycle);
      });
    });
  }
  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')
  loadCycle = (selectedKeys, { selected, selectedNodes, node, event } = {}, flag) => {
    // window.console.log(selectedNodes, node, event);
    if (selectedKeys) {
      CycleStore.setSelectedKeys(selectedKeys);
    }
    const { executePagination, filters } = this.state;
    const data = node ? node.props.data : CycleStore.getCurrentCycle;
    if (data.cycleId) {
      if (!flag) {
        this.setState({
          rightLoading: true,
          // currentCycle: data,
        });
      }

      CycleStore.setCurrentCycle(data);
      // window.console.log(data);

      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, data.cycleId,
      {
        ...filters,
        lastUpdatedBy: [Number(this.lastUpdatedBy)],
        assignedTo: [Number(this.assignedTo)],
      }).then((cycle) => {
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


  // generateList = (data) => {
  //   for (let i = 0; i < data.length; i += 1) {
  //     const node = data[i];
  //     const { key, title, cycleId } = node;
  //     window.console.log(key, title, cycleId);
  //     dataList.push({ ...node });
  //     if (node.children) {
  //       this.generateList(node.children, node.key);
  //     }
  //   }
  // }
  generateList = (data) => {
    // const temp = data;
    // while (temp) {
    //   dataList = dataList.concat(temp.children);
    //   if()
    // }
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      // 找出url上的cycleId
      const { cycleId } = getParams(location.href);
      const currentCycle = CycleStore.getCurrentCycle;
      if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
        this.setExpandDefault(node);
      } else if (currentCycle.cycleId === node.cycleId) {
        CycleStore.setCurrentCycle(node);
      }
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
        // that.setState({
        //   rightLoading: true,
        // });
        deleteExecute(executeId)
          .then((res) => {
            that.refresh();
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
    getStatusList('CYCLE_CASE').then((statusList) => {
      this.setState({ statusList });
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

  filterCycle = (value) => {
    // window.console.log(value);
    if (value !== '') {
      const expandedKeys = dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, CycleStore.getTreeData);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
      CycleStore.setExpandedKeys(expandedKeys);
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }

  // 默认展开并加载右侧数据
  setExpandDefault = (defaultExpandKeyItem) => {
    if (defaultExpandKeyItem) {
      CycleStore.setExpandedKeys([defaultExpandKeyItem.key]);
      CycleStore.setSelectedKeys([defaultExpandKeyItem.key]);
      CycleStore.setCurrentCycle(defaultExpandKeyItem);
      this.setState({
        autoExpandParent: true,
        rightLoading: true,
      });
      const { executePagination } = this.state;
      getCycleById({
        page: executePagination.current - 1,
        size: executePagination.pageSize,
      }, defaultExpandKeyItem.cycleId,
      {}).then((cycle) => {
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
  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        const parentKey = this.getParentKey(item.key, CycleStore.getTreeData);
        CycleStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
        break;
      }
      case 'CLONE_CYCLE': {
        // const parentKey = this.getParentKey(item.key, CycleStore.getTreeData);
        // CycleStore.addItemByParentKey(parentKey, 
        // { ...item, ...{ key: `${parentKey}-CLONE_CYCLE`, type: 'CLONE_CYCLE' } });
        this.setState({
          currentCloneCycle: item.cycleId,
          CloneCycleVisible: true,
        });
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
      case 'EXPORT_CYCLE': {
        exportCycle(item.cycleId).then((data) => {
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const fileName = `${AppState.currentMenuType.name}.xls`;
          FileSaver.saveAs(blob, fileName);
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
        this.setState({
          loading: false,
        });
        if (data.failed) {
          Choerodon.prompt('名字重复');
          CycleStore.removeAdding();
        } else {
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
        rightLoading: true,
        executePagination: pagination,
        filters,
      });
      const currentCycle = CycleStore.getCurrentCycle;
      getCycleById({
        size: pagination.pageSize,
        page: pagination.current - 1,
      }, currentCycle.cycleId,
      {
        ...filters,
        lastUpdatedBy: [Number(this.lastUpdatedBy)],
        assignedTo: [Number(this.assignedTo)],
      }).then((cycle) => {
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
    // debugger;
    const { searchValue } = this.state;
    const expandedKeys = CycleStore.getExpandedKeys;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (<Icon
      style={{ color: '#3F51B5' }}
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
              statusList={this.state.statusList}
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
  quickPass(execute) {
    const cycleData = { ...execute };
    if (_.find(this.state.statusList, { projectId: 0, statusName: '通过' })) {
      cycleData.executionStatus = _.find(this.state.statusList, { projectId: 0, statusName: '通过' }).statusId;
      delete cycleData.defects;
      delete cycleData.caseAttachment;
      delete cycleData.testCycleCaseStepES;
      delete cycleData.lastRank;
      delete cycleData.nextRank;
      this.setState({
        rightLoading: true,
      });
      editCycle(cycleData).then((Data) => {
        this.loadCycle();
      }).catch((error) => {
        this.setState({
          rightLoading: false,
        });
        Choerodon.prompt('网络错误');
      });
    } else {
      Choerodon.prompt('未找到通过');
    }
  }
  render() {
    // window.console.log('render');
    const { CreateCycleExecuteVisible, CreateCycleVisible, EditCycleVisible, CloneCycleVisible,
      currentCloneCycle, loading, currentEditValue, testList, rightLoading, leftVisible,
      searchValue, autoExpandParent,
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
      dataIndex: 'issueName',
      key: 'issueName',
      flex: 1,
      // filters: [],
      // onFilter: (value, record) => 
      //   record.issueInfosDTO && record.issueInfosDTO.issueName.indexOf(value) === 0,  
      render(issueId, record) {
        const { issueInfosDTO } = record;
        return (
          issueInfosDTO && <Tooltip
            title={
              <div>
                <div>{issueInfosDTO.issueName}</div>
                <div>{issueInfosDTO.summary}</div>
              </div>}
          >
            <Link
              className="c7n-text-dot"
              style={{
                width: 100,
              }}
              to={issueLink(issueInfosDTO.issueId, issueInfosDTO.typeCode)}
              target="_blank"
            >
              {issueInfosDTO.issueName}
            </Link>
          </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="status" />,
      dataIndex: 'executionStatus',
      key: 'executionStatus',
      filters: statusList.map(status => ({ text: status.statusName, value: status.statusId })),
      // onFilter: (value, record) => record.executionStatus === value,  
      flex: 1,
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
      filters: [],
      flex: 1,
      render(comment) {
        return (
          <Tooltip title={<RichTextShow data={delta2Html(comment)} />}>
            <div
              className="c7n-text-dot"
            // style={{
            //   width: 65,
            // }}
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
      flex: 1,
      render: defects =>
        (<Tooltip
          placement="topLeft"
          title={
            <div>
              {defects.map((defect, i) => (
                defect.issueInfosDTO && <div>
                  <Link
                    style={{
                      color: 'white',
                    }}
                    to={issueLink(defect.issueInfosDTO.issueId, defect.issueInfosDTO.typeCode)}
                    target="_blank"
                  >
                    {defect.issueInfosDTO.issueName}
                  </Link>
                  <div>{defect.issueInfosDTO.summary}</div>
                </div>
              ))}
            </div>}
        >
          {defects.map((defect, i) => defect.issueInfosDTO && defect.issueInfosDTO.issueName).join(',')}
        </Tooltip>),
    },
    {
      title: <FormattedMessage id="cycle_executeBy" />,
      dataIndex: 'lastUpdateUser',
      key: 'lastUpdateUser',
      flex: 1,
      render(lastUpdateUser) {
        return (<div
          className="c7n-text-dot"
        >
          {lastUpdateUser.realName}
        </div>);
      },
    }, {
      title: <FormattedMessage id="cycle_executeTime" />,
      dataIndex: 'lastUpdateDate',
      key: 'lastUpdateDate',
      flex: 1,
      render(lastUpdateDate) {
        return (<div
          className="c7n-text-dot"
        >
          {/* {lastUpdateDate && moment(lastUpdateDate).format('D/MMMM/YY')} */}
          {lastUpdateDate && moment(lastUpdateDate).format('YYYY-MM-DD')}
        </div>);
      },
    }, {
      title: <FormattedMessage id="cycle_assignedTo" />,
      dataIndex: 'assigneeUser',
      key: 'assigneeUser',
      flex: 1,
      render(assigneeUser) {
        return (<div
          className="c7n-text-dot"
        >
          {assigneeUser && assigneeUser.realName}
        </div>);
      },
    }, {
      title: '',
      key: 'action',
      flex: 1,
      render(text, record) {
        return (
          record.projectId !== 0 &&
          <div style={{ display: 'flex' }}>
            <Tooltip title={<FormattedMessage id="execute_quickPass" />}>
              <Icon type="local_parking" onClick={that.quickPass.bind(that, record)} style={{ cursor: 'pointer' }} />
            </Tooltip>
            <Icon
              type="explicit2"
              style={{ cursor: 'pointer', margin: '0 10px' }}
              onClick={() => {
                const { history } = that.props;
                const urlParams = AppState.currentMenuType;
                history.push(`/testManager/Cycle/execute/${record.executeId}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
              }}
            />
            <Icon
              type="delete_forever"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                that.deleteExecute(record);
              }}
            />
          </div>
        );
      },
    }];
    const otherColumns = [
      {
        title: <FormattedMessage id="cycle_createExecute_component" />,
        dataIndex: 'issueInfosDTO',
        key: 'component',
        render(issueInfosDTO) {
          if (!issueInfosDTO) {
            return null;
          }
          const { componentIssueRelDTOList } = issueInfosDTO;
          return (<Tooltip
            placement="topLeft"
            title={
              <div>
                {componentIssueRelDTOList.map((component, i) => (
                  <div>
                    {component.name}
                  </div>
                ))}
              </div>}
          >
            {componentIssueRelDTOList.map((component, i) => component.name).join(',')}
          </Tooltip>);
        },
      },
      {
        title: <FormattedMessage id="cycle_createExecute_label" />,
        dataIndex: 'issueInfosDTO',
        key: 'statusName',
        render(issueInfosDTO) {
          if (!issueInfosDTO) {
            return null;
          }
          const { labelIssueRelDTOList } = issueInfosDTO;
          return (<Tooltip
            placement="topLeft"
            title={
              <div>
                {labelIssueRelDTOList.map((label, i) => (
                  <div>
                    {label.labelName}
                  </div>
                ))}
              </div>}
          >
            <div style={{ display: 'flex', flexFlow: 'row wrap', width: '100%', justifyContent: 'space-between', alignItems: 'center', maxHeight: 24, overflow: 'hidden' }}>
              {labelIssueRelDTOList.map((label, i) => (<div
                style={{
                  flexShrink: 0,
                  width: '48%',
                  color: '#000',
                  borderRadius: '100px',
                  fontSize: '13px',
                  lineHeight: '20px',
                  padding: '2px 5px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.08)',
                  // margin: '0 5px',
                  // marginBottom: 3,
                }}
                className="c7n-text-dot"
              >
                {label.labelName}
              </div>))}
            </div>

          </Tooltip>);
        },
      },
    ];
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
          style={{ paddingBottom: 0, paddingRight: 0 }}
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
                this.refresh();
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
            <CloneCycle
              visible={CloneCycleVisible}
              currentCloneCycle={currentCloneCycle}
              onCancel={() => { this.setState({ CloneCycleVisible: false }); }}
              onOk={() => { this.setState({ CloneCycleVisible: false }); this.refresh(); }}
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
              <div className={leftVisible ? 'c7n-ch-left' : 'c7n-ch-hidden'}>
                <div className="c7n-chl-head">
                  <div className="c7n-chlh-search">
                    <Input prefix={prefix} placeholder="过滤" onChange={e => _.debounce(this.filterCycle, 200).call(null, e.target.value)} />
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
                <div className="c7n-chlh-tree" style={{ height: window.innerHeight - 234 }}>
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
              <div style={{ width: 1, background: 'rgba(0,0,0,0.26)' }} />
              {cycleId ? <div className="c7n-ch-right" >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div>
                    <FormattedMessage id="cycle_cycleName" />
                    ：<span>{title}</span>
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
                <div style={{ display: 'flex', marginBottom: 20 }}>
                  <SelectFocusLoad
                    label={<FormattedMessage id="cycle_executeBy" />}
                    request={getUsers}
                    onChange={(value) => {
                      this.lastUpdatedBy = value;
                      this.loadCycle();
                    }}
                  />
                  <div style={{ marginLeft: 20 }}>
                    <SelectFocusLoad
                      label={<FormattedMessage id="cycle_assignedTo" />}
                      request={getUsers}
                      onChange={(value) => {
                        this.assignedTo = value;
                        this.loadCycle();
                      }}
                    />
                  </div>
                </div>
                <DragTable
                  pagination={executePagination}
                  loading={rightLoading}
                  onChange={this.handleExecuteTableChange}
                  dataSource={testList}
                  columns={leftVisible ? columns :
                    columns.slice(0, 4).concat(otherColumns).concat(columns.slice(4))}
                  onDragEnd={this.onDragEnd}
                  dragKey="executeId"
                />
              </div> : <div style={{ display: 'flex', alignItems: 'center', height: 250, margin: '88px auto', padding: '50px 75px', border: '1px dashed rgba(0,0,0,0.54)' }}><img src={noRight} alt="" />
                <div style={{ marginLeft: 40 }}>
                  <div style={{ fontSize: '14px', color: 'rgba(0,0,0,0.65)' }}>根据当前选定的测试循环没有查询到循环信息</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: 10 }}>尝试在您的树状图中选择测试循环</div>
                </div>
              </div>}
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default CycleHome;

