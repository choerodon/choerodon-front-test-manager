import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import TestBox from './TestBox';
import { issueLink } from '../../../common/utils';

class DemandBox extends Component {
  render() {
    const { demand } = this.props;
    const { defectInfo, defectCount, linkedTestIssues } = demand;
    const { issueStatusName, issueName, issueColor, issueId } = defectInfo;    
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }} className="c7n-storyArea-DemandBox">
        <div style={{ flex: 1 }}>        
          <div className="c7n-collapse-header-container">
            <Link className="c7n-showId" to={issueLink(issueId)} target="_blank">{issueName}</Link>
            <div className="c7n-issue-status-icon">                 
              <span style={{ color: issueColor, borderColor: issueColor }}>
                {issueStatusName}
              </span>
            </div>
            
          </div>
          <div>
            <FormattedMessage id="report_defectCount" />: {defectCount}
          </div>      
        </div>
        <div style={{ flex: 3 }}>        
          {
            linkedTestIssues.map(test => <TestBox test={test} demandIssueId={demand.issueId} />)
          }
        </div>
      </div>
    );
  }
}

DemandBox.propTypes = {

};

export default DemandBox;
