import React, { Component } from 'react';
import {
  Form, Input, Modal, Spin,
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { SketchPicker } from 'react-color';
import './EditStatusSide.scss';
import { editStatus } from '../../../api/TestStatusApi';
import { getProjectName } from '../../../common/utils';

const FormItem = Form.Item;
const { Sidebar } = Modal;

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
    const {
      visible, onCancel, type,
    } = this.props;
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
              title={<FormattedMessage id="status_side_edit_content_title" values={{ name: getProjectName() }} />}
              description={<FormattedMessage id="status_side_edit_content_description" />}
              link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/setting/status/"
            >
              <Form>
                <FormItem>
                  {getFieldDecorator('statusName', {
                    rules: [{
                      required: true, message: '请输入状态!',
                    }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="status" />} />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('description', {
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="comment" />} />,

                  )}
                </FormItem>

                <div role="none" className="c7ntest-EditStatusSide-color-picker-container" onClick={e => e.stopPropagation()}>
                  <FormattedMessage id="color" />
                  {'：'}
                  <div
                    className="c7ntest-EditStatusSide-color-picker-show"
                    role="none"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ pickShow: true });
                    }}
                  >
                    <div style={{ background: statusColor }}>
                      <div className="c7ntest-EditStatusSide-color-picker-show-rec-con">
                        <div className="c7ntest-EditStatusSide-color-picker-show-rec" />
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

EditStatusSide.propTypes = {

};

export default Form.create()(EditStatusSide);
