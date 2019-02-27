import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { Popover } from 'choerodon-ui';
import './TestProgressLine.scss';

const TestProgressLine = ({
  progress, statusList, style, ...restProps
}) => {
  let total = 0;
  const ProcessBar = {};
  const content = [];
  for (let i = 0; i < statusList.length; i += 1) {
    const status = statusList[i];
    if (progress[status.statusColor]) {
      ProcessBar[status.statusColor] = progress[status.statusColor];
      content.push(
        <div key={status.statusColor} style={{ display: 'flex', width: 100 }}>
          <div>{status.statusName}</div>
          <div className="c7ntest-flex-space" />
          <div>{progress[status.statusColor]}</div>
        </div>,
      );
    }
  }
  Object.keys(ProcessBar).forEach((key) => { total += ProcessBar[key]; });
  const inner = Object.keys(ProcessBar).map((key, i) => {
    const percentage = (ProcessBar[key] / total) * 100;

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
    Object.keys(ProcessBar).length > 0
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
