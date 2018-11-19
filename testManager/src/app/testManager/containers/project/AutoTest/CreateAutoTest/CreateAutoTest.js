import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import {
  Select, Button, Radio, Steps, Icon, Tooltip, Form,
} from 'choerodon-ui';
import {
  Content, Header, Page, stores, axios, 
} from 'choerodon-front-boot';
import _ from 'lodash';
import YAML from 'yamljs';
import './CreateAutoTest.scss';
import { commonLink } from '../../../../common/utils';
import { YamlEditor, SelectVersion } from '../../../../components/CommonComponent';
import SelectApp from './selectApp';

const RadioGroup = Radio.Group;
const Step = Steps.Step;
const { AppState } = stores;
const Option = Select.Option;

@observer
class CreateAutoTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_project: !props.match.params.appId && (props.location.search.indexOf('isProject') === -1),
      appId: props.location.search.split('appId=')[1] ? Number(props.location.search.split('appId=')[1].split('&')[0]) : props.match.params.appId,
      appVersionId: props.location.search.split('verId=')[1] ? Number(props.location.search.split('verId=')[1]) : props.match.params.verId,
      versionId: null,
      current: props.match.params.appId || (props.location.search.indexOf('isProject') === -1 && props.location.search.split('appId=')[1]) ? 2 : 1,
      envId: props.location.search.split('envId=')[1] ? Number(props.location.search.split('envId=')[1]) : undefined,
      mode: 'new',
      markers: null,
      projectId: AppState.currentMenuType.id,
      loading: false,
      changeYaml: false,
    };
  }

  componentDidMount() {
    const { CreateAutoTestStore } = this.props;
    CreateAutoTestStore.setValue(null);
    if (this.state.appId) {
      CreateAutoTestStore.loadApps(this.state.appId)
        .then((data) => {
          this.setState({ app: data });
        });
      const appVersionId = parseInt(this.state.appVersionId, 10);
      if (this.state.is_project) {
        CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, '')
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
          });
      } else if (this.props.location.search.split('verId=')[1]) {
        CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, true)
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
          });
        this.setState({ appVersionId: undefined });
      } else {
        CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, true)
          .then((data) => {
            this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
          });
      }
    } else {
      CreateAutoTestStore.setVersions([]);
    }
    CreateAutoTestStore.loadEnv();
  }


  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const { current } = this.state;
    let status = 'process';
    if (index === current) {
      status = 'process';
    } else if (index > current) {
      status = 'wait';
    } else {
      status = 'finish';
    }
    return status;
  };

  /**
   * 改变步骤条
   * @param index
   */
  changeStep = (index) => {
    const { CreateAutoTestStore } = this.props;
    const {
      appId, appVersionId, envId, mode, 
    } = this.state;
    this.setState({ current: index });
    this.loadReview();
    // 加载yaml
    if (index === 2 && appId) {
      CreateAutoTestStore.setValue(null);
      CreateAutoTestStore.loadValue(appId, appVersionId, envId)
        .then((data) => {
          this.setState({ errorLine: data.errorLines });
        });
    }
  };

  /**
   * 展开选择应用的弹框
   */
  showSideBar = () => {
    if (this.props.match.params.appId) {
      this.setState({ show: true });
    } else {
      this.setState({ show: true, appVersionId: undefined, versionDto: null });
    }
  };

  /**
   * 关闭弹框
   */
  handleCancel = () => {
    this.setState({ show: false });
  };

  // /**
  //  * 弹框确定
  //  * @param app 选择的数据
  //  * @param key 标明是项目应用还是应用市场应用
  //  */
  // handleOk = (app) => {
  //   const { CreateAutoTestStore } = this.props;
  //   if (app) {
  //     CreateAutoTestStore.loadVersion(app.id, this.state.projectId, '');
  //     this.setState({
  //       app,
  //       appId: app.id,
  //       show: false,
  //       is_project: true,
  //       appVersionId: undefined,
  //       versionDto: null,
  //     });
  //   } else {
  //     this.setState({ show: false });
  //   }
  // };
  /**
   * 选择应用以及应用版本之后
   *
   * @memberof CreateAutoTest
   */
  handleOk = (value) => {
    const { CreateAutoTestStore } = this.props;
    const versions = CreateAutoTestStore.versions;
    const versionDto = _.filter(versions, v => v.id === value)[0];
    CreateAutoTestStore.setValue(null);
    this.setState({
      appVersionId: value, versionDto, value: null, markers: [], 
    });
    if (this.state.envId) {
      this.handleSelectEnv(this.state.envId);
    }
  };
  
  /**
   * 选择环境
   * @param value
   */
  handleSelectEnv = (value) => {
    const { CreateAutoTestStore } = this.props;
    const envs = CreateAutoTestStore.envs;
    const envDto = _.filter(envs, v => v.id === value)[0];
    this.setState({
      envId: value, envDto, value: null, yaml: null, changeYaml: false, mode: 'new', 
    });
    const { appId, appVersionId } = this.state;
    CreateAutoTestStore.setValue(null);
    this.setState({ value: null, markers: [] });
    CreateAutoTestStore.loadValue(appId, appVersionId, value)
      .then((data) => {
        this.setState({ errorLine: data.errorLines });
      });
    CreateAutoTestStore.loadInstances(this.state.appId, value);
  };

  // /**
  //  * 选择版本
  //  * @param value
  //  */
  // handleSelectVersion = (value) => {
  //   const { CreateAutoTestStore } = this.props;
  //   const versions = CreateAutoTestStore.versions;
  //   const versionDto = _.filter(versions, v => v.id === value)[0];
  //   CreateAutoTestStore.setValue(null);
  //   this.setState({
  //     appVersionId: value, versionDto, value: null, markers: [], 
  //   });
  //   if (this.state.envId) {
  //     this.handleSelectEnv(this.state.envId);
  //   }
  // };

  /**
   * 选择实例
   * @param value
   */
  handleSelectInstance = (value) => {
    const { CreateAutoTestStore } = this.props;
    const instance = CreateAutoTestStore.currentInstance;
    // const instanceDto = _.filter(instance, v => v.id === value)[0];
    this.setState({ instanceId: value });
  };

  /**
   * 获取values
   * @param value
   */
  handleChangeValue = (value) => {
    const { CreateAutoTestStore } = this.props;
    this.setState({ value });
    CreateAutoTestStore.checkYaml(value)
      .then((data) => {
        this.setState({ errorLine: data });
        const oldYaml = CreateAutoTestStore.getValue ? CreateAutoTestStore.getValue.yaml : '';
        const oldvalue = YAML.parse(oldYaml);
        const newvalue = YAML.parse(value);
        if (JSON.stringify(oldvalue) === JSON.stringify(newvalue)) {
          this.setState({
            changeYaml: false,
          });
        } else {
          this.setState({
            changeYaml: true,
          });
        }
      });
  };


  /**
   * 修改实例模式
   * @param value
   */
  handleChangeMode = (value) => {
    this.setState({ mode: value.target.value });
  };

  /**
   *选择目标版本
   *
   * @param {*} versionId
   * @memberof CreateAutoTest
   */
  handleVersionSelect=(versionId) => {
    this.setState({
      versionId,
    });
  }

  /**
   * 取消第一步
   */
  clearStepOne = () => {
    const { CreateAutoTestStore } = this.props;
    CreateAutoTestStore.setVersions([]);
    CreateAutoTestStore.setValue(null);
    this.setState({
      current: 1,
      appId: undefined,
      app: null,
      appVersionId: undefined,
      versionDto: null,
      envId: undefined,
      envDto: null,
      value: null,
      yaml: null,
      markers: [],
      mode: 'new',
      instanceId: undefined,
      changeYaml: false,
    });
  };

  /**
   * 取消第一步
   */
  clearStepOneBack = () => {
    const { CreateAutoTestStore, location } = this.props;
    CreateAutoTestStore.setVersions([]);
    CreateAutoTestStore.setValue(null);
    this.setState({
      current: 1,
      appId: undefined,
      app: null,
      appVersionId: undefined,
      versionDto: null,
      envId: undefined,
      envDto: null,
      value: null,
      yaml: null,
      markers: [],
      mode: 'new',
      instanceId: undefined,
      changeYaml: false,
    });
    if (location.search.indexOf('envId') !== -1) {
      const { history } = this.props;
      history.go(-1);
    }
  };

  /**
   * 部署应用
   */
  handleDeploy = () => {
    this.setState({
      loading: true,
    });
    const { CreateAutoTestStore } = this.props;
    const instances = CreateAutoTestStore.currentInstance;
    const value = this.state.value || CreateAutoTestStore.value.yaml;
    const applicationDeployDTO = {
      appId: this.state.appId,
      appVerisonId: this.state.appVersionId,
      environmentId: this.state.envId,
      values: value,
      type: this.state.mode === 'new' ? 'create' : 'update',
      appInstanceId: this.state.mode === 'new'
        ? null : this.state.instanceId || (instances && instances.length === 1 && instances[0].id),
    };
    CreateAutoTestStore.deploymentApp(applicationDeployDTO)
      .then((datas) => {
        if (datas) {
          this.openAppDeployment();
        }
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        Choerodon.prompt(error.response.data.message);
        this.setState({
          loading: false,
        });
      });
  };


  loadReview = async () => {
    const { value, appVersionId, projectId } = this.state;
    if (value) {
      const yaml = await axios.post(`/devops/v1/projects/${projectId}/app_instances/previewValue?appappVersionId=${appVersionId}`, { yaml: value })
        .then(data => data);
      this.setState({ yaml });
    }
  };

  /**
   * 渲染第一步
   */
  handleRenderApp = () => {
    const { CreateAutoTestStore, intl } = this.props;
    const { versionId } = this.state;
    const { formatMessage } = intl;
    const versions = CreateAutoTestStore.versions;
    const envs = CreateAutoTestStore.envs;
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
            {this.state.app && (
            <div className="section-text-margin">
              <Tooltip title={<FormattedMessage id={this.state.is_project ? 'project' : 'market'} />}><span className={`icon ${this.state.is_project ? 'icon-project' : 'icon-apps'} section-text-icon`} /></Tooltip>
              <span className="section-text">
                {this.state.app.name}
                {'('}
                {this.state.app.code}
                {')'}
              </span>
            </div>
            )}            
            <a
              role="none"
              className={`${this.state.app ? '' : 'section-text-margin'}`}
              onClick={this.showSideBar}
            >
              {formatMessage({ id: 'autotestapp_add' })}
              <i className="icon icon-open_in_new icon-small" />
            </a>
          </div>
        </section>
        {/* 选择应用版本 */}
        {/* <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-version section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_one_version_title' })}</span>
          </div>
          <Select
            // notFoundContent={formatMessage({ id: 'select_app_first' })}
            value={this.state.appVersionId ? parseInt(this.state.appVersionId, 10) : undefined}
            label={<FormattedMessage id="autoteststep_one_version" />}
            className="section-text-margin"
            onSelect={this.handleSelectVersion}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
          >
            {versions.map(v => <Option key={v.id} value={v.id}>{v.version}</Option>)}
          </Select>
        </section> */}
        {/* 选择目标版本 */}
        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-publish2 section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_one_targetversion' })}</span>
          </div>
          <SelectVersion 
            value={versionId}
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
            value={this.state.envId}
            label={<span className="autotest-text">{formatMessage({ id: 'autoteststep_one_environment' })}</span>}
            className="section-text-margin"
            onSelect={this.handleSelectEnv}
            style={{ width: 482 }}
            optionFilterProp="children"
            filterOption={(input, option) => option.props.children[1]
              .toLowerCase().indexOf(input.toLowerCase()) >= 0}
            filter
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
            disabled={!(this.state.appId)}
            onClick={this.changeStep.bind(this, 2)}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={this.clearStepOneBack}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第二步
   */
  handleRenderEnv = () => {
    const { CreateAutoTestStore, intl } = this.props;
    const { formatMessage } = intl;
    
    const data = this.state.yaml || CreateAutoTestStore.value;
    return (
      <div className="deployApp-env">
        <p>
          {formatMessage({ id: 'autoteststep_two_description' })}
        </p>

        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-description section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep_two_config' })}</span>
          </div>
          {data && (
          <YamlEditor
            newLines={data.newLines}
            isFileError={!!data.errorLines}
            totalLine={data.totalLine}
            errorLines={this.state.errorLine}
            errMessage={data.errorMsg}
            modifyMarkers={this.state.markers}
            value={this.state.value || data.yaml}
            highlightMarkers={data.highlightMarkers}
            onChange={this.handleChangeValue}
            change
          />
          )}
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 3)}
            // disabled={!(this.state.envId && (this.state.value || (data && data.yaml)) 
            //   && (this.state.errorLine
            //     ? this.state.errorLine.length === 0 : (data && data.errorLines === null)))}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button onClick={this.changeStep.bind(this, 1)} funcType="raised">{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第三步
   * @returns {*}
   */
  handleRenderMode = () => {
    const { CreateAutoTestStore, intl } = this.props;
    const { formatMessage } = intl;
    const instances = CreateAutoTestStore.currentInstance;
    return (
      <div className="deployApp-autotest">
        <p>
          {formatMessage({ id: 'autoteststep.three.description' })}
        </p>
        <section className="deployApp-section">
          <div className="autotest-title">
            <i className="icon icon-jsfiddle section-title-icon " />
            <span className="section-title">{formatMessage({ id: 'autoteststep.three.mode.title' })}</span>
          </div>
          <div className="section-text-margin">
            <RadioGroup
              onChange={this.handleChangeMode}
              value={this.state.mode}
              label={<span className="autotest-text">{formatMessage({ id: 'autoteststep.three.mode' })}</span>}
            >
              <Radio className="autotest-radio" value="new">{formatMessage({ id: 'autoteststep.three.mode.new' })}</Radio>
              <Radio className="autotest-radio" value="replace" disabled={instances.length === 0 || (instances.length === 1 && (instances[0].appVersion === this.state.versionDto.version) && !this.state.changeYaml)}>
                {formatMessage({ id: 'autoteststep.three.mode.replace' })}
                <i className="icon icon-error section-instance-icon" />
                <span className="autotest-tip-text">{formatMessage({ id: 'autoteststep.three.mode.help' })}</span>
              </Radio>
            </RadioGroup>
            {this.state.mode === 'replace' && (
            <Select
              onSelect={this.handleSelectInstance}
              value={this.state.instanceId 
                || (instances && instances.length === 1 && instances[0].id)}
              label={<FormattedMessage id="autoteststep.three.mode.replace.label" />}
              className="autotest-select"
              placeholder="Select a person"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.children
                .toLowerCase().indexOf(input.toLowerCase()) >= 0}
              filter
            >
              {instances.map(v => (
                <Option value={v.id} key={v.id} disabled={this.state.changeYaml ? false : v.appVersion === this.state.versionDto.version}>
                  {v.code}
                </Option>
              ))}
            </Select>
            )}
          </div>
        </section>
        <section className="deployApp-section">
          <Button
            type="primary"
            funcType="raised"
            onClick={this.changeStep.bind(this, 3)}
            // disabled={!(this.state.mode === 'new' || (this.state.mode === 'replace' && (this.state.instanceId || (instances && instances.length === 1))))}
          >
            {formatMessage({ id: 'next' })}
          </Button>
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </div>
    );
  };

  /**
   * 渲染第四步预览
   * @returns {*}
   */
  handleRenderReview = () => {
    const { CreateAutoTestStore } = this.props;
    const instances = CreateAutoTestStore.currentInstance;
    const { intl } = this.props;
    const { formatMessage } = intl;
    const data = this.state.yaml || CreateAutoTestStore.value;
    const {
      app, appVersionId, envId, instanceId, mode, 
    } = this.state;
    const options = {
      theme: 'neat',
      mode: 'yaml',
      readOnly: true,
      lineNumbers: true,
    };
    return (
      <section className="deployApp-review">
        <p>
          {formatMessage({ id: 'autoteststep_three_description' })}
        </p>
        <section className="deployApp-section">
          <div>
            <div className="deployApp-title">
              <Icon type="widgets" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_three_app' })}
                {'：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.app && this.state.app.name}
              <span className="deployApp-value">
                {'('}
                {this.state.app && this.state.app.code}
                {')'}
              </span>
            </div>
          </div>
          <div>
            <div className="deployApp-title">
              <Icon type="version" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_three_version' })}
                {'：'}
              </span>
            </div>
            <div className="deployApp-text">{this.state.versionDto && this.state.versionDto.version}</div>
          </div>
          <div>
            <div className="deployApp-title">
              <Icon type="donut_large" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_one_env_title' })}
                {'：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.envDto && this.state.envDto.name}
              <span className="deployApp-value">
                {'('}
                {this.state.envDto && this.state.envDto.code}
                {')'}
              </span>
            </div>
          </div>
          <div>
            <div className="deployApp-title">
              <Icon type="description" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_two_config' })}
                {'：'}
              </span>
            </div>
          </div>
          {data && (
          <div>
            {<YamlEditor
              options={options}
              newLines={data.newLines}
              readOnly={this.state.current === 3}
              value={data.yaml}
              highlightMarkers={data.highlightMarkers}
            />}
          </div>
          )}
        </section>
        <section className="deployApp-section">
          <Button type="primary" funcType="raised" disabled={!(app && appVersionId && envId && mode)} onClick={this.handleDeploy} loading={this.state.loading}>{formatMessage({ id: 'autotestbtn_autotest' })}</Button>
       
          <Button funcType="raised" onClick={this.changeStep.bind(this, 2)}>{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={this.clearStepOne}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </section>
    );
  };

  /**
   * 返回到上一级
   */
  openAppDeployment() {
    const projectName = AppState.currentMenuType.name;
    const projectId = AppState.currentMenuType.id;
    const type = AppState.currentMenuType.type;
    this.props.history.push(
      `/devops/instance?type=${type}&id=${projectId}&name=${projectName}&organizationId=${AppState.currentMenuType.organizationId}`,
    );
  }

  render() {
    const { CreateAutoTestStore, intl } = this.props;
    const { formatMessage } = intl;
    const data = CreateAutoTestStore.value;
    const projectName = AppState.currentMenuType.name;
    const {
      appId, appVersionId, envId, instanceId, mode, value, current, 
    } = this.state;
    // console.log(window.getComputedStyle(document.body));
    return (
      <Page
        className="c7ntest-region c7ntest-deployApp"
      >
        <Header
          title={<FormattedMessage id="autotest_create_header_title" />}
          backPath={commonLink('/AutoTest/list')} 
        />
        <Content className="c7ntest-deployApp-wrapper" code="autotest" values={{ name: projectName }}>
          <div className="deployApp-card">
            <Steps current={this.state.current}>
              <Step
                title={<span style={{ color: current === 1 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_one_title' })}</span>}
                onClick={this.changeStep.bind(this, 1)}
                status={this.getStatus(1)}
              />
              <Step
                className={!(appId && appVersionId) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 2 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_two_title' })}</span>}
                onClick={this.changeStep.bind(this, 2)}
                status={this.getStatus(2)}
              />
              {/* <Step
                className={!(envId && data && data.errorLines === null && (this.state.errorLine === '' || this.state.errorLine === null) && (value || (data && data.yaml))) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep.three.title' })}</span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              /> */}
              <Step
                className={!((mode === 'new' || (mode === 'replace' && instanceId)) && this.state.envId) ? 'step-disabled' : ''}
                title={<span style={{ color: current === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_three_title' })}</span>}
                onClick={this.changeStep.bind(this, 3)}
                status={this.getStatus(3)}
              />
            </Steps>
            <div className="deployApp-card-content">
              {this.state.current === 1 && this.handleRenderApp()}

              {this.state.current === 2 && this.handleRenderEnv()}

              {/* {this.state.current === 3 && this.handleRenderMode()} */}

              {this.state.current === 3 && this.handleRenderReview()}
            </div>
          </div>
          {this.state.show && (
          <SelectApp
            isMarket={!this.state.is_project}
            app={this.state.app}
            show={this.state.show}
            handleCancel={this.handleCancel}
            handleOk={this.handleOk}
          />
          )}
        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CreateAutoTest));
