import React, { Component } from 'react';
import './EmptyBlock.scss';

class EmptyBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    return (
      <div
        className="c7ntest-emptyBlock"
        style={{ ...this.props.style }}
      >
        <div
          className="c7ntest-wrap"
          style={{
            border: this.props.border ? '1px dashed rgba(0, 0, 0, 0.54)' : '',
          }}
        >
          <div className="c7ntest-imgWrap">
            <img src={this.props.pic} alt="" className="c7ntest-img" />
          </div>
          <div
            className="c7ntest-textWrap"
            // style={{ width: this.props.textWidth || 150 }}
          >
            <h1 className="c7ntest-title">
              {this.props.title || ''}
            </h1>
            <div className="c7ntest-des">
              {this.props.des || ''}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default EmptyBlock;
