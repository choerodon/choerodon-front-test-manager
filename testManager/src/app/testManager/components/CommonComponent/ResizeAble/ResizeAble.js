import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import './ResizeAble.css';

class ResizeAble extends Component {
  saveRef = name => (ref) => {
    this[name] = ref;
  }

  handleMouseDown = (mode, e) => {
    e.stopPropagation();
    e.preventDefault();

    console.log('down');
    console.log(e.clientX, e.clientY);
    this.initPosition = {
      mode,
      width: this.con.offsetWidth,
      height: this.con.offsetHeight,
      x: e.clientX,
      y: e.clientY,
    };
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseUp = (e) => {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();
    requestAnimationFrame(() => {
      const {
        width, height, x, y, mode,
      } = this.initPosition;
      console.log(mode, e.clientY, y);
      switch (mode) {
        case 'top': {
          this.con.style.height = `${height - e.clientY - y}px`;
          break;
        }
        case 'topright': {
          this.con.style.height = `${height - e.clientY - y}px`;
          this.con.style.width = `${width + e.clientX - x}px`;
          break;
        }
        case 'right': {
          this.con.style.width = `${width + e.clientX - x}px`;
          break;
        }
        case 'bottomright': {
          this.con.style.width = `${width + e.clientX - x}px`;
          this.con.style.height = `${height + e.clientY - y}px`;
          break;
        }
        case 'bottom': {
          this.con.style.height = `${height + e.clientY - y}px`;  
          break;
        }
        case 'bottomleft': {
          this.con.style.height = `${height - e.clientY - y}px`;
          this.con.style.width = `${width - e.clientX - x}px`;
          break;
        }
        case 'left': {
          this.con.style.width = `${width - e.clientX - x}px`;
          break;
        }
        case 'lefttop': {
          this.con.style.height = `${height - e.clientY - y}px`;
          this.con.style.width = `${width - e.clientX - x}px`;
          break;
        }
        default: break;
      }
    });
  }

  render() {
    return (
      <div className="resizeable container" ref={this.saveRef('con')}>
        {this.props.children}
        {
          ['top', 'right', 'bottom', 'left', 'bottomright', 'topright', 'bottomleft', 'lefttop']
            .map(position => <div role="none" className={`resizeable-bar-${position}`} onMouseDown={this.handleMouseDown.bind(this, position)} />)
        }
      </div>
    );
  }
}

// ResizeAble.propTypes = {

// };

export default ResizeAble;
