import React, {Component} from 'react';
import {
    Page, Header, Content, stores,
  } from 'choerodon-front-boot';
import {Menu, Tooltip, Button, Icon, Dropdown, Select,} from 'choerodon-ui';
import {FormattedMessage} from 'react-intl';
import TestProgress from '../../../../dashboard/TestProgress';
import ReactEcharts from 'echarts-for-react';
import _ from 'lodash';
import { getProjectVersion } from '../../../../api/agileApi';
import { loadProgressByVersion } from '../../../../api/DashBoardApi';
import { getCyclesByVersionId } from '../../../../api/cycleApi';
import { ReporterSwitcher } from '../../../../components/ReportComponent';
import {getProjectName} from '../../../../common/utils';

import './ReportProgress.scss';

const { AppState} = stores;
const {Option} = Select;
class ReportProgress extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentVersion: null,
            currentCycle: null,
            versionList: [],
            cycleList: [],
            versionProgress: [],
          }
    }

    componentDidMount() {
        this.loadData();
      }
    
      loadData = () => {
        getProjectVersion().then((res) => {
          if (res && res.length > 0) {
            const latestVersionId = Math.max.apply(null, res.map(item => item.versionId));
            // console.log(latestVersionId);
            if (latestVersionId !== -Infinity) {
              this.loadProgressByVersion(latestVersionId);
              this.loadCyclesByVersionId(latestVersionId);
            }
            this.setState({
              versionList: res.reverse(),
            });
          }
        });
      }

      loadProgressByVersion = (versionId, cycleId) => {
        // console.log('load', versionId);
        loadProgressByVersion(versionId, cycleId).then((res) => {
          this.setState({
            currentVersion: versionId,
            versionProgress: res,
          });
        });
      }

      loadCyclesByVersionId = (versionId) => {
        getCyclesByVersionId(versionId).then(res => {
            this.setState({
                cycleList: res,
            })
        })
      }
    
      handleVersionChange = (value) => {
        this.loadProgressByVersion(value);
        this.setState({
            currentCycle: null,
        })
        this.loadCyclesByVersionId(value);
      }

      handleCycleChange = (value) => {
          const {currentVersion} = this.state;
          this.setState({
              currentCycle: value,
          })
          this.loadProgressByVersion(currentVersion, value);
      }
    
    getOption() {
        const option = {
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}',
          },
        //   hoverable: true,
          series: [
            {
              name: '执行进度',
              type: 'treemap',
              roam: false,
              nodeClick: false,
              breadcrumb: { // 显示当前路径，面包屑
                show: false,
              },
              itemStyle: {
                normal: {
                  label: {
                    show: true,
                    formatter: '{b}: {c}',
                    textStyle: {
                      color: 'white',
                      fontSize: 14,
                    },
                  },
                },
              },
              data: this.state.versionProgress.map(item => ({
                name: item.name,
                value: item.value,
                itemStyle: {                
                  color: item.color,              
                },  
              })),
              // [
              //   {
              //     name: '未执行',
              //     value: 6,
              //     itemStyle: {                
              //       color: 'rgba(0, 0, 0, 0.18)',              
              //     },  
              //   }]
            },
          ],
        };
    
        return option;
      }

    render(){
        const urlParams = AppState.currentMenuType;
        const { organizationId } = AppState.currentMenuType;
        const {versionList, currentVersion, cycleList, currentCycle, versionProgress } = this.state;
        return (
            <Page className="c7ntest-report-progress">
            <Header
              title={<FormattedMessage id="report_defectToProgress" />}
              backPath={`/testManager/report?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${organizationId}`}
            >
              <ReporterSwitcher />
              <Button onClick={this.getInfo} style={{ marginLeft: 30 }}>
                <Icon type="autorenew icon" />
                <span>
                  <FormattedMessage id="refresh" />
                </span>
              </Button>
            </Header>
            <Content        
              title={<FormattedMessage id="report_progress_content_title" values={{ name: getProjectName() }} />}
              description={<FormattedMessage id="report_progress_content_description" />}
              link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
            >
             <div className="c7ntest-switch">
                <div className="c7ntest-switchVersion">
                    <Select
                        className="c7ntest-version-filter-item"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        value={currentVersion}
                        label="版本"
                        onChange={this.handleVersionChange}
                    >
                        {
                            versionList.map(item => (
                                <Option value={item.versionId} key={item.versionId}>{item.name}</Option>
                            ))
                        }
                    </Select>
                </div>
                <div className="c7ntest-switchCycle">
                    <Select
                        className="c7ntest-cycle-filter-item"
                        getPopupContainer={triggerNode => triggerNode.parentNode}
                        value={currentCycle}
                        label="测试循环"
                        onChange={this.handleCycleChange}
                    >
                        {
                            cycleList.map(item => (
                                <Option value={item.cycleId} key={item.cycleName}>{item.cycleName}</Option>
                            ))
                        }
                    </Select>
                </div>
            </div>
            <div className="c7ntest-chartAndTable">
                <ReactEcharts
                    style={{ width:'60%', height: 350 }}
                    option={this.getOption()}
                />
               {
                   versionProgress && versionProgress.length>0 && (
                    <div className="c7ntest-tableContainer">
                        <p className="c7ntest-table-title">数据统计</p>
                        <table>
                            <tr>
                            <td style={{ width: '158px' }}>测试执行状态</td>
                            <td style={{ width: '62px' }}>执行数量</td>
                            </tr>
                            {
                            versionProgress.map((item, index) => (
                            <tr>
                                <td style={{display: 'flex'}}>
                                <div className="c7ntest-table-icon" style={{ background: item.color }} />
                                <Tooltip title={item.name}>
                                    <div className="c7ntest-table-name">{item.name}</div>
                                </Tooltip>
                                </td>
                                <td style={{ width: '62px', paddingRight: 15 }}>{item.value}</td>
                            </tr>
                            ))
                        }
                        </table>
                    </div>
                   )
               }
            </div>
           
            </Content>
            </Page>
           )
    }
}
export default ReportProgress;
