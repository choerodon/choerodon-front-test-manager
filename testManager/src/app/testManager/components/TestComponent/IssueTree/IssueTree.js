import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Input, Icon, Spin, Tree,
} from 'choerodon-ui';
import _ from 'lodash';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';
import './IssueTree.scss';
import { IssueTreeStore } from '../../../store/project/treeStore';
// import { TreeTitle } from '../../CycleComponent';
import { getIssueTree, addFolder } from '../../../api/IssueApi';
import IssueTreeTitle from './IssueTreeTitle';
import pic from '../../../assets/问题管理－空.png';
// import { Tree } from '../../CommonComponent';

const { TreeNode } = Tree;
const dataList = [];
@observer
class IssueTree extends Component {
  state = {
    loading: false,
    autoExpandParent: false,
    searchValue: '',
    dragingElement: null,
    dragingTreeData: [],
    ctrlKey: false,
  }

  componentDidMount() {
    this.getTree();
  }

  addFolder = (item, e, type) => {
    console.log(item, e.target.value, type);
    this.setState({
      loading: true,
    });
    addFolder({
      name: e.target.value,    
      type: 'cycle',
      versionId: item.versionId,
    }).then((res) => {
      if (res.failed) {
        Choerodon.prompt('名字重复');
        IssueTreeStore.removeAdding();
      } else {
        this.getTree();
      }
      this.setState({
        loading: false,
      });
    });
  }

  callback = (item, code) => {
    switch (code) {
      case 'CLONE_FOLDER': {
        const parentKey = this.getParentKey(item.key, IssueTreeStore.getTreeData);
        IssueTreeStore.addItemByParentKey(parentKey, { ...item, ...{ key: `${parentKey}-CLONE_FOLDER`, type: 'CLONE_FOLDER' } });
        break;
      }

      case 'ADD_FOLDER': {
        IssueTreeStore.addItemByParentKey(item.key, { ...item, ...{ title: Choerodon.getMessage('新文件夹', 'New folder'), key: `${item.key}-ADD_FOLDER`, type: 'ADD_FOLDER' } });
        // 自动展开当前项
        const expandedKeys = IssueTreeStore.getExpandedKeys;
        if (expandedKeys.indexOf(item.key) === -1) {
          expandedKeys.push(item.key);
        }
        IssueTreeStore.setExpandedKeys(expandedKeys);
        break;
      }
      default: break;
    }
  }

  getParentKey = (key, tree) => key.split('-').slice(0, -1).join('-')

  getTree = () => {
    this.setState({
      loading: true,
    });

    getIssueTree().then((data) => {
      IssueTreeStore.setTreeData([{ title: '所有版本', key: '0', children: data.versions }]);
      this.setState({
        // treeData: [
        //   { title: '所有版本', key: '0', children: data.versions },
        // ],
        loading: false,
      });
      this.generateList([
        { title: '所有版本', key: '0', children: data.versions },
      ]);

      // window.console.log(dataList);
    });
  }

