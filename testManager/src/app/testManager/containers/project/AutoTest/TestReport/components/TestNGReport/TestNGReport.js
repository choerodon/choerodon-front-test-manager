import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Tabs, Select, Table, Badge,
} from 'choerodon-ui';
import './TestNGReport.scss';

const { TabPane } = Tabs;
const { Option } = Select;
const toArray = any => (any instanceof Array ? any : [any]);
// 统计一个test中的所有class的方法通过情况
const calculateTestByClass = (classes) => {
  const TestClasses = toArray(classes);
  let pass = 0;
  let skip = 0;
  let fail = 0;
  let all = 0;
  TestClasses.forEach((TestClass) => {
    // console.log(TestClass);
    all += TestClass['test-method'].filter(method => !method['is-config']).length;
    pass += TestClass['test-method'].filter(method => !method['is-config'] && method.status === 'PASS').length;
    skip += TestClass['test-method'].filter(method => !method['is-config'] && method.status === 'SKIP').length;
    fail += TestClass['test-method'].filter(method => !method['is-config'] && method.status === 'FAIL').length;
  });
  return {
    pass, skip, fail, all, passPercent: isNaN(pass / all * 100) ? 0 : pass / all * 100,
  };
};
const calculateTestByTest = (tests) => {
  let pass = 0;
  let skip = 0;
  let fail = 0;
  let all = 0;
  tests.forEach((test) => {
    // console.log(TestClass);
    all += calculateTestByClass(test.class).all;
    pass += calculateTestByClass(test.class).pass;
    skip += calculateTestByClass(test.class).skip;
    fail += calculateTestByClass(test.class).fail;
  });
  tests.push({
    name: '总计',
    pass,
    skip,
    fail,
    passPercent: isNaN(pass / all * 100) ? 0 : pass / all * 100,
    class: { 'test-method': [] },
  });
};


class TestNGReport extends Component {
  state = {
    selectedSuites: [],
    allSuites: [],
    filteredSuites: [],
  }

  handleSelect=(selectedSuites) => {
    this.setState({
      selectedSuites,
    });
  }

  static getDerivedStateFromProps(props, state) {
    const suites = JSON.parse(JSON.stringify(props.data['testng-results'].suite));
    const filteredSuites = suites.filter((suite) => {
      if (state.selectedSuites.length === 0) { return suite.test; } else {
        return suite.test && state.selectedSuites.includes(suite.name);
      }
    });    
    const allSuites = suites.filter(suite => suite.test);      
    filteredSuites.forEach((suite) => {
      suite.test = suite.test instanceof Array ? suite.test : [suite.test];
      calculateTestByTest(suite.test);   
    });         
    return {
      allSuites,
      filteredSuites,
    };
  }

  // 统计suite中所有test的通过状况


  groupClassByStatus = (classes) => {
    const TestClasses = toArray(classes);

    const getTestByStatus = (type) => {
      const Classes = JSON.parse(JSON.stringify(TestClasses));
      Classes.forEach((TestClass) => {
        const len = TestClass['test-method'].filter(method => !method['is-config'] && method.status === type).length;
        if (len === 0) {
          TestClass.empty = true;
        }
        TestClass['test-method'] = TestClass['test-method'].filter(method => !method['is-config'] && method.status === type);
      });

      return Classes.filter(Class => !Class.empty);
    };
    const PassClasses = getTestByStatus('PASS');
    const SkipClasses = getTestByStatus('SKIP');
    const FailClasses = getTestByStatus('FAIL');
    return { PassClasses, SkipClasses, FailClasses };
  }

