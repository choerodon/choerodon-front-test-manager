import React, { memo } from 'react';
import isEqual from 'react-fast-compare';
import './UserHead.scss';

function getFirst(str) {
  if (!str) {
    return '';
  }
  const re = /[\u4E00-\u9FA5]/g;
  for (let i = 0, len = str.length; i < len; i += 1) {
    if (re.test(str[i])) {
      return str[i];
    }
  }
  return str[0];
}
const UserHead = ({
  user, color,
  style,
  type,
  hiddenText,
}) => (
  <div
    className="c7ntest-userHead"
    style={{
      ...style,
      display: user.id ? 'flex' : 'none',
    }}
  >
    {type === 'datalog' ? (
      <div
        style={{
          width: 40,
          height: 40,
          background: '#b3bac5',
          color: '#fff',
          overflow: 'hidden',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          borderRadius: 4,
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" style={{ width: '100%' }} />
        ) : (
          <span style={{
            width: 40, height: 40, lineHeight: '40px', textAlign: 'center', color: '#fff', fontSize: '12px',
          }}
          >
            {getFirst(user.realName)}
          </span>
        )}
      </div>
    ) : (
      <div
        style={{
          width: 18,
          height: 18,
          background: '#c5cbe8',
          color: '#6473c3',
          overflow: 'hidden',
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 5,
          textAlign: 'center',
          borderRadius: '50%',
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" style={{ width: '100%' }} />
        ) : (
          <span style={{
            width: 18, height: 18, lineHeight: '18px', textAlign: 'center', color: '#6473c3',
          }}
          >
            {getFirst(user.realName)}
          </span>
        )}
      </div>
    )}
    {!hiddenText && (
    <span
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '13px',
        lineHeight: '20px',
        color: color || 'rgba(0, 0, 0, 0.65)',
      }}
    >
      {`${user.loginName || ''}${user.realName || ''}`}
    </span>
    )}
  </div>
);
export default memo(UserHead, isEqual);
