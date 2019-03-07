import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { Popover } from 'choerodon-ui';
import './TestProgressLine.scss';

const TestProgressLine = ({
  progress, style, ...restProps
}) => {
  let total = 0;
  // const progress = {};
  const content = Object.keys(progress).map((key) => {
    const { statusName, counts } = progress[key];
    return (
      <div key={key} style={{ display: 'flex', width: 100 }}>
        <div>{statusName}</div>
        <div className="c7ntest-flex-space" />
        <div>{counts}</div>
      </div>
    );
  });

  Object.keys(progress).forEach((key) => { total += progress[key].counts; });
  const inner = Object.keys(progress).map((key, i) => {
    const percentage = (progress[key].counts / total) * 100;

    return <span key={Math.random()} className="c7ntest-process-line-fill-item" style={{ backgroundColor: key, width: `${percentage}%` }} />;
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
    Object.keys(progress).length > 0
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
