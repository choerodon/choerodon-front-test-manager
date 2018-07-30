import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const TestHome = asyncRouter(() => (import('./TestHome')));

const TestIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={TestHome} />
    <Route path={'*'} component={nomatch} />
  </Switch>
);
export default TestIndex;
