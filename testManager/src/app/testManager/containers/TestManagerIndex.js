import React from 'react';
import {Route, Switch} from 'react-router-dom';
import {inject} from 'mobx-react';
import {asyncLocaleProvider, asyncRouter, nomatch} from 'choerodon-front-boot';

const cycleIndex = asyncRouter(() => import('./project/Cycle'));

@inject('AppState')
class TestManagerIndex extends React.Component {
    render() {
        const {match, AppState} = this.props;
        return (
            <Switch>
                <Route path={`${match.url}/cycle`} component={cycleIndex}/>
                <Route path={'*'} component={nomatch}/>
            </Switch>
        );
    }
}

export default TestManagerIndex;