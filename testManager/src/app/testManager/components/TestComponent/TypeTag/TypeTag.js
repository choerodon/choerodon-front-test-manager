import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';

class TypeTag extends Component {
  render() {
    const { type } = this.props;
    const {
      colour: typeColor, name: typeName, typeCode, icon,
    } = type || {}; 
    return (
      <div style={{ display: 'flex' }}>
        <div
          className=""
          style={{
            backgroundColor: `#${typeColor}`,
            display: 'flex',
            width: 20,
            height: 20,
            borderRadius: '50%',
            color: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            style={{ fontSize: '14px' }}
            type={icon}
          />
        </div>
        {
          this.props.showName && (
            <span style={{ marginLeft: 8 }}>{typeName}</span>
          )
        }
      </div>
    );
  }
}
export default TypeTag;
