import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Table, Button, Input, Dropdown, Menu, Pagination,
  Spin, Icon, Select,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import FileSaver from 'file-saver';
import '../../../../assets/main.scss';
import './IssueManage.scss';
import IssueStore from '../../../../store/project/IssueStore';
import IssueTreeStore from '../../../../store/project/treeStore/IssueTreeStore';
import pic from '../../../../assets/问题管理－空.png';
import { loadIssue, createIssue, exportIssues } from '../../../../api/IssueManageApi';
import { importIssue } from '../../../../api/FileApi';
import EmptyBlock from '../../../../components/TestComponent/EmptyBlock';
import CreateIssue from '../../../../components/TestComponent/CreateIssue';
import EditIssue from '../../../../components/TestComponent/EditIssue';
import IssueTree from '../../../../components/TestComponent/IssueTree';
import IssueTable from '../../../../components/TestComponent/IssueTable';
import { Upload } from '../../../../components/CommonComponent';

const { AppState } = stores;
const { Option } = Select;
@observer
class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      create: false,
      selectedIssue: {},
      createIssue: false,
      // selectIssueType: 'issue_test',
      createIssueValue: '',
      createLoading: false,
      // keyCode: 0,
    };
  }

  componentDidMount() {
    this.getInit();
  }

  getInit() {
    const Request = this.GetRequest(this.props.location.search);
    const {
      paramType, paramId, paramName, paramStatus, paramIssueId, paramUrl,
    } = Request;
    IssueStore.setParamId(paramId);
    IssueStore.setParamType(paramType);
    IssueStore.setParamName(paramName);
    IssueStore.setParamStatus(paramStatus);
    IssueStore.setParamIssueId(paramIssueId);
    IssueStore.setParamUrl(paramUrl);
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
    if (paramStatus) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      const a = [paramStatus];
      obj.advancedSearchArgs.statusCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ statusCode: [paramStatus] });
      IssueStore.loadIssues();
    } else if (paramIssueId) {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues()
        .then((res) => {
          window.console.log(res);
          this.setState({
            selectedIssue: res.content.length ? res.content[0] : {},
            expand: true,
          });
        });
    } else {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues();
    }
  }

  GetRequest(url) {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  handleCreateIssue(issueObj) {
    this.setState({ create: false });
    // IssueStore.init();
    IssueStore.loadIssues();
  }

  handleChangeIssueId(issueId) {
    this.setState({
      expand: false,
    }, () => {
      this.setState({
        selectedIssue: {
          issueId,
        },
        expand: true,
      });
    });
  }

  handleIssueUpdate(issueId = this.state.selectedIssue.issueId) {
    loadIssue(issueId).then((res) => {
      // const obj = {
      //   assigneeId: res.assigneeId,
      //   assigneeName: res.assigneeName,
      //   imageUrl: res.imageUrl || '',
      //   issueId: res.issueId,
      //   issueNum: res.issueNum,
      //   priorityCode: res.priorityCode,
      //   priorityName: res.priorityName,
      //   projectId: res.projectId,
      //   statusCode: res.statusCode,
      //   statusColor: res.statusColor,
      //   statusName: res.statusName,
      //   summary: res.summary,
      //   typeCode: res.typeCode,
      // };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = { ...originIssues[index], ...res };
      IssueStore.setIssues(originIssues);
    });
  }

  handleBlurCreateIssue() {
    if (this.state.createIssueValue !== '') {
      const versionIssueRelDTOList = [];
      const selectedVersion = IssueTreeStore.currentCycle.versionId || IssueStore.getSeletedVersion;
      const folderId = IssueTreeStore.currentCycle.cycleId;
      // 判断是否选择版本
      const versions = IssueStore.getVersions;
      if (!selectedVersion || !_.find(versions, { versionId: selectedVersion })) {
        Choerodon.prompt('请选择版本');
        return;
      }
      versionIssueRelDTOList.push({
        versionId: selectedVersion,
        relationType: 'fix',
      });
      const data = {
        priorityCode: 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: 0,
        summary: this.state.createIssueValue,
        typeCode: 'issue_test',
        epicId: 0,
        parentIssueId: 0,
        versionIssueRelDTOList,
      };
      this.setState({
        createLoading: true,
      });
      createIssue(data, folderId)
        .then((res) => {
          // IssueStore.init();
          IssueStore.loadIssues();
          this.setState({
            createIssueValue: '',
            createLoading: false,
          });
        })
        .catch((error) => {
        });
    }
  }


  handleSort({ key }) {
    const currentSort = IssueStore.order;
    const targetSort = {};
    if (currentSort.orderField === key) {
      targetSort.orderField = key;
      if (currentSort.orderType !== 'desc') {
        targetSort.orderType = 'desc';
      } else {
        targetSort.orderType = 'asc';
      }
    } else {
      targetSort.orderField = key;
      targetSort.orderType = 'desc';
    }
    IssueStore.setOrder(targetSort);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }

  handlePaginationChange(page, pageSize) {
    IssueStore.loadIssues(page - 1, pageSize);
  }

  handlePaginationShowSizeChange(current, size) {
    IssueStore.loadIssues(current - 1, size);
  }

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    IssueStore.setPagination({
      current: 0,
      pageSize: IssueStore.pagination.pageSize,
      total: 0,
    });
    IssueStore.setFilteredInfo(filters);
    IssueStore.setBarFilters(barFilters);
    // window.console.log(pagination, filters, sorter, barFilters[0]);
    if (barFilters === undefined || barFilters.length === 0) {
      IssueStore.setBarFilters(undefined);
    }
    const obj = {
      advancedSearchArgs: {},
      searchArgs: {},
    };
    const { statusCode, priorityCode, typeCode } = filters;
    const { issueNum, summary } = filters;
    obj.advancedSearchArgs.statusCode = statusCode || [];
    obj.advancedSearchArgs.priorityCode = priorityCode || [];
    obj.advancedSearchArgs.typeCode = ['issue_test'];
    obj.searchArgs.issueNum = issueNum && issueNum.length ? issueNum[0] : barFilters[0];
    obj.searchArgs.summary = summary && summary.length ? summary[0] : '';
    IssueStore.setFilter(obj);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.loadIssues(current - 1, pageSize);
  }

  exportExcel() {
    exportIssues(null, null).then((excel) => {
      const blob = new Blob([excel], { type: 'application/vnd.ms-excel' });
      const fileName = `${AppState.currentMenuType.name}.xlsx`;
      FileSaver.saveAs(blob, fileName);
    });
  }

  importIssue = (files) => {
    const formData = new FormData();
    [].forEach.call(files, (file) => {
      formData.append('file', file);
    });
    importIssue(formData).then(() => {

    }).catch(() => {

    });
  }


  render() {
    const { expand } = this.state;
    const treeShow = IssueStore.treeShow;
    const versions = IssueStore.getVersions;
    const selectedVersion = IssueTreeStore.currentCycle.versionId || IssueStore.getSeletedVersion;

    const ORDER = [
      {
        code: 'summary',
        showName: <FormattedMessage id="issue_issueSortByName" />,
      },
      // {
      //   code: 'typeCode',
      //   showName: <FormattedMessage id="issue_issueSortByType" />,
      // },
      {
        code: 'priorityCode',
        showName: <FormattedMessage id="issue_issueSortByPriority" />,
      },
      {
        code: 'statusId',
        showName: <FormattedMessage id="issue_issueSortByStatus" />,
      },
      {
        code: 'assigneeId',
        showName: <FormattedMessage id="issue_issueSortByPerson" />,
      },
    ];
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
        dataIndex: 'priorityCode',
        key: 'priorityCode',
        filters: [
          {
            text: Choerodon.getMessage('高', 'high'),
            value: 'high',
          },
          {
            text: Choerodon.getMessage('中', 'medium'),
            value: 'medium',
          },
          {
            text: Choerodon.getMessage('低', 'low'),
            value: 'low',
          },
        ],
        filterMultiple: true,
      },
      {
        title: <FormattedMessage id="issue_issueFilterByStatus" />,
        dataIndex: 'statusCode',
        key: 'statusCode',
        filters: [
          {
            text: Choerodon.getMessage('待处理', 'todo'),
            value: 'todo',
          },
          {
            text: Choerodon.getMessage('处理中', 'doing'),
            value: 'doing',
          },
          {
            text: Choerodon.getMessage('已完成', 'done'),
            value: 'done',
          },
        ],
        filterMultiple: true,
        filteredValue: IssueStore.filteredInfo.statusCode || null,
      },
    ];
    const columns = [
      {
        title: 'summary',
        dataIndex: 'summary',
        render: (summary, record) => (
          expand ? this.renderNarrowIssue(record) : this.renderTestIssue(record)
        ),
      },
    ];
    const sort = (
      <Menu onClick={this.handleSort.bind(this)}>
        {
          ORDER.map(v => (
            <Menu.Item key={v.code}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: IssueStore.order.orderField === v.code ? 'blue' : '#000',
                }}
              >
                <span style={{ width: 100 }}>
                  {v.showName}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {
                    IssueStore.order.orderField === v.code && IssueStore.order.orderType === 'asc' && (
                      <Icon
                        type="arrow_upward"
                      />
                    )
                  }
                  {
                    IssueStore.order.orderField === v.code && IssueStore.order.orderType === 'desc' && (
                      <Icon
                        type="arrow_downward"
                      />
                    )
                  }
                </div>
              </div>
            </Menu.Item>
          ))
        }

      </Menu>
    );

    return (
      <Page className="c7ntest-Issue c7ntest-region">
        <Header
          title={<FormattedMessage id="issue_name" />}
          backPath={IssueStore.getBackUrl}
        >
          <Button className="leftBtn" onClick={() => this.setState({ create: true })}>
            <Icon type="playlist_add icon" />
            <FormattedMessage id="issue_createTestIssue" />
          </Button>
          <Button className="leftBtn" onClick={() => this.exportExcel()}>
            <Icon type="file_upload icon" />
            <FormattedMessage id="export" />
          </Button>
          <Upload
            handleUpload={this.importIssue}
          >
            <Icon type="file_upload" />
            {' '}
            <FormattedMessage id="issue_importIssue" />
          </Upload>
          <Button
            onClick={() => {
              if (this.EditIssue) {
                this.EditIssue.reloadIssue(this.state.selectedIssue.issueId);
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
              // width: this.state.expand ? '28%' : '100%',
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
            {/* <section className="c7ntest-count">
              <span className="c7ntest-span-count"><FormattedMessage id="issue_issueTotal" values={{ total: IssueStore.pagination.total }} /></span>
              <Dropdown overlay={sort} trigger={['click']}>
                <div style={{
                  display: 'flex', alignItems: 'center', fontSize: '13px', lineHeight: '20px', cursor: 'pointer', position: 'absolute', right: 25, bottom: 28,
                }}
                >
                  <Icon type="swap_vert" style={{ fontSize: '16px', marginRight: '5px' }} />
                  <FormattedMessage id="issue_issueSort" />
                </div>
              </Dropdown>
            </section> */}

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
                    selectedIssue={this.state.selectedIssue}
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
                  {this.state.createIssue ? (
                    <div className="c7ntest-add" style={{ display: 'block', width: '100%' }}>
                      <div className="c7ntest-add-select-version">
                        {/* 创建issue选择版本 */}
                        {
                          _.find(versions, { versionId: selectedVersion })
                            ? (
                              <div style={{ display: 'flex', alignItems: 'center', marginTop: -8 }}>
                                <span className="c7ntest-add-select-version-prefix">V</span>
                                <Select
                                  disabled={IssueTreeStore.currentCycle.versionId}
                                  onChange={(value) => {
                                    IssueStore.selectVersion(value);
                                  }}
                                  value={selectedVersion}
                                  style={{ width: 50 }}
                                  dropdownMatchSelectWidth={false}
                                >
                                  {
                                    versions.map(version => <Option value={version.versionId}>{version.name}</Option>)
                                  }
                                </Select>
                              </div>
                            )
                            : (
                              <div style={{ color: 'gray', marginTop: -3 }}>
                                {'暂无版本'}
                              </div>
                            )
                        }

                        <div style={{ marginLeft: 8, flexGrow: 1 }}>
                          <Input
                            autoFocus
                            value={this.state.createIssueValue}
                            placeholder={<FormattedMessage id="issue_whatToDo" />}
                            onChange={(e) => {
                              this.setState({
                                createIssueValue: e.target.value,
                              });
                            }}
                            maxLength={44}
                            onPressEnter={this.handleBlurCreateIssue.bind(this)}
                          />
                        </div>
                      </div>
                      <div style={{
                        marginTop: 10, display: 'flex', marginLeft: 50, paddingRight: 70,
                      }}
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            this.setState({
                              createIssue: false,
                            });
                          }}
                        >
                          <FormattedMessage id="cancel" />
                        </Button>
                        <Button
                          type="primary"
                          loading={this.state.createLoading}
                          onClick={this.handleBlurCreateIssue.bind(this)}
                        >
                          <FormattedMessage id="ok" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="leftBtn"
                      style={{ color: '#3f51b5' }}
                      funcType="flat"
                      onClick={() => {
                        this.setState({
                          createIssue: true,
                          createIssueValue: '',
                        });
                      }}
                    >
                      <Icon type="playlist_add icon" style={{ marginRight: -2 }} />
                      <span><FormattedMessage id="issue_issueCreate" /></span>
                    </Button>
                  )}
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

          <div
            className="c7ntest-sidebar"
            style={{
              // width: this.state.expand ? '72%' : 0,
              // width: this.state.expand ? 440 : 0,              
              display: this.state.expand ? '' : 'none',
              overflowY: 'hidden',
              overflowX: 'hidden',
              width: treeShow ? 440 : '72%',
            }}
          >
            {
              this.state.expand ? (
                <EditIssue
                  mode={treeShow ? 'narrow' : 'wide'}
                  ref={(instance) => {
                    if (instance) { this.EditIssue = instance; }
                  }}
                  issueId={this.state.selectedIssue.issueId}
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
                    // IssueStore.init();
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
            this.state.create ? (
              <CreateIssue
                visible={this.state.create}
                onCancel={() => this.setState({ create: false })}
                onOk={this.handleCreateIssue.bind(this)}

              />
            ) : null
          }
        </Content>
      </Page>
    );
  }
}
export default Test;
