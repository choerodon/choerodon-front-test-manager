import React, { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { Button } from 'choerodon-ui';
import 'react-quill/dist/quill.snow.css';
import ImageDrop from './ImageDrop';
import './WYSIWYGEditor.scss';

Quill.register('modules/imageDrop', ImageDrop);

class WYSIWYGEditor extends Component {
  modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      // ['clean'],
    ],
    imageDrop: true,
  };

  formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
  ];

  defaultStyle = {
    width: 498,
    height: 200,
    borderRight: 'none',
  };

  isHasImg = (delta) => {
    let pass = false;
    if (delta && delta.ops) {
      delta.ops.forEach((item) => {
        if (item.insert && item.insert.image) {
          pass = true;
        }
      });
    }
    return pass;
  };

  handleChange = (content, delta, source, editor) => {
    const value = editor.getContents();
    if (this.props.onChange && value && value.ops) {
      this.props.onChange(value.ops);
    }
  };

  render() {
    const { placeholder, value } = this.props;
    let defaultValue = value;
    try {
      defaultValue = JSON.parse(value);     
    } catch (error) {
      defaultValue = value;
    }
    const style = { ...this.defaultStyle, ...this.props.style };
    const editHeight = style.height - (this.props.toolbarHeight || 42);
    return (
      <div style={{ width: '100%' }}>
        <div style={style} className="react-quill-editor">
          <ReactQuill
            theme="snow"
            modules={this.modules}
            formats={this.formats}
            style={{ height: editHeight }}
            placeholder={placeholder || Choerodon.getMessage('描述', 'Description')}
            defaultValue={defaultValue}
            onChange={this.handleChange}
          />
        </div>
        {
          this.props.bottomBar && (
            <div style={{
              padding: '0 8px', border: '1px solid #ccc', borderTop: 'none', display: 'flex', justifyContent: 'flex-end', 
            }}
            >
              <Button 
                type="primary"
                onClick={() => this.props.handleDelete()}
              >
                {Choerodon.getMessage('取消', 'Cancle')}
              </Button>
              <Button
                type="primary"
                onClick={() => this.props.handleSave()}
              >
                {Choerodon.getMessage('保存', 'Save')}             
              </Button>
            </div>
          )
        }
      </div>
    );
  }
}

export default WYSIWYGEditor;
