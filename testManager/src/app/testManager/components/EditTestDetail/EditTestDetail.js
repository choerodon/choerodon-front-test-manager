import React, { Component } from 'react';
import { Button, Select, Icon, Modal, Upload, Spin } from 'choerodon-ui';
import { Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { editCycleSide, deleteAttachment, removeDefect, addDefects } from '../../api/CycleExecuteApi';
import { getIssueList } from '../../api/agileApi';
import './EditTestDetail.less';
import WYSIWYGEditor from '../WYSIWYGEditor';

import { text2Delta } from '../../common/utils';

const { Sidebar } = Modal;
const { Option } = Select;

const styles = {
  editLabel: {
    margin: '15px 0',
  },
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '100px',
    display: 'inline-block',
    color: 'white',
  },
};

class EditTestDetail extends Component {
  state = {
    selectLoading: false,
    reset: false,
    fileList: [],
    loading: false,
    stepId: null,
    comment: null,
    executeId: null,
    testStep: null,
    stepStatus: null,
    stepStatusList: [],
    executeStepId: null,
    objectVersionNumber: null,
    stepAttachment: [],
    caseAttachment: [],
    defects: [],
    issueList: [],
    defectIds: [],
    originDefects: [],
  }
  componentWillReceiveProps(nextProps) {
    const { editing } = nextProps;
    // console.log(editing)
    const {
      stepStatusList,
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment,
      stepAttachment,
      caseAttachment,
      defects,
    } = editing || {};

    this.setState({
      stepStatus,
      executeId,
      testStep,
      comment,
      stepStatusList: stepStatusList || [],
      stepId,
      executeStepId,
      objectVersionNumber,
      stepAttachment: stepAttachment || [],
      caseAttachment: caseAttachment || [],
      fileList: caseAttachment ? caseAttachment.map((attachment) => {
        const { id, attachmentName, url } = attachment;
        return {
          uid: id,
          name: attachmentName,
          status: 'done',
          url,
        };
      }) : [],
      defects: defects || [],
      defectIds: defects ? defects.map(defect => defect.issueId.toString()) : [],
      originDefects: defects ? defects.map(defect => defect.issueId.toString()) : [],
    });
    // 修复默认值不变
    if (this.props.visible === false && nextProps.visible === true) {
      this.setState({
        reset: false,
      }, () => {
        this.setState({
          reset: true,
        });
      });
    }
  }
  onOk = () => {
    // editCycleSide
    const {
      fileList,
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment,
      stepAttachment,
      caseAttachment,
      defects,
      defectIds,
      originDefects,
      issueList } = this.state;
    const data = {
      executeId,
      stepStatus,
      stepId,
      executeStepId,
      objectVersionNumber,
      testStep,
      comment: comment || '',
      stepAttachment,
      caseAttachment,
      defects,
    };
    const formData = new FormData();
    fileList.forEach((file) => {
      if (!file.url) {
        formData.append('file', file);
      }
    });
    Object.keys(data).forEach((key) => {
      formData.append(key, JSON.stringify(data[key]));
    });
    this.setState({ loading: true });
    // 
    const needAdd =
      issueList
        .filter(issue => defectIds.includes(issue.issueId.toString()))// 取到选中的issueList
        .filter(issue => !originDefects.includes(issue.issueId.toString()))// 去掉之前已有的
        .map(item => ({
          defectType: 'CASE_STEP',
          defectLinkId: executeStepId,
          issueId: item.issueId,
          defectName: item.issueNum,
        }));
    if (needAdd.length > 0) {
      addDefects(needAdd).then((res) => {

      });
    }
    // 
    editCycleSide(formData).then(() => {
      this.setState({
        loading: false,
      });
      this.props.onOk();
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      Choerodon.prompt('网络错误');
    });
  }
  handleChange = (value) => {
    this.setState({
      stepStatus: value,
    });
  }
  handleFileChange = (info) => {
    const fileList = info.fileList;
    this.setState({ fileList });
  }
  handleDefectsChange = (List) => {
    const { originDefects, defects, defectIds } = this.state;
    const oldList = [...defectIds];
    // window.console.log('old', oldList, 'new', List);
    // 删除元素
    if (oldList.length > List.length) {
      const deleteEle = oldList.filter(old => !List.includes(old));
      // 如果isse已存在，调用删除接口
      if (defectIds.includes(deleteEle[0])
        && _.find(defects, { issueId: Number(deleteEle[0]) })) {
        window.console.log(defects);
        removeDefect(_.find(defects, { issueId: Number(deleteEle[0]) }).id);
      }
      window.console.log('delete');
    } else {
      window.console.log('add', List.filter(item => !oldList.includes(item)));
    }

    this.setState({
      defectIds: List,
    });
  }
  render() {
    const { visible, onOk, onCancel } = this.props;
    const { reset, fileList, executeId, testStep, comment,
      stepStatusList, stepStatus, loading, defects, issueList,
      selectLoading, defectIds } = this.state;
    const delta = text2Delta(comment);
    // console.log(delta)
    const props = {
      action: '//jsonplaceholder.typicode.com/posts/',
      onChange: this.handleFileChange,
      multiple: true,
      onRemove: (file) => {
        if (file.url) {
          this.setState({ loading: true });
          deleteAttachment(file.uid).then(() => {
            this.setState({ loading: false });
          }).catch(() => {
            Choerodon.prompt('网络异常');
            this.setState({ loading: false });
          });
        } else {
          const index = _.findIndex(fileList, { uid: file.uid });
          this.setState({
            fileList: fileList.splice(index, 1),
          });
        }
      },
      beforeUpload: (file) => {
        this.setState({
          fileList: [...fileList, file],
        });
        return false;
      },
    };
    const options = stepStatusList.map((status) => {
      const { statusName, statusId, statusColor } = status;
      return (<Option value={statusId} key={statusId}>
        <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
          {statusName}
        </div>
      </Option>);
    });

    const defectsOptions =
      issueList.map(issue => (<Option key={issue.issueId} value={issue.issueId.toString()}>
        {issue.issueNum} {issue.summary}
      </Option>));
    return (
      <Sidebar
        title="测试详细信息"
        visible={visible}
        onOk={this.onOk}
        onCancel={onCancel}
      >
        <Content
          style={{
            padding: '0 0 10px 0',
          }}
          title={`修改“${testStep}”的信息`}
          description="您可以修改一个测试步骤的详细信息。"
          link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/case-management/update-list/"
        >
          <Spin spinning={loading}>
            <Select
              label="状态"             
              value={stepStatus}
              style={{ width: 500 }}
              onChange={(value) => {
                this.setState({
                  stepStatus: value,
                });
              }}
            >
              {options}
            </Select>
            <br />
            <Select
              
              style={{ width: 500 }}
              label="缺陷"        
              value={defectIds}
              onChange={this.handleDefectsChange}
              allowClear
              loading={selectLoading}
              filter
              mode="multiple"
              filterOption={false}
              onFilterChange={(value) => {
                // window.console.log('filter');
                this.setState({
                  selectLoading: true,
                });
                getIssueList(value).then((issueData) => {
                  this.setState({
                    issueList: issueData.content,
                    selectLoading: false,
                  });
                });
              }}
              onFocus={() => {
                this.setState({
                  selectLoading: true,
                });
                getIssueList().then((issueData) => {
                  this.setState({
                    issueList: issueData.content,
                    selectLoading: false,
                  });
                });
              }}
            >
              {defectsOptions}
            </Select>
            <div style={styles.editLabel}>附件</div>
            <Upload {...props} fileList={fileList}>
              <Button className="c7n-EditTestDetail-uploadBtn">
                <Icon type="file_upload" /> 上传附件
              </Button>
            </Upload>
            <div style={styles.editLabel}>注释</div>
            {reset && <WYSIWYGEditor
              // value={comment}
              value={delta}
              style={{ height: 200, width: '100%' }}
              onChange={(value) => {
                this.setState({ comment: value });
              }}
            />}
          </Spin>
        </Content>
      </Sidebar>
    );
  }
}

EditTestDetail.propTypes = {

};

export default EditTestDetail;
