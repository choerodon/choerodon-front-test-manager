import React, { Component } from 'react';
import { Form, Input, Select, Modal, Spin, DatePicker } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import moment from 'moment';
import { getProjectVersion } from '../../../api/agileApi';
import { editFolder } from '../../../api/cycleApi';

const Option = Select.Option;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;

class EditCycle extends Component {
    state = {
      versions: [],
      selectLoading: false,
      loading: false,      
    }
    componentWillReceiveProps(nextProps) {
      const { setFieldsValue } = this.props.form;
      if (this.props.visible === false && nextProps.visible === true) {
        const {
          versionId,
          title, 
          description, 
          build, 
          environment, 
          fromDate, 
          toDate,
        } = nextProps.initialValue;
        setFieldsValue({
          versionId,
          cycleName: title, 
          description, 
          build, 
          environment, 
          fromDate: fromDate ? moment(fromDate) : null, 
          toDate: toDate ? moment(toDate) : null,         
        });
      }
    }

  onOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;        
        editFolder({ 
          ...values,
          ...{
            type: 'cycle',
            fromDate: fromDate.format('YYYY-MM-DD HH:mm:ss'),
            toDate: toDate.format('YYYY-MM-DD HH:mm:ss'),
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
    const { visible, onCancel, initialValue } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { versions, loading, selectLoading } = this.state;
    const { versionId, title, description, build, environment, fromDate, toDate } = initialValue;
    const options = versions.map(version => 
      (<Option value={version.versionId} key={version.versionId}>     
        {version.name}     
      </Option>));
    return (
      <div onClick={() => { this.setState({ pickShow: false }); }} role="none">
        <Spin spinning={loading}>
          <Sidebar
            title="修改测试循环"
            visible={visible}
            onOk={this.onOk}
            onCancel={onCancel}
          >
            <Content
              style={{
                padding: '0 0 10px 0',
              }}
              title={`在项目“${AppState.currentMenuType.name}”中修改测试循环`}
              description="您可以为一个或多个成员分配一个或多个全局层的角色，即给成员授予全局层的权限。"
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
                      placeholder="版本"                  
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
                    <Input style={{ width: 500 }} placeholder="名称" maxLength={30} label="名称" />,
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
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('build', {                   
                    rules: [{
                      required: true, message: '请输入构建号!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="构建号" maxLength={30} label="构建号" />,
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
                    rules: [{
                      required: true, message: '请输入环境!',
                    }],
                  })(
                    <Input style={{ width: 500 }} placeholder="环境" maxLength={30} label="环境" />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('fromDate', {                    
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker 
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: 500 }} 
                      placeholder="开始日期" 
                    />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('toDate', {                   
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker 
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: 500 }} 
                      placeholder="结束日期"
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

EditCycle.propTypes = {

};

export default Form.create()(EditCycle);
