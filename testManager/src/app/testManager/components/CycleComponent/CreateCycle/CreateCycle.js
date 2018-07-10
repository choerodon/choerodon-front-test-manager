import React, { Component } from 'react';
import { Form, Input, Select, Button, Icon, Modal, Upload, Spin, DatePicker } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
// import './CreateCycle.less';
// import { CreateCycle } from '../../../api/TestStatusApi';
const Option = Select.Option;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;
const children = [];
for (let i = 10; i < 36; i += 1) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function handleChange(value) {
  window.console.log(`selected ${value}`);
}
class CreateCycle extends Component {
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
        window.console.log('Received values of form: ', values);
        CreateCycle({
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
            title="创建测试循环"
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={`在项目“${AppState.currentMenuType.name}”中创建测试循环`}
              description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
              link="#"
            >
              <Form>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('versionId', {
                    rules: [{
                      required: true, message: '请选择版本!',
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
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('cycleName', {
                    rules: [{
                      required: true, message: '请输入名称!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="名称" maxLength={30} label="名称" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('description', {
                    rules: [{
                      required: true, message: '请输入说明!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="说明" maxLength={30} label="说明" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('build', {
                    rules: [{
                      required: true, message: '请输入构建号!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="构建号" maxLength={30} label="构建号" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('environment', {
                    rules: [{
                      required: true, message: '请输入环境!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="环境" maxLength={30} label="环境" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('fromDate', {
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker style={{ width: 500 }} placeholder="开始日期" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('toDate', {
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker style={{ width: 500 }} placeholder="结束日期" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
              </Form>
            </Content>
          </Sidebar>
        </Spin>
      </div>
    );
  }
}

CreateCycle.propTypes = {

};

export default Form.create()(CreateCycle);
