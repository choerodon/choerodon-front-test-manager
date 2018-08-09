import React, { Component } from 'react';
import { Form, Tabs, Select, Radio, Collapse, Icon, Modal, Spin } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import { Content, stores } from 'choerodon-front-boot';
import {
  createCycleExecute, getCyclesByVersionId, getFoldersByCycleId,
  getStatusList, createCycleExecuteFromCycle,
} from '../../../api/cycleApi';
import { getUsers } from '../../../api/CommonApi';
import { getIssueList, getIssueStatus, getProjectVersion, getModules, getLabels, getPrioritys } from '../../../api/agileApi';
import './CreateCycleExecute.scss';

const { AppState } = stores;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const Option = Select.Option;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
const styles = {
  userOption: {
    background: '#c5cbe8',
    color: '#6473c3',
    width: '20px',
    height: '20px',
    textAlign: 'center',
    lineHeight: '20px',
    borderRadius: '50%',
    marginRight: '8px',
  },
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
};

class CreateCycleExecute extends Component {
  state = {
    tab: '1',
    value: 1,
    loading: false,
    issueList: [],
    selectIssueList: [],
    userList: [],
    selectLoading: false,
    assignedTo: AppState.userInfo.id,
    versions: [],
    cycleList: [],
    folderList: [],
    priorityList: [],
    statusList: [],
    issueStatusList: [],
    moduleList: [],
    labelList: [],
    hasIssue: 1,
  }

  componentWillReceiveProps(nextProps) {
    const { resetFields } = this.props.form;
    if (this.props.visible === false && nextProps.visible === true) {
      resetFields();
      this.setState({
        selectIssueList: [],
        assignedTo: AppState.userInfo.id,
      });
    }
  }

  onChange = (e) => {
    window.console.log('radio checked', e.target.value);
    this.setState({
      value: e.target.value,
    });
  }

  onOk = () => {
    const { selectIssueList, assignedTo } = this.state;
    const { onOk, type, data, rank } = this.props;
    const { cycleId } = data;
    if (this.state.tab === '1') {
      this.createFromIssue();
    } else {
      this.createFromCycle();
    }
  }
  modeChange = (key) => {
    this.setState({ tab: key });
  }
  createFromCycle = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        window.console.log('Received values of form: ', values);
        const { assignedTo, cycleId, folderId, priorityCode,
          executionStatus, component, lable, statusCode } = values;
        // const obj = {};
        // [].forEach((key) => {
        //   if (values[key]) {
        //     obj[key] = values.key;
        //   }
        // });
        const filter = {
          advancedSearchArgs: {
            // priorityCode: [
            //   'high',
            // ],
            // statusCode: [
            //   'todo',
            // ],
          },
          otherArgs: {
            // issueIds: [
            //   '7023',
            // ],
            // component: [
            //   '',
            // ],
            // lable: [
            //   '',
            // ],
          },
        };
        if (executionStatus) {
          filter.executionStatus = executionStatus.map(item => Number(item));
        }
        if (priorityCode) {
          filter.advancedSearchArgs.priorityCode = priorityCode;
        }
        if (statusCode) {
          filter.defectStatus = statusCode;
        }
        if (component) {
          filter.otherArgs.component = component;
        }
        if (lable) {
          filter.otherArgs.lable = lable;
        }
        createCycleExecuteFromCycle(folderId || cycleId, this.props.data.cycleId,
          assignedTo || AppState.userInfo.id,
          filter).then((res) => {
          if (res.failed) {
            Choerodon.prompt('当前实例已存在');
          } else {
            this.props.onOk();
          }
          this.setState({
            loading: false,
          });
        }).catch(() => {
          this.setState({
            loading: false,
          });
          Choerodon.prompt('网络错误');
        });
        // POST / v1 / projects / { project_id } / issues / test_component / no_sub;


        // {
        //     "advancedSearchArgs": {
        //         "priorityCode": [
        //             "high"
        //         ],
        //         "statusCode": [
        //             "todo"
        //         ]
        //     }, 
        //     "otherArgs": {
        //         "issueIds": [
        //             "7023"
        //         ],
        //         "component": [
        //             ""
        //         ],
        //         "lable": [
        //             ""
        //         ]
        //     }
        // }
        // { executionStatus, advancedSearchArgs: { typeCode: ['issue_test'], ...filter } }

