import React, { Component } from 'react';
import {
  Button, Select, Radio, Form, Input, Popover, Icon, Spin, DatePicker,
} from 'choerodon-ui';
import moment from 'moment';
import { FormattedMessage, injectIntl } from 'react-intl';
import CreateAutoTestStore from '../../../../../../store/project/AutoTest/CreateAutoTestStore';
import { YamlEditor } from '../../../../../../components/CommonComponent';
import { getYaml } from '../../../../../../api/AutoTestApi';
import './ConfirmInfo.scss';

const intlPrefix = 'taskdetail';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
@injectIntl
@Form.create()
class ConfirmInfo extends Component {
  state = {
    triggerType: 'easy',
    testType: 'instant',
    data: null,
  }

  componentDidMount() {
    this.loadYaml();
  }

  loadYaml=() => {
    getYaml().then((data) => {
      if (data) {
        this.setState({
          data,
        });
      }
    });
  }
  
  // 创建任务切换触发类型
  changeValue(e) {
    const { resetFields } = this.props.form;
    resetFields(['simpleRepeatInterval', 'simpleRepeatCount', 'simpleRepeatIntervalUnit', 'cronExpression']);
    this.setState({
      triggerType: e.target.value === 'simple-trigger' ? 'easy' : 'cron',
    });
  }

  disabledEndDate = (endTime) => {
    const startTime = this.state.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return endTime.valueOf() <= startTime.valueOf();
  }

