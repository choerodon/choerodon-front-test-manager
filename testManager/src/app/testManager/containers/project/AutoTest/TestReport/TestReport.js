import React, { Component } from 'react';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Content, Header, Page,
} from 'choerodon-front-boot';
import { MochaReport } from './components';
import { commonLink, getProjectName } from '../../../../common/utils';

class TestReport extends Component {
  render() {
    return (
      <Page>
        <Header
          title="测试报告"
          backPath={commonLink('/AutoTest/list')}
        />
        <Content>
          <MochaReport />
        </Content>
      </Page>      
    );
  }
}

TestReport.propTypes = {

};

export default TestReport;
