import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content } from 'choerodon-front-boot';
import { Button, Icon } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import FileSaver from 'file-saver';
import IssueStore from '../../../../store/project/IssueManage/IssueStore';

import { loadIssue, downloadTemplate } from '../../../../api/IssueManageApi';
import { commonLink, getParams } from '../../../../common/utils';
import RunWhenProjectChange from '../../../../common/RunWhenProjectChange';

import CreateIssue from '../../../../components/IssueManageComponent/CreateIssue';
import EditIssue from '../../../../components/IssueManageComponent/EditIssue';
import IssueTree from '../../../../components/IssueManageComponent/IssueTree';
import IssueTable from '../../../../components/IssueManageComponent/IssueTable';
import ExportSide from '../../../../components/IssueManageComponent/ExportSide';
import './IssueManage.scss';
import IssueTreeStore from '../../../../store/project/IssueManage/IssueTreeStore';

const EditIssueWidth = {
  narrow: 440,
  medium: '54%',
  wide: '64%',
};
@inject('MenuStore')
@observer
export default class IssueManage extends Component {
  state = {
    expand: false,
    createIssueShow: false,
    selectedIssue: {},
  }

  componentDidMount() {
    RunWhenProjectChange(IssueStore.clearStore);
    this.getInit();
  }

  getInit() {
    const Request = getParams(this.props.location.search);
    const { paramName, paramIssueId } = Request;
    IssueStore.setParamName(paramName);
    IssueStore.setParamIssueId(paramIssueId);
    // 当参数中有用例名时，在table的筛选框中加入
    const barFilters = paramName ? [paramName] : [];
    IssueStore.setBarFilters(barFilters);
    IssueStore.init();
    IssueStore.loadIssues().then((res) => {
      if (paramIssueId) {
        this.setState({
          selectedIssue: res.content.length ? res.content[0] : {},
          expand: true,
        });
      }
    });
  }

  /**
   *
   * 用例创建后，默认选到目标文件夹
   * @param {*} issue
   * @param {*} folderId
   * @memberof IssueManage
   */
  handleCreateIssue(issue, folderId) {
    this.setState({ createIssueShow: false });
    let targetCycle = null;
    // 如果指定了文件夹就设置文件夹，否则设置版本
    if (folderId) {
      targetCycle = _.find(IssueTreeStore.dataList, { cycleId: folderId });
    } else {
      const versionId = issue.versionIssueRelDTOList[0].versionId;
      targetCycle = _.find(IssueTreeStore.dataList, { versionId });
    }    
    if (targetCycle) {      
      const expandKeys = IssueTreeStore.getExpandedKeys;
      // 设置当前选中项
      IssueTreeStore.setCurrentCycle(targetCycle);
      // 设置当前选中项
      IssueTreeStore.setSelectedKeys([targetCycle.key]);
      // 设置展开项，展开父元素
      IssueTreeStore.setExpandedKeys([...expandKeys, targetCycle.key.split('-').slice(0, -1).join('-')]);      
    }
    IssueStore.loadIssues();
  }

  /**
   * 当issue更新时,本地更新单个issue
   * @param {*} issueId 
   */
  handleIssueUpdate(issueId = this.state.selectedIssue.issueId) {
    loadIssue(issueId).then((res) => {
      IssueStore.updateSingleIssue(res);
    });
  }

  // handleSort({ key }) {
  //   const currentSort = IssueStore.order;
  //   const targetSort = {};
  //   if (currentSort.orderField === key) {
  //     targetSort.orderField = key;
  //     if (currentSort.orderType !== 'desc') {
  //       targetSort.orderType = 'desc';
  //     } else {
  //       targetSort.orderType = 'asc';
  //     }
  //   } else {
  //     targetSort.orderField = key;
  //     targetSort.orderType = 'desc';
  //   }
  //   IssueStore.setOrder(targetSort);
  //   const { current, pageSize } = IssueStore.pagination;
  //   IssueStore.loadIssues(current - 1, pageSize);
  // }


