import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const TestPlanHome = asyncRouter(() => (import('./TestPlanHome')));
const CycleExecuteShow = asyncRouter(() => import('./CycleExecuteShow'));
const TestIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={TestPlanHome} />
    <Route exact path={`${match.url}/executeShow/:id?`} component={CycleExecuteShow} />
    <Route path="*" component={nomatch} />
  </Switch>
);
export default TestIndex;
