import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';


const ReportHome = asyncRouter(() => import('./ReportHome'));
const ReportStory = asyncRouter(() => import('./ReportStory'));
const ReportTest = asyncRouter(() => import('./ReportTest'));
const CycleIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={ReportHome} />
    <Route exact path={`${match.url}/story`} component={ReportStory} />
    <Route exact path={`${match.url}/test`} component={ReportTest} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);

export default CycleIndex;
