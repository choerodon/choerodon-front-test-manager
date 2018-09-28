import React, { Component } from 'react';
import {
  Table, Input, Icon, Select, Tooltip,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { editCycleStep, addDefects } from '../../../api/CycleExecuteApi';
import {
  TextEditToggle, UploadInTable, DefectSelect,
} from '../../CommonComponent';
import { delta2Text } from '../../../common/utils';

import EditTestDetail from '../EditTestDetail';
import './StepTable.scss';
import CycleExecuteStore from '../../../store/project/cycle/CycleExecuteStore';

const { TextArea } = Input;
const Option = Select.Option;
const styles = {
  cardTitle: {
    fontWeight: 500,
    display: 'flex',
  },
  cardTitleText: {
    lineHeight: '20px',
    marginLeft: '5px',
  },
  cardBodyStyle: {
    // maxHeight: '100%',
    padding: 12,
    overflow: 'visible',
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
// const FormItem = Form.Item;
class StepTable extends Component {
  state = {
    editVisible: false,
    editing: null,
    // issueList: [],
  }

  editCycleStep = (values) => {
    // this.setState({ loading: true });

    // const formData = new FormData();
    const data = { ...values };
    // window.console.log(data);
    // Object.keys(data).forEach((key) => {
    //   formData.append(key, JSON.stringify(data[key]));
    // });
    delete data.defects;
    delete data.caseAttachment;
    delete data.stepAttachment;
    editCycleStep([data]).then(() => {
      // this.setState({
      //   loading: false,
      // });
      CycleExecuteStore.loadDetailList();
    }).catch((error) => {
      window.console.log(error);
      // this.setState({
      //   loading: false,
      // });
      Choerodon.prompt('网络错误');
    });
  };

  render() {
    const that = this;
    // const { onOk, enterLoad, leaveLoad } = this.props;
    const { disabled } = this.props;
    const stepStatusList = CycleExecuteStore.getStepStatusList;
    const detailList = CycleExecuteStore.getDetailList;
    const detailPagination = CycleExecuteStore.getDetailPagination;
    // const { getFieldDecorator } = this.props.form;
    const { editVisible, editing } = this.state;
    const options = stepStatusList.map((status) => {
      const { statusName, statusId, statusColor } = status;
      return (
        <Option value={statusId} key={statusId}>
          <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
            {statusName}
          </div>
        </Option>
      );
    });
    // const defectsOptions =
    //   issueList.map(issue => (<Option key={issue.issueId} value={issue.issueId.toString()}>
    //     {issue.issueNum} {issue.summary}
    //   </Option>));
    const columns = [{
      title: <FormattedMessage id="execute_testStep" />,
      dataIndex: 'testStep',
      key: 'testStep',
      width: '10%',
      render: testStep => (
        // <Tooltip title={testStep}>
        <div 
          dangerouslySetInnerHTML={{ __html: testStep && testStep.replace(/\n/g, '<br />') }}
        />
        // </Tooltip>
      ),
    }, {
      title: <FormattedMessage id="execute_testData" />,
      dataIndex: 'testData',
      key: 'testData',
      render: testData => (
        // <Tooltip title={testData}>
        <div
          dangerouslySetInnerHTML={{ __html: testData && testData.replace(/\n/g, '<br />') }}
        /> 
        // </Tooltip>
      ),
    }, {
      title: <FormattedMessage id="execute_expectedOutcome" />,
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      render: expectedResult => (
        // <Tooltip title={expectedResult}>
        <div
          dangerouslySetInnerHTML={{ __html: expectedResult && expectedResult.replace(/\n/g, '<br />') }}
        />
        // </Tooltip> 
      ),
    },
    {
      title: <FormattedMessage id="execute_stepAttachment" />,
      dataIndex: 'stepAttachment',
      key: 'stepAttachment',
      render(stepAttachment) {
        return (
          <div>
            {stepAttachment.filter(attachment => attachment.attachmentType === 'CASE_STEP').map(attachment => (
              <div style={{
                display: 'flex', fontSize: '12px', flexShrink: 0, margin: '5px 2px', alignItems: 'center',
              }}
              >
                <Icon type="attach_file" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }} />
                <a className="c7n-text-dot" style={{ margin: '2px 5px', fontSize: '13px' }} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
              </div>
            ))
                }
          </div>
        );
      },
    },
    {
      title: <FormattedMessage id="execute_stepStatus" />,
      dataIndex: 'stepStatus',
      key: 'stepStatus',
      // width: 120,
      render(stepStatus, record) {
        const statusColor = _.find(stepStatusList, { statusId: stepStatus })
          ? _.find(stepStatusList, { statusId: stepStatus }).statusColor : '';
        const statusName = _.find(stepStatusList, { statusId: stepStatus })
          && _.find(stepStatusList, { statusId: stepStatus }).statusName;
        return (
          <div style={{ width: 85 }}>
            <TextEditToggle
              disabled={disabled}
              formKey="stepStatus"
              onSubmit={value => that.editCycleStep({ ...record, stepStatus: value })}
              originData={stepStatus}
            >
              <Text>
                <div style={{ ...styles.statusOption, ...{ background: statusColor } }}>
                  {statusName}
                </div>
              </Text>
              <Edit>
                <Select autoFocus style={{ width: 85 }}>
                  {options}
                </Select>
              </Edit>
            </TextEditToggle>
          </div>);
      },
    },
    {
      title: <FormattedMessage id="execute_comment" />,
      dataIndex: 'comment',
      key: 'comment',
      render(comment, record) {
        // window.console.log(comment, delta2Text(comment));
        return (
        // <Tooltip title={<RichTextShow data={comment} />}>
          <TextEditToggle
            disabled={disabled}
            formKey="comment"
            onSubmit={(value) => { that.editCycleStep({ ...record, comment: value }); }}
            originData={delta2Text(comment)}
          >
            <Text>
              <div 
                style={{ minHeight: 20 }}
                dangerouslySetInnerHTML={{ __html: delta2Text(comment) && delta2Text(comment).replace(/\n/g, '<br />') }}
              />
            </Text>
            <Edit>
              <TextArea autosize autoFocus />
            </Edit>
          </TextEditToggle>
        // </Tooltip>
        );
      },
    }, {
      title: <FormattedMessage id="attachment" />,
      dataIndex: 'stepAttachment',
      key: 'caseAttachment',
      render(stepAttachment, record) {
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
        return (
          <TextEditToggle
            disabled={disabled}
          >
            <Text>
              <div style={{ minHeight: 20 }}>
                {stepAttachment.filter(attachment => attachment.attachmentType === 'CYCLE_STEP').map(attachment => (
                  <div style={{
                    display: 'flex', fontSize: '12px', flexShrink: 0, margin: '5px 2px', alignItems: 'center',
                  }}
                  >
                    <Icon type="attach_file" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }} />
                    <a className="c7n-text-dot" style={{ margin: '2px 5px', fontSize: '13px' }} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
                  </div>
                ))
                }
              </div>
            </Text>
            <Edit>
              <UploadInTable
                fileList={stepAttachment.filter(attachment => attachment.attachmentType === 'CYCLE_STEP')}
                onOk={CycleExecuteStore.loadDetailList}
                enterLoad={CycleExecuteStore.enterloading}
                leaveLoad={CycleExecuteStore.unloading}
                config={{
                  attachmentLinkId: record.executeStepId,
                  attachmentType: 'CYCLE_STEP',
                }}
              />
            </Edit>
          </TextEditToggle>
        );
      },
    },
    {
      title: <FormattedMessage id="bug" />,
      dataIndex: 'defects',
      key: 'defects',
      render: (defects, record) => (
        <TextEditToggle
          disabled={disabled}
          onSubmit={() => {   
            if (that.needAdd.length > 0) {
              CycleExecuteStore.enterloading();
              addDefects(that.needAdd).then((res) => {
                CycleExecuteStore.loadDetailList();
              });
            } else {
              CycleExecuteStore.loadDetailList();
            }
          }}
          // originData={{ defects }}
          onCancel={CycleExecuteStore.loadDetailList}
        >
          <Text>
            {
              defects.length > 0 ? (
              // <Tooltip title={(
                <div>
                  {defects.map((defect, i) => (
                    <div style={{
                      fontSize: '13px',                 
                    }}
                    >
                      {defect.issueInfosDTO && defect.issueInfosDTO.issueName}
                    </div>))}
                </div>
              // )}
              // >
              // <div>
              // {defects.map((defect, i) => defect.issueInfosDTO && defect.issueInfosDTO.issueName).join(',')}
              // </div> */}
              // </Tooltip> 
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 20,
                  }}
                />
              )
            }
          </Text>
          <Edit>
            <DefectSelect
              defects={defects}
              setNeedAdd={(needAdd) => { that.needAdd = needAdd; }}
              executeStepId={record.executeStepId}
            />
          </Edit>
        </TextEditToggle>
      ),
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
      //           editing: { ...recorder, ...{ stepStatusList:
      //  CycleExecuteStore.getStepStatusList } },
      //         });
      //       }}
      //     />);
      //   },
      // },
    ];
    return (
      <div className="StepTable">
        <EditTestDetail
          visible={editVisible}
          onCancel={() => {
            this.setState({ editVisible: false });
            CycleExecuteStore.loadDetailList();
          }}
          onOk={(data) => {
            this.setState({ editVisible: false });
            CycleExecuteStore.loadDetailList();
          }}
          editing={editing}
        />
        <Table
          filterBar={false}
          dataSource={detailList}
          columns={columns}
          pagination={detailPagination}
          onChange={CycleExecuteStore.loadDetailList}
        />
      </div>);
  }
}


export default StepTable;
