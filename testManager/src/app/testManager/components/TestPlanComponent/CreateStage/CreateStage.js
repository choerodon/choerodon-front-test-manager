import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker, 
} from 'choerodon-ui';
import moment from 'moment';
import { Content, stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { getProjectVersion } from '../../../api/agileApi';
import { addCycle } from '../../../api/cycleApi';

const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;

class CreateStage extends Component {
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
        // this.setState({ loading: true });
        window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;

        // addCycle({
        //   ...values,
        //   ...{
        //     type: 'folder',
        //     fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
        //     toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
        //   },
        // }).then((res) => {
        //   if (res.failed) {
        //     Choerodon.prompt('同名循环已存在');
        //   } else {
        //     this.props.onOk();
        //   }
        //   this.setState({ loading: false });
        // }).catch(() => {
        //   Choerodon.prompt('网络异常');
        //   this.setState({ loading: false });
        // });
      }
    });
  }

  loadVersions = () => {
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

  disabledDate=(current) => {
    // Can not select days before today and today
    
    const disabled = current < moment().startOf('day');
    // console.log(disabled);
    return disabled;
  }

  render() {
    const {
      visible, onOk, onCancel, CreateStageIn, 
    } = this.props;
    const { cycleName } = CreateStageIn;
    const { getFieldDecorator } = this.props.form;
    const { versions, loading, selectLoading } = this.state;
    const options = versions.map(version => (
      <Option value={version.versionId} key={version.versionId}>
        {version.name}
      </Option>
    ));
    return (
      <div>
        <Spin spinning={loading}>
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
              title={<FormattedMessage id="testPlan_createStage" />}
              description={<FormattedMessage id="testPlan_createStageIn" values={{ cycleName }} />}
              link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/create-cycle/"
            >
              <Form>                
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('cycleName', {
                    rules: [{
                      required: true, message: '请输入名称!',
                    }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="name" />} />,                    
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
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('folderId', {
                    rules: [{
                      required: true, message: '请选择文件夹!',
                    }],
                  })(
                    <Select
                      loading={selectLoading}
                      onFocus={this.loadVersions}
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label={<FormattedMessage id="testPlan_linkFolder" />}
                    >
                      {options}
                    </Select>,                    
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('fromDate', {
                    // rules: [{
                    //   required: true, message: '请选择日期!',
                    // }],
                  })(
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabledDate={this.disabledDate}
                      style={{ width: 500 }}
                      label={<FormattedMessage id="cycle_startTime" />}
                    />,                   
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('toDate', {
                    // rules: [{
                    //   required: true, message: '请选择日期!',
                    // }],
                  })(
                    <DatePicker
                      label={<FormattedMessage id="cycle_endTime" />}
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}
                    />,                   
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

CreateStage.propTypes = {

};

export default Form.create()(CreateStage);
