import React, { Component } from 'react';
import { Table, Icon } from 'choerodon-ui';
import ReactEcharts from 'echarts-for-react';
import hljs from 'highlight.js/lib/highlight';
import CodeSnippet from './CodeSnippet';
import 'highlight.js/styles/solarized-light.css';
import { StatusTags } from '../../../../../../components/CommonComponent';

// Register hljs languages
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript'));
hljs.registerLanguage('diff', require('highlight.js/lib/languages/diff'));

const columns = [{
  title: '名称',
  dataIndex: 'name',
  key: 'name',
  render: (name) => {
    console.log(name);
    return (
      <span>
        {/* <StatusTags name="通过" colorCode="success" /> */}
        {`    ${name}`}
      </span>
    );
  },
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  width: '12%',
  render: (status, record) => {
    const { passes, failures } = record;
    if (passes && failures) {
      return (
        <span>
          <StatusTags name="全部通过" colorCode="success" />
        </span>
      );
    } else {
      return (
        <span>
          <StatusTags name="通过" colorCode="success" />
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
    const { durationdOut } = record;
    return (
      <div>
        <span style={{ display: 'inline-block', width: 50 }}>
          {duration}
        ms
        </span>
        <Icon type="durationr" style={{ color: durationdOut ? 'red' : 'rgba(0,0,0,.38)' }} />
      </div>
    );
  },
}];

const data = [{
  key: 1,
  name: 'Status Api-CYCLE_CASE',
  age: 60,
  duration: '1800',
  passes: [],
  failures: [],
  children: [{
    key: 11,
    name: '[POST] 查询当前项目状态列表',
    age: 42,
    duration: '1200',
    durationdOut: true,
  }, {
    key: 12,
    name: 'Status Api-CYCLE_CASE',
    age: 30,
    duration: '300',
    code: 'var cycleId = cloneCycle.cycleId;\nreturn cycleFunc.deleteCycle(cycleId);',
  }, {
    key: 13,
    name: 'Status Api-CYCLE_CASE',
    age: 72,
    duration: '300',
  }],
}, {
  key: 2,
  name: 'Joe Black',
  age: 32,
  duration: '900',
  passes: [],
  failures: [],
}];
class MochaReport extends Component {
  getOption() {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)',
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 10,
        top: 20,
        bottom: 20,
        // data: data.legendData,
      },
      series: [
        {
          color: ['#00BFA5', 'red'],
          type: 'pie',
          // radius: ['38px', '68px'],
          // avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '42%'],
          label: {
            normal: {
              show: false,
              // position: 'center',
              textStyle: {
                fontSize: '13',
              },
            },
            emphasis: {
              show: false,
            },
          },
          data: [
            { value: 50, name: '成功数量' },
            { value: 5, name: '失败数量' },            
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
    const code = 'var cycleId = cloneCycle.cycleId;\nreturn cycleFunc.deleteCycle(cycleId);';
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <ReactEcharts
            style={{ height: 200, flex: 1 }}
            option={this.getOption()}
          />
          <ReactEcharts
            style={{ height: 200, flex: 1 }}
            option={this.getOption()}
          />
        </div>
        <Table
          columns={columns}
          dataSource={data} 
          // expandedRowRender={record => <CodeSnippet className="code-snippet" code={record.code} />}
        />
        <CodeSnippet className="code-snippet" code={code} label="Stack Trace" />
        <CodeSnippet className="code-snippet" code={'- 400\n+ 200\n'} lang="diff" label="Diff" />
      </div>
    );
  }
}


export default MochaReport;
// atelier-estuary-light
// atom-one-light
// foundation
// magula
// mono-blue
// expandedRowRender={record => <p style={{ margin: 0 }}>{record.description}</p>
