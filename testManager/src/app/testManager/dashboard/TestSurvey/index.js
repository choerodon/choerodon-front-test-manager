import React, { Component } from 'react';
import { DashBoardNavBar } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import { getCaseNotPlain, getCaseNotRun, getCaseNum } from '../../api/summaryApi';
import { getIssueCount } from '../../api/agileApi';
import './index.scss';

export default class TestSurvey extends Component {
  state = {
    totalTest: 0,
    notPlan: 0,
    notRun: 0,
    caseNum: 0,
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {   
    Promise.all([getIssueCount({
      advancedSearchArgs: {
        typeCode: [
          'issue_test',
        ],
      },
      otherArgs: {
        // version: [version.versionId],
      },
    }), getCaseNotPlain(), getCaseNotRun(), getCaseNum()])
      .then(([totalData, notPlan, notRun, caseNum]) => {
        this.setState({
          totalTest: totalData.totalElements,
          notPlan,
          notRun,
          caseNum,
        });
      }).catch(() => {
        Choerodon.prompt('网络异常');
      });
  }

  getOption() {
    const {
      notRun, notPlan, caseNum, totalTest,
    } = this.state;
    const option = {
      series: [
        {
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: ['38px', '68px'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '42%'],
          label: {
            normal: {
              show: false,
              position: 'center',
              textStyle: {
                fontSize: '13',
              },
            },
            emphasis: {
              show: false,

            },
          },
          data: [
            { value: notRun, name: '剩余数量' },
            { value: caseNum - notRun, name: '执行数量' },
            { value: totalTest - notPlan, name: '未规划数量' },
          ],
          itemStyle: {
            normal: {
              borderColor: '#FFFFFF', borderWidth: 1,
            },
          },
        },
      ],
    };
    return option;
  }

  render() {
    return (
      <div className="c7ntest-dashboard-announcement">
        <div className="c7ntest-charts">
          <ReactEcharts
            style={{ height: 200 }}
            option={this.getOption()}
          />
          <ul className="c7ntest-charts-legend">
            <li>
              <div />
              {'待处理'}
            </li>
            <li>
              <div />
              {'处理中'}
            </li>
            <li>
              <div />
              {'已完成'}
            </li>
          </ul>
        </div>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/">{Choerodon.getMessage('查看测试管理文档', 'review test manage document')}</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
