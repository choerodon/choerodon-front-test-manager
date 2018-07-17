import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ShowCycleData.scss';

class ShowCycleData extends Component {
  render() {
    const { type, build, cycleId, versionName, title,
      description, toDate, environment, fromDate, cycleCaseList, createdName,
      children,
    } = this.props.data;
    const user = createdName ? createdName.split(' ') : ['', ''];
    // 全局数
    let allExectueNum = 0;    
    // 全局执行过的数
    let ExectuedNum = 0;
    Object.keys(cycleCaseList || {}).forEach((key) => {
      if (key !== 'gray') {
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
      type === 'cycle' ?
        <div className="c7n-right-card-container">
          <div className="c7n-right-card-column">
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              构建号：
              </div>
              <div className="c7n-right-card-item-text">
                {build}
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
            开始时间：
              </div>
              <div className="c7n-right-card-item-text">
                {fromDate}
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
            全层级执行数：
              </div>
              <div className="c7n-right-card-item-text">
                {allExectueNum}
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
            说明：
              </div>
              <div className="c7n-right-card-item-text">
                {description}
              </div>
            </div>
          </div>
          <div className="c7n-right-card-column">
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              环境：
              </div>
              <div className="c7n-right-card-item-text">
                {environment}
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              循环层执行数：
              </div>
              <div className="c7n-right-card-item-text">
                {CycleExectueNum}
              </div>
            </div>
          </div>
          <div className="c7n-right-card-column">
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              创建人：
              </div>
              <div className="c7n-right-card-item-text">           
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="c7n-avatar">
                    {user[1].slice(0, 1)}
                  </span>
                  <span>
                    {`${user[0]} ${user[1]}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              结束时间：
              </div>
              <div className="c7n-right-card-item-text">
                {toDate}
              </div>
            </div>
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              全层级已执行数：
              </div>
              <div className="c7n-right-card-item-text">
                {ExectuedNum}
              </div>
            </div>
          </div>
        </div> :
        <div className="c7n-right-card-container">
          <div className="c7n-right-card-column">
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              全部执行数：
              </div>
              <div className="c7n-right-card-item-text">
                {allExectueNum}
              </div>
            </div>
          </div> 
          <div className="c7n-right-card-column">            
            <div className="c7n-right-card-item">
              <div className="c7n-right-card-item-label">
              已执行数：
              </div>
              <div className="c7n-right-card-item-text">
                {ExectuedNum}
              </div>
            </div>       
          </div>
        </div>

    );
  }
}


export default ShowCycleData;
