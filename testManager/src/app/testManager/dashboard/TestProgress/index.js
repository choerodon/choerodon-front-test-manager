import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';

import './index.scss';

const { AppState } = stores;
export default class TestProgress extends Component {
  state = {

  }

  componentDidMount() {
    // this.getInfo();
  }

  getInfo = () => {   

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
          name: '矩形图',
          type: 'treemap',
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: '{b}: {c}',
                textStyle: {
                  color: '#00ffdd',
                  fontFamily: 'Times New Roman",Georgia,Serif',
                  fontSize: 20,
                  fontStyle: 'italic',
                  fontWeight: 'bolder',
                },
              },
              borderWidth: 1,
              borderColor: '#000',
            },
            emphasis: {
              label: {
                show: true,
                textStyle: {
                  color: '#0000ff',
                  fontFamily: 'Times New Roman",Georgia,Serif',
                  fontSize: 18,
                  fontStyle: 'normal',
                  fontWeight: 'bold',
                },
              },
              color: '#cc99cc',
              // borderWidth: 3,
              // borderColor: '#996699',
            },
          },
          data: [
            {
              name: '三星',
              value: 6,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    formatter: '{b}最多',
                    x: 60,
                    y: 65,
                    textStyle: {
                      color: '#ccc',
                      fontSize: 16,
                    },
                  },
                  color: '#ccff99',
                  borderWidth: 1,
                },
                emphasis: {
                  label: {
                    show: true,
                    formatter: '{b}-{c}',
                    x: 80,
                    y: 85,
                    textStyle: {
                      color: 'red',
                      fontSize: 18,
                    },
                  },
                  color: '#cc9999',
                  borderWidth: 3,
                  borderColor: '#999999',
                },
              },
              children: [
                {
                  name: 'S4',
                  value: 6,
                  children: [
                    {
                      name: '2012',
                      value: 6,
                    },
                    {
                      name: '2013',
                      value: 4,
                    },
                    {
                      name: '2014',
                      value: 3,
                    },
                  ],
                },
                {
                  name: 'note 3',
                  value: 6,
                },
                {
                  name: 'S5',
                  value: 4,
                },
                {
                  name: 'S6',
                  value: 3,
                },
              ],
            },
            {
              name: '小米',
              value: 4,
              itemStyle: {
                normal: {
                  color: '#99ccff',
                },
                emphasis: {
                  label: {
                    show: false,
                  },
                },
              },
            },
            {
              name: '苹果',
              value: 4,
              itemStyle: {
                normal: {
                  color: '#9999cc',
                },
              },
            },
            {
              name: '魅族',
              value: 3,
              itemStyle: {
                normal: {
                  color: '#99cccc',
                },
              },
            },
            {
              name: '华为',
              value: 2,
              itemStyle: {
                normal: {
                  color: '#ccffcc',
                },
              },
            },
            {
              name: '联想',
              value: 2,
              itemStyle: {
                normal: {
                  color: '#ccccff',
                },
              },
            },
            {
              name: '中兴',
              value: 1,
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    formatter: '{b}: {c}',
                  },
                  borderWidth: 3,
                },
                emphasis: {
                  label: {
                    show: true,
                  },
                  color: '#cc9999',
                  borderWidth: 3,
                  borderColor: '#999999',
                },
              },
            },
          ],
        },
      ],
    };
                      
    return option;
  }

  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, name } = menu;
   
    return (
      <div className="c7ntest-dashboard-announcement">
        <div className="c7ntest-charts">
          <ReactEcharts
            style={{ height: 200 }}
            option={this.getOption()}
          />
        </div>
        <DashBoardNavBar>
          <Link to={encodeURI(`/testManager/summary?type=${type}&id=${projectId}&name=${name}`)}>{Choerodon.getMessage('转至测试摘要', 'review test summary')}</Link>
        </DashBoardNavBar>
      </div>
    );
  }
}
