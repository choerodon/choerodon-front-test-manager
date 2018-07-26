import React, { Component } from 'react';
import { Pagination, Spin } from 'choerodon-ui';
import DemandBox from './DemandBox';
import './ReportStoryArea.scss';

class ReportStoryArea extends Component {
  render() {
    const { demands } = this.props;
    return (
      <div className="c7n-report-storyArea">
        <div className="c7n-report-story-table-header" >
          <div>
          要求
          </div>
          <div >
          测试
          </div>
          <div >
          执行
          </div>
          <div >
          缺陷
          </div>
        </div>
        
        {
          demands.map(demand => <DemandBox demand={demand} />)
        }
        <Pagination total={50} />
      </div>
    );
  }
}


export default ReportStoryArea;
