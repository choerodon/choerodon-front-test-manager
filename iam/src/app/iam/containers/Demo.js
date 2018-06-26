import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import GrayStore from '../stores/organization/gray/GrayStore';

@inject('AppState')
@observer
class Demo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
    };
  }
  test =() => {
    GrayStore.testGray().then(() => {
      window.console.log(true);
    }).catch(() => {
      window.console.log(false);
    });
  };
  render() {
    return (
      <div>
        <button onClick={this.test}>测试DEMO</button>
        this is DEMO
      </div>
    );
  }
}
export default withRouter(Demo);

