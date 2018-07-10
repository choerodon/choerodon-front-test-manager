import React, { Component } from 'react';
import { Form, Input, Tabs, Select, Button, Icon, Modal, Upload, Spin } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
// import './CreateCycleExecute.less';
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;
function callback(key) {
  window.console.log(key);
}
const children = [];
for (let i = 10; i < 36; i += 1) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  window.console.log(`selected ${value}`);
}
class CreateCycleExecute extends Component {
  state = {
    loading: false,
    pickShow: false,
    statusColor: 'GRAY',
  }
  componentWillReceiveProps(nextProps) {
    const { resetFields } = this.props.form;
    if (this.props.visible === false && nextProps.visible === true) {
      resetFields();
    }
  }

  onOk = () => {
    const { statusColor } = this.state;
    const { onOk, type } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        window.console.log('Received values of form: ', {
          ...values,
          ...{ statusColor, statusType: type },
        });
        CreateCycleExecute({
          ...values,
          ...{ statusColor, statusType: type },
        }).then((data) => {
          this.setState({ loading: false });
          this.props.onOk();
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });
      }
    });
  }
  render() {
    const { visible, onOk, onCancel, type } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { pickShow, statusColor, loading } = this.state;
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
              title={'添加测试到文件夹“1.0”'}
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
                    onChange={handleChange}
                  >
                    {children}
                  </Select>
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
                          {children}
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
                          {children}
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
                          {children}
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
                          {children}
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
