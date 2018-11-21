import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, Icon, 
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { SketchPicker } from 'react-color';
import './CreateStatus.scss';
import { createStatus } from '../../../api/TestStatusApi';
import { getProjectName } from '../../../common/utils';

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
    const {
      visible, onOk, onCancel, type, 
    } = this.props;
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
              title={<FormattedMessage id="status_side_content_title" values={{ name: getProjectName() }} />}
              description={<FormattedMessage id="status_side_content_description" />}
              link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/setting/status/"
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
                    <Select label={<FormattedMessage id="type" />} style={{ width: 500 }}>
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
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="status" />} />,
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
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="comment" />} />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>

                <div role="none" className="c7ntest-CreateStatus-color-picker-container" onClick={e => e.stopPropagation()}>
                  <FormattedMessage id="color" />
                  {'：'}
                  <div
                    className="c7ntest-CreateStatus-color-picker-show"
                    role="none"
                    // style={{ background: statusColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ pickShow: true });
                    }}
                  >            
                    <div style={{ background: statusColor }}>
                      <div className="c7ntest-CreateStatus-color-picker-show-rec-con">
                        <div className="c7ntest-CreateStatus-color-picker-show-rec" />
                      </div>
                    </div>
                  </div>
                  <div
                    style={pickShow
                      ? {
                        display: 'block', position: 'absolute', bottom: 20, left: 60, 
                      }
                      : { display: 'none' }}
                  >
                    <SketchPicker
                      color={statusColor}
                      onChangeComplete={(color) => {
                        const {
                          r, g, b, a, 
                        } = color.rgb;
                        // window.console.log(color);
                        this.setState({ statusColor: `rgba(${r},${g},${b},${a})` });
                      }}
                    />
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
