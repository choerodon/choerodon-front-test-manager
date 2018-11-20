import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Steps } from 'choerodon-ui';
import {
  Content, Header, Page, stores, 
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
     * 取消第一步
     */
  // clearStepOne = () => {
  //   CreateAutoTestStore.setVersions([]);
  //   CreateAutoTestStore.setValue(null);
  //   this.setState({
  //     currentStep: 1,
  //     appId: undefined,
  //     app: null,
  //     appVersionId: undefined,
  //     versionDto: null,
  //     envId: undefined,
  //     envDto: null,
  //     value: null,
  //     yaml: null,
  //     markers: [],
  //     mode: 'new',
  //     instanceId: undefined,
  //     changeYaml: false,
  //   });
  // };

  /**
     * 取消第一步
     */
  // clearStepOneBack = () => {
  //   const { location } = this.props;
  //   CreateAutoTestStore.setVersions([]);
  //   CreateAutoTestStore.setValue(null);
  //   this.setState({
  //     currentStep: 1,
  //     appId: undefined,
  //     app: null,
  //     appVersionId: undefined,
  //     versionDto: null,
  //     envId: undefined,
  //     envDto: null,
  //     value: null,
  //     yaml: null,
  //     markers: [],
  //     mode: 'new',
  //     instanceId: undefined,
  //     changeYaml: false,
  //   });
  //   if (location.search.indexOf('envId') !== -1) {
  //     const { history } = this.props;
  //     history.go(-1);
  //   }
  // };
  render() {
    const { intl } = this.props;
    const { formatMessage } = intl;
    const data = CreateAutoTestStore.value;
    const projectName = AppState.currentMenuType.name;
    const { currentStep } = CreateAutoTestStore;
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
            <Steps current={currentStep - 1}>
              <Step
                title={<span style={{ color: currentStep === 1 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_one_title' })}</span>}
              />
              <Step
                // className={!(appVersionId) ? 'step-disabled' : ''}
                title={<span style={{ color: currentStep === 2 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_two_title' })}</span>}
              />
              <Step
                // className={!((mode === 'new' || (mode === 'replace' && instanceId)) && this.state.envId) ? 'step-disabled' : ''}
                title={<span style={{ color: currentStep === 3 ? '#3F51B5' : '', fontSize: 14 }}>{formatMessage({ id: 'autoteststep_three_title' })}</span>}
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