  downloadTemplate = () => {
    downloadTemplate().then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = '导入模板.xlsx';
      FileSaver.saveAs(blob, fileName);
    });
  }

  getMode = () => {
    // 左侧菜单状态 true 折叠 false未折叠
    const MenuCollapsed = this.props.MenuStore.collapsed;
    const treeShow = IssueStore.treeShow;
    if (!treeShow) {
      return 'wide';
    } else if (treeShow && !MenuCollapsed) {
      return 'narrow';
    } else {
      return 'medium';
    }
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  render() {
    const { expand, createIssueShow, selectedIssue } = this.state;
    const treeShow = IssueStore.treeShow;
    const currentCycle = IssueTreeStore.getCurrentCycle;
    const EditIssueMode = this.getMode();

    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title={<FormattedMessage id="issue_name" />}
        >
          <Button className="leftBtn" onClick={() => this.setState({ createIssueShow: true })}>
            <Icon type="playlist_add icon" />
            <FormattedMessage id="issue_createTestIssue" />
          </Button>
          <Button className="leftBtn" onClick={() => this.ExportSide.open()}>
            <Icon type="export icon" />
            <FormattedMessage id="export" />
          </Button>
          <Button className="leftBtn" onClick={() => { this.props.history.push(commonLink('/IssueManage/import')); }}>
            <Icon type="file_upload icon" />
            <FormattedMessage id="import" />
          </Button>
          <Button className="leftBtn" onClick={this.downloadTemplate}>
            <Icon type="get_app icon" />
            下载模板
          </Button>
          <Button
            onClick={() => {
              if (this.EditIssue) {
                this.EditIssue.reloadIssue(selectedIssue.issueId);
              }
              const { current, pageSize } = IssueStore.pagination;
              if (this.tree) {
                this.tree.getTree();
              }
              IssueStore.loadIssues(current - 1, pageSize);
            }}
          >
            <Icon type="autorenew icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0' }}>
          <div className="c7ntest-chs-bar">
            {!treeShow && (
              <p
                role="none"
                onClick={() => {
                  IssueStore.setTreeShow(true);
                }}
              >
                <FormattedMessage id="issue_repository" />
              </p>
            )}
          </div>
          <div className="c7ntest-issue-tree">
            {treeShow && (
              <IssueTree
                ref={(tree) => { this.tree = tree; }}
                onClose={() => {
                  IssueStore.setTreeShow(false);
                }}
              />
            )}
          </div>
          <div
            className="c7ntest-content-issue"
            style={{
              flex: 1,
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <IssueTable
              setExpand={(value) => {
                this.setState({
                  expand: value,
                });
              }}
              setSelectIssue={(value) => {
                this.setState({
                  selectedIssue: value,
                });
              }}
              selectedIssue={selectedIssue}
              expand={expand}
              treeShow={treeShow}
            />

          </div>
          <ExportSide ref={this.saveRef('ExportSide')} />
          <div
            className="c7ntest-sidebar"
            style={{
              display: expand ? '' : 'none',
              width: EditIssueWidth[EditIssueMode],
            }}
          >
            {
              expand ? (
                <EditIssue
                  mode={EditIssueMode === 'narrow' ? 'narrow' : 'wide'}
                  ref={(instance) => {
                    if (instance) { this.EditIssue = instance; }
                  }}
                  issueId={selectedIssue.issueId}
                  onCancel={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                    });
                  }}
                  onDeleteIssue={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                    });
                    IssueStore.loadIssues();
                  }}
                  onUpdate={this.handleIssueUpdate.bind(this)}
                  onCopyAndTransformToSubIssue={() => {
                    const { current, pageSize } = IssueStore.pagination;
                    IssueStore.loadIssues(current - 1, pageSize);
                  }}
                />
              ) : null
            }
          </div>
          {
            createIssueShow && (
              <CreateIssue
                visible={createIssueShow}
                onCancel={() => this.setState({ createIssueShow: false })}
                onOk={this.handleCreateIssue.bind(this)}
                defaultVersion={currentCycle.versionId}
              />
            )
          }
        </Content>
      </Page>
    );
  }
}
