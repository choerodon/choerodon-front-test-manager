import React, { Component } from 'react';
import {
  Select, Button, Radio, Steps, Icon, Tooltip, Form,
} from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { YamlEditor, SelectVersion } from '../../../../../../components/CommonComponent';
import CreateAutoTestStore from '../../../../../../store/project/AutoTest/CreateAutoTestStore';
import { getEnvs } from '../../../../../../api/AutoTestApi';
import SelectAppAndVersion from '../SelectAppAndVersion';

const Option = Select.Option;
@injectIntl
@observer
class SelectVariable extends Component {
  state = {
    selectApp: false,
    envs: [],
  }

  /**
   * 展开选择应用的弹框
   */
  showSideBar = () => {
    this.setState({ selectApp: true });
  };

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.setState({ selectApp: false });
  };

  /**
   * 选择应用版本
   */
  handleOk = (selectdApp, selectedAppVersion) => {
    // console.log(`选择应用:${selectdApp}`, `选择应用版本:${selectedAppVersion}`);
    // CreateAutoTestStore.setApp(selectdApp);
    // CreateAutoTestStore.setAppVersion(selectedAppVersion);
    this.setState({ selectApp: false });
  }

  /**
   *选择目标版本
   *
   * @param {*} versionId
   * @memberof CreateAutoTest
   */
  handleVersionSelect=(versionId, other) => {
    const { children: versionName } = other.props;
    CreateAutoTestStore.setVersion({ versionId, versionName });    
  }

  handleSelectEnv=(envId, other) => {
    const { envs } = this.state;
    CreateAutoTestStore.setEnv(_.find(envs, { id: envId }));
  }

  loadEnvs=() => {
    getEnvs().then((envs) => {
      this.setState({
        envs,
      });
    });
  }

  render() {
    const { intl } = this.props;
    const { selectApp, envs } = this.state;
    const { formatMessage } = intl;
    const { app, env, version } = CreateAutoTestStore;
    return (
      <div className="deployApp-app">
        <p>
          {formatMessage({ id: 'autoteststep_one_description' })}
        </p>
        {/* 选择应用 */}
        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-widgets section-title-icon" />
            <span className="section-title">{formatMessage({ id: 'autoteststep_one_app' })}</span>
          </div>
          <div className="autotest-text">
            {app && (
              <div className="section-text-margin">
                <Tooltip title={<FormattedMessage id={this.state.is_project ? 'project' : 'market'} />}><span className={`icon ${this.state.is_project ? 'icon-project' : 'icon-apps'} section-text-icon`} /></Tooltip>
                <span className="section-text">
                  {app.name}
                  {'('}
                  {app.code}
                  {')'}
                </span>
              </div>
            )}
            <a
              role="none"
              className={`${app ? '' : 'section-text-margin'}`}
              onClick={this.showSideBar}
            >
              {formatMessage({ id: 'autotestapp_add' })}
              <i className="icon icon-open_in_new icon-small" />
            </a>
          </div>
        </section>
        {/* 选择目标版本 */}
        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-publish2 section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_one_targetversion' })}</span>
          </div>
          <SelectVersion
            value={version.versionId}
            className="section-text-margin"
            style={{ width: 482 }}
            onChange={this.handleVersionSelect}
          />
        </section>
        {/* 选择环境 */}
        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-donut_large section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_one_environment' })}</span>
          </div>
          <Select
            value={env.id}
            label={<span className="autotest-text">{formatMessage({ id: 'autoteststep_one_environment' })}</span>}
            className="section-text-margin"
            onSelect={this.handleSelectEnv}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children[1]
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
            onFocus={this.loadEnvs}
          >
            {envs.map(v => (
              <Option value={v.id} key={v.id} disabled={!v.connect}>
                {v.connect ? <span className="c7ntest-ist-status_on" /> : <span className="c7ntest-ist-status_off" />}
                {v.name}
              </Option>
            ))}
          </Select>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
          // disabled={!(this.state.appId)}
            onClick={CreateAutoTestStore.nextStep}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" className="c7ntest-autotest-clear">{formatMessage({ id: 'cancel' })}</Button>
        </section>
        <SelectAppAndVersion
          show={selectApp}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
        />
      </div>
    );
  }
}


export default SelectVariable;
