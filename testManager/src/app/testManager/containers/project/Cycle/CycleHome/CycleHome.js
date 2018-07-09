import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import debounce from 'lodash/debounce'
import './CycleHome.scss';
import {getVersionCode, getProjectVersion} from '../../../../../api/agileApi.js'
import {getCycleByVersionId, getFolderByCycleId, filterCycleWithBar} from '../../../../../api/cycleApi'
import {Button, Icon, Input, Tree} from 'choerodon-ui';
import TreeTitle from '../../../../components/CycleComponent/TreeTitleComponent/TreeTitle'
import {Page, Header, Content, stores} from 'choerodon-front-boot';

const {AppState} = stores;
const TreeNode = Tree.TreeNode;

@observer
class CycleHome extends Component {

    input = debounce(() => {

    });

    refresh() {

    }

    state = {
        treeData: [
            {title: '所有版本', key: '0'},
        ],
        icon: 'folder',
        expandedKeys: ['0'],
        leftVisible: true,
        sideVisible: false,
    };
    filterCycle = (parameter) => {
        let versionIds = [];
        getProjectVersion().then((res) => {
            for (let i = 0; i < res.length; i++) {
                versionIds.push(res[i].versionId);
            }
            let parameters = {
                parameter: parameter,
                versionIds: versionIds,
            };
            filterCycleWithBar(parameters).then((res) => {

            });
        });
    };
    onExpand = (expandedKeys) => {
        this.setState({
            expandedKeys,
        });
    };
    onLoadData = (treeNode) => {
        return new Promise((resolve) => {
            if (treeNode.props.children) {
                resolve();
                return;
            }
            let deep = treeNode.props.eventKey.replace(/[^-]/g, '').length;
            switch (deep) {
                case 0:
                    getVersionCode().then((res) => {
                        let versionCodes = [];
                        for (let i = 0; i < res.lookupValues.length; i++) {
                            let versionName = res.lookupValues[i].name;
                            versionCodes.push({
                                title: `${versionName}`,
                                key: `${treeNode.props.eventKey}-${i}`
                            });
                        }
                        treeNode.props.dataRef.children = versionCodes;
                        this.setState({
                            treeData: [...this.state.treeData],
                        });
                    });
                    break;
                case 1:
                    getProjectVersion().then((res) => {
                        let projectVersions = [];
                        for (let i = 0; i < res.length; i++) {
                            if (res[i].statusName === treeNode.props.title) {
                                projectVersions.push({
                                    title: `${res[i].name}`,
                                    key: `${treeNode.props.eventKey}-${i}`,
                                    label: `${res[i].versionId}`,
                                });
                            }
                        }
                        treeNode.props.dataRef.children = projectVersions;
                        this.setState({
                            treeData: [...this.state.treeData],
                        });
                    });
                    break;
                case 2:
                    getCycleByVersionId(treeNode.props.label).then((res) => {
                        let cycles = [];
                        let j = 0;
                        for (let i = 0; i < res.length; i++) {
                            if (res[i].parentCycleId === 0) {
                                if (res[i].type === 'temp') {
                                    cycles.push({
                                        title: <TreeTitle text={res[i].cycleName} type={res[i].type}
                                                          processBar={{"#00BFA5": 3, "#D50000": 5,}}/>,
                                        key: `${treeNode.props.eventKey}-${j}`,
                                        label: `${res[i].cycleId}`,
                                        type: `${res[i].type}`,
                                        versionId: `${res[i].versionId}`,
                                        isLeaf: true,
                                    });
                                } else {
                                    cycles.push({
                                        title: <TreeTitle text={res[i].cycleName} type={res[i].type}
                                                          processBar={{"#00BFA5": 3, "#D50000": 5,}}/>,
                                        key: `${treeNode.props.eventKey}-${j}`,
                                        label: `${res[i].cycleId}`,
                                        type: `${res[i].type}`,
                                        versionId: `${res[i].versionId}`,
                                    });
                                }
                                j++;
                            }
                        }
                        treeNode.props.dataRef.children = cycles;
                        this.setState({
                            treeData: [...this.state.treeData],
                        });
                        let storage = window.localStorage;
                        storage.removeItem('cycleData');
                        storage.setItem('cycleData', JSON.stringify(res));
                    });
                    break;
                case 3:
                    let storage = window.localStorage;
                    let res = JSON.parse(storage.getItem('cycleData'));
                    let folders = [];
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].parentCycleId == treeNode.props.label) {
                            folders.push({
                                title: <TreeTitle text={res[i].cycleName} type={res[i].type}
                                                  processBar={{"#00BFA5": 3, "#D50000": 5,}}/>,
                                key: `${treeNode.props.eventKey}-${i}`,
                                label: `${res[i].cycleId}`,
                                isLeaf: true,
                            });
                        }
                    }
                    treeNode.props.dataRef.children = folders;
                    this.setState({
                        treeData: [...this.state.treeData],
                    });
                    break;
            }
            resolve();
        });
    };
    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item} showIcon={true}
                              icon={<Icon
                                  type={this.state.expandedKeys.includes(item.key) ? 'folder_open' : 'folder'}/>}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode
                icon={<Icon type={this.state.expandedKeys.includes(item.key) ? 'folder_open' : 'folder'}/>} {...item}
                dataRef={item}/>;
        });
    };

    render() {
        const prefix = <Icon type="filter_list"/>;
        return (
            <Page className="c7n-cycle">
                <Header title="测试循环">
                    <Button funcTyp="flat" onClick={this.refresh.bind(this)}>
                        <Icon type="autorenew icon"/>
                        <span>刷新</span>
                    </Button>
                </Header>
                <Content
                    title={`项目"${AppState.currentMenuType.name}"的循环摘要`}
                    description="循环摘要使用树状图查看本项目中不同版本锁对应的测试情况。"
                >
                    <div className="c7n-cycleHome">
                        <div className={this.state.sideVisible ? 'c7n-ch-side' : 'c7n-ch-hidden'}>
                            <div className="c7n-chs-button">
                                <Button
                                    icon="navigate_next"
                                    className="c7n-cycleHome-button"
                                    onClick={() => {
                                        this.setState({
                                            leftVisible: true,
                                            sideVisible: false,
                                        });
                                    }}
                                />
                            </div>
                            <div className="c7n-chs-bar">
                                {this.state.versionVisible ? '' : (
                                    <p role="none" onClick={() => {
                                        this.setState({});
                                    }}>测试循环</p>
                                )}
                            </div>
                        </div>
                        <div className={this.state.leftVisible ? 'c7n-ch-left' : 'c7n-ch-hidden'}>
                            <div className="c7n-chl-head">
                                <div className="c7n-chlh-search">
                                    <Input prefix={prefix} placeholder="&nbsp;过滤"/>
                                </div>
                                <div className="c7n-chlh-button">
                                    <div className='c7n-chlhb-left'>
                                        <Button
                                            icon="navigate_before"
                                            className="c7n-cycleHome-button"
                                            onClick={() => {
                                                this.setState({
                                                    leftVisible: false,
                                                    sideVisible: true,
                                                });
                                            }}
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
                                <Tree loadData={this.onLoadData}
                                      defaultExpandAll={true}
                                      showIcon={true}
                                      onExpand={this.onExpand}>
                                    {this.renderTreeNodes(this.state.treeData)}
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