  renderTreeNodes = data => data.map((item) => {
    const {
      children, key, cycleCaseList, type,
    } = item;
    const { searchValue } = this.state;
    const expandedKeys = IssueTreeStore.getExpandedKeys;
    const index = item.title.indexOf(searchValue);
    const beforeStr = item.title.substr(0, index);
    const afterStr = item.title.substr(index + searchValue.length);
    const icon = (
      <Icon
        style={{ color: '#3F51B5' }}
        type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
      />
    );
    if (type === 'ADD_FOLDER') {
      return (
        <TreeNode
          title={(
            <div onClick={e => e.stopPropagation()} role="none">
              <Input
                defaultValue={item.title}
                autoFocus
                onBlur={(e) => {
                  this.addFolder(item, e, type);
                }}
              />
            </div>
          )}
          icon={icon}
          data={item}
        />);
    } else if (children) {
      const title = index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{item.title}</span>;
      return (
        <TreeNode
          title={item.cycleId || item.versionId
            ? (
              <IssueTreeTitle
                title={title}
                data={item}
                refresh={this.getTree}
                callback={this.callback}
              />
            )
            : title}
          key={key}
          data={item}
          showIcon
          icon={icon}
        >
          {this.renderTreeNodes(children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        icon={icon}
        {...item}
        data={item}
      />);
  });

  renderSimpleTree = data => data.map((item) => {
    const { children, key, title } = item;
    const expandedKeys = IssueTreeStore.getExpandedKeys;
    const icon = (
      <Icon
        style={{ color: '#3F51B5' }}
        type={expandedKeys.includes(item.key) ? 'folder_open2' : 'folder_open'}
      />
    );
    if (children) {
      return (
        <TreeNode
          title={title}
          key={key}
          data={item}
          showIcon
          icon={icon}
        >
          {this.renderSimpleTree(children)}
        </TreeNode>
      );
    }
    return (
      <TreeNode
        icon={icon}
        {...item}
        data={item}
      />);
  })

  generateList = (data) => {
    // const temp = data;
    // while (temp) {
    //   dataList = dataList.concat(temp.children);
    //   if()
    // }
    for (let i = 0; i < data.length; i += 1) {
      const node = data[i];
      const { key, title } = node;
      // 找出url上的cycleId
      // const { cycleId } = getParams(window.location.href);
      // const currentCycle = IssueTreeStore.getCurrentCycle;
      // if (!currentCycle.cycleId && Number(cycleId) === node.cycleId) {
      //   this.setExpandDefault(node);
      // } else if (currentCycle.cycleId === node.cycleId) {
      //   IssueTreeStore.setCurrentCycle(node);
      // }
      dataList.push({ key, title });
      if (node.children) {
        this.generateList(node.children, node.key);
      }
    }
  }

  onExpand = (expandedKeys) => {
    IssueTreeStore.setExpandedKeys(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  filterCycle = (value) => {
    // window.console.log(value);
    if (value !== '') {
      const expandedKeys = dataList.map((item) => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, IssueTreeStore.getTreeData);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
      IssueTreeStore.setExpandedKeys(expandedKeys);
    }
    this.setState({
      searchValue: value,
      autoExpandParent: true,
    });
  }

  onDragStart = ({ event, node }) => {
    // console.log(node.props.data);
    // this.ctrlKey = event.ctrlKey;
    // // event.preventDefault();
    // const target = event.target;
    // // const clone = target.cloneNode(true);
    // // clone.style.display = 'flex';
    // // const container = document.getElementById('test');
    // // document.addEventListener('mousemove', this.handleMove);
    // const img = new Image();
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    // event.dataTransfer.setDragImage(img, 0, 0);
    // console.log('start', event.clientX, event.clientY);
    // this.status = document.getElementById('status');
    // target.addEventListener('drag', this.onDrag);
    // // target.ondrag = this.onDrag;
    // // target.ondrag = () => {
    // //   console.log('drag');
    // // };
    // // container.style.display = 'block';
    // // const offset = [10, 0];
    // // container.style.left = `${event.clientX + offset[0]}px`;
    // // container.style.top = `${event.clientY + offset[1]}px`;
    // // if (container.firstElementChild) {
    // //   document.getElementById('test').replaceChild(clone, container.firstElementChild);
    // // } else {
    // //   document.getElementById('test').appendChild(clone);
    // // }
    // if (event.ctrlKey) {
    //   console.log('按下');
    //   this.status.innerText = '复制';
    //   // const test = document.getElementById('test');
    //   // test.style.display = 'block';
    //   // const img = new Image();
    //   // img.src = pic;
    // } else {
    //   console.log('松开');
    //   this.status.innerText = '剪切';
    // }
    // this.setState({
    //   dragingTreeData: [{ ...node.props.data }],
    //   // dragingElement: target.cloneNode(true),
    //   // dragingElement: React.cloneElement(target, {}),
    // });
    // document.addEventListener('mousemove', this.handleMove);
  }

  onDragEnd = (result) => {
    console.log('end', result);
    // const target = event.target;
    // requestAnimationFrame((timestamp) => {
    //   this.instance.style.display = 'none';
    // });

    // target.removeEventListener('drag', this.onDrag);
  }

  onDrag = (event) => {
    // console.log('draging', mousePosition);   

    const offset = [10, 0];
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    requestAnimationFrame((timestamp) => {
      this.instance.style.display = 'block';
      this.instance.style.transform = `translate(${mousePosition.x + offset[0]}px,${mousePosition.y + offset[1]}px)`;
      // this.container.style.transform = `translate(${mousePosition.y + offset[1]}px)`;
    });
    if (event.ctrlKey === this.ctrlKey) {
      return;
    }
    if (event.ctrlKey) {
      console.log('按下');
      this.status.innerText = '复制';
      // const test = document.getElementById('test');
      // test.style.display = 'block';
      // const img = new Image();
      // img.src = pic;
    } else {
      console.log('松开');
      this.status.innerText = '剪切';
    }
    this.ctrlKey = event.ctrlKey;
  }

  onDrop = () => {
    console.log('drop');
    // const container = document.getElementById('test');
    this.container.style.display = 'none';
  }

  handleMove = (event) => {
    const offset = [10, 0];
    const mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    const container = document.getElementById('test');
    console.log(mousePosition);
    container.style.display = 'block';
    container.style.left = `${mousePosition.x + offset[0]}px`;
    container.style.top = `${mousePosition.y + offset[1]}px`;
  }

  render() {
    const { onClose } = this.props;
    const {
      autoExpandParent, loading, dragingElement, dragingTreeData, ctrlKey,
    } = this.state;
    const treeData = IssueTreeStore.getTreeData;
    const expandedKeys = IssueTreeStore.getExpandedKeys;
    const selectedKeys = IssueTreeStore.getSelectedKeys;
    const currentCycle = IssueTreeStore.getCurrentCycle;
    return (
      <Spin spinning={loading}>
        <div className="c7n-IssueTree">
          <div
            ref={(instance) => { this.instance = instance; }}
            id="test"
            style={{
              // width: 200,
              //  height: 200,
              top: 0,
              left: 0,
              // right: 100, 
              display: 'none',
              position: 'fixed',
              background: 'white',
              zIndex: 1000,
            }}
          >
            <div id="status" />
            <Tree
              // draggable
              // onDragStart={this.onDragStart}
              // onDragEnd={this.onDragEnd}
              // selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              showIcon
            // onExpand={this.onExpand}
            // onSelect={this.loadCycle}
            // autoExpandParent={autoExpandParent}
            >
              {this.renderSimpleTree(dragingTreeData)}
            </Tree>
          </div>
          <div className="c7n-treeTop">
            <Input
              prefix={<Icon type="filter_list" style={{ color: 'black' }} />}
              placeholder="过滤"
              style={{ marginTop: 2 }}
              onChange={e => _.debounce(this.filterCycle, 200).call(null, e.target.value)}
            />
            <Icon type="close" className="c7n-pointer" onClick={onClose} />
          </div>
          <div
            className="c7n-IssueTree-tree"
          // onDragStart={() => {
          //   console.log('start');
          // }}
          >
            <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
              <Tree
              // draggable
              // onDragEnter={() => { }}
              // onDrag={() => { console.log('drag'); }}
              // onDrop={this.onDrop}
              // onDragStart={this.onDragStart}
              // onDragEnd={this.onDragEnd}
                selectedKeys={selectedKeys}
                expandedKeys={expandedKeys}
                showIcon
                onExpand={this.onExpand}
                onSelect={this.loadCycle}
                autoExpandParent={autoExpandParent}
              >
                {this.renderTreeNodes(treeData)}
              </Tree>
            </DragDropContext>
          </div>
        </div>
      </Spin>
    );
  }
}

IssueTree.propTypes = {

};

export default IssueTree;
