import React, { Component } from 'react';
import { Icon, Collapse } from 'choerodon-ui';
import ExecuteBox from './ExecuteBox';
import ReportStoryStore from '../../../store/project/report/ReportStoryStore';

class TestBox extends Component {
  render() {
    const { test, demandIssueId } = this.props;
    const { testCycleCaseES } = test;
    const statusList = ReportStoryStore.getStatusList;
    const openId = ReportStoryStore.getOpenId;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }} className="c7n-storyArea-border">
        <div style={{ flex: 1 }}>
          {/* <Collapse 
            activeKey={openId[demandIssueId]}
            bordered={false} 
            onChange={(keys) => { this.handleOpen(demandIssueId, keys); }}
          >
            {
              linkedTestIssues.map((issue, i) => (<Panel
                showArrow={false}
                header={
                  // 展开时加margin
                  <div style={{ marginBottom: openId[issueId] && 
                    openId[issueId].includes(issue.issueId) &&
                    issue.testCycleCaseES.length > 1
                    ? (issue.testCycleCaseES.length * 30) - 48 : 0 }}
                  >                                 
                    <div style={{ display: 'flex', alignItems: 'center' }}>     
                      <Icon type="navigate_next" className="c7n-collapse-icon" />       
                      <Link className="c7n-showId" to={issueLink(issue.issueId)} target="_blank">{issue.issueName}</Link>       
                           
                    </div>
                    <div className="c7n-report-summary">{issue.summary}</div>
                  </div>
                }
                key={issue.issueId}
              />))
            }
          </Collapse> */}
          test
        </div>
        <div style={{ flex: 2 }}>
          {testCycleCaseES.map(execute => <ExecuteBox execute={execute} />)}
        </div>
      </div>
    );
  }
}

TestBox.propTypes = {

};

export default TestBox;
