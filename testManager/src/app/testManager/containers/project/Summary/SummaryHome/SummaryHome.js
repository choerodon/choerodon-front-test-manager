import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Tabs, Menu, Dropdown, Button, Icon, Card, Select, Spin, Upload } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import { Chart, Axis, Geom, Tooltip } from 'bizcharts';
import './SummaryHome.less';


class SummaryHome extends Component {
  render() {
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
      </Page>
    );
  }
}

SummaryHome.propTypes = {

};

export default SummaryHome;