  render() {
    const log = this.props.data['reporter-output'];
    const { filteredSuites, allSuites } = this.state;
    const columns = [
      { title: '测试', dataIndex: 'name', key: 'name' },
      {
        title: '持续时间', dataIndex: 'duration-ms', key: 'duration-ms', render: duration => duration !== undefined && `${duration}ms`,
      },
      {
        title:
  <span>
    <Badge status="success" />
            通过
  </span>,
        dataIndex: 'pass',
        key: 'pass',
        render: (pass, record) => record.pass || calculateTestByClass(record.class).pass,
      },
      {
        title:
  <span>
    <Badge status="warning" />
            跳过
  </span>,
        dataIndex: 'skip',
        key: 'skip',
        render: (pass, record) => record.skip || calculateTestByClass(record.class).skip,
      },
      {
        title:
  <span>
    <Badge status="error" />
            失败
  </span>,
        dataIndex: 'fail',
        key: 'fail',
        render: (pass, record) => record.fail || calculateTestByClass(record.class).fail,
      },
      {
        title: '通过率',
        dataIndex: 'passPercent',
        key: 'passPercent',
        render: (pass, record) => `${record.passPercent || calculateTestByClass(record.class).passPercent}%`,
      },
    ];
    
    
    const InnerTable = (TestClass) => {
      const { name } = TestClass;
      const innerColumns = [
        {
          title: name, dataIndex: 'name', key: 'name', colSpan: 3,
        },
        {
          title: '时长',
          dataIndex: 'duration-ms',
          key: 'duration-ms',
          colSpan: 0,
          render: duration => `${duration}ms`,
        },
        {
          title: 'log',
          key: 'log',
          colSpan: 0,
          render: (recordInner) => {
            const { params, exception } = recordInner;
            return (
              <div>
                {params && <div>{`[DATA] ${toArray(params.param).map(param => param.value).join(',')}`}</div>}
                {exception && <div style={{ color: '#3F51B5' }}>{exception.message}</div>}
                {exception && <div style={{ whiteSpace: 'pre-wrap' }}>{exception['full-stacktrace']}</div>}
              </div>
            );
          },
        },
      ];   
      return (
        <Table
          filterBar={false}
          columns={innerColumns}
          dataSource={TestClass['test-method']}
          pagination={false}
        />
      );
    };
    const expandedRowRender = (record) => {      
      const { PassClasses, SkipClasses, FailClasses } = this.groupClassByStatus(record.class);
      return (
        <div>
          {/* 通过 */}
          {PassClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-pass">
                  <Badge status="success" />
                  测试通过
                </div>
                {PassClasses.map(InnerTable)}
              </div>
            )}
          {/* 跳过 */}
          {SkipClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-skip">
                  <Badge status="warning" />
                  测试跳过
                </div>
                {SkipClasses.map(InnerTable)}
              </div>
            )}
          {/* 失败 */}
          {FailClasses.length > 0
            && (
              <div>
                <div className="c7ntest-table-title c7ntest-table-header-failed">
                  <Badge status="error" />
                  测试失败
                </div>
                {FailClasses.map(InnerTable)}
              </div>
            )}
        </div>
      );
    };
    return (
      <div className="c7ntest-TestNGReport">
        TestNGReport
        <Tabs defaultActiveKey="1">
          <TabPane tab="总览" key="1">
            <section style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontWeight: 500 }}>筛选：</span>
              <Select
                mode="multiple"          
                className="quickSearchSelect"
                placeholder="Suite"
                maxTagCount={0}
                maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item).join(', ')}`}              
                onChange={this.handleSelect}
              >
                {
                allSuites.map(suite => (
                  <Option key={suite.name} value={suite.name}>
                    {suite.name}
                  </Option>
                ))
              }               
              </Select>
            </section>
            <section>
              {
                filteredSuites.map((suite) => {
                  const tests = toArray(suite.test);                  
                  return (
                    <Table
                      rowClassName={(record, index) => (index === tests.length - 1 ? 'c7ntest-table-total' : '')}
                      title={() => <div style={{ paddingLeft: 57 }}>{suite.name}</div>}
                      filterBar={false}
                      columns={columns}
                      expandedRowRender={expandedRowRender}
                      dataSource={tests}
                      pagination={false}
                    />
                  );
                })
              }
            </section>
          </TabPane>
          <TabPane tab="日志" key="2">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {log}
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

TestNGReport.propTypes = {

};

export default TestNGReport;
