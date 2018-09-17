import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker,
} from 'choerodon-ui';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import moment from 'moment';
import { Content, stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { editFolder } from '../../../api/cycleApi';
import { getFoldersByVersion } from '../../../api/IssueApi';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';

// const { RangePicker } = DatePicker;
const { Option } = Select;
const { AppState } = stores;
const FormItem = Form.Item;
const { Sidebar } = Modal;
const { TextArea } = Input;

@observer
class EditStage extends Component {
  state = {
    folders: [],
    selectLoading: false,
    loading: false,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      this.loadFolders();
    }
  }

  onOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ loading: true });
        // window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;       
        const initialValue = TestPlanStore.CurrentEditStage;
        // console.log(toJS(initialValue));
        editFolder({
          ...values,
          ...{
            cycleId: initialValue.cycleId,
            type: 'folder',
            fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
            toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,
          },
        }).then((res) => {
          if (res.failed) {
            Choerodon.prompt('同名循环已存在');
          } else {
            TestPlanStore.getTree();
            TestPlanStore.ExitEditStage();
          }
          this.setState({ loading: false });
        }).catch(() => {
          Choerodon.prompt('网络异常');
          this.setState({ loading: false });
        });        
      }
    });
  }

  onCancel = () => {
    TestPlanStore.ExitEditStage();
  }

  loadFolders = () => {
    this.setState({
      selectLoading: true,
    });
    const { versionId } = TestPlanStore.CurrentEditStage;
    getFoldersByVersion(versionId).then((folders) => {
      this.setState({
        folders,
        selectLoading: false,
      });
    });
  }

  disabledStartDate = (startValue) => {
    const { parentTime } = TestPlanStore.CurrentEditStage;
    const { start, end } = parentTime;    
    const { getFieldValue } = this.props.form;
    const endValue = getFieldValue('toDate');
    if (!startValue || !endValue) {
      return startValue < moment(start).startOf('day') 
    || startValue > moment(end).endOf('day');
    }
    return startValue.valueOf() > endValue.valueOf() 
    || startValue < moment(start).startOf('day') 
    || startValue > moment(end).endOf('day');
  }

  disabledEndDate = (endValue) => {
    const { parentTime } = TestPlanStore.CurrentEditStage;
    const { start, end } = parentTime;    
    const { getFieldValue } = this.props.form;
    const startValue = getFieldValue('fromDate'); 
    if (!endValue || !startValue) {
      return endValue < moment(start).startOf('day') 
      || endValue > moment(end).endOf('day');
    }
    return endValue.valueOf() <= startValue.valueOf()
    || endValue < moment(start).startOf('day') 
    || endValue > moment(end).endOf('day');
  }


  render() {
    const { visible } = this.props;
    const { 
      parentTime,
      title, description, versionId, fromDate, toDate, folderId,
    } = TestPlanStore.CurrentEditStage;
    // console.log(parentTime);
    const { getFieldDecorator } = this.props.form;
    const { folders, loading, selectLoading } = this.state;
    const options = folders.map(folder => (
      <Option value={folder.folderId} key={folder.folderId}>
        {folder.name}
      </Option>
    ));
    return (
      <div>
        <Sidebar
          destroyOnClose
          title={<FormattedMessage id="testPlan_EditStage_title" />}
          visible={visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
        >
          <Content
            style={{
              padding: '0 0 10px 0',
            }}
            title={<FormattedMessage id="testPlan_EditStage" values={{ cycleName: title }} />}
          >
            <Spin spinning={loading}>
              <Form>
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
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="name" />} />,
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
                    <Input style={{ width: 500 }} maxLength={30} label={<FormattedMessage id="comment" />} />,
                  )}
                </FormItem>
                <FormItem
                  // {...formItemLayout}
                  label={null}
                >
                  {getFieldDecorator('folderId', {
                    initialValue: folderId,
                    rules: [{
                      required: true, message: '请选择文件夹!',
                    }],
                  })(
                    <Select
                      disabled
                      loading={selectLoading}
                      onFocus={this.loadFolders}
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label={<FormattedMessage id="testPlan_linkFolder" />}
                    >
                      {options}
                    </Select>,
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
                      format="YYYY-MM-DD"
                      disabledDate={this.disabledStartDate}
                      style={{ width: 500 }}
                      label={<FormattedMessage id="cycle_startTime" />}
                    />,
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
                      label={<FormattedMessage id="cycle_endTime" />}
                      format="YYYY-MM-DD"
                      style={{ width: 500 }}
                    />,
                  )}
                </FormItem>
                {/* <RangePicker
                  format="YYYY-MM-DD" 
                  disabledDate={this.disabledDate}
                  label={<FormattedMessage id="cycle_endTime" />}
                /> */}
              </Form>
            </Spin>
          </Content>
        </Sidebar>
      </div>
    );
  }
}

EditStage.propTypes = {

};

export default Form.create()(EditStage);
