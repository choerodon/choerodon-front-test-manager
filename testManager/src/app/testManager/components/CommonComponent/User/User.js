import React, { Component } from 'react';
import PropTypes from 'prop-types';

class User extends Component {
  render() {
    const { user } = this.props;
    return user ? (
      <div 
        style={{        
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            background: '#c5cbe8',
            color: '#6473c3',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 5,
            textAlign: 'center',
            borderRadius: '50%',
          }}
        >
          {
            user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                style={{ width: '100%' }}
              />
            ) : (
              <span style={{ width: 18, height: 18, lineHeight: '18px', textAlign: 'center', color: '#6473c3' }}>
                {user.realName[0]}
              </span>
            )
          }
        </div>
        <div>
          <span
            style={{             
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              lineHeight: '20px',
              color: 'rgba(0, 0, 0, 0.65)',
            }}
          >
            {user.loginName} {user.realName}
          </span>
        </div>
      </div>

    ) : null;
  }
}


export default User;
