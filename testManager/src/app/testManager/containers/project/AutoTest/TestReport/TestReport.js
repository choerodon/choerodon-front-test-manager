import React, { Component } from 'react';
import { Button, Icon } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Content, Header, Page,
} from 'choerodon-front-boot';
import { MochaReport } from './components';
import { commonLink, getProjectName } from '../../../../common/utils';

class TestReport extends Component {
  componentDidMount() {
    this.handleRefresh();
  }
  
  saveRef = name => (ref) => {
    this[name] = ref;
  }

  handleRefresh=() => {
    const { id } = this.props.match.params;
    this.MochaReport.loadTestReport(id);
  }

  render() {
    return (
      <Page>
        <Header
          title="测试报告"
          backPath={commonLink('/AutoTest/list')}
        >
          <Button
            onClick={this.handleRefresh}
          >
            <Icon type="autorenew icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content 
          title={`项目“${getProjectName()}”的测试报告`}
          description="您可以在此页面一目了然地了解测试报告详情。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management"
        >
          <MochaReport ref={this.saveRef('MochaReport')} />
        </Content>
      </Page>      
    );
  }
}


export default TestReport;
