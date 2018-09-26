import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Modal } from 'choerodon-ui';
import '../../../assets/main.scss';

import WYSIWYGEditor from '../WYSIWYGEditor';


class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delta: '', 
    };
  }

  componentDidMount() {
    this.initValue();
  }

  initValue() {
    this.setState({
      delta: this.props.initValue,
    });
  }

  handleOk = () => {
    this.props.onOk(this.state.delta);
  }

  render() {
    const { visible } = this.props;

    return (
      <Modal
        title="编辑任务描述"
        visible={visible || false}
        maskClosable={false}
        width={1200}
        onCancel={this.props.onCancel}
        onOk={this.handleOk}
      >
        <WYSIWYGEditor
          value={this.state.delta}
          style={{ height: 500, width: '100%', marginTop: 20 }}
          onChange={(value) => {
            this.setState({ delta: value });
          }}
        />
      </Modal>
    );
  }
}
export default Form.create({})(withRouter(CreateSprint));
