import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Table, Button, Pagination, Icon,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import FileSaver from 'file-saver';
import IssueStore from '../../../../store/project/IssueManage/IssueStore';
import pic from '../../../../assets/问题管理－空.png';
import { loadIssue, downloadTemplate } from '../../../../api/IssueManageApi';
import { commonLink, getParams } from '../../../../common/utils';
import EmptyBlock from '../../../../components/IssueManageComponent/EmptyBlock';
import CreateIssue from '../../../../components/IssueManageComponent/CreateIssue';
import EditIssue from '../../../../components/IssueManageComponent/EditIssue';
import IssueTree from '../../../../components/IssueManageComponent/IssueTree';
import IssueTable from '../../../../components/IssueManageComponent/IssueTable';
import ExportSide from '../../../../components/IssueManageComponent/ExportSide';
import { CreateIssueTiny } from './components';
import './IssueManage.scss';

@observer
export default class IssueManage extends Component {
  state = {
    expand: false,
    createIssueShow: false,
    selectedIssue: {},
  }

  componentDidMount() {
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

  handleCreateIssue() {
    this.setState({ createIssueShow: false });
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

  handlePaginationChange(page, pageSize) {
    IssueStore.loadIssues(page - 1, pageSize);
  }

  handlePaginationShowSizeChange(current, size) {
    IssueStore.loadIssues(current - 1, size);
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    // 条件变化返回第一页
    IssueStore.setPagination({
      current: 1,
      pageSize: IssueStore.pagination.pageSize,
      total: IssueStore.pagination.total,
    });
    IssueStore.setFilteredInfo(filters);
    IssueStore.setBarFilters(barFilters);
    // window.console.log(pagination, filters, sorter, barFilters[0]);
    if (barFilters === undefined || barFilters.length === 0) {
      IssueStore.setBarFilters(undefined);
    }
    
    const { statusId, priorityId } = filters;
    const { issueNum, summary } = filters;
    const search = {
      advancedSearchArgs: {
        statusId: statusId || [],
        priorityId: priorityId || [],
      },
      searchArgs: {
        issueNum: issueNum && issueNum.length ? issueNum[0] : barFilters[0],
        summary: summary && summary.length ? summary[0] : '',
      },
    };
    IssueStore.setFilter(search);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }


  downloadTemplate=() => {
    downloadTemplate().then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const fileName = '导入模板.xlsx';
      FileSaver.saveAs(blob, fileName);
    });
  }


  saveRef = name => (ref) => {
    this[name] = ref;
  }

  render() {
    const { expand, createIssueShow, selectedIssue } = this.state;
    const treeShow = IssueStore.treeShow;
    const prioritys = IssueStore.getPrioritys;
    const issueStatusList = IssueStore.getIssueStatus;
    const filterColumns = [
      {
        title: <FormattedMessage id="issue_issueFilterByNum" />,
        dataIndex: 'issueNum',
        key: 'issueNum',
        filters: [],
      },
      {
        title: <FormattedMessage id="issue_issueFilterBySummary" />,
        dataIndex: 'summary',
        key: 'summary',
        filters: [],
      },
      {
        title: <FormattedMessage id="issue_issueFilterByPriority" />,
        dataIndex: 'priorityId',
        key: 'priorityId',
        filters: prioritys.map(priority => ({ text: priority.name, value: priority.id.toString() })),
        filterMultiple: true,
      },
      {
        title: <FormattedMessage id="issue_issueFilterByStatus" />,
        dataIndex: 'statusId',
        key: 'statusId',
        filters: issueStatusList.map(status => ({ text: status.name, value: status.id.toString() })),
        filterMultiple: true,
        filteredValue: IssueStore.filteredInfo.statusId || null,
      },
    ];
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
            <section className="c7ntest-bar">
              <Table
                rowKey={record => record.id}
                columns={filterColumns}
                dataSource={[]}
                filterBar
                showHeader={false}
                onChange={this.handleFilterChange}
                pagination={false}
                filters={IssueStore.barFilters || []}
                filterBarPlaceholder={<FormattedMessage id="issue_filterTestIssue" />}
              />
            </section>
            <section
              className={`c7ntest-table ${this.state.expand ? 'expand-sign' : ''}`}
              style={{
                paddingRight: this.state.expand ? '0' : '24px',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {
                IssueStore.issues.length === 0 && !IssueStore.loading ? (
                  <EmptyBlock
                    style={{ marginTop: 40 }}
                    border
                    pic={pic}
                    title={<FormattedMessage id="issue_noIssueTitle" />}
                    des={<FormattedMessage id="issue_noIssueDescription" />}
                  />
                ) : (
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
                )
              }

              <div className="c7ntest-backlog-sprintIssue">
                <div
                  style={{
                    userSelect: 'none',
                    background: 'white',
                    padding: '12px 0 12px 20px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  {/* table底部创建用例 */}
                  <CreateIssueTiny />
                </div>
              </div>
              {
                IssueStore.issues.length !== 0 ? (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16,
                  }}
                  >
                    <Pagination
                      current={IssueStore.pagination.current}
                      defaultCurrent={1}
                      defaultPageSize={10}
                      pageSize={IssueStore.pagination.pageSize}
                      showSizeChanger
                      total={IssueStore.pagination.total}
                      onChange={this.handlePaginationChange.bind(this)}
                      onShowSizeChange={this.handlePaginationShowSizeChange.bind(this)}
                    />
                  </div>
                ) : null
              }

            </section>

          </div>
          <ExportSide ref={this.saveRef('ExportSide')} />
          <div
            className="c7ntest-sidebar"
            style={{
              display: expand ? '' : 'none',
              width: treeShow ? 440 : '72%',
            }}
          >
            {
              expand ? (
                <EditIssue
                  mode={treeShow ? 'narrow' : 'wide'}
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
              />
            )
          }
        </Content>
      </Page>
    );
  }
}
