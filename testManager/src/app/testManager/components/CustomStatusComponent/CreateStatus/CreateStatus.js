/*
 * @Author: LainCarl 
 * @Date: 2019-01-25 11:36:56 
 * @Last Modified by:   LainCarl 
 * @Last Modified time: 2019-01-25 11:36:56 
 * @Feature: 创建状态侧边栏
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Form, Input, Select, Modal, Spin, 
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { CompactPicker } from 'react-color';
import './CreateStatus.scss';
import { getProjectName } from '../../../common/utils';

const FormItem = Form.Item;
const { Sidebar } = Modal;
const Option = Select.Option;
const defaultProps = {
 
};

const propTypes = {
  visible: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
class CreateStatus extends PureComponent {
  state = {
    pickShow: false,
    statusColor: 'GRAY',
  }

  componentWillReceiveProps(nextProps) {
    const { resetFields } = this.props.form;
    if (this.props.visible === false && nextProps.visible === true) {
      resetFields();
    }
  }

  handleOk = () => {
    const { statusColor } = this.state;
    const { onSubmit } = this.props;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onSubmit({
          ...values,
          ...{ statusColor },
        });
      }
    });
  }

  render() {
    const {
      visible, onCancel, loading,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { pickShow, statusColor } = this.state;
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title={`创建“${getFieldValue('statusType') === 'CYCLE_CASE' ? '执行' : '步骤'}”状态`}
            visible={visible}
            onOk={this.handleOk}
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
                <FormItem>
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

                <div role="none" className="c7ntest-CreateStatus-color-picker-container" onClick={e => e.stopPropagation()}>
                  <FormattedMessage id="color" />
                  {'：'}
                  <div
                    className="c7ntest-CreateStatus-color-picker-show"
                    role="none"                  
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
                    <CompactPicker
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

CreateStatus.propTypes = propTypes;
CreateStatus.defaultProps = defaultProps;
export default Form.create()(CreateStatus);
