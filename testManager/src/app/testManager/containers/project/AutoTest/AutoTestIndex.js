import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const CreateAutoTest = asyncRouter(() => (import('./CreateAutoTest')), () => import('../../../store/project/AutoTest/DeploymentAppStore'));
const AutoTestList = asyncRouter(() => import('./AutoTestList'));
const TestIndex = ({ match }) => (
  <Switch>
    <Route exact path={`${match.url}/create`} component={CreateAutoTest} />
    <Route exact path={`${match.url}/list`} component={AutoTestList} />
    <Route path="*" component={nomatch} />
  </Switch>
);
export default TestIndex;
