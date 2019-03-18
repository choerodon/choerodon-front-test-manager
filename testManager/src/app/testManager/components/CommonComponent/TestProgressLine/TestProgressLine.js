import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { Popover } from 'choerodon-ui';
import './TestProgressLine.scss';

const TestProgressLine = ({
  progress, style, ...restProps
}) => {
  let total = 0;
  // 对状态进行id排序
  const keys = Object.keys(progress).sort((a, b) => progress[a].statusId - progress[b].statusId);
  
  const content = keys.map((key) => {
    const { statusName, counts } = progress[key];
    return (
      <div key={key} className="c7ntest-between" style={{ width: 100 }}>
        <div>{statusName}</div>        
        <div>{counts}</div>
      </div>
    );
  });
  keys.forEach((key) => { total += progress[key].counts; });
  const inner = keys.map((key, i) => {
    const percentage = (progress[key].counts / total) * 100;

    return <span className="c7ntest-process-line-fill-item" style={{ backgroundColor: key, width: `${percentage}%` }} />;
  });
  const renderLine = () => (
    <div className="c7ntest-process-line" style={style}>
      <span className="c7ntest-process-line-unfill" />
      <div className="c7ntest-process-line-fill-area">
        {inner}
      </div>
    </div>
  );
  return (
    keys.length > 0
      ? (
        <Popover
          content={<div>{content}</div>}
          title={null}
        >
          {renderLine()}
        </Popover>
      )
      : renderLine()
  );
};
export default memo(TestProgressLine, isEqual);
