import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, Dropdown, Icon, Spin, Tooltip,
} from 'choerodon-ui';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import { getProjectVersion } from '../../api/agileApi';
import { loadProgressByVersion } from '../../api/DashBoardApi';
import './index.scss';

const { AppState } = stores;
export default class TestProgress extends Component {
  state = { 
    currentVersion: null,
    versionList: [],
    VersionProgress: [],
  }

  componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    getProjectVersion().then((res) => {
      if (res && res.length > 0) {
        const latestVersionId = Math.max.apply(null, res.map(item => item.versionId));
        // console.log(latestVersionId);
        if (latestVersionId !== -Infinity) {
          this.loadProgressByVersion(latestVersionId);
        }
        this.setState({
          versionList: res,
         
        });
      }
    });
  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}',
      },
      hoverable: true,
      series: [
        {
          name: '执行进度',
          type: 'treemap',
          nodeClick: false,
          breadcrumb: { // 显示当前路径，面包屑
            show: false,
          },
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: '{b}: {c}',
                textStyle: {
                  color: 'white',
                  fontSize: 14,
                },
              },
            },
          },
          data: this.state.VersionProgress.map(item => ({
            name: item.name,
            value: item.value,
            itemStyle: {                
              color: item.color,              
            },  
          })),
          // [
          //   {
          //     name: '未执行',
          //     value: 6,
          //     itemStyle: {                
          //       color: 'rgba(0, 0, 0, 0.18)',              
          //     },  
          //   }]
        },
      ],
    };

    return option;
  }

  loadProgressByVersion = (versionId) => {
    // console.log('load', versionId);
    loadProgressByVersion(versionId).then((res) => {
      this.setState({
        currentVersion: versionId,
        VersionProgress: res,
      });
    });
  }

  handleMenuClick = (e) => {
    this.loadProgressByVersion(e.key);
  }


  renderContent = () => {
    const { versionList, currentVersion } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} style={{ height: 200, overflow: 'hidden auto' }}>
        {
          versionList.map(item => (
            <Menu.Item key={item.versionId}>
              <Tooltip title={item.name} placement="topRight">
                <span className="c7ntest-text-dot">
                  {item.name}
                </span>
              </Tooltip>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return [
      <div className="switchVersion">
        <Dropdown overlay={menu} trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode}>
          <a className="ant-dropdown-link versionProgress-select">
            {_.find(versionList, { versionId: currentVersion }) ? _.find(versionList, { versionId: currentVersion }).name : '切换版本'}
            
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </div>,
      <div className="c7ntest-charts">
        <ReactEcharts
          style={{ height: 200 }}
          option={this.getOption()}
        />
      </div>,
    ];
  }

  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, name } = menu;

    return (
      <div className="c7ntest-dashboard-TestProgress">
        {this.renderContent()}
        <DashBoardNavBar>
          <Link to={encodeURI(`/testManager/TestExecute?type=${type}&id=${projectId}&name=${name}`)}>{Choerodon.getMessage('转至测试执行', 'review test execute')}</Link>
        </DashBoardNavBar>
      </div>
    );
  }
}
