import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Radio, Menu, Dropdown, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import { getCaseNotPlain, getCaseNotRun, getCycleRange } from '../../../../api/summaryApi';
import './SummaryHome.less';

const ButtonGroup = Button.Group;

class SummaryHome extends Component {
  state={
    loading: false,
    range: '7',
  }
  componentDidMount() {
    this.getInfo();
  }
  
  getInfo=() => {
    this.setState({ loading: true });
    Promise.all([getCaseNotPlain(), getCaseNotRun(), getCycleRange('2018-07-16', 7)]).then(([notPlan, notRun]) => {
      this.setState({ loading: false });
      window.console.log(notPlan, notRun);
    }).catch(() => {
      this.setState({ loading: false });
      Choerodon.prompt('网络异常');
    });
  }
  handleRangeChange=(e) => {
    this.setState({
      range: e.target.value,
    });
  }
  render() {
    const { loading, range } = this.state;
    const data = [
      { year: '1991', value: 3 },
      { year: '1992', value: 4 },
      { year: '1993', value: 3.5 },
      { year: '1994', value: 5 },
      { year: '1995', value: 4.9 },
      { year: '1996', value: 6 },
      { year: '1997', value: 7 },
      { year: '1998', value: 9 },
      { year: '1999', value: 13 },
    ];

    const cols = {
      value: { min: 0 },
      year: { range: [0, 1] },
    };
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
                  <div className="c7n-statistic-item-num">12</div>
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
                  <div className="c7n-statistic-item-num">12</div>
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
                <Chart height={400} data={data} scale={cols} forceFit>
                  <Axis name="year" />
                  <Axis name="value" />
                  <Tooltip crosshairs={{ type: 'y' }} />
                  <Geom type="line" position="year*value" size={2} />
                  <Geom type="point" position="year*value" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
                </Chart>
              </div>
              <div className="c7n-chart-container">
                <Chart height={400} data={data} scale={cols} forceFit>
                  <Axis name="year" />
                  <Axis name="value" />
                  <Tooltip crosshairs={{ type: 'y' }} />
                  <Geom type="line" position="year*value" size={2} />
                  <Geom type="point" position="year*value" size={4} shape={'circle'} style={{ stroke: '#fff', lineWidth: 1 }} />
                </Chart>
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
