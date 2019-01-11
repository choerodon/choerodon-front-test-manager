import React, { Component } from 'react';
import {
  Table, Input, Icon, Select, Tooltip,
} from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import { editCycleStep, addDefects } from '../../../api/ExecuteDetailApi';
import {
  TextEditToggle, UploadInTable, DefectSelect, StatusTags,
} from '../../CommonComponent';
import { delta2Text } from '../../../common/utils';
import './StepTable.scss';
import ExecuteDetailStore from '../../../store/project/TestExecute/ExecuteDetailStore';

const { TextArea } = Input;
const Option = Select.Option;
const { Text, Edit } = TextEditToggle;

class StepTable extends Component {
  editCycleStep = (values) => {
    const data = { ...values };

    delete data.defects;
    delete data.caseAttachment;
    delete data.stepAttachment;
    editCycleStep([data]).then(() => {
      ExecuteDetailStore.loadDetailList();
    }).catch((error) => {
      window.console.log(error);
      Choerodon.prompt('网络错误');
    });
  };

  render() {
    const that = this;
    const { disabled } = this.props;
    const stepStatusList = ExecuteDetailStore.getStepStatusList;
    const detailList = ExecuteDetailStore.getDetailList;
    const detailPagination = ExecuteDetailStore.getDetailPagination;


    const options = stepStatusList.map((status) => {
      const { statusName, statusId, statusColor } = status;
      return (
        <Option value={statusId} key={statusId} title={statusName}>
          <StatusTags 
            color={statusColor}
            name={statusName}
          />          
        </Option>
      );
    });
    const columns = [{
      title: <FormattedMessage id="execute_testStep" />,
      dataIndex: 'testStep',
      key: 'testStep',
      width: '10%',
      render: testStep => (
        // <Tooltip title={testStep}>
        <div 
          className="c7ntest-text-wrap"       
        >
          {testStep}
        </div>
        // </Tooltip>
      ),
    }, {
      title: <FormattedMessage id="execute_testData" />,
      dataIndex: 'testData',
      key: 'testData',
      render: testData => (
        // <Tooltip title={testData}>
        <div
          className="c7ntest-text-wrap"         
        > 
          {testData}
        </div>
        // </Tooltip>
      ),
    }, {
      title: <FormattedMessage id="execute_expectedOutcome" />,
      dataIndex: 'expectedResult',
      key: 'expectedResult',
      render: expectedResult => (
        // <Tooltip title={expectedResult}>
        <div
          className="c7ntest-text-wrap"      
        >
          {expectedResult}
        </div>
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
                <a className="c7ntest-text-dot" style={{ margin: '2px 5px', fontSize: '13px' }} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
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
        return (
          <div style={{ width: 85 }}>
            <TextEditToggle
              disabled={disabled}
              formKey="stepStatus"
              onSubmit={value => that.editCycleStep({ ...record, stepStatus: value })}
              originData={stepStatus}
            >
              <Text>
                {(data) => {
                  const targetStatus = _.find(stepStatusList, { statusId: data });
                  const statusColor = targetStatus && targetStatus.statusColor;
                  const statusName = targetStatus && targetStatus.statusName;
                  return (
                    <StatusTags
                      color={statusColor}
                      name={statusName}
                    />
                  );
                }}
                
              </Text>
              <Edit>
                <Select autoFocus>
                  {options}
                </Select>
              </Edit>
            </TextEditToggle>
          </div>
        );
      },
    },
    {
      title: <FormattedMessage id="execute_comment" />,
      dataIndex: 'comment',
      key: 'comment',
      render(comment, record) {
        return (
        // <Tooltip title={<RichTextShow data={comment} />}>
          <TextEditToggle
            disabled={disabled}
            formKey="comment"
            onSubmit={(value) => { that.editCycleStep({ ...record, comment: value }); }}
            originData={delta2Text(comment)}
          >
            <Text>
              {data => (
                <div 
                  className="c7ntest-text-wrap"
                  style={{ minHeight: 20 }}                 
                >
                  {delta2Text(data)}
                </div>
              )}              
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
                    <a className="c7ntest-text-dot" style={{ margin: '2px 5px', fontSize: '13px' }} href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.attachmentName}</a>
                  </div>
                ))
                }
              </div>
            </Text>
            <Edit>
              <UploadInTable
                fileList={stepAttachment.filter(attachment => attachment.attachmentType === 'CYCLE_STEP')}
                onOk={ExecuteDetailStore.loadDetailList}
                enterLoad={ExecuteDetailStore.enterloading}
                leaveLoad={ExecuteDetailStore.unloading}
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
          saveRef={(bugsToggle) => { this[`bugsToggle_${record.stepId}`] = bugsToggle; }}
          disabled={disabled}
          onSubmit={() => {   
            if (that.needAdd.length > 0) {
              ExecuteDetailStore.enterloading();
              addDefects(that.needAdd).then((res) => {
                ExecuteDetailStore.loadDetailList();
              });
            } else {
              ExecuteDetailStore.loadDetailList();
            }
          }}
            // originData={{ defects }}
          onCancel={ExecuteDetailStore.loadDetailList}
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
                      </div>
                    ))}
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
              bugsToggleRef={this[`bugsToggle_${record.stepId}`]}
            />
          </Edit>
        </TextEditToggle>
      ),
    },
    ];
    return (
      <div className="StepTable">
        <Table
          filterBar={false}
          dataSource={detailList}
          columns={columns}
          pagination={detailPagination}
          onChange={ExecuteDetailStore.loadDetailList}
        />
      </div>
    );
  }
}


export default StepTable;
