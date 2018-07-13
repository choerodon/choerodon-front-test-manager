import React, { Component } from 'react';
import { Input, Tooltip } from 'choerodon-ui';
import { AppState } from 'choerodon-front-boot';

class NumericInput extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      users: [],
    };
  }

  componentWillMount() {
  }

  onChange = (e) => {
    const { value } = e.target;
    // const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    const reg = /^(0|[1-9][0-9]*)(\[0-9]*)?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '') {
      this.props.onChange(value);
    }
  }
  // '.' at the end or only '-' in the input box.
  onBlur = () => {
    const { value, onBlur, onChange } = this.props;
    if (value.charAt(value.length - 1) === '.' || value === '-') {
      onChange({ value: value.slice(0, -1) });
    }
    if (onBlur) {
      onBlur();
    }
  }

  formatNumber(value) {
    value += '';
    const list = value.split('.');
    const prefix = list[0].charAt(0) === '-' ? '-' : '';
    let num = prefix ? list[0].slice(1) : list[0];
    let result = '';
    while (num.length > 3) {
      result = `,${num.slice(-3)}${result}`;
      num = num.slice(0, num.length - 3);
    }
    if (num) {
      result = num + result;
    }
    return `${prefix}${result}${list[1] ? `.${list[1]}` : ''}`;
  }

  render() {
    const { value } = this.props;
    const title = value ? (
      <span className="numeric-input-title">
        {value !== '-' ? this.formatNumber(value) : '-'}
      </span>
    ) : 'Input a number';
    return (
      // <Tooltip
      //   trigger={['focus']}
      //   title={title}
      //   placement="topLeft"
      //   overlayClassName="numeric-input"
      // >
      <Input
        {...this.props}
        onChange={this.onChange}
        onBlur={this.onBlur}
        // placeholder="Input a number"
        maxLength="3"
      />
      // </Tooltip>
    );
  }
}

export default NumericInput;
