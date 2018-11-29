import React, { Component } from 'react';
import { Table, Icon } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { StatusTags } from '../../../../../../components/CommonComponent';
import ReportStore from './reportStore';
import DuringChart from './DuringChart';
import './MochaReport.scss';

const STATUS = {
  passed: {
    name: '通过',
    code: 'success',
  },
  failed: {
    name: '失败',
    code: 'error',
  },
  slow: 'red',
  medium: '#fbc02d',
  fast: 'rgba(0,0,0,.38)',
};
const columns = [{
  title: '名称',
  dataIndex: 'title',
  key: 'title',
  render: (title, record) => {
    const { tests } = record;
    return (
      <span>
        {title}
        {tests && `（${tests.length}）`}
      </span>
    );
  },
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  width: '12%',
  render: (status, record) => {
    const { tests } = record;
    // 父类型
    if (tests) {
      const {
        passes, failures,
      } = record;
      if (failures.length === 0) {
        return (
          <span>
            <StatusTags name="全部通过" colorCode="success" />
          </span>
        );
      } else if (failures.length > 0 && passes.length === 0) {
        return (
          <span>
            <StatusTags name="全不通过" colorCode="error" />
          </span>
        );
      } else {
        return (
          <span>
            <StatusTags name="部分通过" color="#4D90FE" />
          </span>
        );
      }
    } else {
      const { state } = record;
      // console.log(state);
      return (
        <span>
          <StatusTags name={STATUS[state].name} colorCode={STATUS[state].code} />
        </span>
      );
    }
  },
}, {
  title: '用时',
  dataIndex: 'duration',
  width: '30%',
  key: 'duration',
  render: (duration, record) => {
    const { durationdOut, timedOut, speed } = record;
    // slow medium fast
    return (
      <div>
        <span style={{ display: 'inline-block', width: 60 }}>
          {duration > 1000 ? `${duration / 1000}s` : `${duration}ms`}
        </span>     
        <Icon type="APItest" style={{ color: timedOut ? 'red' : STATUS[speed] || 'rgba(0,0,0,.38)' }} />
      </div>
    );
  },
}];

@observer
class MochaReport extends Component {
  componentDidMount() {
    ReportStore.updateFilteredSuites();
  }

  getOption() {
    const { stats } = ReportStore;
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)',
      },
      
      series: [
        {
          color: ['red', '#00BFA5'],
          type: 'pie',
          radius: '80%',
          // radius: ['38px', '68px'],
          // avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          // center: ['40%', '42%'],
          // label: {
          //   normal: {
          //     // show: false,
          //     // position: 'center',
          //     textStyle: {
          //       fontSize: '13',
          //     },
          //   },
          //   align: 'right',
          //   // emphasis: {
          //   //   show: false,
          //   // },
          // },
          data: [            
            { value: stats.failures, name: '失败数量' },
            { value: stats.passes, name: '成功数量' },
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
    const tests = ReportStore.getFilteredTests;
    const { stats } = ReportStore;
    const {
      passPercent, skipped, duration, passes, failures, start, end, testsRegistered,
    } = stats;
    const { suites } = tests[0] || { suites: [] };
    return (
      <div className="c7ntest-mochaReport">
        <div style={{ display: 'flex' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>测试统计</span>        
          <ReactEcharts
            style={{ width: '40%' }}
            option={this.getOption()}
          />
          <div className="c7ntest-mochaReport-statistics">
            <div className="c7ntest-mochaReport-statistics-title">数据统计</div>
            <div className="c7ntest-mochaReport-statistics-item">
              {`通过率：${passPercent}%`}
            </div>
            <div className="c7ntest-mochaReport-statistics-item">
              {`测试单元：${stats.suites}`}           
              <div className="c7ntest-mochaReport-statistics-item">
                {`总测试数量：${testsRegistered}`}           
              </div>
              <div className="c7ntest-mochaReport-statistics-item">
                {`通过数量：${passes}`}            
              </div>
              <div className="c7ntest-mochaReport-statistics-item">
                {`失败数量：${failures}`}            
              </div>
              <div className="c7ntest-mochaReport-statistics-item">
                {`总耗时：${duration > 1000 ? `${duration / 1000} 秒` : `${duration} 毫秒}`}`}
              </div>
              <div className="c7ntest-mochaReport-statistics-item">
                {`开始时间：${moment(start).format('YYYY-MM-DD hh:mm:ss')}`}             
              </div>
              <div className="c7ntest-mochaReport-statistics-item">
                {`结束时间：${moment(end).format('YYYY-MM-DD hh:mm:ss')}`}             
              </div>
            </div>
          </div>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>测试时长表</span>        
        <DuringChart />
        <Table
          columns={columns}
          dataSource={suites.map(suite => ({ ...suite, children: suite.tests }))}
        />          
      </div>      
    );
  }
}


export default MochaReport;
