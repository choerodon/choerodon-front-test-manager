import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import debounce from 'lodash/debounce'
import './CycleHome.scss';
import {getVersionCode} from '../../../../../api/agileApi.js'
import {Button, Table, Spin, Popover, Tooltip, Icon, Input, Tree} from 'choerodon-ui';
import {Page, Header, Content, stores} from 'choerodon-front-boot';

const {AppState} = stores;
const TreeNode = Tree.TreeNode;

@observer
class CycleHome extends Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //         lookupValues: [],
    //     };
    // }

    input = debounce(() => {

    });
    state = {
        treeData: [
            {title: 'Expand to load', key: '0'},
            {title: 'Expand to load', key: '1'},
            {title: 'Tree Node', key: '2', isLeaf: true},
        ],
    };
    lookupValues = [];
    onLoadData = (treeNode) => {
        return new Promise((resolve) => {
            if (treeNode.props.children) {
                resolve();
                return;
            }

            getVersionCode().then((res) => {
                this.setState({
                    lookupValues: res.lookupValues,
                });
                for (let i = 0; i < this.lookupValues.length; i++) {
                    this.state.treeData.add(this.lookupValues[i].name, i);
                    debugger;
                }
            });

            treeNode.props.dataRef.children = [
                {title: 'Child Node', key: `${treeNode.props.eventKey}-0`},
                {title: 'Child Node', key: `${treeNode.props.eventKey}-1`},
            ];
            this.setState({
                treeData: [...this.state.treeData],
            });
            resolve();
        });
    };
    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} dataRef={item}/>;
        });
    };

    render() {
        const prefix = <Icon type="filter_list"/>;
        return (
            <Page className="c7n-cycle">
                <Header title="测试循环">
                    <Button funcTyp="flat">
                        <Icon type="autorenew icon"/>
                        <span>刷新</span>
                    </Button>
                </Header>
                <Content
                    title={`项目"${AppState.currentMenuType.name}"的循环摘要`}
                    description="循环摘要使用树状图查看本项目中不同版本锁对应的测试情况。"
                >
                    <div className="c7n-cycleHome">
                        <div className="c7n-ch-left">
                            <div className="c7n-chl-head">
                                <div className="c7n-chlh-search">
                                    <Input prefix={prefix} placeholder="&nbsp;过滤"/>
                                </div>
                                <div className="c7n-chlh-button">
                                    <div className="c7n-chlhb-left">
                                        <Button
                                            icon="navigate_before"
                                            className="c7n-cycleHome-button"
                                        />
                                    </div>
                                    <div className="c7n-chlhb-right">
                                        <Button
                                            icon="add"
                                            className="c7n-cycleHome-button"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="c7n-chlh-tree">
                                <Tree loadData={this.onLoadData}>
                                    <TreeNode title="所有版本" key="-1">
                                        {this.renderTreeNodes(this.state.treeData)}
                                    </TreeNode>
                                </Tree>
                            </div>
                        </div>
                        <div className="c7n-ch-right">

                        </div>
                    </div>
                </Content>
            </Page>
        );
    }
}

export default CycleHome;

