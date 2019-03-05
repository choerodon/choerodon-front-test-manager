import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CompactPicker } from 'react-color';
import PropTypes from 'prop-types';
import './ColorPicker.scss';

class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      color: props.value || 'GRAY',
    };
  }


  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      return {
        color: nextProps.value,
        // ...(nextProps.value || {}),
      };
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('click', this.hiddenPicker);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.hiddenPicker);
  }

  handleColorChange = (Color) => {
    const {
      r, g, b, a,
    } = Color.rgb;
    const color = `rgba(${r},${g},${b},${a})`;
    // this.handleCheckColor(color);
    // this.setState({ color });    
    if (!('value' in this.props)) {
      this.setState({ color });
    }
    this.triggerChange(color);
  }

  handleVisibleChange = (visible) => {
    console.log(visible);
    // if (!('value' in this.props)) {
    this.setState({ visible });
    // }
    // this.triggerChange({ visible });
  }

  hiddenPicker = () => {
    console.log('hidden');
    this.handleVisibleChange(false);
  }

  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  }

  render() {
    const { visible, color } = this.state;
    return (
      <div role="none" className="c7ntest-CreateStatus-color-picker-container" onClick={e => e.stopPropagation()}>
        <FormattedMessage id="color" />
        {'：'}
        <div
          className="c7ntest-CreateStatus-color-picker-show"
          role="none"
          onClick={(e) => {
            e.stopPropagation();
            this.handleVisibleChange(true);
          }}
        >
          <div style={{ background: color }}>
            <div className="c7ntest-CreateStatus-color-picker-show-rec-con">
              <div className="c7ntest-CreateStatus-color-picker-show-rec" />
            </div>
          </div>
        </div>
        <div
          style={visible
            ? {
              display: 'block', position: 'absolute', bottom: 20, left: 60,
            }
            : { display: 'none' }}
        >
          <CompactPicker
            color={color}
            onChangeComplete={this.handleColorChange}
          />
        </div>
      </div>
    );
  }
}

ColorPicker.propTypes = {

};

export default ColorPicker;
