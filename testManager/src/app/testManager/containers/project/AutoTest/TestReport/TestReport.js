import React, { Component } from 'react';
import { Button, Icon, Progress } from 'choerodon-ui';
import { injectIntl, FormattedMessage } from 'react-intl';
import {
  Content, Header, Page,
} from 'choerodon-front-boot';
import { MochaReport, TestNGReport } from './components';
import { getTestReport } from '../../../../api/AutoTestApi';
import { commonLink, getProjectName } from '../../../../common/utils';

const ReportComponents = {
  mocha: MochaReport,
  TestNG: TestNGReport,
};
class TestReport extends Component {
  state = {
    loading: false,
    ReportData: { framework: '', json: '{}' },
  }

  componentDidMount() {
    this.loadTestReport();
  }
  
  saveRef = name => (ref) => {
    this[name] = ref;
  }

  loadTestReport = () => {
    const { id } = this.props.match.params;
    this.setState({
      loading: true,
    });
    getTestReport(id).then((report) => {
      this.setState({
        loading: false,
        ReportData: report,
      });
    });
  }

  render() {
    const { loading, ReportData } = this.state;
    const { framework, json } = ReportData;
    const Report = ReportComponents[framework] ? ReportComponents[framework] : () => <div />;
    // const Data = JSON.parse(json);
    const Data = '';
    return (
      <Page>
        <Header
          title="测试报告"
          backPath={commonLink('/AutoTest/list')}
        >
          <Button
            onClick={this.loadTestReport}
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
          {loading
            ? <Progress type="loading" className="spin-container" />
            : <Report data={Data} />}
        </Content>
      </Page>      
    );
  }
}


export default TestReport;