  /**
   * 部署应用
   */
  handleDeploy = () => {
    this.setState({
      loading: true,
    });
    const instances = CreateAutoTestStore.currentInstance;
    const value = this.state.value || CreateAutoTestStore.value.yaml;
    const applicationDeployDTO = {
      appId: this.state.appId,
      appVerisonId: this.state.appVersionId,
      environmentId: this.state.envId,
      values: value,
      type: this.state.mode === 'new' ? 'create' : 'update',
      appInstanceId: this.state.mode === 'new'
        ? null : this.state.instanceId || (instances && instances.length === 1 && instances[0].id),
    };
    if (this.state.selectType === 'create') {
      const { type, id } = this.taskdetail;
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.setState({
            // isSubmitting: true,
          });
          const flag = values.triggerType === 'simple-trigger';
          const {
            startTime, endTime, cronExpression, simpleRepeatInterval,
            simpleRepeatIntervalUnit, simpleRepeatCount, 
          } = values;
          const body = {
            ...values,
            startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
            endTime: endTime ? endTime.format('YYYY-MM-DD HH:mm:ss') : null,
            cronExpression: flag ? null : cronExpression,
            simpleRepeatInterval: flag ? Number(simpleRepeatInterval) : null,
            simpleRepeatIntervalUnit: flag ? simpleRepeatIntervalUnit : null,
            simpleRepeatCount: flag ? Number(simpleRepeatCount) : null,
          };
          createTask(body, type, id).then(({ failed, message }) => {
            if (failed) {
              Choerodon.prompt(message);
              this.setState({
                // isSubmitting: false,
              });
            } else {
              // Choerodon.prompt(intl.formatMessage({ id: 'create.success' }));
              this.setState({
                // isSubmitting: false,
              }, () => {
                // this.handleRefresh();
              });
            }
          }).catch(() => {
            // Choerodon.prompt(intl.formatMessage({ id: 'create.error' }));
            // this.setState({
            //   isSubmitting: false,
            // });
          });
        }
      });
    }
    // CreateAutoTestStore.deploymentApp(applicationDeployDTO)
    //   .then((datas) => {
    //     if (datas) {
    //       this.openAppDeployment();
    //     }
    //     this.setState({
    //       loading: false,
    //     });
    //   })
    //   .catch((error) => {
    //     Choerodon.prompt(error.response.data.message);
    //     this.setState({
    //       loading: false,
    //     });
    //   });
  };

  getCronContent = () => {
    const { cronLoading, cronTime } = this.state;
    const { intl } = this.props;
    let content;
    if (cronLoading === 'empty') {
      content = (
        <div className="c7ntest-task-deatil-cron-container-empty">
          <FormattedMessage id={`${intlPrefix}.cron.tip`} />
          <a href={intl.formatMessage({ id: `${intlPrefix}.cron.tip.link` })} target="_blank">
            <span>{intl.formatMessage({ id: 'learnmore' })}</span>
            <Icon type="open_in_new" style={{ fontSize: '13px' }} />
          </a>
        </div>
      );
    } else if (cronLoading === true) {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>);
    } else if (cronLoading === 'right') {
      content = (
        <div className="c7ntest-task-deatil-cron-container">
          <FormattedMessage id={`${intlPrefix}.cron.example`} />
          {
            cronTime.map((value, key) => (
              <li>
                <FormattedMessage id={`${intlPrefix}.cron.runtime`} values={{ time: key + 1 }} />
                <span>{value}</span>
              </li>
            ))
          }
        </div>
      );
    } else {
      content = (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FormattedMessage id={`${intlPrefix}.cron.wrong`} />
        </div>
      );
    }
    return content;
  }

  renderTimingExecute = () => {
    const { triggerType } = this.state;
    const { intl, AppState } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="c7ntest-create-task">
        <FormItem
          {...formItemLayout}
          className="c7ntest-create-task-inline-formitem"
        >
          {getFieldDecorator('startTime', {
            rules: [{
              required: true,
              message: intl.formatMessage({ id: `${intlPrefix}.task.start.time.required` }),
            }],
          })(
            <DatePicker
              label="开始时间"
              style={{ width: '248px' }}
              format="YYYY-MM-DD HH:mm:ss"
              disabledDate={this.disabledStartDate}
              disabledTime={this.disabledDateStartTime}
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              // getCalendarContainer={() => document.getElementsByClassName('ant-modal-body')[document.getElementsByClassName('ant-modal-body').length - 1]}
              onChange={this.onStartChange}
              onOpenChange={this.clearStartTimes}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          className="c7ntest-create-task-inline-formitem"
        >
          {getFieldDecorator('endTime', {
            rules: [],
          })(
            <DatePicker
              label="结束时间"
              style={{ width: '248px' }}
              format="YYYY-MM-DD HH:mm:ss"
              disabledDate={this.disabledEndDate.bind(this)}
              // disabledTime={this.disabledDateEndTime.bind(this)}
              showTime={{ defaultValue: moment() }}
              // getCalendarContainer={() => document.getElementsByClassName('ant-modal-body')[document.getElementsByClassName('ant-modal-body').length - 1]}
              onChange={this.onEndChange}
              onOpenChange={this.clearEndTimes}
            />,
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
        >
          {getFieldDecorator('triggerType', {
            initialValue: 'simple-trigger',
          })(
            <RadioGroup
              className="c7ntest-create-task-radio-container"
              label="触发类型"
              onChange={this.changeValue.bind(this)}
            >
              <Radio value="simple-trigger">简单任务</Radio>
              <Radio value="cron-trigger">Cron任务</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        <div style={{ display: triggerType === 'easy' ? 'block' : 'none' }}>       
          <FormItem
            {...formItemLayout}
            className="c7ntest-create-task-inline-formitem"
          >
            {getFieldDecorator('simpleRepeatInterval', {
              rules: [{
                required: triggerType === 'easy',
                // message: intl.formatMessage({ id: `${intlPrefix}.repeat.required` }),
              }, {
                pattern: /^[1-9]\d*$/,
                // message: intl.formatMessage({ id: `${intlPrefix}.repeat.pattern` }),
              }],
              validateFirst: true,
            })(
              <Input style={{ width: '100px' }} autoComplete="off" label="重复间隔" />,
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            className="c7ntest-create-task-inline-formitem c7ntest-create-task-inline-formitem-select"
          >
            {getFieldDecorator('simpleRepeatIntervalUnit', {
              rules: [],
              initialValue: 'SECONDS',
            })(
              <Select
                style={{ width: '124px' }}
              >
                <Option value="SECONDS">秒</Option>
                <Option value="MINUTES">分</Option>
                <Option value="HOURS">时</Option>
                <Option value="DAYS">天</Option>
              </Select>,
            )}
          </FormItem>
   
          <FormItem
            className="c7ntest-create-task-inline-formitem"
            {...formItemLayout}
          >
            {getFieldDecorator('simpleRepeatCount', {
              rules: [{
                required: triggerType === 'easy',
                // message: intl.formatMessage({ id: `${intlPrefix}.repeat.time.required` }),
              }, {
                pattern: /^[1-9]\d*$/,
                // message: intl.formatMessage({ id: `${intlPrefix}.repeat.pattern` }),
              }],
            })(
              <Input style={{ width: '100px' }} autoComplete="off" label="执行次数" />,
            )}
          </FormItem>
        </div>
        <div>
          <FormItem
            {...formItemLayout}
            style={{ display: triggerType === 'cron' ? 'inline-block' : 'none' }}
          >
            {getFieldDecorator('cronExpression', {
              rules: [{
                required: triggerType === 'cron',
                // message: intl.formatMessage({ id: `${intlPrefix}.cron.expression.required` }),
              }],
            })(
              <Input style={{ width: 512 }} autoComplete="off" label="Cron表达式" />,
            )}
          </FormItem>
          <Popover
            content={this.getCronContent()}
            trigger="click"
            placement="bottom"
            overlayClassName="c7ntest-task-detail-popover"
            // getPopupContainer={() => document.getElementsByClassName('sidebar-content')[0].parentNode}
          >
            <Icon
              onClick={this.checkCron}
              style={{ display: triggerType === 'cron' ? 'inline-block' : 'none' }}
              className="c7ntest-task-detail-popover-icon"
              type="find_in_page"
            />
          </Popover>
        </div>
      </div>
    );
  }

  render() {
    const instances = CreateAutoTestStore.currentInstance;
    const { intl } = this.props;
    const { formatMessage } = intl;
    // const data = this.state.yaml || CreateAutoTestStore.value;
    const {
      data, app, appVersionId, envId, instanceId, mode, testType,
    } = this.state;
    const options = {
      theme: 'neat',
      mode: 'yaml',
      readOnly: true,
      lineNumbers: true,
    };
    return (
      <section className="deployApp-review">
        <p>
          {formatMessage({ id: 'autoteststep_three_description' })}
        </p>
        <section className="deployApp-section">
          <div>
            <div className="deployApp-title">
              <span className="deployApp-title-text">
                {'测试类型：'}
              </span>
            </div>
            <div className="deployApp-text">
              <RadioGroup
                value={testType}
                onChange={(e) => {
                  this.setState({
                    testType: e.target.value,
                  });
                }}
              >
                <Radio value="instant">立即执行</Radio>
                <Radio value="timing">定时执行</Radio>
              </RadioGroup>
            </div>
          </div>
          {/* 定时执行 */}
          {testType === 'timing' && this.renderTimingExecute()}
          <div>
            <div className="deployApp-title">
              <span className="deployApp-title-text">
                {'测试框架：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.app && this.state.app.name}
              <span className="deployApp-value">
                {'('}
                {this.state.app && this.state.app.code}
                {')'}
              </span>
            </div>
          </div>
          <div>
            <div className="deployApp-title">
              <span className="deployApp-title-text">
                {'应用：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.app && this.state.app.name}
              <span className="deployApp-value">
                {'('}
                {this.state.app && this.state.app.code}
                {')'}
              </span>
            </div>
          </div>
          <div>
            <div className="deployApp-title">
              <span className="deployApp-title-text">
                {'版本：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.app && this.state.app.name}
              <span className="deployApp-value">
                {'('}
                {this.state.app && this.state.app.code}
                {')'}
              </span>
            </div>
          </div>
          {/* <div>
            <div className="deployApp-title">
              <Icon type="version" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_three_version' })}
                {'：'}
              </span>
            </div>
            <div className="deployApp-text">{this.state.versionDto && this.state.versionDto.version}</div>
          </div>
          <div>
            <div className="deployApp-title">
              <Icon type="donut_large" />
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_one_env_title' })}
                {'：'}
              </span>
            </div>
            <div className="deployApp-text">
              {this.state.envDto && this.state.envDto.name}
              <span className="deployApp-value">
                {'('}
                {this.state.envDto && this.state.envDto.code}
                {')'}
              </span>
            </div>
          </div>
          */}
          <div>
            <div className="deployApp-title">
              {/* <Icon type="description" /> */}
              <span className="deployApp-title-text">
                {formatMessage({ id: 'autoteststep_two_config' })}
                {'：'}
              </span>
            </div>
          </div>
          {data && (
            <div>
              {<YamlEditor
                options={options}
                newLines={data.newLines}
                readOnly={this.state.current === 3}
                value={data.yaml}
                highlightMarkers={data.highlightMarkers}
              />}
            </div>
          )}
        </section>
        <section className="deployApp-section">
          <Button type="primary" funcType="raised" disabled={!(app && appVersionId && envId && mode)} onClick={this.handleDeploy} loading={this.state.loading}>{formatMessage({ id: 'autotestbtn_autotest' })}</Button>
       
          <Button funcType="raised" onClick={CreateAutoTestStore.preStep}>{formatMessage({ id: 'previous' })}</Button>
          <Button funcType="raised" className="c7ntest-autotest-clear" onClick={() => { CreateAutoTestStore.toStep(1); }}>{formatMessage({ id: 'cancel' })}</Button>
        </section>
      </section>
    );
  }
}

export default ConfirmInfo;
