import React, { Component } from 'react';
import { Form, Input, Select, Icon, Modal, Upload, Spin } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import PropTypes from 'prop-types';
import { SketchPicker } from 'react-color';
import './CreateStatus.less';
import { createStatus } from '../../api/TestStatusApi';

const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const Option = Select.Option;
class CreateStatus extends Component {
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
    const { onOk } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        window.console.log('Received values of form: ', {
          ...values,
          ...{ statusColor },
        });
        createStatus({
          ...values,
          ...{ statusColor },
        }).then((res) => {
          if (res.failed) {
            Choerodon.prompt('状态或颜色不能相同');
          } else {
            onOk();
          }
          this.setState({ loading: false });
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });
      }
    });
  }
  render() {
    const { visible, onOk, onCancel, type } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { pickShow, statusColor, loading } = this.state;
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title={`创建“${getFieldValue('statusType') === 'CYCLE_CASE' ? '执行' : '步骤'}”状态`}
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={`在项目“${AppState.currentMenuType.name}”中创建执行状态`}
              description="您可以创建自定义状态，包括执行状态和步骤状态。"
              link="#"
            >
              <Form>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('statusType', {
                    initialValue: 'CYCLE_CASE',
                    rules: [{
                      required: true, message: '请选择类型!',
                    }],
                  })(
                    <Select label="类型" style={{ width: 500 }}>
                      <Option value="CYCLE_CASE">执行状态</Option>
                      <Option value="CASE_STEP">步骤状态</Option>
                    </Select>,
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('statusName', {
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
                  {getFieldDecorator('description', {
                    // rules: [{
                    //   required: true, message: '请输入说明!',
                    // }],
                  })(
                    <Input style={{ width: 500 }} placeholder="说明" maxLength={30} label="说明" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>

                <div className="c7n-CreateStatus-color-picker-container">
                  颜色：
                  <div
                    role="none"
                    style={{ width: 18, height: 18, background: statusColor, position: 'relative', border: '1px solid gray' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ pickShow: true });
                    }}
                  >
                    <div
                      style={pickShow ?
                        { display: 'block', position: 'absolute', bottom: 0, left: 20 } :
                        { display: 'none' }}
                    >
                      <SketchPicker
                        color={statusColor}
                        onChangeComplete={(color) => {
                          const { r, g, b, a } = color.rgb;
                          // window.console.log(color);
                          this.setState({ statusColor: `rgba(${r},${g},${b},${a})` });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Form>
            </Content>
          </Sidebar>
        </Spin>
      </div>
    );
  }
}

CreateStatus.propTypes = {

};

export default Form.create()(CreateStatus);