        // CreateCycleExecute({
        //   ...values,
        //   ...{ statusColor, statusType: type },
        // }).then((data) => {
        //   this.setState({ loading: false });
        //   this.props.onOk();
        // }).catch(() => {
        //   Choerodon.prompt('网络异常');
        //   this.setState({ loading: false });
        // });
      }
    });
  }
  createFromIssue = () => {
    const { selectIssueList, assignedTo } = this.state;
    const { onOk, type, data, rank } = this.props;
    const { cycleId } = data;
    const fin = selectIssueList.map((issueId, i) => {
      if (i === 0) {
        return {
          lastRank: rank,
          cycleId,
          issueId: Number(issueId),
          assignedTo,
        };
      }
      return {
        cycleId,
        issueId: Number(issueId),
        assignedTo,
      };
    });
    window.console.log(fin);
    if (fin.length > 0) {
      createCycleExecute(fin).then((res) => {
        if (res.failed) {
          Choerodon.prompt('同一循环内不能存在相同测试用例');
        } else {
          onOk();
        }
      });
    } else {
      Choerodon.prompt('请选择问题');
    }
  }
  handleAssignedChange = (assignedTo) => {
    window.console.log(assignedTo);
    this.setState({
      assignedTo,
    });
  }
  handleIssueChange = (selectIssueList) => {
    this.setState({
      selectIssueList,
    });
  }
  loadVersions = () => {
    this.setState({
      selectLoading: true,
    });
    getProjectVersion().then((versions) => {
      this.setState({
        versions,
        selectLoading: false,
      });
    });
  }
  render() {
    const { visible, onOk, onCancel, data } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { loading, userList, issueList, assignedTo,
      selectLoading, selectIssueList, versions, tab, cycleList,
      folderList, priorityList, statusList, moduleList, labelList,
      hasIssue, issueStatusList } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const userOptions = userList.map(user =>
      (<Option key={user.id} value={user.id}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          {user.imageUrl ?
            <img src={user.imageUrl} alt="" style={{ width: 20, height: 20, borderRadius: '50%', marginRight: '8px' }} /> :
            <div style={styles.userOption}>{user.realName.slice(0, 1)}
            </div>
          }
          <span>{`${user.loginName} ${user.realName}`}</span>
        </div>
      </Option>),
    );
    const issueOptions =
      issueList.map(issue => (<Option key={issue.issueId} value={issue.issueId.toString()}>
        {issue.issueNum} {issue.summary}
      </Option>));
    const versionOptions = versions.map(version =>
      (<Option value={version.versionId} key={version.versionId}>
        {version.name}
      </Option>));
    const cycleOptions = cycleList.map(cycle =>
      (<Option value={cycle.cycleId} key={cycle.cycleId}>
        {cycle.cycleName}
      </Option>));
    const folderOptions = folderList.map(cycle =>
      (<Option value={cycle.cycleId} key={cycle.cycleId}>
        {cycle.cycleName}
      </Option>));
    const priorityOptions = priorityList.map((priority) => {
      const { valueCode, name } = priority;
      return (<Option value={valueCode} key={valueCode}>
        {/* <div style={{ ...styles.statusOption, ...{ background: statusColor } }}> */}
        {name}
        {/* </div> */}
      </Option>);
    });
    const statusOptions = statusList.map((status) => {
      const { statusName, statusId, statusColor } = status;
      return (<Option value={statusId.toString()} key={statusId}>
        {/* <div style={{ ...styles.statusOption, ...{ background: statusColor } }}> */}
        {statusName}
        {/* </div> */}
      </Option>);
    });
    const moduleOptions = moduleList.map((component) => {
      const { componentId, name } = component;
      return (<Option value={componentId.toString()} key={componentId}>
        {name}
      </Option>);
    });
    const labelOptions = labelList.map((label) => {
      const { labelId, labelName } = label;
      return (<Option value={labelId.toString()} key={labelId}>
        {labelName}
      </Option>);
    });
    const issueStatusOptions = issueStatusList.map((status) => {
      const { categoryCode, name } = status;
      return (<Option value={categoryCode} key={categoryCode}>
        {name}
      </Option>);
    });
    return (

      <Spin spinning={loading}>

        <Sidebar
          title={<FormattedMessage id="cycle_createExecute_title" />}
          visible={visible}
          onOk={this.onOk}
          onCancel={onCancel}
        >
          <Content
            style={{
              padding: '0 0 10px 0',
            }}
            title={
              <FormattedMessage
                id="cycle_createExecute_content_title"
                values={{
                  type: data.type === 'cycle' ? Choerodon.getMessage('测试循环', 'Cycle')
                    : Choerodon.getMessage('文件夹', 'Folder'),
                  title: data.title,
                }}
              />}
            description={<FormattedMessage id="cycle_createExecute_content_description" />}
            link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/add-execution/"
          >
            <Tabs activeKey={tab} onChange={this.modeChange}>
              <TabPane tab={<FormattedMessage id="cycle_createExecute_createFromQuestion" />} key="1">
                <Select
                  style={{ width: 500, margin: '0 0 10px 0' }}
                  label={<FormattedMessage id="cycle_createExecute_testQuestion" />}

                  value={selectIssueList}
                  onChange={this.handleIssueChange}
                  loading={selectLoading}
                  filter
                  mode="multiple"
                  filterOption={false}
                  onFilterChange={(value) => {
                    // window.console.log('filter');
                    this.setState({
                      selectLoading: true,
                    });
                    getIssueList(value, 'issue_test').then((issueData) => {
                      this.setState({
                        issueList: issueData.content,
                        selectLoading: false,
                      });
                    });
                  }}
                  onFocus={() => {
                    this.setState({
                      selectLoading: true,
                    });
                    getIssueList(null, 'issue_test').then((issueData) => {
                      this.setState({
                        issueList: issueData.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {issueOptions}
                </Select><br />
                <RadioGroup onChange={this.onChange} value={this.state.value}>
                  <Radio style={radioStyle} value={1}><FormattedMessage id="cycle_createExecute_me" /></Radio>
                  <Radio style={radioStyle} value={2}><FormattedMessage id="cycle_createExecute_others" /></Radio>
                </RadioGroup><br />
                {this.state.value === 2 ?
                  <Select
                    allowClear
                    loading={selectLoading}
                    style={{ width: 500, margin: '0 0 10px 0' }}
                    label={<FormattedMessage id="cycle_createExecute_selectAssign" />}
                    filter
                    filterOption={false}
                    onChange={this.handleAssignedChange}
                    onFilterChange={(value) => {
                      this.setState({
                        selectLoading: true,
                      });
                      getUsers(value).then((userData) => {
                        this.setState({
                          userList: userData.content,
                          selectLoading: false,
                        });
                      });
                    }}
                    onFocus={() => {
                      this.setState({
                        selectLoading: true,
                      });
                      getUsers().then((userData) => {
                        this.setState({
                          userList: userData.content,
                          selectLoading: false,
                        });
                      });
                    }}
                  >
                    {userOptions}
                  </Select>
                  :
                  null}
              </TabPane>
              <TabPane tab={<FormattedMessage id="cycle_createExecute_createFromCycle" />} key="2">
                <div className="c7n-create-execute">
                  <Form>
                    <FormItem>
                      {getFieldDecorator('versionId', {
                        rules: [{
                          required: true, message: '请输入状态!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label={<FormattedMessage id="version" />}

                          loading={selectLoading}
                          onFocus={this.loadVersions}
                        >
                          {versionOptions}
                        </Select>,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('cycleId', {
                        rules: [{
                          required: true, message: '请选择循环!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          loading={selectLoading}
                          label={<FormattedMessage id="cycle" />}

                          onFocus={() => {
                            if (getFieldValue('versionId')) {
                              getCyclesByVersionId(getFieldValue('versionId')).then((List) => {
                                this.setState({
                                  selectLoading: false,
                                  cycleList: List,
                                });
                              });
                            }
                          }}
                        >
                          {cycleOptions}
                        </Select>,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('folderId', {
                        // rules: [{
                        //   required: true, message: '请输入说明!',
                        // }],
                      })(
                        <Select
                          allowClear
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label={<FormattedMessage id="cycle_createExecute_folder" />}

                          onFocus={() => {
                            if (getFieldValue('cycleId')) {
                              getFoldersByCycleId(getFieldValue('cycleId')).then((List) => {
                                this.setState({
                                  selectLoading: false,
                                  folderList: List,
                                });
                              });
                            }
                          }}
                        >
                          {folderOptions}
                        </Select>,
                      )}
                    </FormItem>
                    <Collapse bordered={false} >
                      <Panel
                        header={
                          <div className="c7n-collapse-header-container">
                            <div>
                              {<FormattedMessage id="cycle_createExecute_assigned" />}
                            </div>
                            <div className="c7n-collapse-header-icon">
                              <Icon type="navigate_next" />
                            </div>
                          </div>
                        }
                        key="1"
                        showArrow={false}
                      >
                        <RadioGroup onChange={this.onChange} value={this.state.value}>
                          <Radio style={radioStyle} value={1}>
                            <FormattedMessage id="cycle_createExecute_me" />
                          </Radio>
                          <Radio style={radioStyle} value={2}>
                            <FormattedMessage id="cycle_createExecute_others" />
                          </Radio>
                        </RadioGroup>
                        {this.state.value === 2 ? <FormItem>
                          {getFieldDecorator('assignedTo', {
                            // rules: [{
                            //   required: true, message: '请输入说明!',
                            // }],
                          })(
                            <Select
                              allowClear
                              loading={selectLoading}
                              style={{ width: 500, margin: '0 0 10px 0' }}
                              label={<FormattedMessage id="cycle_createExecute_selectAssign" />}
                              filter
                              filterOption={false}
                              onFilterChange={(value) => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getUsers(value).then((userData) => {
                                  this.setState({
                                    userList: userData.content,
                                    selectLoading: false,
                                  });
                                });
                              }}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getUsers().then((userData) => {
                                  this.setState({
                                    userList: userData.content,
                                    selectLoading: false,
                                  });
                                });
                              }}
                            >
                              {userOptions}
                            </Select>,
                          )}
                        </FormItem> : null}
                      </Panel>
                    </Collapse>
                    <Collapse bordered={false} >
                      <Panel
                        header={
                          <div className="c7n-collapse-header-container">
                            <div><FormattedMessage id="cycle_createExecute_filter" /></div>
                            <div className="c7n-collapse-header-icon">
                              <Icon type="navigate_next" />
                            </div>
                          </div>
                        }
                        key="1"
                        showArrow={false}
                      >
                        <FormItem>
                          {getFieldDecorator('priorityCode', {

                          })(
                            <Select
                              mode="tags"
                              style={{ width: 500, margin: '0 0 10px 0' }}
                              loading={selectLoading}
                              label={<FormattedMessage id="cycle_createExecute_priority" />}

                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getPrioritys().then((priorityData) => {
                                  this.setState({
                                    priorityList: priorityData.lookupValues,
                                    selectLoading: false,
                                  });
                                });
                              }}
                            >
                              {priorityOptions}
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem>
                          {getFieldDecorator('executionStatus', {

                          })(
                            <Select
                              mode="tags"
                              style={{ width: 500, margin: '0 0 10px 0' }}
                              label={<FormattedMessage id="cycle_createExecute_executeStatus" />}
                              loading={selectLoading}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getStatusList('CYCLE_CASE').then((List) => {
                                  this.setState({
                                    statusList: List,
                                    selectLoading: false,
                                  });
                                });
                              }}
                            >
                              {statusOptions}
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem>
                          {getFieldDecorator('component', {

                          })(
                            <Select
                              mode="tags"
                              style={{ width: 500, margin: '0 0 10px 0' }}
                              label={<FormattedMessage id="cycle_createExecute_component" />}

                              loading={selectLoading}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getModules().then((List) => {
                                  this.setState({
                                    moduleList: List,
                                    selectLoading: false,
                                  });
                                });
                              }}
                            >
                              {moduleOptions}
                            </Select>,
                          )}
                        </FormItem>
                        <FormItem>
                          {getFieldDecorator('lable', {

                          })(
                            <Select
                              mode="tags"
                              style={{ width: 500, margin: '0 0 10px 0' }}
                              label={<FormattedMessage id="cycle_createExecute_label" />}

                              loading={selectLoading}
                              onFocus={() => {
                                this.setState({
                                  selectLoading: true,
                                });
                                getLabels().then((List) => {
                                  this.setState({
                                    labelList: List,
                                    selectLoading: false,
                                  });
                                });
                              }}
                            >
                              {labelOptions}
                            </Select>,
                          )}
                        </FormItem>
                        <FormattedMessage id="cycle_createExecute_hasDefects" /><br />
                        <RadioGroup
                          onChange={(e) => {
                            this.setState({ hasIssue: e.target.value });
                          }}
                          value={hasIssue}
                        >
                          <Radio style={radioStyle} value={1}>
                            <FormattedMessage id="cycle_createExecute_no" />
                          </Radio>
                          <Radio style={radioStyle} value={2}>
                            <FormattedMessage id="cycle_createExecute_yes" />
                          </Radio>
                        </RadioGroup>
                        {hasIssue === 2 ?
                          <FormItem>
                            {getFieldDecorator('statusCode', {
                              // rules: [{
                              //   required: true, message: '请输入说明!',
                              // }],
                            })(
                              <Select
                                mode="tags"
                                style={{ width: 500, margin: '0 0 10px 0' }}
                                label={<FormattedMessage id="cycle_createExecute_defectStatus" />}
                                loading={selectLoading}
                                onFocus={() => {
                                  this.setState({
                                    selectLoading: true,
                                  });
                                  getIssueStatus().then((List) => {
                                    this.setState({
                                      issueStatusList: List,
                                      selectLoading: false,
                                    });
                                  });
                                }}
                              >
                                {issueStatusOptions}
                              </Select>,
                            )}
                          </FormItem> : null}

                      </Panel>
                    </Collapse>

                  </Form>
                </div>
              </TabPane>

            </Tabs>

          </Content>
        </Sidebar>

      </Spin>

    );
  }
}

CreateCycleExecute.propTypes = {

};

export default Form.create()(CreateCycleExecute);
