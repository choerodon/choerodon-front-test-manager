import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch } from 'choerodon-front-boot';
import 'moment/locale/zh-cn';
import 'moment/locale/en-nz';
import moment from 'moment';
import '../assets/index.scss';

const TestExecuteIndex = asyncRouter(() => import('./project/TestExecute'));
const TestPlanIndex = asyncRouter(() => import('./project/TestPlan'));
const CustomStatusIndex = asyncRouter(() => import('./project/CustomStatus'));
const ReportIndex = asyncRouter(() => import('./project/Report'));
const SummaryIndex = asyncRouter(() => import('./project/Summary'));
const TESTINDEX = asyncRouter(() => import('./project/Test'));
@inject('AppState')
class TestManagerIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    // const langauge = 'en_US';
    if (langauge === 'zh_CN') {
      moment.locale('zh-cn');
    }
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route path={`${match.url}/summary`} component={SummaryIndex} />
          <Route path={`${match.url}/manager`} component={TESTINDEX} />
          <Route path={`${match.url}/TestExecute`} component={TestExecuteIndex} />
          <Route path={`${match.url}/TestPlan`} component={TestPlanIndex} />
          <Route path={`${match.url}/report`} component={ReportIndex} />
          <Route path={`${match.url}/status`} component={CustomStatusIndex} />

          <Route path="*" component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default TestManagerIndex;
