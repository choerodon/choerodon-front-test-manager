import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Table, Tabs, Menu, Dropdown, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import './ReportHome.less';
import Pic from './pic.svg';
import Pic2 from './pic2.svg';

const { Option } = Select;
const { AppState } = stores;
const styles = {
  itemContainer: {
    marginRight: 24,
    width: 280, 
    height: 296, 
    background: '#FAFAFA', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    padding: 18,
    fontSize: '13px',
  },
  imgContainer: {                
    width: 220,
    height: 154,
    textAlign: 'center',
    lineHeight: '154px',
    // padding: '30px 10px',
    boxShadow: '0 1px 0 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.12), 0 2px 1px -1px rgba(0,0,0,0.12)',
    borderRadius: 2, 
  },
  itemTextBold: { 
    width: '100%', 
    margin: '18px 0', 
    fontWeight: 'bold', 
  },
};
class ReportHome extends Component {
  render() {
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu>
        <Menu.Item key="0">
          <Link to={`/testManager/report/story?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`} >故事到测试</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link to={`/testManager/report/test?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`}>测试到故事</Link>
        </Menu.Item>      
      </Menu>
    );
    return (
      <Page className="c7n-report-home">
        <Header title="报表">
          <Dropdown overlay={menu} trigger="click">
            <a className="ant-dropdown-link" href="#">
            切换报表 <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>          
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
          <div style={{ display: 'flex' }}>
            <div style={styles.itemContainer}>
              <div style={styles.imgContainer}>
                <img src={Pic} alt="" />
              </div>
              <div style={styles.itemTextBold}>{'要求 -> 测试 -> 执行 -> 缺陷'}</div>
              <div style={{ color: 'rgba(0,0,0,0.65)' }}>从类型字段搜索要求或缺陷，然后选择合适版本以缩小范围，最后单击“生成” 创建可跟踪性报告。</div>
            </div>
            <div style={styles.itemContainer}>
              <div style={styles.imgContainer}>
                <img src={Pic2} alt="" />
              </div>
              <div style={styles.itemTextBold}>{'缺陷 -> 执行 -> 测试 -> 要求'}</div>
              <div style={{ color: 'rgba(0,0,0,0.65)' }}>从类型字段搜索要求或缺陷，然后选择合适版本以缩小范围，最后单击“生成” 创建可跟踪性报告。</div>
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}

ReportHome.propTypes = {

};

export default ReportHome;
