import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Content, stores, WSHandler } from 'choerodon-front-boot';
import {
  Modal, Progress, Table, Button, Icon, Tooltip, Select,
} from 'choerodon-ui';
import { pull, pullAll, intersection } from 'lodash';
import { getCycleTreeByVersionId, getLastCloneData, batchClone } from '../../../../../../api/cycleApi';
import { SelectFocusLoad } from '../../../../../../components/CommonComponent';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
// const data = [{
//   cycleId: 1,
//   type: 'cycle',
//   cycleName: 'test',
//   children: [{
//     cycleId: 3,
//     parentCycleId: 1,
//     type: 'folder',
//     cycleName: 'folder',
//   }, {
//     cycleId: 5,
//     parentCycleId: 1,
//     type: 'folder',
//     cycleName: 'folder2',
//   }],
// }, {
//   cycleId: 2,
//   type: 'cycle',
//   cycleName: 'test2',
//   children: [{
//     cycleId: 4,
//     parentCycleId: 2,
//     type: 'folder',
//     cycleName: 'folder',
//   }],
// }];
class BatchClone extends Component {
  state = {
    visible: false,
    selectCycleKeys: [],
    selectFolderKeys: [],
    data: [],
    sourceVersionId: null,
    targetVersionId: null,
    cloningData: {
      rate: 0,
    },
    cloning: false,
    tableLoading: false,
    lastCloneData: { successfulCount: 0 },
  }


  open = () => {
    this.loadLastCloneData();
    this.setState({
      visible: true,
    });
  }

  close = () => {
    this.setState({
      visible: false,
    });
  }

  loadLastCloneData = () => {
    getLastCloneData().then((res) => {
      this.setState({
        lastCloneData: res,
        cloning: false,
      });
    });
  }

  loadCycleTreeByVersionId = (versionId) => {
    getCycleTreeByVersionId(versionId).then((res) => {
      this.setState({
        data: res.cycle,
        tableLoading: false,
      });
    });
  }

  handleSourceVersionChange = (versionId) => {
    this.setState({
      selectCycleKeys: [],
      selectFolderKeys: [],
      tableLoading: true,
      sourceVersionId: versionId,
    });
    this.loadCycleTreeByVersionId(versionId);
  }

  handleTargetVersionChange = (targetVersionId) => {
    this.setState({
      targetVersionId,
    });
  }

  handleRowSelect = (record, selected, selectedRows, nativeEvent) => {
    const { data } = this.state;
    let selectFolderKeys = selectedRows.filter(row => row.type === 'folder').map(row => row.cycleId);
    const selectCycleKeys = selectedRows.filter(row => row.type === 'cycle').map(row => row.cycleId);
    const { type } = record;
    // 循环
    if (type === 'cycle') {
      const targetCycle = data.find(item => item.cycleId === record.cycleId);
      const folderKeys = targetCycle.children.map(folder => folder.cycleId);
      if (selected) {
        selectFolderKeys = [...selectFolderKeys, ...folderKeys];
        selectCycleKeys.push(record.cycleId);
      } else {
        pull(selectCycleKeys, record.cycleId);
        // 取消子元素
        pullAll(selectFolderKeys, folderKeys);
      }
      // 阶段
    } else {
      const { parentCycleId } = record;
      const parentCycle = data.find(item => item.cycleId === parentCycleId);
      const folderKeys = parentCycle.children.map(folder => folder.cycleId);
      if (selected) {
        // 如果没有选择父cycle，则自动选上
        if (!selectCycleKeys.includes(parentCycleId)) {
          selectCycleKeys.push(parentCycleId);
        }
      } else {
        // 取消时，如果同级只剩自己，则取消父的选择
        // eslint-disable-next-line no-lonely-if
        if (intersection(selectFolderKeys, folderKeys).length === 0) {
          pull(selectCycleKeys, parentCycleId);
        }
      }
    }
    // console.log(selectedRowKeys);

    this.setState({
      selectCycleKeys: [...new Set(selectCycleKeys)],
      selectFolderKeys: [...new Set(selectFolderKeys)],
    });
  }

