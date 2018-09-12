import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const ComponentHome = asyncRouter(() => import('./CycleHome'));
const CycleExecute = asyncRouter(() => import('./CycleExecute'));
const CycleExecuteShow = asyncRouter(() => import('./CycleExecuteShow'));
const CycleIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ComponentHome} />
    <Route exact path={`${match.url}/execute/:id?`} component={CycleExecute} />
    <Route exact path={`${match.url}/executeShow/:id?`} component={CycleExecuteShow} />
    <Route path="*" component={nomatch} />
  </Switch>
);

export default CycleIndex;
