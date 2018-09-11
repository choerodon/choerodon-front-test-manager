import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker,
} from 'choerodon-ui';
import { observer } from 'mobx-react';

import moment from 'moment';
import { Content, stores } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { addFolder } from '../../../api/cycleApi';
import { getFoldersByVersion } from '../../../api/IssueApi';
import TestPlanStore from '../../../store/project/TestPlan/TestPlanStore';

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


  onOk = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // this.setState({ loading: true });
        window.console.log('Received values of form: ', values);
        const { fromDate, toDate } = values;
        const { cycleName, cycleId, versionId } = TestPlanStore.CurrentEditStage;
        // addFolder({
        //   ...values,          
        //   parentCycleId: cycleId,
        //   versionId,        
        //   type: 'folder',
        //   fromDate: fromDate ? fromDate.format('YYYY-MM-DD HH:mm:ss') : null,
        //   toDate: toDate ? toDate.format('YYYY-MM-DD HH:mm:ss') : null,

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

  disabledDate = (current) => {
    // Can not select days before today and today

    const disabled = current < moment().startOf('day');
    // console.log(disabled);
    return disabled;
  }

  render() {
    const visible = TestPlanStore.EditStageVisible;
    const {
      title, description, versionId, fromDate, toDate, folderId,
    } = TestPlanStore.CurrentEditStage;
    const { getFieldDecorator } = this.props.form;
    const { folders, loading, selectLoading } = this.state;
    const options = folders.map(folder => (
      <Option value={folder.folderId} key={folder.folderId}>
        {folder.name}
      </Option>
    ));
    return (
      <div>
        <Spin spinning={loading}>
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
              // description={<FormattedMessage id="testPlan_EditStageIn" values={{ title }} />}
              // link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/create-cycle/"
            >
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
                      disabledDate={this.disabledDate}
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

EditStage.propTypes = {

};

export default Form.create()(EditStage);
