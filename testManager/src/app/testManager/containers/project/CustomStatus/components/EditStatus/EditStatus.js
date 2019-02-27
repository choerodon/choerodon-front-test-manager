/*
 * @Author: LainCarl 
 * @Date: 2019-01-25 11:37:12 
 * @Last Modified by: LainCarl
 * @Last Modified time: 2019-01-25 13:51:42
 * @Feature: 编辑状态侧边栏 
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { CompactPicker } from 'react-color';
import './EditStatus.scss';
import { getProjectName } from '../../../../../common/utils';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const defaultProps = {

};

const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  initValue: PropTypes.shape({}).isRequired,
  onCheckStatusRepeat: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
class EditStatus extends Component {
  state = {
    pickShow: false,
    statusColor: '',
    colorRepeat: null,
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

  handleColorChange = (color) => {
    const {
      r, g, b, a,
    } = color.rgb;
    const statusColor = `rgba(${r},${g},${b},${a})`;
    const { statusType } = this.props.initValue;
    this.props.onCheckStatusRepeat({ statusType, statusColor })(null, null, this.handleColorRepeat);
    this.setState({ statusColor });
  }

  handleCheckStatusRepeat = (...args) => { 
    const { getFieldValue } = this.props.form;
    const statusName = getFieldValue('statusName');    
    const { statusType, statusId } = this.props.initValue;
    this.props.onCheckStatusRepeat({ statusId, statusName, statusType })(...args);
  }

  handleColorRepeat=(errorMessage) => {
    this.setState({
      colorRepeat: errorMessage,
    });
  }

  handleOk = () => {
    const { statusColor, colorRepeat } = this.state;
    const { initValue, onSubmit } = this.props;

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err && !colorRepeat) {
        onSubmit({
          ...initValue,
          ...values,
          ...{ statusColor },
        });
      }
    });
  }

  render() {
    const {
      visible, onCancel, loading, initValue,
    } = this.props;
    const { statusColor, pickShow, colorRepeat } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Sidebar
          title={`编辑“${initValue.statusType === 'CYCLE_CASE' ? '执行' : '步骤'}”状态`}
          visible={visible}
          onOk={this.handleOk}
          onCancel={onCancel}
          confirmLoading={loading}
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
                  }, {
                    validator: this.handleCheckStatusRepeat,
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

              <div role="none" className="c7ntest-EditStatus-color-picker-container" onClick={e => e.stopPropagation()}>
                <FormattedMessage id="color" />
                {'：'}
                <div
                  className="c7ntest-EditStatus-color-picker-show"
                  role="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({ pickShow: true });
                  }}
                >
                  <div style={{ background: statusColor }}>
                    <div className="c7ntest-EditStatus-color-picker-show-rec-con">
                      <div className="c7ntest-EditStatus-color-picker-show-rec" />
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
                  <CompactPicker
                    color={statusColor}
                    onChangeComplete={this.handleColorChange}
                  />
                </div>
              </div>
              <div className="ant-form-explain" style={{ color: '#d50000', marginTop: 2 }}>
                {colorRepeat}
              </div>
            </Form>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

EditStatus.propTypes = propTypes;
EditStatus.defaultProps = defaultProps;
export default Form.create()(EditStatus);
