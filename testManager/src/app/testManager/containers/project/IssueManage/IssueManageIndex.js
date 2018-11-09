import React from 'react';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { asyncRouter, nomatch } from 'choerodon-front-boot';

const IssueManage = asyncRouter(() => (import('./IssueManage')));
const ImportIssue = asyncRouter(() => (import('./ImportIssue')));

const IssueManageIndex = ({ match }) => (
  <Switch>
    <Route exact path={match.url} component={IssueManage} />
    <Route exact path={`${match.url}/import`} component={ImportIssue} />
    <Route path="*" component={nomatch} />
  </Switch>
);
export default IssueManageIndex;
