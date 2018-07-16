import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Radio, Menu, Dropdown, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import moment from 'moment';
import _ from 'lodash';
import { getCaseNotPlain, getCaseNotRun, getCycleRange } from '../../../../api/summaryApi';
import './SummaryHome.less';

const ButtonGroup = Button.Group;

class SummaryHome extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      range: '7',
      excuteList: [],
      notPlan: 0,
      notRun: 0,
      totalExcute: 0,
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getInfo = () => {
    this.setState({ loading: true });
    const { date, range } = this.state;

    Promise.all([getCaseNotPlain(), getCaseNotRun(),
      getCycleRange(moment().format('YYYY-MM-DD'), range)]).then(([notPlan, notRun, excuteList]) => {
      this.setState({
        loading: false,
        notPlan,
        notRun,
        excuteList: this.listTransform(excuteList),
        totalExcute: _.sum(excuteList),
      });
      window.console.log(notPlan, notRun);
    }).catch(() => {
      this.setState({ loading: false });
      Choerodon.prompt('网络异常');
    });
  }
  handleRangeChange = (e) => {
    this.setState({ loading: true });
    getCycleRange(moment().format('YYYY-MM-DD'), e.target.value).then((excuteList) => {
      this.setState({
        loading: false,
        range: e.target.value,
        excuteList: this.listTransform(excuteList),
        totalExcute: _.sum(excuteList),
      });
    });
  }
  listTransform = (list) => {
    const { range } = this.state;
    window.console.log(list.map((item, i) => ({
      time: moment().subtract(i, 'days').format('YYYY-MM-DD'),
      value: item,
    })));
    return list.reverse().map((item, i) => ({
      time: moment().subtract(i, 'days').format('YYYY-MM-DD'),
      value: item,
    }));
  }
  render() {
    const { loading, range, excuteList, totalExcute, notPlan, notRun } = this.state;
    const data = [
      { time: '1991', value: 3 },
      { time: '1992', value: 4 },
      { time: '1993', value: 3.5 },
      { time: '1994', value: 5 },
      { time: '1995', value: 4.9 },
      { time: '1996', value: 6 },
      { time: '1997', value: 7 },
      { time: '1998', value: 9 },
      { time: '1999', value: 13 },
    ];


    const columns = [{
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    }, {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
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
                  <div className="c7n-statistic-item-num">20</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" />
                <div>
                  <div className="c7n-statistic-item-title">总剩余数量</div>
                  <div className="c7n-statistic-item-num">{notRun}</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" />
                <div>
                  <div className="c7n-statistic-item-title">总执行数量</div>
                  <div className="c7n-statistic-item-num">8</div>
                </div>
              </div>
              <div className="c7n-statistic-item-container">
                <div className="c7n-statistic-item-colorBar" />
                <div>
                  <div className="c7n-statistic-item-title">总为规划数量</div>
                  <div className="c7n-statistic-item-num">{notPlan}</div>
                </div>
              </div>
            </div>
            <div className="c7n-tableArea-container">
              <div className="c7n-table-container">
                <div className="c7n-table-title">测试统计（按版本）</div>
                <Table columns={columns} dataSource={[]} filterBar={false} />
              </div>
              <div className="c7n-table-container">
                <div className="c7n-table-title">测试统计（按模块）</div>
                <Table columns={columns} dataSource={[]} filterBar={false} />
              </div>
              <div className="c7n-table-container">
                <div className="c7n-table-title">测试统计（按标签）</div>
                <Table columns={columns} dataSource={[]} filterBar={false} />
              </div>
            </div>
            <div style={{ margin: '30px 20px 18px 20px', display: 'flex', alignItems: 'center' }}>
              <div>查看时段：</div>
              <Radio.Group value={range} onChange={this.handleRangeChange}>
                <Radio.Button value="1">1天</Radio.Button>
                <Radio.Button value="7">7天</Radio.Button>
                <Radio.Button value="15">15天</Radio.Button>
                <Radio.Button value="30">30天</Radio.Button>
              </Radio.Group>
            </div>
            <div className="c7n-chartArea-container">

              <div className="c7n-chart-container">
                <div style={{ fontWeight: 'bold', margin: 12 }}>测试创建</div>
                <Chart height={240} width={550} data={data} padding="auto">
                  <Axis name="time" />
                  <Axis name="value" />
                  <Tooltip crosshairs={{ type: 'y' }} />
                  <Geom type="line" position="time*value" size={2} />
                  <Geom type="point" position="time*value" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
                </Chart>
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
