import React from 'react';
import { Icon } from 'choerodon-ui';
import './TypeTag.scss';

const initTypes = ['agile_epic', 'agile_story', 'agile_fault', 'agile_task', 'agile_subtask'];
const TypeTag = ({
  type, style, showName,
}) => {
  const {
    colour: typeColor, name: typeName, typeCode, icon,
  } = type || {}; 
  const backgroundColor = typeColor && typeColor.includes('#') ? typeColor : `#${typeColor}`;
  return (
    <div className="c7n-typeTag" style={style}>
      {initTypes.indexOf(icon || '') !== -1
        ? (
          <Icon
            style={{
              fontSize: '26px',
              color: typeColor || '#fab614',
            }}
            type={icon || 'help'}
          />
        )
        : (
          <div
            className="icon-wapper"
            style={{
              backgroundColor: typeColor || '#fab614',
              padding: '2px',
              margin: '3px',
            }}
          >
            <Icon
              style={{ fontSize: '16px' }}
              type={icon || 'help'}
            />
          </div>
        )
      }
      {
        showName && (
          <span className="name">{typeName || ''}</span>
        )
      }
    </div>
  );
};
export default TypeTag;
