import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import { Form } from 'choerodon-ui';
import './TextEditToggle.scss';

const Text = props => props.children;
const Edit = props => props.children;
const FormItem = Form.Item;
class TextEditToggle extends Component {
  state = {
    editing: false,
    originData: null,
  }
  componentDidMount() {

  }
  // 提交编辑
  onSubmit = () => {
    const { getFieldValue } = this.props.form;
    this.setState({
      editing: false,
    });
    if (this.props.onSubmit) {
      // console.log(this.props.formKey, getFieldValue(this.props.formKey));
      this.props.onSubmit(this.props.formKey ? getFieldValue(this.props.formKey) : null);
    }
  }
  // 进入编辑状态
  enterEditing = () => {
    this.setState({
      editing: true,
      originData: this.props.originData,
    });
  }
  // 取消编辑
  leaveEditing = () => {
    this.setState({
      editing: false,
    });
    if (this.props.onCancel) {
      this.props.onCancel(this.state.originData);
    }
  }

  renderChild = () => {
    const { editing } = this.state;
    const { children, originData, formKey } = this.props;
    const { getFieldDecorator } = this.props.form;
    let child = null;
    // window.console.log(children, children[0].props.children);
    if (editing) {
      child = children.filter(current => current.type === Edit);
      child = (<div className="c7n-TextEditToggle-edit">
        <Form layout="vertical">
          {child.map(one =>
            (formKey ? <FormItem >
              {getFieldDecorator(formKey, {
                // rules: [{ required: true, message: '测试步骤为必输项' }],
                initialValue: originData,
              })(
                one.props.children,
              )}
            </FormItem> : one),
          )}
        </Form>
        {/* {child} */}
        <div style={{ textAlign: 'right', lineHeight: '20px' }}>
          <Icon type="done" className="c7n-TextEditToggle-edit-icon" onClick={this.onSubmit} />
          <Icon type="close" className="c7n-TextEditToggle-edit-icon" onClick={this.leaveEditing} />
        </div>
      </div>);
    } else {
      child = children.filter(current => current.type === Text);
      child = (<div className="c7n-TextEditToggle-text" onClick={this.enterEditing} role="none">
        {child}
        <Icon type="mode_edit" className="c7n-TextEditToggle-text-icon" />
      </div>);
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

TextEditToggle.propTypes = {
  // onSubmit: PropTypes.func.isRequired,
  // originData: PropTypes.any.isRequired,
  // onCancel: PropTypes.func.isRequired,
};

export default Form.create({})(TextEditToggle);
