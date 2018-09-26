import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Form, Modal } from 'choerodon-ui';

import WYSIWYGEditor from '../WYSIWYGEditor';

class CreateSprint extends Component {
  state = {
    delta: '',
  };

  componentWillReceiveProps(nextProps) {
    try {
      JSON.parse(nextProps.initValue);
      this.setState({
        delta: JSON.parse(nextProps.initValue),
      });
    } catch (error) {
      this.setState({
        delta: nextProps.initValue,
      });
    }
  }


  handleOk = () => {
    this.props.onOk(this.state.delta);
  }

  render() {
    const { visible, onCancel, onOk } = this.props;

    return (
      <Modal
        title={Choerodon.getMessage('编辑描述', 'Edit description')}
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
