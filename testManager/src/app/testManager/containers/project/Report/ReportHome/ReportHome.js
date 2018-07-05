import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tabs, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import './ReportHome.less';
const {Option}=Select;
class ReportHome extends Component {
  render() {
    return (
      <Page className="c7n-report-home">
        <Header title="报表">
          <Select
              value={'test'}
              style={{ width: 100, color: '#3F51B5', margin: '0 30px' }}
              dropdownStyle={{
                color: '#3F51B5',
              }}             
            >  
            <Option value="test">测试</Option>     
            </Select>
          <Button onClick={this.getInfo}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={`项目"${'projectzzy'}"的报表`}
          description="两种可跟踪性报告可用：要求 -> 测试 -> 执行 -> 缺陷，缺陷 -> 执行 -> 测试 -> 。
          点击您需要查看的报告类型可以查看具体的详细内容。"
          link="#"
        >
          总览
        </Content>
      </Page>
    );
  }
}

ReportHome.propTypes = {

};

export default ReportHome;