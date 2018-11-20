import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Steps } from 'choerodon-ui';
import {
  Content, Header, Page, stores, axios, 
} from 'choerodon-front-boot';
import _ from 'lodash';

import './CreateAutoTest.scss';
import { commonLink } from '../../../../common/utils';
import CreateAutoTestStore from '../../../../store/project/AutoTest/CreateAutoTestStore';
import { SelectVariable, ModifyConfig, ConfirmInfo } from './components';

const Step = Steps.Step;
const { AppState } = stores;

@observer
class CreateAutoTest extends Component {
  constructor(props) {
    super(props);
    this.state = {     
      mode: 'new',    
      markers: null,
      loading: false,
      changeYaml: false,
    };
  }

  componentDidMount() {
    // const { CreateAutoTestStore } = this.props;
    // CreateAutoTestStore.setValue(null);
    // if (this.state.appId) {
    //   CreateAutoTestStore.loadApps(this.state.appId)
    //     .then((data) => {
    //       this.setState({ app: data });
    //     });
    //   const appVersionId = parseInt(this.state.appVersionId, 10);
    //   if (this.state.is_project) {
    //     CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, '')
    //       .then((data) => {
    //         this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
    //       });
    //   } else if (this.props.location.search.split('verId=')[1]) {
    //     CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, true)
    //       .then((data) => {
    //         this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
    //       });
    //     this.setState({ appVersionId: undefined });
    //   } else {
    //     CreateAutoTestStore.loadVersion(this.state.appId, this.state.projectId, true)
    //       .then((data) => {
    //         this.setState({ versionDto: _.filter(data, v => v.id === appVersionId)[0] });
    //       });
    //   }
    // } else {
    //   CreateAutoTestStore.setVersions([]);
    // }
    // CreateAutoTestStore.loadEnv();
  }


  /**
   * 获取步骤条状态
   * @param index
   * @returns {string}
   */
  getStatus = (index) => {
    const currentStep = CreateAutoTestStore.currentStep;
    let status = 'process';
    if (index === currentStep) {
      status = 'process';
    } else if (index > currentStep) {
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
    this.setState({ currentStep: index });
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
  // handleVersionSelect=(versionId) => {
  //   this.setState({
  //     versionId,
  //   });
  // }

  /**
   * 取消第一步
   */
  clearStepOne = () => {
    const { CreateAutoTestStore } = this.props;
    CreateAutoTestStore.setVersions([]);
    CreateAutoTestStore.setValue(null);
    this.setState({
      currentStep: 1,
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
    const { location } = this.props;
    CreateAutoTestStore.setVersions([]);
    CreateAutoTestStore.setValue(null);
    this.setState({
      currentStep: 1,
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

  loadReview = async () => {
    const { value, appVersionId, projectId } = this.state;
    if (value) {
      const yaml = await axios.post(`/devops/v1/projects/${projectId}/app_instances/previewValue?appappVersionId=${appVersionId}`, { yaml: value })
        .then(data => data);
      this.setState({ yaml });
    }
  };

  render() {
    const { intl } = this.props;
    const { formatMessage } = intl;
    const data = CreateAutoTestStore.value;
    const projectName = AppState.currentMenuType.name;
    const { currentStep, appVersionId, env } = CreateAutoTestStore;
    const toStep = CreateAutoTestStore.toStep;
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
            <Steps currentStep={this.state.currentStep}>
              <Step
                title={<span style={{ color: currentStep === 1 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_one_title' })}</span>}
                onClick={() => { toStep(1); }}
                status={this.getStatus(1)}
              />
              <Step
                className={!(appVersionId) ? 'step-disabled' : ''}
                title={<span style={{ color: currentStep === 2 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_two_title' })}</span>}
                onClick={() => { toStep(2); }}
                status={this.getStatus(2)}
              />
              <Step
                // className={!((mode === 'new' || (mode === 'replace' && instanceId)) && this.state.envId) ? 'step-disabled' : ''}
                title={<span style={{ color: currentStep === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_three_title' })}</span>}
                onClick={() => { toStep(3); }}
                status={this.getStatus(3)}
              />
            </Steps>
            <div className="deployApp-card-content"> 
              {currentStep === 1 && <SelectVariable />}
              {currentStep === 2 && <ModifyConfig />}
              {currentStep === 3 && <ConfirmInfo />}              
            </div>
          </div>

        </Content>
      </Page>
    );
  }
}

export default withRouter(injectIntl(CreateAutoTest));
