import React from 'react';
import { Icon } from 'choerodon-ui';

const STATUS = {
  passed: {
    icon: 'check_circle',
    text: '通过',
    color: '#00BF96',
  },
  pending: {
    icon: 'timelapse',
    text: '进行中',
    color: '#4D90FE',
  },
  failed: {
    icon: 'cancel',
    text: '失败',
    color: '#F44336',
  },
};
const TESTRESULT = {
  passed: {
    icon: 'check_circle',
    text: '全部通过',
    color: '#00BF96',
  },
  pending: {
    icon: 'timelapse',
    text: '部分通过',
    color: '#4D90FE',
  },
  failed: {
    icon: 'cancel',
    text: '全未通过',
    color: '#F44336',
  },
};
export function CiStatus(status) {
  const tag = STATUS[status];
  return (
    <div className="c7ntest-center">
      <Icon type={tag.icon} style={{ color: tag.color, marginRight: 5 }} />
      {tag.text}
    </div>
  );
}

export function TestResult(result) {
  const tag = TESTRESULT[result];
  return (
    <div style={{
      width: 50,
      height: 16,
      color: 'white',
      background: tag.color,
      borderRadius: 2, 
      fontSize: '10px',
      lineHeight: '16px',
      textAlign: 'center',
    }}
    >     
      {tag.text}
    </div>
  );
}
