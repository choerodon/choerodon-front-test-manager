import React, { Component } from 'react';
import { Icon } from 'choerodon-ui';
import { Form } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import TextEditToggleStore from './TextEditToggleStore';
import './TextEditToggle.scss';

const Text = props => props.children;
const Edit = props => props.children;
const FormItem = Form.Item;
@observer
class TextEditToggle extends Component {
  state = {
    editing: false,
    originData: null,
  }

  componentDidMount() {
    this.key = Math.random();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onSubmit);
  }

  // componentWillReact(nextProps) {
  //   console.log('will');
  // }

  // 提交编辑
  onSubmit = () => {
    // e.nativeEvent.stopImmediatePropagation(); 
    document.removeEventListener('click', this.onSubmit);
    const { getFieldValue } = this.props.form;
    try {
      const newValue = getFieldValue(this.props.formKey);
      // console.log(newValue);
      if (this.props.onSubmit && newValue !== this.props.originData) {
        // console.log(this.props.formKey, getFieldValue(this.props.formKey));      
        this.props.onSubmit(this.props.formKey ? newValue : null);
      }
      this.setState({
        editing: false,
      });
    } catch (err) {
      this.setState({
        editing: false,
      });
    }
  }

  // 进入编辑状态
  enterEditing = () => {
    // console.log('enter');
    TextEditToggleStore.setCurrentToggle(this.key);
    document.addEventListener('click', this.onSubmit);
    this.setState({
      editing: true,
      originData: this.props.originData,
    });
  }

  // 取消编辑
  leaveEditing = () => {
    document.removeEventListener('click', this.onSubmit);
    this.setState({
      editing: false,
    });
    if (this.props.onCancel) {
      this.props.onCancel(this.state.originData);
    }
  }

  renderFormItemChild(children) {
    // formItem只有一个组件起作用
    if (children instanceof Array) {
      const targetElement = children.filter(child => child.type
        && child.type.prototype instanceof Component)[0];
      return targetElement;
      // return React.cloneElement(targetElement, {
      //   autoFocus: true,
      //   onBlur: this.onSubmit,
      // });
    } else if (children.type.prototype instanceof Component) {
      return children;
      // return React.cloneElement(children, {
      //   autoFocus: true,
      //   onBlur: this.onSubmit,
      // });
    } else {
      throw new Error('使用Form功能时，Edit的children必须是Component');
    }
  }

  renderChild = () => {
    const { editing } = this.state;
    const { children, originData, formKey } = this.props;
    const { getFieldDecorator } = this.props.form;

    let child = null;
    if (editing) {
      child = children.filter(current => current.type === Edit);
      child = (
        <div className="c7n-TextEditToggle-edit">
          <Form layout="vertical">
            {child.map(one => (formKey ? (
              <FormItem>
                {getFieldDecorator(formKey, {
                  // rules: [{ required: true, message: '测试步骤为必输项' }],
                  initialValue: originData,
                })(
                  this.renderFormItemChild(one.props.children),
                )}
              </FormItem>
            ) : one))}
          </Form>
          {/* {child} */}
          <div style={{ textAlign: 'right', lineHeight: '20px' }}>
            <Icon type="done" className="c7n-TextEditToggle-edit-icon" onClick={this.onSubmit} />
            <Icon type="close" className="c7n-TextEditToggle-edit-icon" onClick={this.leaveEditing} />
          </div>
        </div>
      );
    } else {
      child = children.filter(current => current.type === Text);
      child = (
        <div className="c7n-TextEditToggle-text" onClick={this.enterEditing} role="none">
          {child}
          <Icon type="mode_edit" className="c7n-TextEditToggle-text-icon" />
        </div>
      );
    }
    return child;
  }

  render() {
    const { editing } = this.state;
    const child = this.renderChild();
    // console.log(child);
    const currentToggle = TextEditToggleStore.getCurrentToggle;
    
    return (
      <div
        onClick={(event) => {
          // console.log(currentToggle, this.key);
          if (currentToggle === this.key) {
            event.nativeEvent.stopImmediatePropagation();
          }
          // event.preventDefault();
          // event.stopPropagation();
        }}
        role="none"
      >
        {child}
      </div>
    );
  }
}
TextEditToggle.Text = Text;
TextEditToggle.Edit = Edit;

Text.propTypes = {
  children: PropTypes.node,
};
Edit.propTypes = {
  children: PropTypes.node,
};
export default Form.create({})(TextEditToggle);
