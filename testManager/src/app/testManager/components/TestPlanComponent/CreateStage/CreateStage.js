import React, { Component } from 'react';
import {
  Form, Input, Select, Modal, Spin, DatePicker, 
} from 'choerodon-ui';
import moment from 'moment';
import { Content } from 'choerodon-front-boot';
import { FormattedMessage } from 'react-intl';
import { addFolder } from '../../../api/cycleApi';
import { getFoldersByVersion } from '../../../api/IssueManageApi';

const { Option } = Select;
const FormItem = Form.Item;
const { Sidebar } = Modal;


class CreateStage extends Component {
  state = {
    folders: [],
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
        const { fromDate, toDate } = values;
        const { CreateStageIn } = this.props;
        const { cycleId, versionId } = CreateStageIn;
        addFolder({
          ...values,          
          parentCycleId: cycleId,
          versionId,        
          type: 'folder',
          fromDate: fromDate ? fromDate.startOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
          toDate: toDate ? toDate.endOf('day').format('YYYY-MM-DD HH:mm:ss') : null,
         
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

  loadFolders = () => {
    this.setState({
      selectLoading: true,
    });
    const { CreateStageIn } = this.props;
    const { versionId } = CreateStageIn;
    getFoldersByVersion(versionId).then((folders) => {
      this.setState({
        folders,
        selectLoading: false,
      });
    });
  }

  disabledStartDate = (startValue) => {
    const { CreateStageIn } = this.props;
    const { fromDate, toDate } = CreateStageIn;    
    const { getFieldValue } = this.props.form;
    const endValue = getFieldValue('toDate');
    if (!startValue || !endValue) {
      return startValue < moment(fromDate).startOf('day') 
    || startValue > moment(toDate).endOf('day');
    }
    return startValue.valueOf() > endValue.valueOf() 
    || startValue < moment(fromDate).startOf('day') 
    || startValue > moment(toDate).endOf('day');
  }

  disabledEndDate = (endValue) => {
    const { CreateStageIn } = this.props;    
    const { fromDate, toDate } = CreateStageIn;    
    const { getFieldValue } = this.props.form;
    const startValue = getFieldValue('fromDate'); 
    if (!endValue || !startValue) {
      return endValue < moment(fromDate).startOf('day') 
      || endValue > moment(toDate).endOf('day');
    }
    return endValue.valueOf() <= startValue.valueOf()
    || endValue < moment(fromDate).startOf('day') 
    || endValue > moment(toDate).endOf('day');
  }

  render() {
    const {
      visible, onOk, onCancel, CreateStageIn, 
    } = this.props;
    const {
      title, versionId, fromDate, toDate, 
    } = CreateStageIn;
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
          title={<FormattedMessage id="testPlan_createStage" />}
          visible={visible}
          onOk={this.onOk}
          onCancel={onCancel}
        >
          <Content
            style={{
              padding: '0 0 10px 0',
            }}
            title={<FormattedMessage id="testPlan_createStage" />}
            description={<FormattedMessage id="testPlan_createStageIn" values={{ cycleName: title }} />}
            link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-cycle/create-cycle/"
          >
            <Spin spinning={loading}>
              <Form>                
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
                  {getFieldDecorator('folderId', {
                    rules: [{
                      required: true, message: '请选择文件夹!',
                    }],
                  })(
                    <Select
                      loading={selectLoading}
                      onFocus={this.loadFolders}
                      style={{ width: 500, margin: '0 0 10px 0' }}
                      label={<FormattedMessage id="testPlan_linkFolder" />}
                      optionFilterProp="children"
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                      filter
                    >
                      {options}
                    </Select>,                    
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('fromDate', {
                    initialValue: fromDate && moment(fromDate),
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
                    initialValue: toDate && moment(toDate),
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

CreateStage.propTypes = {

};

export default Form.create()(CreateStage);
