import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker,
} from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import moment from 'moment';
import { observer } from 'mobx-react';
import { getProjectVersion } from '../../../api/agileApi';
import { editFolder } from '../../../api/cycleApi';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';

const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;

@observer
class EditCycle extends Component {
  state = {
    versions: [],
    selectLoading: false,
    loading: false,
  }

  onCancel=() => {
    TestPlanStore.ExitEditCycle();
  }

  onOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        // window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;
        const initialValue = TestPlanStore.CurrentEditCycle;
        editFolder({
          ...values,
          ...{
            cycleId: initialValue.cycleId,
            type: 'cycle',
            fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
            toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
          },
        }).then((res) => {
          if (res.failed) {
            Choerodon.prompt('同名循环已存在');
          } else {
            TestPlanStore.getTree();
            TestPlanStore.ExitEditCycle();
          }
          this.setState({ loading: false });
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });
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

  disabledStartDate = (startValue) => { 
    const { getFieldValue } = this.props.form;
    const endValue = getFieldValue('toDate');
    const children = TestPlanStore.CurrentEditCycle.children || [];
    // 子元素最小的时间
    const starts = children.map(child => moment(child.fromDate));
    // console.log(starts, moment.min(starts), endValue.format('YYYYMMDD'));
    // console.log(startValue, endValue);
    // moment.max(a, b);
    if (!startValue || !endValue) {
      return false;
    }
    if (children.length > 0) {
      return startValue.valueOf() > endValue.valueOf() || startValue > moment.min(starts);   
    } else {
      return startValue.valueOf() > endValue.valueOf();
    }
  }

  disabledEndDate = (endValue) => {
    const { getFieldValue } = this.props.form;
    const startValue = getFieldValue('fromDate'); 
    const children = TestPlanStore.CurrentEditCycle.children || [];
    // 子元素最小的时间
    const ends = children.map(child => moment(child.toDate));
    if (!endValue || !startValue) {
      return false;
    }
    if (children.length > 0) {
      return endValue.valueOf() <= startValue.valueOf() || endValue < moment.max(ends);
    } else {
      return endValue.valueOf() <= startValue.valueOf();
    }   
  }

  render() {
    const visible = TestPlanStore.EditCycleVisible;
    const { getFieldDecorator } = this.props.form;
    const { versions, loading, selectLoading } = this.state;
    const {
      versionId, title, description, build, environment, fromDate, toDate,
    } = TestPlanStore.CurrentEditCycle;
    const options = versions.map(version => (
      <Option value={version.versionId} key={version.versionId}>
        {version.name}
      </Option>
    ));
    return (
      <div>
        
        <Sidebar
          destroyOnClose
          title="修改测试循环"
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <Content
            style={{
              padding: '0 0 10px 0',
            }}
            title={`在项目“${AppState.currentMenuType.name}”中修改测试循环`}
            description="您可以更改一个测试循环的具体信息。"
            link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/"
          >
            <Spin spinning={loading}>
              <Form>
                {/* <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('versionId', {
                    initialValue: versionId,
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
                </FormItem> */}
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('cycleName', {
                    initialValue: title,
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
                    initialValue: description,
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
                    initialValue: build,
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
                    initialValue: environment,
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
                <FormItem>
                  {getFieldDecorator('fromDate', {
                    initialValue: moment(fromDate),
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}
                      label="开始日期"
                    />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('toDate', {
                    initialValue: moment(toDate),
                    rules: [{
                      required: true, message: '请选择日期!',
                    }],
                  })(
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}
                      label="结束日期"
                    />,
                    // <div style={{ width: 500 }}>
                    //   <TextArea maxLength={30} label="说明" placeholder="说明" autosize />
                    // </div>
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

EditCycle.propTypes = {

};

export default Form.create()(EditCycle);
