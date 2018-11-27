import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import { observer } from 'mobx-react';
import ReportStore from './reportStore';


@observer
class DuringChart extends Component {
  getOption() {
    // const { intl: { formatMessage } } = this.props;
    const tests = ReportStore.getTests;
    const { stats } = ReportStore;
    console.log(tests);
    const averageDuration = [];
    // averageDuration.length = pipelineTime && pipelineTime.length ? pipelineTime.length : 0;
    // const ava = pipelineTime && pipelineTime.length ? ((_.reduce(pipelineTime, (sum, n) => sum + parseFloat(n), 0)) / pipelineTime.length) : 0;
    // _.fill(averageDuration, ava);
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none',
        },
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
          fontSize: 13,
          lineHeight: 20,
        },
        padding: [10, 15],
        extraCssText:
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
        formatter(params, ticket) {       
          const { name, value, dataIndex } = params[0];          
          return `<div>
            <div>${'全名'}：${tests[dataIndex].fullTitle}</div>
            <div>${'名称'}：${name}</div>
            <div>${'时长'}：${value > 1000 ? `${value / 1000}s` : `${value}ms`}</div>
          </div>`;
        },
      },
      grid: {
        left: '2%',
        right: '3%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },
        axisLabel: {
          margin: 13,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
          rotate: 40,
          formatter(value) {
            return `${value.substr(0, value.indexOf('-') + 5)}`;
          },
        },
        splitLine: {
          lineStyle: {
            color: ['#eee'],
            width: 1,
            type: 'solid',
          },
        },
        data: tests.map(during => during.title),
      },
      yAxis: {
        name: '时间',
        type: 'value',

        nameTextStyle: {
          fontSize: 13,
          color: '#000',
        },
        axisTick: { show: false },
        axisLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 2,
          },
        },

        axisLabel: {
          margin: 19.3,
          textStyle: {
            color: 'rgba(0, 0, 0, 0.65)',
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
            type: 'solid',
            width: 1,
          },
        },
        // min: (pipelineTime && pipelineTime.length) ? null : 0,
        // max: (pipelineTime && pipelineTime.length) ? null : 4,
      },
      series: [
        {
          type: 'bar',
          barWidth: '30%',
          itemStyle: {
            color: 'rgba(77, 144, 254, 0.60)',
            borderColor: '#4D90FE',
            emphasis: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.20)',
            },
          },
          data: tests.map(during => during.duration),
        },
        {
          type: 'line',
          symbol: 'none',
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.36)',
            width: 2,
            type: 'dashed',
            border: '1px solid #4D90FE',
          },
          data: averageDuration,
        },
      ],
    };
  }

  render() {
    return (
      <ReactEcharts
        // style={{ height: 200, flex: 1 }}
        option={this.getOption()}
      />  
    );
  }
}

DuringChart.propTypes = {

};

export default DuringChart;
