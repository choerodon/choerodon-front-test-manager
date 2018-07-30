import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DefectBox from './DefectBox';

class ExecuteBox extends Component {
  render() {
    const { execute } = this.props;
    const { defects, subStepDefects } = execute;
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start' }} className="c7n-storyArea-border">
        <div style={{ flex: 1 }}>
        executebox
        </div>
        <div style={{ flex: 1 }}>
          {defects.concat(subStepDefects).map(defect => <DefectBox defect={defect} />)}
        </div>
      </div>
    );
  }
}

ExecuteBox.propTypes = {

};

export default ExecuteBox;
