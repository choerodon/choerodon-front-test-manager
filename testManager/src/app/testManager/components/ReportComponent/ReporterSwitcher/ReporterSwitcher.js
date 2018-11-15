import React from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, Dropdown, Icon, Button,
} from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';


const { AppState } = stores;
const ReporterSwitcher = (props) => {
  const urlParams = AppState.currentMenuType;
  const { organizationId } = AppState.currentMenuType;
  const menu = (
    <Menu style={{ marginTop: 35 }}>
      <Menu.Item key="0">
        <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
          <FormattedMessage id="report_dropDown_demand" />
        </Link>
      </Menu.Item>
      <Menu.Item key="1">
        <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
          <FormattedMessage id="report_dropDown_defect" />
        </Link>
      </Menu.Item>
      {
        !props.isHome && (
          <Menu.Item key="2">
            <Link to={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}>
              <FormattedMessage id="report_dropDown_home" />
            </Link>
          </Menu.Item>
        )
      }
    </Menu>
  );
  return (
    <Dropdown placement="bottomCenter" overlay={menu} trigger={['click']}>
      <Button funcType="flat">
        <FormattedMessage id="report_switch" />
        <Icon type="arrow_drop_down" />
      </Button>
    </Dropdown>
  );
};
export default ReporterSwitcher;
