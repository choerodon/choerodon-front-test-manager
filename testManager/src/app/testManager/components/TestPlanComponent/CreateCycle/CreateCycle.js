import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker, 
} from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { getProjectVersion } from '../../../api/agileApi';
import { addCycle } from '../../../api/cycleApi';
import { getProjectName } from '../../../common/utils';

const { Option } = Select;
const FormItem = Form.Item;
const { Sidebar } = Modal;
class CreateCycle extends Component {
  state = {
    versions: [],
    selectLoading: false,
    loading: false,
  }

  componentWillReceiveProps(nextProps) {
    const { resetFields } = this.props.form;
    if (this.props.visible === false && nextProps.visible === true) {
      resetFields();
    }
  }

  onOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;
        addCycle({
          ...values,
          ...{
            type: 'cycle',
            fromDate: fromDate ? fromDate.startOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
            toDate: toDate ? toDate.endOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
          },
        }).then((res) => {
          if (res.failed) {
            Choerodon.prompt('同名循环已存在');
          } else {
            this.props.onOk();
          }
          this.setState({ loading: false });
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });
      }
    });
  }

  getProjectVersion = () => {
    this.setState({
      selectLoading: true,
    });
    getProjectVersion().then((versions) => {
      this.setState({
        versions,
        selectLoading: false,
      });
    });
  }

  disabledStartDate = (startValue) => { 
    const { getFieldValue } = this.props.form;
    const endValue = getFieldValue('toDate');
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();   
  }

  disabledEndDate = (endValue) => {
    const { getFieldValue } = this.props.form;
    const startValue = getFieldValue('fromDate'); 
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  render() {
    const {
      visible, onOk, onCancel, type, 
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { versions, loading, selectLoading } = this.state;
    const options = versions.map(version => (
      <Option value={version.versionId} key={version.versionId}>
        {version.name}
      </Option>
    ));
    return (
      <div>
        <Sidebar
          title={<FormattedMessage id="cycle_create_title" />}
          visible={visible}
          onOk={this.onOk}
          onCancel={onCancel}
        >
          <Content
            style={{
              padding: '0 0 10px 0',
            }}
            title={<FormattedMessage id="cycle_create_content_title" values={{ name: getProjectName() }} />}
            description={<FormattedMessage id="cycle_create_content_description" />}
            link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/create-cycle/"
          >
            <Spin spinning={loading}>
              <Form>
                <FormItem>
                  {getFieldDecorator('versionId', {
                    rules: [{
                      required: true, message: '请选择版本!',
                    }],
                  })(
                    <Select
                      loading={selectLoading}
                      onFocus={this.getProjectVersion}
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label={<FormattedMessage id="version" />}
                    >
                      {options}
                    </Select>,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('cycleName', {
                    rules: [{
                      required: true, message: '请输入名称!',
                    }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="name" />} />,                  
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('description', {                  
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="comment" />} />,                  
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('build', {          
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="cycle_build" />} />,                  
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('environment', {                
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="cycle_environment" />} />,                  
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('fromDate', {
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabledDate={this.disabledStartDate}
                      style={{ width: 500 }}
                      label={<FormattedMessage id="cycle_startTime" />}
                    />,                    
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('toDate', {
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      label={<FormattedMessage id="cycle_endTime" />}
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}
                    />,                    
                  )}
                </FormItem>
              </Form>
            </Spin>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

CreateCycle.propTypes = {

};

export default Form.create()(CreateCycle);
