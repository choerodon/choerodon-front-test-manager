import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Radio, Menu, Dropdown, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import moment from 'moment';
import _ from 'lodash';
import { getCaseNotPlain, getCaseNotRun, getCaseNum, getCycleRange, getCreateRange } from '../../../../api/summaryApi';
import { getProjectVersion, getLabels, getModules, getIssueCount } from '../../../../api/agileApi';
import './SummaryHome.less';

const ButtonGroup = Button.Group;

class SummaryHome extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      range: '7',
      excuteList: [],
      createList: [],
      totalIssue: 0,
      totalTest: 0,
      notPlan: 0,
      notRun: 0,
      caseNum: 0,
      totalExcute: 0,
      totalCreate: 0,
      versionList: [],
      componentList: [],
      labelList: [],
      versionTable: [],
      componentTable: [],
      labelTable: [],
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.setState({ loading: true });
    const { date, range } = this.state;
    Promise.all([getIssueCount({}), getIssueCount({
      advancedSearchArgs: {
        typeCode: [
          'issue_test',
        ],
      },
      otherArgs: {
        // version: [version.versionId],
      },
    }), getCaseNotPlain(), getCaseNotRun(), getCaseNum(),
    getCycleRange(moment().format('YYYY-MM-DD'), range),
    getCreateRange(range), getProjectVersion(), getModules(), getLabels()])
      .then(([totalIssueData, totalData, notPlan, notRun, caseNum, excuteList,
        createList, versionList, componentList, labelList]) => {
        this.setState({
          loading: false,
          totalIssue: totalIssueData.totalElements,
          totalTest: totalData.totalElements,
          notPlan,
          notRun,
          caseNum,
          excuteList: this.listTransform(excuteList),
          totalExcute: _.sum(excuteList),
          createList: this.createTransform(createList, range),
          totalCreate: _.sumBy(createList, 'issueCount'),
          versionList,
          componentList,
          labelList,
        });
        
        this.getVersionTable(versionList).then((versionTable) => {         
          versionTable.unshift({
            versionId: null, 
            name: '未规划',
            num: totalIssueData.totalElements - _.sumBy(versionTable, 'num'),
          });
          this.setState({
            versionTable,
          });
        });
        this.getLabelTable(labelList).then((labelTable) => {         
          labelTable.unshift({
            id: null, 
            name: '未规划',
            num: totalIssueData.totalElements - _.sumBy(labelTable, 'num'),
          });
          this.setState({
            labelTable,
          });
        });
        this.getComponentTable(componentList).then((componentTable) => {         
          componentTable.unshift({
            id: null, 
            name: '未规划',
            num: totalIssueData.totalElements - _.sumBy(componentTable, 'num'),
          });
          this.setState({
            componentTable,
          });
        });
      }).catch(() => {
        this.setState({ loading: false });
        Choerodon.prompt('网络异常');
      });
  }
  getVersionTable = versionList => Promise.all(
    versionList.map(version => new Promise((resolve, reject) => {
      const search = {
        advancedSearchArgs: {

        },
        otherArgs: {
          // version: [version.versionId],
        },
      };
      if (version.versionId) {
        search.otherArgs.version = [version.versionId];
      }
      getIssueCount(search).then((data) => {
        window.console.log(version.versionId, data.totalElements);
        resolve({ name: version.name, versionId: version.versionId, num: data.totalElements });
      });
    }),
    ))
    getLabelTable = labelList => Promise.all(
      labelList.map(label => new Promise((resolve, reject) => {
        const search = {
          advancedSearchArgs: {
  
          },
          otherArgs: {
            lable: [label.id],
          },
        };


        getIssueCount(search).then((data) => {
          window.console.log(label, data.totalElements);
          resolve({ name: label.name, id: label.id, num: data.totalElements });
        });
      }),
      ))
      getComponentTable = componentList => Promise.all(
        componentList.map(component => new Promise((resolve, reject) => {
          const search = {
            advancedSearchArgs: {
    
            },
            otherArgs: {
              component: [component.id],
            },
          };
  
  
          getIssueCount(search).then((data) => {
            window.console.log(component, data.totalElements);
            resolve({ name: component.name, id: component.id, num: data.totalElements });
          });
        }),
        ))
  handleRangeChange = (e) => {
    this.setState({ loading: true });
    Promise.all([
      getCycleRange(moment().format('YYYY-MM-DD'), e.target.value),
      getCreateRange(e.target.value)]).then(([excuteList, createList]) => {
      this.setState({
        loading: false,
        range: e.target.value,
        excuteList: this.listTransform(excuteList),
        totalExcute: _.sum(excuteList),
        createList: this.createTransform(createList, e.target.value),
        totalCreate: _.sumBy(createList, 'issueCount'),
      });
    });
  }
  createTransform = (source, range) => Array(Number(range)).fill(0).map((item, i) => {
    const time = moment().subtract(i, 'days').format('YYYY-MM-DD');
    if (_.find(source, { creationDay: time })) {
      const { creationDay, issueCount } = _.find(source, { creationDay: time });
      return {
        creationDay,
        issueCount,
      };
    } else {
      return {
        creationDay: time,
        issueCount: 0,
      };
    }
  });

  listTransform = list => list.reverse().map((item, i) => ({
    time: moment().subtract(i, 'days').format('YYYY-MM-DD'),
    value: item,
  }))
  render() {
    const { loading, range, excuteList, createList, totalExcute,
      totalCreate, totalTest, notPlan, notRun, caseNum, versionTable,
      labelTable, componentTable } = this.state;
    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
    }];
    return (
      <Page>
        <Header title="测试摘要">
          <Button onClick={this.getInfo}>
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Spin spinning={loading}>
          <div className="c7n-content-container">
            <div className="c7n-statistic-container">
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" />
                <div>
                  <div className="c7n-statistic-item-title">总测试数量</div>
                  <div className="c7n-statistic-item-num">{totalTest}</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" style={{ borderColor: '#FFB100' }} />
                <div>
                  <div className="c7n-statistic-item-title">总剩余数量</div>
                  <div className="c7n-statistic-item-num">{notRun}</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" style={{ borderColor: '#00BFA5' }} />
                <div>
                  <div className="c7n-statistic-item-title">总执行数量</div>
                  <div className="c7n-statistic-item-num">{caseNum}</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" style={{ borderColor: '#FF7043' }} />
                <div>
                  <div className="c7n-statistic-item-title">总未规划数量</div>
                  <div className="c7n-statistic-item-num">{notPlan}</div>
                </div>
              </div>
            </div>
            <div className="c7n-tableArea-container">
              <div className="c7n-table-container">
                <div className="c7n-table-title">测试统计（按版本）</div>
                <Table
                  columns={columns}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  dataSource={versionTable}
                  filterBar={false}
                />
              </div>
              <div className="c7n-table-container" style={{ margin: '0 15px' }}>
                <div className="c7n-table-title">测试统计（按模块）</div>
                <Table 
                  columns={columns} 
                  pagination={{ pageSize: 5, showSizeChanger: false }} 
                  dataSource={labelTable} 
                  filterBar={false}
                />
              </div>
              <div className="c7n-table-container">
                <div className="c7n-table-title">测试统计（按标签）</div>
                <Table 
                  columns={columns} 
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  dataSource={componentTable} 
                  filterBar={false}
                />
              </div>
            </div>
            <div style={{ margin: '30px 20px 18px 20px', display: 'flex', alignItems: 'center' }}>
              <div>查看时段：</div>
              <Radio.Group value={range} onChange={this.handleRangeChange}>
                {/* <Radio.Button value="1">1天</Radio.Button> */}
                <Radio.Button value="7">7天</Radio.Button>
                <Radio.Button value="15">15天</Radio.Button>
                <Radio.Button value="30">30天</Radio.Button>
              </Radio.Group>
            </div>
            <div className="c7n-chartArea-container">

              <div className="c7n-chart-container">
                <div style={{ fontWeight: 'bold', margin: 12 }}>测试创建</div>
                <Chart height={240} width={550} data={createList} padding="auto">
                  <Axis name="creationDay" />
                  <Axis name="issueCount" />
                  <Tooltip crosshairs={{ type: 'y' }} />
                  <Geom
                    type="line"
                    position="creationDay*issueCount"
                    size={2}
                    tooltip={['creationDay*issueCount', (time, issueCount) => ({
                      // 自定义 tooltip 上显示的 title 显示内容等。
                      name: '创建数',
                      value: issueCount,
                    })]}
                  />
                  <Geom type="point" position="creationDay*issueCount" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
                </Chart>
                <div style={{ color: 'rgba(0,0,0,0.65)', margin: 10 }}>
                  创建测试：<span style={{ color: 'black', fontWeight: 'bold' }}>{totalCreate}</span>，
                过去<span style={{ color: 'black', fontWeight: 'bold' }}> {range} </span>天
                </div>
              </div>
              <div className="c7n-chart-container">
                <div style={{ fontWeight: 'bold', margin: 12 }}>测试执行</div>
                <Chart height={240} width={550} data={excuteList} padding="auto">
                  <Axis name="time" />
                  <Axis name="value" />
                  <Tooltip crosshairs={{ type: 'y' }} />
                  <Geom
                    type="line"
                    position="time*value"
                    size={2}
                    tooltip={['time*value', (time, value) => ({
                      // 自定义 tooltip 上显示的 title 显示内容等。
                      name: '执行数',
                      value,
                    })]}
                  />
                  <Geom
                    type="point"
                    position="time*value"
                    size={4}
                    shape={'circle'}
                    style={{ stroke: '#fff', lineWidth: 1 }}
                  />
                </Chart>
                <div style={{ color: 'rgba(0,0,0,0.65)', margin: 10 }}>
                  执行测试：<span style={{ color: 'black', fontWeight: 'bold' }}>{totalExcute}</span>，
                过去<span style={{ color: 'black', fontWeight: 'bold' }}> {range} </span>天
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </Page>
    );
  }
}

SummaryHome.propTypes = {

};

export default SummaryHome;
