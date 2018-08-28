import React, { Component } from 'react';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
import { Page, Header, Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import {
  Tooltip, Table, Button, Icon, Input, Tree, Spin, Modal,
} from 'choerodon-ui';
import { EventCalendar, PlanTree } from '../../../../components/TestPlanComponent';
import './TestPlanHome.scss';

const moment = extendMoment(Moment);
class TestPlanHome extends Component {
  state = {
    loading: false,
    treeShow: true,
  }

  render() {
    const { loading, treeShow } = this.state;
    return (
      <Page className="c7n-TestPlan">
        <Header title={<FormattedMessage id="testPlan_name" />}>
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <span>
              <FormattedMessage id="refresh" />
            </span>
          </Button>
        </Header>
        <Content
          title={null}
          description={null}
          style={{ paddingBottom: 0, paddingRight: 0, paddingLeft: 0 }}
        >
          <div className="c7n-TestPlan-content">
            {!treeShow && (
              <div className="c7n-TestPlan-bar">
                <div
                  role="none"
                  className="c7n-TestPlan-bar-button"
                  onClick={() => {
                    this.setState({
                      treeShow: true,
                    });
                  }}
                >
                  <Icon type="navigate_next" />
                </div>
                <p
                  role="none"
                  onClick={() => {
                    this.setState({
                      treeShow: true,
                    });
                  }}
                >
                  <FormattedMessage id="testPlan_name" />
                </p>
              </div>
            )}
            <div className="c7n-TestPlan-tree">
              {treeShow && (
                <PlanTree onClose={() => {                  
                  this.setState({
                    treeShow: false,
                  });
                }}
                />
              )}
            </div>
            {/* <Spin spinning={loading}> */}
            <EventCalendar />
            {/* </Spin> */}
          </div>
        </Content>
      </Page>
    );
  }
}

TestPlanHome.propTypes = {

};

export default TestPlanHome;
