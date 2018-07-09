import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {Menu, Dropdown, Button} from 'choerodon-ui';
import './TreeTitle.scss';

class TreeTitle extends Component {
    constructor(props) {
        super(props);
    }

    creatProcessBar = (processBar) => {
        let count = 0;
        let processBarObject = Object.entries(processBar);
        for (let a = 0; a < processBarObject.length; a++) {
            count = count + processBarObject[a][1];
        }
        return processBarObject.map((item, i) => {
            let percentage = (item[1] / count) * 100;
            return (
                <span className='c7n-pb-fill' style={{backgroundColor: item[0], width: `${percentage}%`}}></span>
            )
        });
    };

    render() {
        const getMenu = (record) => (
            <Menu>
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
                            <div className='c7n-pb-fill-parent'>
                                {this.creatProcessBar(this.props.processBar)}
                            </div>
                        </span>
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

export default observer(TreeTitle);