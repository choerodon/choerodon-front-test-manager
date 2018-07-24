import React, { Component } from 'react';
import { Form, Input, Modal, Spin } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { SketchPicker } from 'react-color';
import './EditStatusSide.less';
import { editStatus } from '../../api/TestStatusApi';

const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;
class EditStatusSide extends Component {
  state = {
    pickShow: false,
    statusColor: '',
    loading: false,
  }
  componentWillReceiveProps(nextProps) {
    const { setFieldsValue } = this.props.form;
    if (this.props.visible === false && nextProps.visible === true) {
      const { statusName, description, statusColor } = nextProps.initValue;
      setFieldsValue({ statusName, description });
      this.setState({
        statusColor,
      });
    }
  }
  
  onOk = () => {
    const { statusColor } = this.state;
    // window.console.log(statusColor);
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        const { initValue, onOk } = this.props;
        editStatus({
          ...initValue,
          ...values,
          ...{ statusColor },
        }).then((data) => {
          this.setState({ loading: false });
          onOk();
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });       
      }
    });
  }
  render() {
    const { visible, onOk, onCancel, type } = this.props;
    const { statusColor, loading, pickShow } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title={`编辑“${type === 'CYCLE_CASE' ? '执行' : '步骤'}”状态`}
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >        
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={<FormattedMessage id="status_side_edit_content_title" />}
              description={<FormattedMessage id="status_side_edit_content_description" />}
              link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/setting/status/"
            >
              <Form>
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

                <div className="c7n-EditStatusSide-color-picker-container">
                  <FormattedMessage id="color" />：
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

EditStatusSide.propTypes = {

};

export default Form.create()(EditStatusSide);
