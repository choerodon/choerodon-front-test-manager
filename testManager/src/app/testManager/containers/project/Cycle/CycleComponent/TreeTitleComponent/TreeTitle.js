import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Menu, Dropdown} from 'choerodon-ui';

@observer
class TreeTitle extends Component {
    constructor(props) {
        super(props);
    }

    creatProcessBar = (processBar) => {
        let count = 0;
        for (let a = 0; a < processBar.length; a++) {
            count = count + processBar[a].value
        }
        let code = '';
        for (let i = 0; i < processBar.length; i++) {
            let percentage = processBar[a].value / count;
            code = code + <span style={{backgroundColor: processBar[i].key, width: percentage}}></span>
        }
        return (code);
    };

    render() {
        const getMenu = (record) => (
            <Menu onClick={this.handleClickMenu.bind(this, record)}>
                {
                    record === 'folder' ? '' : (
                        <Menu.Item key="0">
                            增加文件夹
                        </Menu.Item>
                    )
                }
                <Menu.Item key="1">
                    {record === 'folder' ? '编辑文件夹' : '编辑循环'}
                </Menu.Item>
                <Menu.Item key="2">
                    {record === 'folder' ? '删除文件夹' : '删除循环'}
                </Menu.Item>
                <Menu.Item key="3">
                    {record === 'folder' ? '克隆文件夹' : '克隆循环'}
                </Menu.Item>
                <Menu.Item key="4">
                    {record === 'folder' ? '导出文件夹' : '导出循环'}
                </Menu.Item>
            </Menu>
        );

        return (
            <div className='c7n-tree-title'>
                <div className='c7n-tt-text'>
                    {this.props.text}
                </div>
                <div className='c7n-tt-processBar'>
                    <div className='c7n-process-bar'>
                        <span className='c7n-pb-unfill'>
                        {this.creatProcessBar(this.props.processBar)}
                        </span>;
                    </div>
                </div>
                <div className='c7n-tt-actionButton'>
                    <Dropdown overlay={getMenu(this.props.type)} trigger="click">
                        <Button shape="circle" icon="more_vert"/>
                    </Dropdown>
                </div>
            </div>
        );
    }
}

export default TreeTitle;