  handleSelectAll = (selected, selectedRows, changeRows) => {
    console.log(selectedRows);
    const selectFolderKeys = selectedRows.filter(row => row.type === 'folder').map(row => row.cycleId);
    const selectCycleKeys = selectedRows.filter(row => row.type === 'cycle').map(row => row.cycleId);
    this.setState({
      selectCycleKeys,
      selectFolderKeys,
    });
  }

  handleOk = () => {
    const {
      selectCycleKeys, selectFolderKeys, data, targetVersionId,
    } = this.state;
    if (!targetVersionId) {
      Choerodon.prompt('请选择目标版本');
      return;
    }
    const cloneDTO = [];
    selectCycleKeys.forEach((cycleKey) => {
      const cycle = { cycleId: cycleKey, folderIds: [] };
      const targetCycle = data.find(item => item.cycleId === cycleKey);
      targetCycle.children.forEach((folder) => {
        if (selectFolderKeys.includes(folder.cycleId)) {
          cycle.folderIds.push(folder.cycleId);
        }
      });
      cloneDTO.push(cycle);
    });
    if (cloneDTO.length > 0) {
      batchClone(targetVersionId, cloneDTO).then((res) => {
        if (res.failed) {
          Choerodon.prompt('目标版本含有同名循环或阶段');
        }
      }).catch((err) => {
        // if (err.message === '')
      });
    } else {
      Choerodon.prompt('请选择循环或阶段');
    }
  }

  handleMessage = (data) => {
    console.log(data);
    this.setState({
      cloningData: data,
      cloning: true,
    });
    if (data.rate === 1) {
      this.loadLastCloneData();
    }
  }

  render() {
    const {
      data, visible, targetVersionId, sourceVersionId, lastCloneData, cloning, cloningData, tableLoading,
    } = this.state;
    const { rate, status } = cloningData;
    const progress = (rate * 100).toFixed(2);
    const columns = [{
      title: '名称',
      render: record => record.cycleName,
    }];
    const { selectFolderKeys, selectCycleKeys } = this.state;
    const selectedRowKeys = [...new Set([...selectFolderKeys, ...selectCycleKeys])];
    return (
      <Sidebar
        destroyOnClose
        title="批量克隆"
        visible={visible}
        onCancel={this.close}
        onOk={this.handleOk}
        disableOk={!targetVersionId || cloning}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
        >
          <div className="c7ntest-BatchClone">
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
              <SelectFocusLoad
                label="版本"
                filter={false}
                loadWhenMount
                type="version"
                style={{ width: 160 }}
                onChange={this.handleSourceVersionChange}
              />
              <SelectFocusLoad
                label="克隆到"
                filter={false}
                loadWhenMount
                optionDisabled={version => version.versionId === sourceVersionId}
                type="version"
                style={{ marginLeft: 20, width: 160 }}
                onChange={this.handleTargetVersionChange}
              />
              <div style={{ marginLeft: 20, marginTop: 20 }}>
                {cloning ? (
                  <div style={{
                    width: 180,
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}
                  >
                    {status === 3
                      ? (
                        <span style={{ marginRight: 10 }}>
                          克隆失败
                        </span>
                      ) : (
                        <Fragment>
                          <span style={{ marginRight: 10 }}>
                            正在克隆
                          </span>
                          <Tooltip title={`进度：${progress}%`}>
                            <Progress percent={progress} showInfo={false} />
                          </Tooltip>
                        </Fragment>
                      )}
                  </div>
                ) : `克隆成功 ${lastCloneData.successfulCount || 0} 阶段`}
              </div>
            </div>
            <WSHandler
              messageKey={`choerodon:msg:test-cycle-batch-clone:${AppState.userInfo.id}`}
              onMessage={this.handleMessage}
            >
              <Table
                filterBar={false}
                pagination={false}
                loading={tableLoading}
                rowKey="cycleId"
                columns={columns}
                rowSelection={{
                  selectedRowKeys,
                  onSelectAll: this.handleSelectAll,
                  onSelect: this.handleRowSelect,
                }}
                dataSource={data}
              />
            </WSHandler>
          </div>
        </Content>
      </Sidebar>
    );
  }
}

BatchClone.propTypes = {

};

export default BatchClone;
