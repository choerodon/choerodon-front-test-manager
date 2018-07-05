import React, { Component } from 'react';
import { Form, Input, Button, Icon, Modal, Upload } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';
import './EditStatusSide.less';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;
class EditStatusSide extends Component {
  state = {
    color: '',
  }
  onOk = () => {
    const { color } = this.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        window.console.log('Received values of form: ', { ...values, ...{ color } });
      }
    });
  }
  render() {
    const { visible, onOk, onCancel } = this.props;
    const { status } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title={`编辑“${'执行'}”状态`}
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={`在项目“${'测试项目'}”中创建执行状态`}
          description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
          link="#"
        >
          <Form>
            <FormItem
              // {...formItemLayout}
              label={null}
            >
              {getFieldDecorator('status', {
                rules: [{
                  required: true, message: '请输入状态!',
                }],
              })(
                <Input style={{ width: 500 }} placeholder="状态" maxLength={30} label="状态" />,
              )}
            </FormItem>
            <FormItem
              // {...formItemLayout}
              label={null}
            >
              {getFieldDecorator('comment', {
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

            <div className="c7n-EditStatusSide-color-picker-container">
              颜色：<ColorPicker
                color={'#36c'}
                alpha={30}
                onClose={(color) => { this.setState({ color }); }}
                placement="topLeft"
                className="c7n-EditStatusSide-color-picker"
              >
                <span className="rc-color-picker-trigger" />
              </ColorPicker>
            </div>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

EditStatusSide.propTypes = {

};

export default Form.create()(EditStatusSide);
