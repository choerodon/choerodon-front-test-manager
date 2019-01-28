import React from 'react';
import './TestProgressLine.scss';

const TestProgressLine = ({ progress, style, ...restProps }) => {
  let count = 0;
  const processBarObject = Object.entries(progress);
  for (let a = 0; a < processBarObject.length; a += 1) {
    count += processBarObject[a][1];
  }
  const inner = processBarObject.map((item, i) => {
    const percentage = (item[1] / count) * 100; 
      
    return <span key={Math.random()} className="c7ntest-process-line-fill-item" style={{ backgroundColor: item[0], width: `${percentage}%` }} />;
  });

  return (
    <div className="c7ntest-process-line" style={style}>
      <span className="c7ntest-process-line-unfill" />     
      <div className="c7ntest-process-line-fill-area">
        {inner}
      </div>          
    </div>
  );
};
export default TestProgressLine;
