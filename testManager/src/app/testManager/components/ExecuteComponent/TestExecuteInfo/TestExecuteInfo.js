import React, { Component } from 'react';
import {
  Button, Icon, Select, Upload,
} from 'choerodon-ui';
import _ from 'lodash';
import { observer } from 'mobx-react';
import { FormattedMessage } from 'react-intl';
import {
  TextEditToggle, RichTextShow, User, SelectCreateIssueFooter, StatusTags,
} from '../../CommonComponent';
import { uploadFile, deleteAttachment } from '../../../api/FileApi';
import { delta2Html } from '../../../common/utils';
import {
  addDefects, editCycle, removeDefect,
} from '../../../api/ExecuteDetailApi';
import { FullEditor } from '../../CommonComponent';
import ExecuteDetailStore from '../../../store/project/cycle/ExecuteDetailStore';
import './TestExecuteInfo.scss';


function beforeUpload(file) {
  const isLt2M = file.size / 1024 / 1024 < 30;
  if (!isLt2M) {
    // console.log('不能超过30MB!');
  }
  return isLt2M;
}
const styles = {
  cardTitle: {
    fontWeight: 500,
    display: 'flex',
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px',
  },
  carsContentItemPrefix: {
    width: 105,
    color: 'rgba(0,0,0,0.65)',
    fontSize: 13,
  },
  cardContentItem: {
    display: 'flex',
    marginLeft: 24,
    marginTop: 10,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
    lineHeight: '20px',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  statusOption: {
    width: 60,
    textAlign: 'center',
    borderRadius: '2px',
    display: 'inline-block',
    color: 'white',
  },
  userOption: {
    background: '#c5cbe8',
    color: '#6473c3',
    width: '20px',
    height: '20px',
    textAlign: 'center',
    lineHeight: '20px',
    borderRadius: '50%',
    marginRight: '8px',
  },
};

const Option = Select.Option;
const { Text, Edit } = TextEditToggle;
@observer
class TestExecuteInfo extends Component {
  state = {
    edit: false,
  }

  handleUpload = (e) => {
    if (beforeUpload(e.target.files[0])) {
      const formData = new FormData();
      [].forEach.call(e.target.files, (file) => {
        formData.append('file', file);
      });
      const config = {
        bucketName: 'test',
        comment: '',
        attachmentLinkId: ExecuteDetailStore.getCycleData.executeId,
        attachmentType: 'CYCLE_CASE',
      };
      ExecuteDetailStore.enterloading();
      uploadFile(formData, config).then(() => {
        ExecuteDetailStore.getInfo();
        // 清空input值，保证触发change
        this.uploadInput.value = '';
      }).catch(() => {
        // 清空input值，保证触发change
        this.uploadInput.value = '';
        Choerodon.prompt('网络异常');
      });
    }
  }


  addDefects = (issueList) => {
    const cycleData = ExecuteDetailStore.getCycleData;
    const defectIds = ExecuteDetailStore.getDefectIds;
    const { executeId } = cycleData;
    const needAdd = issueList.filter(issueId => !defectIds.includes(issueId))
      .map(issueId => ({
        defectType: 'CYCLE_CASE',
        defectLinkId: executeId,
        issueId,
        // defectName: item.issueNum,
      }));
    if (needAdd.length > 0) {
      ExecuteDetailStore.enterloading();
      addDefects(needAdd).then((res) => {
        ExecuteDetailStore.getInfo();
      });
    }
  }

  handleDefectsChange = (List) => {
    // const { originDefects, defectIds, cycleData } = this.state;
    const cycleData = ExecuteDetailStore.getCycleData;
    const defectIds = ExecuteDetailStore.getDefectIds;
    const oldList = [...defectIds];
    window.console.log('old', oldList, 'new', List);
    // 删除元素
    if (oldList.length > List.length) {
      const deleteEle = oldList.filter(old => !List.includes(old));
      // 如果isse已存在，调用删除接口
      if (defectIds.includes(deleteEle[0].toString())) {
        if (_.find(cycleData.defects, { issueId: Number(deleteEle[0]) })) {
          const id = _.find(cycleData.defects, { issueId: Number(deleteEle[0]) }).id;
          cycleData.defects.splice(defectIds.indexOf(deleteEle[0].toString()));
          removeDefect(id).then((res) => {
            cycleData.defects.splice(defectIds.indexOf(deleteEle[0]));
            ExecuteDetailStore.setCycleData(cycleData);
          });
        }
      }
      window.console.log('delete');
    } else {
      window.console.log('add', List.filter(item => !oldList.includes(item)));
    }
  }

  submit = (updateData) => {
    // window.console.log('submit', originData);
    const cycleData = ExecuteDetailStore.getCycleData;
    const newData = { ...cycleData, ...updateData };
    newData.assignedTo = newData.assignedTo || 0;
    // 删除一些不必要字段
    delete newData.defects;
    delete newData.caseAttachment;
    delete newData.testCycleCaseStepES;
    delete newData.lastRank;
    delete newData.nextRank;

    editCycle(newData).then((Data) => {
      this.setState({
        edit: false,
      });
      ExecuteDetailStore.getInfo();
    }).catch((error) => {
      Choerodon.prompt('网络异常');
    });
  }

  render() {
    const { disabled } = this.props;
    const statusList = ExecuteDetailStore.getStatusList;
    const issueList = ExecuteDetailStore.getIssueList;
    const userList = ExecuteDetailStore.getUserList;
    const cycleData = ExecuteDetailStore.getCycleData;
    // debugger;
    const selectLoading = ExecuteDetailStore.selectLoading;
    const {
      executionStatus, assigneeUser, lastUpdateUser,
      lastUpdateDate, comment, defects,
    } = cycleData;
    const fileList = ExecuteDetailStore.getFileList;
    const defectIds = ExecuteDetailStore.getDefectIds;
    const { statusColor, statusName } = ExecuteDetailStore.getStatusById(executionStatus);
    const props = {
      onRemove: (file) => {
        if (file.url) {
          ExecuteDetailStore.enterloading();
          deleteAttachment(file.uid).then((data) => {
            // window.console.log(data);
            ExecuteDetailStore.getInfo();
          });
          // 写服务端删除逻辑
        }
      },
    };
    const options = statusList.map(status => (
      <Option value={status.statusId} key={status.statusId}>
        <StatusTags
          color={status.statusColor}
          name={status.statusName}
        />
        {/* <div style={{ ...styles.statusOption, ...{ background: status.statusColor } }}>
          {status.statusName}
        </div> */}
      </Option>
    ));
    const defectsOptions = issueList.map(issue => (
      <Option key={issue.issueId} value={issue.issueId.toString()}>
        {issue.issueNum}
        {' '}
        {issue.summary}
      </Option>
    ));
    const userOptions = userList.map(user => (
      <Option key={user.id} value={user.id}>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px' }}>
          {user.imageUrl
            ? (
              <img
                src={user.imageUrl}
                alt=""
                style={{
                  width: 20, height: 20, borderRadius: '50%', marginRight: '8px',
                }}
              />
            )
            : (
              <div style={styles.userOption}>
                {user.realName.slice(0, 1)}
              </div>
            )
          }
          <span>{`${user.loginName} ${user.realName}`}</span>
        </div>
      </Option>
    ));
    return (
      <div style={{ display: 'flex', marginBottom: 24 }} className="c7n-TestExecuteinfo">
        {/* 基本信息 */}
        <div
          className="c7n-card"
          style={{ flex: 1, minHeight: 236 }}
        >
          <div style={styles.cardTitle}>
            {/* <Icon type="expand_more" /> */}
            <span style={styles.cardTitleText}><FormattedMessage id="execute_cycle_execute" /></span>
          </div>
          <div style={styles.cardContent}>
            <div style={styles.cardContentItem}>
              <div style={styles.carsContentItemPrefix}>
                <FormattedMessage id="execute_status" />
                {':'}
              </div>
              <TextEditToggle
                disabled={disabled}
                formKey="executionStatus"
                onSubmit={(id) => { this.submit({ executionStatus: id }); }}
                originData={executionStatus}
              >
                <Text>
                  <StatusTags
                    color={statusColor}
                    name={statusName}
                  />
                  {/* <div style={{
                    background: statusColor, width: 60, textAlign: 'center', borderRadius: '2px', display: 'inline-block', color: 'white',
                  }}
                  >
                    {statusName}
                  </div> */}
                </Text>
                <Edit>
                  <Select
                    autoFocus
                    // defaultValue={executionStatus}
                    style={{ width: 200 }}
                  >
                    {options}
                  </Select>
                </Edit>
              </TextEditToggle>
            </div>
            <div style={styles.cardContentItem}>
              <div style={styles.carsContentItemPrefix}>
                <FormattedMessage id="execute_assignedTo" />
                {'：'}
              </div>
              <TextEditToggle
                // disabled={disabled}
                formKey="assignedTo"
                onSubmit={(id) => { this.submit({ assignedTo: id || 0 }); }}
                originData={assigneeUser ? assigneeUser.id : null}
                onCancel={this.cancelEdit}
              >
                <Text>
                  {assigneeUser ? <User user={assigneeUser} />
                    : '无'}
                </Text>
                <Edit>
                  <Select
                    filter
                    allowClear
                    autoFocus
                    filterOption={false}
                    onFilterChange={(value) => { ExecuteDetailStore.loadUserList(value); }}
                    loading={selectLoading}
                    style={{ width: 200 }}
                    onFocus={() => { ExecuteDetailStore.loadUserList(); }}
                  >
                    {userOptions}
                  </Select>
                </Edit>
              </TextEditToggle>
            </div>
            <div style={styles.cardContentItem}>
              <div style={styles.carsContentItemPrefix}>
                <FormattedMessage id="execute_executive" />
                {'：'}
              </div>
              {lastUpdateUser ? <User user={lastUpdateUser} /> : '无'}
            </div>
            <div style={styles.cardContentItem}>
              <div style={styles.carsContentItemPrefix}>
                <FormattedMessage id="execute_executeTime" />
                {'：'}
              </div>
              <div>
                {lastUpdateDate}
              </div>
            </div>
            <div style={styles.cardContentItem}>
              <div style={styles.carsContentItemPrefix}>
                <FormattedMessage id="bug" />
                {'：'}
              </div>
              <TextEditToggle
                disabled={disabled}
                formKey="defects"
                onSubmit={this.addDefects}
                originData={defectIds}
                onCancel={this.cancelEdit}
              >
                <Text>
                  {defects.length > 0 ? (
                    <div
                      style={{
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {defects.map((defect, i) => defect.issueInfosDTO.issueName).join('，')}
                    </div>
                  ) : '无'}
                </Text>
                <Edit>
                  <Select
                    // filter
                    // allowClear
                    autoFocus
                    filter
                    mode="multiple"
                    filterOption={false}
                    loading={selectLoading}
                    footer={<SelectCreateIssueFooter />}
                    // value={defectIds}
                    style={{ minWidth: 250 }}
                    onChange={this.handleDefectsChange}
                    onFilterChange={(value) => { ExecuteDetailStore.loadIssueList(value); }}
                    onFocus={() => { ExecuteDetailStore.loadIssueList(); }}
                  >
                    {defectsOptions}
                  </Select>
                </Edit>
              </TextEditToggle>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 20, flex: 1 }}>
          {/* 描述 */}
          <div
            className="c7n-card"
            style={{
              width: '100%', height: '60%', display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={styles.cardTitle}>
              {/* <Icon type="expand_more" /> */}
              <span style={styles.cardTitleText}><FormattedMessage id="execute_description" /></span>
              <div style={{ flex: 1, visibility: 'hidden' }} />
              {/* {!disabled && ( */}
              <Button className="c7n-upload-button" onClick={() => { this.setState({ edit: true }); }}>
                <Icon type="zoom_out_map" />
                {' '}
                <FormattedMessage id="execute_edit_fullScreen" />
              </Button>
              {/* )} */}
              <FullEditor
                initValue={comment}
                visible={this.state.edit}
                onCancel={() => this.setState({ edit: false })}
                onOk={(value) => { this.submit({ comment: JSON.stringify(value) }); }}
              />
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: '20px', padding: '0 20px', height: 80, overflow: 'auto',
            }}
            >
              <RichTextShow data={delta2Html(comment)} />
            </div>
          </div>
          {/* 附件 */}
          <div
            className="c7n-card"
            style={{ width: '100%', height: 'calc(40% - 20px)', marginTop: 20 }}
          >
            <div style={styles.cardTitle}>
              <div>
                {/* <Icon type="expand_more" /> */}
                <span style={styles.cardTitleText}><FormattedMessage id="attachment" /></span>
              </div>
              <div style={{ flex: 1, visibility: 'hidden' }} />
              {/* {!disabled && ( */}
              <Button className="c7n-upload-button" onClick={() => this.uploadInput.click()}>
                <Icon type="file_upload" />
                {' '}
                <FormattedMessage id="upload_attachment" />
                <input
                  ref={
                    (uploadInput) => { if (uploadInput) { this.uploadInput = uploadInput; } }
                  }
                  type="file"
                  multiple
                  onChange={this.handleUpload}
                  style={{ display: 'none' }}
                />
              </Button>
              {/* )} */}
            </div>
            <div style={{ marginTop: -10 }}>
              <Upload
                {...props}
                fileList={fileList}
                className="upload-button"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TestExecuteInfo.propTypes = {

};

export default TestExecuteInfo;
