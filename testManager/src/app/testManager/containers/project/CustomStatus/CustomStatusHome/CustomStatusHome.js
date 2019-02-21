/*
 * @Author: LainCarl 
 * @Date: 2019-01-25 11:36:04 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2019-01-25 11:48:10
 * @Feature: 用户自定义状态展示组件
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, Tabs, Button, Icon, Spin, Modal,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Page, Header, Content } from 'choerodon-front-boot';
import { CreateStatus, EditStatus } from '../../../../components/CustomStatusComponent';
import { getProjectName } from '../../../../common/utils';

const TabPane = Tabs.TabPane;
const { confirm } = Modal;
const defaultProps = {

};

const propTypes = {
  loading: PropTypes.bool.isRequired,
  createVisible: PropTypes.bool.isRequired,
  editVisible: PropTypes.bool.isRequired,
  statusList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  CurrentEditStatus: PropTypes.shape({}).isRequired,
  EditStatusLoading: PropTypes.bool.isRequired,
  CreateStatusLoading: PropTypes.bool.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  onTabChange: PropTypes.func.isRequired,
  onShowCreateClick: PropTypes.func.isRequired,
  onEditStatusClick: PropTypes.func.isRequired,
  onDeleteOk: PropTypes.func.isRequired,
  onCreateStatusCancel: PropTypes.func.isRequired,
  onEditStatusCancel: PropTypes.func.isRequired,
  onCreateStatusSubmit: PropTypes.func.isRequired,
  onEditStatusSubmit: PropTypes.func.isRequired,
};
const CustomStatusHome = ({
  loading,
  createVisible,
  editVisible,
  statusList,
  statusType,
  CurrentEditStatus,
  EditStatusLoading,
  CreateStatusLoading,
  onRefreshClick,
  onTabChange,
  onShowCreateClick,
  onEditStatusClick,
  onDeleteOk,
  onCreateStatusCancel,
  onEditStatusCancel,
  onCreateStatusSubmit,
  onEditStatusSubmit,
}) => {
  const deleteStatus = (data) => {
    confirm({
      title: '确定要删除状态?',
      onOk: () => { onDeleteOk(data); },
    });
  };
  const columns = [{
    title: <FormattedMessage id="status_name" />,
    dataIndex: 'statusName',
    key: 'statusName',
    filters: [],
    onFilter: (value, record) => {
      const reg = new RegExp(value, 'g');
      return reg.test(record.statusName);
    },
  }, {
    title: <FormattedMessage id="status_comment" />,
    dataIndex: 'description',
    key: 'description',
    filters: [],
    onFilter: (value, record) => {
      const reg = new RegExp(value, 'g');
      return record.description && reg.test(record.description);
    },
  }, {
    title: <FormattedMessage id="status_color" />,
    dataIndex: 'statusColor',
    key: 'statusColor',
    render(statusColor) {
      return (
        <div style={{ width: 18, height: 18, background: statusColor }} />
      );
    },
  }, {
    title: '',
    key: 'action',
    render: (text, record) => (
      record.projectId !== 0
      && (
        <div>
          <Icon
            type="mode_edit"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              onEditStatusClick(record);
            }}
          />
          <Icon
            type="delete_forever"
            style={{ cursor: 'pointer', marginLeft: 10 }}
            onClick={() => { deleteStatus(record); }}
          />
        </div>
      )
    ),
  }];
  return (
    <div>
      <CreateStatus
        visible={createVisible}
        loading={CreateStatusLoading}
        onCancel={onCreateStatusCancel}
        onSubmit={onCreateStatusSubmit}
      />
      <EditStatus
        visible={editVisible}
        loading={EditStatusLoading}
        initValue={CurrentEditStatus}
        onCancel={onEditStatusCancel}
        onSubmit={onEditStatusSubmit}
      />
      <Page>
        <Header title={<FormattedMessage id="status_title" />}>
          <Button icon="playlist_add" onClick={onShowCreateClick}>
            <FormattedMessage id="status_create" />
          </Button>
          <Button icon="autorenew" onClick={onRefreshClick}>
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Spin spinning={loading}>
          <Content
            title={<FormattedMessage id="status_custom_home_title" values={{ name: getProjectName() }} />}
            description={<FormattedMessage id="status_custom_home_description" />}
            link="http://choerodon.io/zh/docs/user-guide/test-management/setting/status/"
          >
            <Tabs activeKey={statusType} onChange={onTabChange}>
              <TabPane tab={<FormattedMessage id="status_executeStatus" />} key="CYCLE_CASE">
                <Table
                  rowKey="statusId"
                  columns={columns}
                  dataSource={statusList}
                />
              </TabPane>
              <TabPane tab={<FormattedMessage id="status_steptatus" />} key="CASE_STEP">
                <Table
                  rowKey="statusId"
                  columns={columns}
                  dataSource={statusList}
                />
              </TabPane>
            </Tabs>
          </Content>
        </Spin>
      </Page>
    </div>
  );
};

CustomStatusHome.propTypes = propTypes;
CustomStatusHome.defaultProps = defaultProps;

export default CustomStatusHome;
