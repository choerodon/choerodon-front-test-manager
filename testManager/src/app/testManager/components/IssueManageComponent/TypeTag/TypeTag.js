import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import { Icon } from 'choerodon-ui';

const TypeTag = ({
  type,
  showName,
}) => {
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
          showName && (
            <span style={{ marginLeft: 8 }}>{typeName}</span>
          )
        }
    </div>
  );
};
export default memo(TypeTag, isEqual);
