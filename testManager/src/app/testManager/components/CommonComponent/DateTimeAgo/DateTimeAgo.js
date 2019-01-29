import React, { Component } from 'react';
import TimeAgo from 'timeago-react';
import { Tooltip } from 'choerodon-ui';

class Timeago extends Component {
  render() {
    const { date } = this.props;
    return (
      <div>
        <Tooltip placement="top" title={date || ''}>
          <TimeAgo datetime={date || ''} locale={Choerodon.getMessage('zh_CN', 'en')} />
        </Tooltip>
      </div>
    );
  }
}
export default Timeago;
