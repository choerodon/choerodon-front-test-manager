import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const CreateAutoTest = asyncRouter(() => (import('./CreateAutoTest')));
const AutoTestList = asyncRouter(() => import('./AutoTestList'));
const TestReport = asyncRouter(() => import('./TestReport'));
const TestIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}/create`} component={CreateAutoTest} />
    <Route exact path={`${match.url}/list`} component={AutoTestList} />
    <Route exact path={`${match.url}/report`} component={TestReport} />
    <Route path="*" component={nomatch} />
  </Switch>
);
export default TestIndex;
