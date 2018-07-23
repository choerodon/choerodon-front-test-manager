import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { inject } from 'mobx-react';
import { asyncLocaleProvider, asyncRouter, nomatch } from 'choerodon-front-boot';

const cycleIndex = asyncRouter(() => import('./project/Cycle'));
const CustomStatusIndex = asyncRouter(() => import('./project/CustomStatus'));
const ReportIndex = asyncRouter(() => import('./project/Report'));
const SummaryIndex = asyncRouter(() => import('./project/Summary'));
const TESTINDEX = asyncRouter(() => import('./project/Test'));
@inject('AppState')
class TestManagerIndex extends React.Component {
  render() {
    const { match, AppState } = this.props;
    const langauge = AppState.currentLanguage;
    const IntlProviderAsync = asyncLocaleProvider(langauge, () => import(`../locale/${langauge}`));
    return (
      <IntlProviderAsync>
        <Switch>
          <Route path={`${match.url}/cycle`} component={cycleIndex} />
          <Route path={`${match.url}/status`} component={CustomStatusIndex} />
          <Route path={`${match.url}/report`} component={ReportIndex} />
          <Route path={`${match.url}/summary`} component={SummaryIndex} />
          <Route path={`${match.url}/manager`} component={TESTINDEX} />
          <Route path={'*'} component={nomatch} />
        </Switch>
      </IntlProviderAsync>
    );
  }
}

export default TestManagerIndex;
