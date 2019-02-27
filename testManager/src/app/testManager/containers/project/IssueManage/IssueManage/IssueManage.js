import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content } from 'choerodon-front-boot';
import { Button, Icon } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import FileSaver from 'file-saver';
import IssueStore from '../../../../store/project/IssueManage/IssueStore';
import { loadIssue, downloadTemplate } from '../../../../api/IssueManageApi';
import { commonLink, getParams, testCaseDetailLink } from '../../../../common/utils';
import RunWhenProjectChange from '../../../../common/RunWhenProjectChange';
import CreateIssue from '../../../../components/IssueManageComponent/CreateIssue';
import IssueTree from '../../../../components/IssueManageComponent/IssueTree';
import IssueTable from '../../../../components/IssueManageComponent/IssueTable';
import ExportSide from '../../../../components/IssueManageComponent/ExportSide';
import './IssueManage.scss';
import IssueTreeStore from '../../../../store/project/IssueManage/IssueTreeStore';

@observer
export default class IssueManage extends Component {
  state = { 
    createIssueShow: false,
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
    IssueStore.loadIssues();
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


  downloadTemplate = () => {
    downloadTemplate().then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = '导入模板.xlsx';
      FileSaver.saveAs(blob, fileName);
    });
  }


  handleTableRowClick=(record) => {
    const { history } = this.props;
    history.push(testCaseDetailLink(record.issueId, record.folderName));
  }


  saveRef = name => (ref) => {
    this[name] = ref;
  }

  render() {
    const { createIssueShow } = this.state;
    const treeShow = IssueStore.treeShow;
    const currentCycle = IssueTreeStore.getCurrentCycle;
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
              onRow={record => ({
                onClick: (event) => { this.handleTableRowClick(record); },                             
              })}
            />
          </div>
          <ExportSide ref={this.saveRef('ExportSide')} />
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
