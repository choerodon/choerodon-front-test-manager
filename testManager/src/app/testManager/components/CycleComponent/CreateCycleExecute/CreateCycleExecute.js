import React, { Component } from 'react';
import { Form, Input, Tabs, Select, Radio, Button, Icon, Modal, Spin } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import { createCycleExecute } from '../../../../api/cycleApi';
import { getUsers } from '../../../../api/CommonApi';
import { getIssueList } from '../../../../api/agileApi';
// import './CreateCycleExecute.less';
const { AppState } = stores;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
function callback(key) {
  window.console.log(key);
}
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
};
function handleChange(value) {
  window.console.log(`selected ${value}`);
}
class CreateCycleExecute extends Component {
  state = {
    value: 1,
    loading: false,
    issueList: [],
    selectIssueList: [],
    userList: [],
    selectLoading: false,
    assignedTo: AppState.userInfo.id,
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
    const fin = selectIssueList.map((issueId, i) => {
      if (i === 0) {
        return {
          lastRank: rank,
          cycleId,
          issueId,
          assignedTo,
        };
      }
      return {
        cycleId,
        issueId,
        assignedTo,
      };
    });
    window.console.log(fin);
    createCycleExecute(fin).then((res) => {
      onOk();
    });
    // this.props.form.validateFieldsAndScroll((err, values) => {
    //   if (!err) {
    //     this.setState({ loading: true });
    //     window.console.log('Received values of form: ', values);
    //     CreateCycleExecute({
    //       ...values,
    //       ...{ statusColor, statusType: type },
    //     }).then((data) => {
    //       this.setState({ loading: false });
    //       this.props.onOk();
    //     }).catch(() => {
    //       Choerodon.prompt('网络异常');
    //       this.setState({ loading: false });
    //     });
    //   }
    // });
  }
  handleAssignedChange=(assignedTo) => {
    window.console.log(assignedTo);
    this.setState({
      assignedTo,
    });
  }
  handleIssueChange=(selectIssueList) => {
    this.setState({
      selectIssueList,
    });
  }
  render() {
    const { visible, onOk, onCancel, data } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { loading, userList, issueList, assignedTo, selectLoading, selectIssueList } = this.state;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    const userOptions = userList.map(user =>
      (<Option key={user.id} value={user.id}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          <div style={styles.userOption}>
            {user.imageUrl ? <img src={user.imageUrl} alt="" /> : user.realName.slice(0, 1)}
          </div>
          <span>{`${user.loginName} ${user.realName}`}</span>
        </div>
      </Option>),
    );
    const issueOptions = 
    issueList.map(issue => (<Option key={issue.issueId} value={issue.issueId.toString()}>
      {issue.issueNum} {issue.summary}
    </Option>));
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title="添加测试执行"
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={`添加测试执行到${data.type === 'cycle' ? '测试循环' : '文件夹'}“${data.title}”`}
              description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
              link="#"
            >
              <Tabs defaultActiveKey="1" onChange={callback}>
                <TabPane tab="从问题添加" key="1">
                  <Select
                    mode="tags"
                    style={{ width: 500, margin: '0 0 10px 0' }}
                    label="测试问题"
                    placeholder="测试问题"
                    value={selectIssueList}
                    onChange={this.handleIssueChange}
                    loading={selectLoading}
                    onFocus={() => {               
                      this.setState({
                        selectLoading: true,
                      });
                      getIssueList().then((issueData) => {
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
                    <Radio style={radioStyle} value={1}>我</Radio>
                    <Radio style={radioStyle} value={2}>其他</Radio> 
                  </RadioGroup><br />
                  {this.state.value === 2 ? 
                    <Select
                      allowClear                 
                      loading={selectLoading}                      
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label="选择指派人"
                      placeholder="选择指派人"                   
                      onChange={this.handleAssignedChange}
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
                <TabPane tab="从其他循环添加" key="2">
                  <Form>
                    <FormItem>
                      {getFieldDecorator('statusName', {
                        rules: [{
                          required: true, message: '请输入状态!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label="版本"
                          placeholder="版本"
                          onChange={handleChange}
                        >
                          {/* {children} */}
                        </Select>,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('description', {
                        rules: [{
                          required: true, message: '请输入说明!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label="测试循环"
                          placeholder="测试循环"
                          onChange={handleChange}
                        >
                          {/* {children} */}
                        </Select>,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('description', {
                        rules: [{
                          required: true, message: '请输入说明!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label="测试文件夹"
                          placeholder="测试文件夹"
                          onChange={handleChange}
                        >
                          {/* {children} */}
                        </Select>,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('description', {
                        rules: [{
                          required: true, message: '请输入说明!',
                        }],
                      })(
                        <Select
                          style={{ width: 500, margin: '0 0 10px 0' }}
                          label="测试循环"
                          placeholder="测试循环"
                          onChange={handleChange}
                        >
                          {/* {children} */}
                        </Select>,
                      )}
                    </FormItem>
                  </Form>
                </TabPane>

              </Tabs>

            </Content>
          </Sidebar>
        </Spin>
      </div>
    );
  }
}

CreateCycleExecute.propTypes = {

};

export default Form.create()(CreateCycleExecute);
