import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';

class TypeTag extends Component {
  render() {
    const { type } = this.props;
    const {
      colour: typeColor, name: typeName, typeCode, icon,
    } = type || {}; 
    const backgroundColor = typeColor && typeColor.includes('#') ? typeColor : `#${typeColor}`;
    return (
      <div style={{ display: 'flex' }}>
        <div      
          style={{
            backgroundColor,
            display: 'flex',
            width: 20,
            height: 20,
            borderRadius: '4px',
            color: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon
            style={{ fontSize: '14px' }}
            type={icon}
            color="#fff"
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
