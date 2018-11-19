import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Modal, Table, Select } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import './SelectApp.scss';
import { getApps, getAppVersions } from '../../../../../api/AutoTestApi';
import SelectAppStore from '../../../../../store/project/AutoTest/SelectAppStore';

const SideBar = Modal.Sidebar;
const { AppState } = stores;
const { Option } = Select;
@observer
class DeployAppHome extends Component {
  state = {
    projectId: AppState.currentMenuType.id,
    appList: [],
    selectedApp: null,
    appVersions: [],
    selectedAppVersion: null,
    loading: false,
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },

  }

  componentDidMount() {
    this.loadApps();
  }

  loadApps = (value = '') => {
    const { pagination, selectedApp } = this.state;
    const { current, pageSize: size } = pagination;
    let searchParam = {};
    if (value !== '') {
      searchParam = { name: [value] };
    }
    getApps({
      page: current - 1,
      size,
      sort: { field: 'id', order: 'desc' },
      postData: { searchParam, param: '' },
    }).then((data) => {
      // 默认取第一个
      if (data.failed) {
        Choerodon.prompt(data.failed);
        return; 
      }
      if (data.content.length > 0 && data.content[0].id != selectedApp) {
        this.loadAppVersions(data.content[0].id);
        this.setState({
          selectedApp: data.content[0].id,
        });
      }
      this.setState({
        appList: data.content,
      });
    });
  }

  loadAppVersions = (appId) => {
    getAppVersions(appId).then((data) => {      
      this.setState({
        appVersions: data,
      });
    });
  }

  /**
   * 切换分页
   * @param page
   * @param size
   */
  // onPageChange = (page, size) => {
  //   const { projectId } = this.state;
  //   this.loadData({
  //     projectId,
  //     page: page - 1,
  //     size,
  //   });
  // };

  /**
   * 获取本项目的app
   * @returns {*}
   */
  getProjectTable = () => {
    const { intl } = this.props;
    const {
      app, isMarket, appVersions, selectedAppVersion, pagination,
    } = this.state;
    const column = [{
      key: 'check',
      width: '50px',
      render: record => (
        record.id === selectedAppVersion.id && <i className="icon icon-check icon-select" />
      ),
    }, {
      title: <FormattedMessage id="app_name" />,
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filters: [],
    }, {
      title: <FormattedMessage id="autoteststep_one_version" />,
      dataIndex: 'version',
      key: 'version',
      sorter: true,
    }, {
      title: <FormattedMessage id="app_code" />,
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      filters: [],
    }];
    return (
      <Table
        filterBarPlaceholder={intl.formatMessage({ id: 'filter' })}
        rowClassName="col-check"
        onRow={(record) => {
          const a = record;
          return {
            onClick: this.handleSelectAppVersion.bind(this, record),
          };
        }}
        onChange={this.tableChange}
        columns={column}
        rowKey={record => record.id}
        dataSource={appVersions}
        pagination={pagination}
      />
    );
  };

  /**
   * 初始化选择数据
   */
  // handleSelectData = () => {
  //   if (this.props.app) {
  //     if (this.props.isMarket) {
  //       const app = this.props.app;
  //       app.appId = app.id;
  //     }
  //     this.setState({ app: this.props.app, isMarket: this.props.isMarket });
  //   }
  // };


  /**
   * 清空搜索框数据
   */
  // clearInputValue = (key) => {
  //   const { projectId, activeKey } = this.state;
  //   const keys = key || activeKey;
  //   SelectAppStore.setSearchValue('');
  //   if (keys === '1') {
  //     SelectAppStore.loadData({
  //       projectId,
  //       page: 0,
  //       size: SelectAppStore.localPageInfo.pageSize,
  //     });
  //   } else {
  //     SelectAppStore.loadApps({
  //       projectId,
  //       page: 0,
  //       size: SelectAppStore.storePageInfo.pageSize,
  //     });
  //   }
  // };

  /**
   * 点击选择数据
   * @param record
   */
  handleSelectApp = (record) => {
    this.loadAppVersions(record.id);
    this.setState({ app: record, selectedApp: record.id });
  };

  handleSelectAppVersion=(record) => {
    this.setState({ selectedAppVersion: record.id });
  }

  /**
   * table 改变的函数
   * @param pagination 分页
   * @param filters 过滤
   * @param sorter 排序
   */
  tableChange = (pagination, filters, sorter, paras) => {
    const menu = AppState.currentMenuType;
    const organizationId = menu.id;
    const sort = { field: 'id', order: 'desc' };
    if (sorter.column) {
      sort.field = sorter.field || sorter.columnKey;
      // sort = sorter;
      if (sorter.order === 'ascend') {
        sort.order = 'asc';
      } else if (sorter.order === 'descend') {
        sort.order = 'desc';
      }
    }
    let searchParam = {};
    const page = pagination.current - 1;
    if (Object.keys(filters).length) {
      searchParam = filters;
    }
    const postData = {
      searchParam,
      param: paras.toString(),
    };

    // SelectAppStore.loadData({
    //   projectId: organizationId,
    //   sort,
    //   postData,
    //   page,
    //   size: pagination.pageSize,
    // });
  };


  /**
   * 确定选择数据
   */
  handleOk = () => {
    const { selectedAppVersion } = this.state;
    const { handleOk, intl } = this.props;
    if (selectedAppVersion) {
      handleOk(selectedAppVersion);
    } else {
      Choerodon.prompt('未选择应用版本');
    }
  };

  render() {
    const { intl: { formatMessage }, show, handleCancel } = this.props;
    const { appList, selectedApp } = this.state;
    const projectName = AppState.currentMenuType.name;
    const appOptions = appList.map(app => <Option value={app.id} key={app.id}>{app.name}</Option>);
    return (
      <SideBar
        title={<FormattedMessage id="autoteststep_one_app" />}
        visible={show}
        onOk={this.handleOk}
        okText={formatMessage({ id: 'ok' })}
        cancelText={formatMessage({ id: 'cancel' })}
        onCancel={handleCancel}
      >
        <Content className="c7ntest-deployApp-sidebar sidebar-content" code="autotest.sidebar" value={projectName}>
          <Select
            style={{ width: 200, marginBottom: 30 }}
            label="应用名称"
            onChange={this.handleSelectApp}
            value={selectedApp}
            filter
            filterOption={false}
            onFilterChange={(value) => { this.loadApps(value); }}
          >
            {appOptions}
          </Select>
          <div>
            {this.getProjectTable()}
          </div>
        </Content>
      </SideBar>);
  }
}

export default withRouter(injectIntl(DeployAppHome));
