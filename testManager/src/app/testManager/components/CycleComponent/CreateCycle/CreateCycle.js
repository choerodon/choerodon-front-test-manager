import React, { Component } from 'react';
import { Form, Input, Select, Button, Icon, Modal, Upload, Spin, DatePicker } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
// import './CreateCycle.less';
import { getProjectVersion } from '../../../api/agileApi';
import { addCycle } from '../../../api/cycleApi';

const Option = Select.Option;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;

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
            fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
            toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
          }, 
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
  loadVersions=() => {
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
  render() {
    const { visible, onOk, onCancel, type } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { versions, loading, selectLoading } = this.state;
    const options = versions.map(version => 
      (<Option value={version.versionId} key={version.versionId}>     
        {version.name}     
      </Option>));
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
              description="您可以在一个版本中创建一个测试循环。"
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
                      loading={selectLoading}
                      onFocus={this.loadVersions}
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label="版本"                                   
                    >
                      {options}
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
                    <Input style={{ width: 500 }} maxLength={30} label="名称" />,
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
                    // rules: [{
                    //   required: true, message: '请输入说明!',
                    // }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label="说明" />,
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
                    // rules: [{
                    //   required: true, message: '请输入构建号!',
                    // }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label="构建号" />,
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
                    // rules: [{
                    //   required: true, message: '请输入环境!',
                    // }],
                  })(
                    <Input style={{ width: 500 }} maxLength={30} label="环境" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem >
                  {getFieldDecorator('fromDate', {
                    // rules: [{
                    //   required: true, message: '请选择日期!',
                    // }],
                  })(
                    <DatePicker 
                      format="YYYY-MM-DD"
                      style={{ width: 500 }} 
                      label="开始日期"
                    />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem >
                  {getFieldDecorator('toDate', {
                    // rules: [{
                    //   required: true, message: '请选择日期!',
                    // }],
                  })(
                    <DatePicker 
                      label="结束日期"
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}                       
                    />,
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
