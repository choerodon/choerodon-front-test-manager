import React, { Component } from 'react';
import { Radio } from 'choerodon-ui';
import { FormattedMessage } from 'react-intl';
import './RadioButton.scss';

class RadioButton extends Component {
  render() {
    const { 
      style, defaultValue, onChange, data, 
    } = this.props;
    return (
      <div className="c7ntest-radio-button" style={style}>
        <Radio.Group defaultValue={defaultValue} onChange={onChange}>
          {
            data.map(button => (
              <Radio.Button value={button.value}>
                <FormattedMessage id={button.text} />
              </Radio.Button>
            ))
          }        
        </Radio.Group>
      </div>
    );
  }
}

RadioButton.propTypes = {

};

export default RadioButton;
