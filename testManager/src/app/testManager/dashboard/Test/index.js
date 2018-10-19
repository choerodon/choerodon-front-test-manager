import React, { Component } from 'react';
import { DashBoardNavBar } from 'choerodon-front-boot';

import './index.scss';

export default class Announcement extends Component {
  render() {
    return (
      <div className="c7ntest-dashboard-Test">
        <ul>
          <li>           
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/case-management/">
              {Choerodon.getMessage('测试用例管理', 'issue manage')}
            </a>
          </li>
          <li>           
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/test-cycle/">
              {Choerodon.getMessage('测试循环', 'cycle')}
            </a>
          </li>
          <li>           
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/execution-test/">
              {Choerodon.getMessage('执行测试', 'execute')}
            </a>
          </li>
          <li>           
            <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/test-report/">
              {Choerodon.getMessage('测试报告', 'report')}
            </a>
          </li>
        </ul>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/user-guide/test-management/">{Choerodon.getMessage('查看测试管理文档', 'review test manage document')}</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
