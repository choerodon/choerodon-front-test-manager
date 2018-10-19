import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { DashBoardNavBar, stores } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import { getCaseNotPlain, getCaseNotRun, getCaseNum } from '../../api/summaryApi';
import { getIssueCount } from '../../api/agileApi';
import TestProgress from '../TestProgress';
import IssueAndExecute from '../IssueAndExecute';
import './index.scss';

const { AppState } = stores;
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
          color: ['#FFB100', '#00BFA5', '#FF7043'],
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
    const menu = AppState.currentMenuType;
    const { type, id: projectId, name } = menu;
   
    return (
      <div className="c7ntest-dashboard-announcement">
        {/* <div className="c7ntest-charts">
          <ReactEcharts
            style={{ height: 200 }}
            option={this.getOption()}
          />
          <ul className="c7ntest-charts-legend">
            <li>
              <div />
              {'剩余数量'}
            </li>
            <li>
              <div />
              {'执行数量'}
            </li>
            <li>
              <div />
              {'未规划数量'}
            </li>
          </ul>
        </div> */}
        {/* <TestProgress /> */}
        <IssueAndExecute />
        {/* <DashBoardNavBar>
          <Link to={encodeURI(`/testManager/summary?type=${type}&id=${projectId}&name=${name}`)}>{Choerodon.getMessage('转至测试摘要', 'review test summary')}</Link>
        </DashBoardNavBar> */}
      </div>
    );
  }
}
