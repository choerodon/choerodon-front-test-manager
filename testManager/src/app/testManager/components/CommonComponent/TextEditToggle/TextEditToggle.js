/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react';
import { Form, Icon } from 'choerodon-ui';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import './TextEditToggle.scss';

const Text = props => props.children;
const Edit = props => props.children;
const FormItem = Form.Item;
function contains(root, n) {
  let node = n;
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}
@observer
class TextEditToggle extends Component {
  state = {
    editing: false,
    originData: null,
  }

  static defaultProps = {
    // hasFeedback: false,
    // prefixCls: 'ant-form',
    // colon: true,
  };

  static propTypes = {
    // prefixCls: PropTypes.string,
    // label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    // labelCol: PropTypes.object,
    // help: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
    // validateStatus: PropTypes.oneOf(['', 'success', 'warning', 'error', 'validating']),
    // hasFeedback: PropTypes.bool,
    // wrapperCol: PropTypes.object,
    // className: PropTypes.string,
    // id: PropTypes.string,
    // children: PropTypes.node,
    // colon: PropTypes.bool,
  };


  onDocumentClick = (event) => {
    const target = event.target;
    const root = findDOMNode(this);
    // 如果点击不在当前元素内，就调用submit提交数据
    if (!contains(root, target)) {
      console.log(target);
      this.onSubmit();
    }
  }

  // 提交编辑
  onSubmit = () => {
    document.removeEventListener('mousedown', this.onDocumentClick);
    try {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          if (this.props.formKey) {
            const newValue = values[this.props.formKey];
            if (this.props.onSubmit && newValue !== this.props.originData) {
              this.props.onSubmit(this.props.formKey ? newValue : null);
            }
          } else {
            this.props.onSubmit();
          }
          this.setState({
            editing: false,
          });
        }
      });
    } catch (err) {
      this.setState({
        editing: false,
      });
    }
  }

  // 进入编辑状态
  enterEditing = () => {
    // 如果禁用，将不进入编辑模式
    const { disabled } = this.props;
    if (disabled) {
      return;
    }
    document.addEventListener('mousedown', this.onDocumentClick);
    this.setState({
      editing: true,
      originData: this.props.originData,
    });
  }

  // 取消编辑
  leaveEditing = () => {
    document.removeEventListener('mousedown', this.onDocumentClick);
    this.setState({
      editing: false,
    });
    if (this.props.onCancel) {
      this.props.onCancel(this.state.originData);
    }
  }

  getEditOrTextChildren = () => {
    const { editing } = this.state;
    const { children } = this.props;
    return editing
      ? children.filter(child => child.type === Edit)
      : children.filter(child => child.type === Text);
  }

  renderFormItemChild(children) {
    // formItem只有一个组件起作用
    const childrenArray = React.Children.toArray(children);
    const targetElement = childrenArray.filter(child => child.type
      && child.type.prototype instanceof Component)[0];
    if (!targetElement) {
      throw new Error('使用Form功能时，Edit的children必须是Component');
    }
    return targetElement;
  }

  // 为子元素加上getPopupContainer，因为默认getPopupContainer是body,点击时判断onDocumentClick会调用onSubmit方法
  wrapChildren = (children) => {
    const childrenArray = React.Children.toArray(children);
    console.log(childrenArray);
    return childrenArray.map(child => React.cloneElement(child, {
      getPopupContainer: () => findDOMNode(this),
    }));
  }

  renderChild = () => {
    const { editing } = this.state;
    const { disabled } = this.props;
    const { originData, formKey, rules } = this.props;
    const { getFieldDecorator } = this.props.form;
    // 拿到不同模式下对应的子元素
    const children = this.getEditOrTextChildren();
    // 根据不同模式对子元素进行包装
    return editing ? (
      <div className="c7n-TextEditToggle-edit">
        { // 采用form模式就进行form包装,否则
          formKey ? (
            <Form layout="vertical">
              {children.map(child => (
                <FormItem>
                  {getFieldDecorator(formKey, {
                    rules,
                    initialValue: originData,
                  })(
                    this.renderFormItemChild(this.wrapChildren(child.props.children)),
                  )}
                </FormItem>
              ))}
            </Form>
          ) : children.map(child => (this.wrapChildren(child.props.children)))
        }
        <div style={{ textAlign: 'right', lineHeight: '20px' }}>
          <Icon type="done" className="c7n-TextEditToggle-edit-icon" onClick={this.onSubmit} />
          <Icon type="close" className="c7n-TextEditToggle-edit-icon" onClick={this.leaveEditing} />
        </div>
      </div>
    ) : (
      <div
        className={disabled ? 'c7n-TextEditToggle-text' : 'c7n-TextEditToggle-text c7n-TextEditToggle-text-active'}
        onClick={this.enterEditing}
        role="none"
      >
        {children}
        <Icon type="mode_edit" className="c7n-TextEditToggle-text-icon" />
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderChild()}
      </div>
    );
  }
}
TextEditToggle.Text = Text;
TextEditToggle.Edit = Edit;

Text.propTypes = {
  children: PropTypes.element.isRequired,
};
Edit.propTypes = {
  children: PropTypes.element.isRequired,
};
export default Form.create({})(TextEditToggle);
