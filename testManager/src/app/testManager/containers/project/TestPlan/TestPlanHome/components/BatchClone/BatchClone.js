import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Content, stores, WSHandler } from 'choerodon-front-boot';
import {
  Modal, Progress, Table, Button, Icon, Tooltip, Select,
} from 'choerodon-ui';
import { pull, pullAll, intersection } from 'lodash';
import { getCycleTreeByVersionId } from '../../../../../../api/cycleApi';
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
    selectedRowKeys: [],
    data: [],
  }

  open=() => {
    this.setState({
      visible: true,
    });
  }

  close=() => {
    this.setState({
      visible: false,
    });
  }

  loadCycleTreeByVersionId=(versionId) => {
    getCycleTreeByVersionId(versionId).then((res) => {
      this.setState({
        data: res.cycle,
      });
    });
  }

  handleSourceVersionChange = (versionId) => {
    this.loadCycleTreeByVersionId(versionId);
  }

  handleTargetVersionChange = () => {

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
        if (intersection(selectFolderKeys, folderKeys).length === 0) {
          pull(selectCycleKeys, parentCycleId);
        }        
      }
    }
    // console.log(selectedRowKeys);
    
    this.setState({
      selectedRowKeys: [...new Set([...selectFolderKeys, ...selectCycleKeys])],
    });
  }

  render() {
    const { data, visible } = this.state;
    const columns = [{
      title: '名称',
      render: record => record.cycleName,
    }];
    const { selectedRowKeys } = this.state;
    return (
      <Sidebar
        title="批量克隆"
        visible={visible}
        onCancel={this.close}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
        >
          <div className="c7ntest-BatchClone">
            <div style={{ marginBottom: 24 }}>
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
                type="version"
                style={{ marginLeft: 20, width: 160 }}
                onChange={this.handleTargetVersionChange}
              />
            </div>
            <WSHandler
              messageKey={`choerodon:msg:test-cycle-export:${AppState.userInfo.id}`}
              onMessage={this.handleMessage}
            >
              <Table
                filterBar={false}
                pagination={false}
                rowKey="cycleId"
                columns={columns}
                rowSelection={{
                  selectedRowKeys,
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
