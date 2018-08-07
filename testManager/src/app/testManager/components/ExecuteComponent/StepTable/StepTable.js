import React, { Component } from 'react';
import { Form, Table, Button, Input, Icon, Card, Select, Spin, Upload, Tooltip } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { editCycleStep, deleteAttachment, addDefects } from '../../../api/CycleExecuteApi';
import { TextEditToggle, RichTextShow, UploadInTable, DefectSelect } from '../../CommonComponent';
import { delta2Html, delta2Text } from '../../../common/utils';
import { uploadFile } from '../../../api/CommonApi';
import { getIssueList } from '../../../api/agileApi';
import './StepTable.scss';

const Option = Select.Option;
const styles = {
  cardTitle: {
    fontWeight: 'bold',
    display: 'flex',
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px',
  },
  cardBodyStyle: {
    // maxHeight: '100%',
    padding: 12,
    overflow: 'hidden',
  },
  cardContent: {

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
const { Text, Edit } = TextEditToggle;
const FormItem = Form.Item;
class StepTable extends Component {
  state = {
    selectLoading: false,
    issueList: [],
  }
  editCycleStep = (record) => {
    this.props.form.validateFields((err, values) => {
      this.setState({ loading: true });

      const formData = new FormData();
      const data = { ...record, ...values };
      window.console.log(data);
      // Object.keys(data).forEach((key) => {
      //   formData.append(key, JSON.stringify(data[key]));
      // });
      delete data.defects;
      delete data.caseAttachment;
      delete data.stepAttachment;
      editCycleStep([data]).then(() => {
        this.setState({
          loading: false,
        });
        this.props.onOk();
      }).catch((error) => {
        window.console.log(error);
        this.setState({
          loading: false,
        });
        Choerodon.prompt('网络错误');
      });
    });
  };
  uploadFile
  render() {
    const that = this;
    const { stepStatusList, detailList, detailPagination, onOk, enterLoad, leaveLoad } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectLoading, issueList } = this.state;
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
    const columns = [{
      title: <FormattedMessage id="execute_testStep" />,
      dataIndex: 'testStep',
      key: 'testStep',
      width: '10%',
      render: testStep =>
        (<Tooltip title={testStep}>
          <div className="c7n-text-dot">
            {testStep}
          </div>
        </Tooltip>),
    }, {
      title: <FormattedMessage id="execute_testData" />,
      dataIndex: 'testData',
      key: 'testData',
      render: testData =>
        (<Tooltip title={testData}>
          <div
            className="c7n-text-dot"
          >
            {testData}
          </div>
        </Tooltip>),
    }, {
      title: <FormattedMessage id="execute_expectedOutcome" />,
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      render: expectedResult =>
        (<Tooltip title={expectedResult}>
          <div

            className="c7n-text-dot"
          >
            {expectedResult}
          </div>
        </Tooltip>),
    },
    {
      title: <FormattedMessage id="execute_stepAttachment" />,
      dataIndex: 'stepAttachment',
      key: 'stepAttachment',
      render(stepAttachment) {
        return (<Tooltip title={
          <div>
            {stepAttachment.map((attachment, i) => (
              <div style={{
                fontSize: '13px',
                color: 'white',
              }}
              >
                {attachment.attachmentName}
              </div>))}
          </div>}
        >
          <div
            className="c7n-text-dot"
          >
            {stepAttachment.map((attachment, i) => attachment.attachmentName).join(',')}
          </div>
        </Tooltip>);
      },
    },
    {
      title: <FormattedMessage id="execute_stepStatus" />,
      dataIndex: 'stepStatus',
      key: 'stepStatus',
      width: 120,
      render(stepStatus, record) {
        const statusColor = _.find(stepStatusList, { statusId: stepStatus }) ?
          _.find(stepStatusList, { statusId: stepStatus }).statusColor : '';
        const statusName = _.find(stepStatusList, { statusId: stepStatus }) &&
          _.find(stepStatusList, { statusId: stepStatus }).statusName;
        return (<TextEditToggle
          onSubmit={() => that.editCycleStep(record)}
        >
          <Text>
            <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
              {statusName}
            </div>
          </Text>
          <Edit>
            <FormItem style={{ margin: '5px 0 0 0' }}>
              {getFieldDecorator('stepStatus', {
                initialValue: stepStatus,
              })(
                <Select autoFocus style={{ width: 85 }}>
                  {options}
                </Select>,
              )}
            </FormItem>

          </Edit>
        </TextEditToggle>);
      },
    },
    {
      title: <FormattedMessage id="execute_comment" />,
      dataIndex: 'comment',
      key: 'comment',
      render(comment, record) {
        return (
          <Tooltip title={<RichTextShow data={comment} />}>
            <TextEditToggle
              onSubmit={() => that.editCycleStep(record)}
              originData={comment}
            >
              <Text>
                <div
                  style={{
                    width: 100,
                    height: 20,
                  }}
                  className="c7n-text-dot"
                >
                  {comment}
                </div>
              </Text>
              <Edit>
                <FormItem style={{ margin: '5px 0 0 0' }}>
                  {getFieldDecorator('comment', {
                    initialValue: comment,
                  })(
                    <Input autoFocus />,
                  )}
                </FormItem>

              </Edit>
            </TextEditToggle>
          </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="attachment" />,
      dataIndex: 'caseAttachment',
      key: 'caseAttachment',
      render(caseAttachment, record) {
        // return (<Tooltip title={
        //   <div>
        //     {caseAttachment.map((attachment, i) => (
        //       <div style={{
        //         fontSize: '13px',
        //         color: 'white',
        //       }}
        //       >
        //         {attachment.attachmentName}
        //       </div>))}
        //   </div>}
        // >
        //   <div
        //     style={{
        //       width: 100,
        //       display: 'flex',
        //       alignItems: 'center',
        //     }}
        //     className="c7n-text-dot"
        //   >
        //     {caseAttachment.map((attachment, i) => attachment.attachmentName).join(',')}
        //   </div>
        // </Tooltip>);
        return (<TextEditToggle>
          <Text>
            <div style={{ display: 'flex', overflow: 'hidden', height: 20 }}>
              {caseAttachment.map(attachment => (
                <div style={{ fontSize: '12px', flexShrink: 0, margin: '0 2px' }} className="c7n-text-dot">
                  <Icon type="attach_file" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }} />
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
                </div>
              ))
              }
            </div>
          </Text>
          <Edit>
            <UploadInTable
              fileList={caseAttachment}
              onOk={onOk}
              enterLoad={enterLoad}
              leaveLoad={leaveLoad}
              config={{
                attachmentLinkId: record.executeStepId,
                attachmentType: 'CYCLE_STEP',
              }}
            />
          </Edit>
        </TextEditToggle>);
      },
    },
    {
      title: <FormattedMessage id="bug" />,
      dataIndex: 'defects',
      key: 'defects',
      render: (defects, record) =>
        // (<Tooltip title={
        //   <div>
        //     {defects.map((defect, i) => (
        //       <div style={{
        //         fontSize: '13px',
        //         color: 'white',
        //       }}
        //       >
        //         {defect.issueInfosDTO && defect.issueInfosDTO.issueName}
        //       </div>))}
        //   </div>}
        // >
        //   <div
        //     style={{
        //       width: 100,
        //       overflow: 'hidden',
        //       textOverflow: 'ellipsis',
        //       whiteSpace: 'nowrap',
        //     }}
        //   >
        //     {defects.map((defect, i) => defect.issueInfosDTO &&
        //  defect.issueInfosDTO.issueName).join(',')}
        //   </div>
        // </Tooltip>),
        (<TextEditToggle
          onSubmit={() => {
            if (that.needAdd.length > 0) {
              addDefects(that.needAdd).then((res) => {
                onOk();
              });
            }
          }}
          // originData={{ defects }}
          onCancel={onOk}
        >
          <Text>
            <Tooltip title={
              <div>
                {defects.map((defect, i) => (
                  <div style={{
                    fontSize: '13px',
                    color: 'white',
                  }}
                  >
                    {defect.issueInfosDTO && defect.issueInfosDTO.issueName}
                  </div>))}
              </div>}
            >
              <div
                style={{
                  width: 100,
                }}
                className="c7n-text-dot"
              >
                {defects.map((defect, i) => defect.issueInfosDTO && defect.issueInfosDTO.issueName).join(',')}
              </div>
            </Tooltip>
          </Text>
          <Edit>
            <DefectSelect
              defects={defects}
              setNeedAdd={(needAdd) => { that.needAdd = needAdd; }}
              executeStepId={record.executeStepId}
            />
          </Edit>
        </TextEditToggle>),
    },
      // {
      //   title: null,
      //   dataIndex: 'executeId',
      //   key: 'executeId',
      //   render(executeId, recorder) {
      //     return (<Icon
      //       type="mode_edit"
      //       style={{ cursor: 'pointer' }}
      //       onClick={() => {
      //         that.setState({
      //           editVisible: true,
      //           editing: { ...recorder, ...{ stepStatusList } },
      //         });
      //       }}
      //     />);
      //   },
      // }
    ];
    return (<Table
      filterBar={false}
      dataSource={detailList}
      columns={columns}
      pagination={detailPagination}
      onChange={this.props.onChange}
    />);
  }
}


export default Form.create({})(StepTable);
