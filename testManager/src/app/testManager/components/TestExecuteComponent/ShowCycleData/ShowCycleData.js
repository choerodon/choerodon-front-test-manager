import React, { Fragment, memo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'react-fast-compare';
import moment from 'moment';
import 'moment/locale/zh-cn';
import { FormattedMessage } from 'react-intl';
import { User, TestProgressLine } from '../../CommonComponent';
import './ShowCycleData.scss';

const CardColumn = ({ children }) => (
  <div className="c7ntest-right-card-column">
    {children}
  </div>
);
const CardItem = ({ label, content }) => (
  <div className="c7ntest-right-card-item">
    <div className="c7ntest-right-card-item-label">
      {label}
      ：
    </div>
    <div className="c7ntest-right-card-item-text">
      {content}
    </div>
  </div>
);
const propTypes = {
  data: PropTypes.shape({}).isRequired,
  statusList: PropTypes.arrayOf(PropTypes.shape({})),  
};
const ShowCycleData = ({
  data, statusList,
}) => {
  const calculateNum = (cycleCaseList) => {
    let total = 0;
    Object.keys(cycleCaseList).forEach((key) => { total += cycleCaseList[key]; });
    let notExecute = 0;
    for (let i = 0; i < statusList.length; i += 1) {
      const status = statusList[i];
      if (cycleCaseList[status.statusColor] && status.statusName === '未执行' && status.projectId === 0) {
        notExecute += cycleCaseList[status.statusColor];
      }
    }
    return {
      execute: total - notExecute,
      total,
    };
  };

  const {
    type, build, cycleId, versionName, title,
    description, toDate, environment, fromDate, cycleCaseList, createdUser,
    children,
  } = data;
    // 全局数
  let allExectueNum = 0;
  // 全局执行过的数
  let ExectuedNum = 0;
  Object.keys(cycleCaseList || {}).forEach((key) => {
    if (key !== 'rgba(0,0,0,0.18)') {
      ExectuedNum += cycleCaseList[key];
    }
    allExectueNum += cycleCaseList[key];
  });
  // 循环层的数
  let CycleExectueNum = allExectueNum;
  children.forEach((child) => {
    let folderExecuteNum = 0;
    Object.keys(child.cycleCaseList || {}).forEach((key) => {
      folderExecuteNum += child.cycleCaseList[key];
    });
    CycleExectueNum -= folderExecuteNum;
  });

  return (
    <Fragment>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '20px' }}>
          {type === 'folder' ? <FormattedMessage id="cycle_stageName" />
            : <FormattedMessage id="cycle_cycleName" />}
          <span>{`：${title}`}</span>
        </div>
        <TestProgressLine style={{ margin: '0 20px' }} statusList={statusList} progress={cycleCaseList} />
        {`已测:${calculateNum(cycleCaseList).execute}/${calculateNum(cycleCaseList).total}`}
        <div style={{ flex: 1, visiblity: 'hidden' }} />
      </div>
      {type === 'cycle'
        ? (
          <div className="c7ntest-right-card-container">
            <CardColumn>
              <CardItem label={<FormattedMessage id="version" />} content={versionName} />
              <CardItem label={<FormattedMessage id="cycle_createBy" />} content={<User user={createdUser} />} />
              <CardItem label={<FormattedMessage id="cycle_comment" />} content={description} />
            </CardColumn>
            <CardColumn>
              <CardItem label={<FormattedMessage id="cycle_startTime" />} content={fromDate && moment(fromDate).format('YYYY/MM/DD')} />
              <CardItem label={<FormattedMessage id="cycle_build" />} content={build} />
            </CardColumn>
            <CardColumn>
              <CardItem label={<FormattedMessage id="cycle_endTime" />} content={toDate && moment(toDate).format('YYYY/MM/DD')} />
              <CardItem label={<FormattedMessage id="cycle_environment" />} content={environment} /> 
            </CardColumn>
          </div>
        )
        : (
          <div className="c7ntest-right-card-container">
            <CardColumn>
              <CardItem label={<FormattedMessage id="cycle_createBy" />} content={<User user={createdUser} />} />
            </CardColumn>
            <CardColumn>
              <CardItem label={<FormattedMessage id="cycle_startTime" />} content={fromDate && moment(fromDate).format('YYYY/MM/DD')} />
            </CardColumn>
            <CardColumn>
              <CardItem label={<FormattedMessage id="cycle_endTime" />} content={toDate && moment(toDate).format('YYYY/MM/DD')} />
            </CardColumn>
          </div>
        )}
    </Fragment>
  );
};
ShowCycleData.propTypes = propTypes;

export default memo(ShowCycleData, isEqual);
