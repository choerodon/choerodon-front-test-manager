import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './TextEditToggle.scss';
const Text = (props) => props.children;
const Edit = (props) => props.children;

class TextEditToggle extends Component {
  state = {
    editing: false,
    originData: null,
  }
  componentDidMount() {

  }
  // 进入编辑状态
  enterEditing = () => {
    this.setState({
      editing: true,
      originData: this.props.originData
    })
  }
  // 取消编辑
  leaveEditing = () => {
    this.setState({
      editing: false
    });
    this.props.onCancel(this.state.originData);
  }
  // 提交编辑
  onSubmit = () => {
    this.setState({
      editing: false
    })
    this.props.onSubmit(this.state.originData);
  }
  renderChild = () => {
    const { editing } = this.state;
    const { children } = this.props;
    let child = null;
    if (editing) {
      child = children.filter(child => child.type === Edit);
      child = <div className="c7n-TextEditToggle-edit">
        {child}
        <div style={{ textAlign: 'right' }}>
          <Icon type="done" className="c7n-TextEditToggle-edit-icon" onClick={this.onSubmit} />
          <Icon type="close" className="c7n-TextEditToggle-edit-icon" onClick={this.leaveEditing} />
        </div>
      </div>
    } else {
      child = children.filter(child => child.type === Text)
      child = <div className="c7n-TextEditToggle-text" onClick={this.enterEditing}>
        {child}
        <Icon type="mode_edit" className="c7n-TextEditToggle-text-icon" />
      </div>
    }
    return child;
  }
  render() {
    const { editing } = this.state;
    const child = this.renderChild();
    // console.log(child);
    return child;
  }
}
TextEditToggle.Text = Text;
TextEditToggle.Edit = Edit;
export default TextEditToggle;