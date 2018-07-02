import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import './TextEditToggle.scss';
class Text extends Component {
  render() {
    return this.props.children
  }
}
class Edit extends Component {
  render() {
    return this.props.children
  }
}
class TextEditToggle extends Component {
  state = {
    editing: false,
  }
  componentDidMount() {

  }
  enterEditing = () => {
    this.setState({
      editing: true
    })
  }
  leaveEditing = () => {
    this.setState({
      editing: false
    })
  }
  onSubmit=()=>{
    this.setState({
      editing: false
    })
    this.props.onSubmit();
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
      child = <div className="c7n-TextEditToggle-text">
        {child}
        <Icon type="mode_edit" className="c7n-TextEditToggle-text-icon" onClick={this.enterEditing} />
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