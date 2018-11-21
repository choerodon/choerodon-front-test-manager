import React, { Component } from 'react';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import {
  Icon, Button, Table, Select, Spin, Tooltip, Modal,
} from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import { FormattedMessage } from 'react-intl';
import _ from 'lodash';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/base16-dark.css';
import { User } from '../../../../components/CommonComponent';
import { getAppList, getTestHistoryByApp, loadPodParam } from '../../../../api/AutoTestApi';
import { CiStatus, TestResult } from './AutoTestTags';
import { commonLink, getProjectName } from '../../../../common/utils';
import './AutoTestList.scss';

const Sidebar = Modal.Sidebar;
const { Option } = Select;
const { AppState } = stores;
class AutoTestList extends Component {
  state = {
    showSide: false,
    following: true,
    fullscreen: false,
    containerArr: [],
    appList: [],
    historyList: [],
    currentApp: null,
    loading: false,
    selectLoading: false,
  }

  componentDidMount() {
    this.getAppList();
  }

  getAppList = (value) => {
    const { currentApp } = this.state;
    this.setState({
      selectLoading: true,
    });
    getAppList(value).then((List) => {
      console.log(currentApp);
      if (!currentApp && !value && List.length > 0) {
        this.setState({
          currentApp: List[0].id,
          appList: List,
          selectLoading: false,
        });
        this.getTestHistoryByApp(List[0].id);
      } else {
        this.setState({
          appList: List,
          selectLoading: false,
        });
      }
    });
  }

  getTestHistoryByApp = (appId = this.state.currentApp) => {
    this.setState({
      loading: true,
    });
    getTestHistoryByApp(appId).then((history) => {
      this.setState({
        loading: false,
        historyList: history.content,
      });
    });
  }

  /**
   *  全屏查看日志
   */
  setFullscreen = () => {
    const cm = this.editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    cm.state.fullScreenRestore = {
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
      width: wrap.style.width,
      height: wrap.style.height,
    };
    wrap.style.width = '';
    wrap.style.height = 'auto';
    wrap.className += ' c7ntest-CodeMirror-fullscreen';
    this.setState({ fullscreen: true });
    document.documentElement.style.overflow = 'hidden';
    cm.refresh();
    window.addEventListener('keydown', (e) => {
      this.setNormal(e.which);
    });
  };

  /**
   * 任意键退出全屏查看
   */
  setNormal = () => {
    const cm = this.editorLog.getCodeMirror();
    const wrap = cm.getWrapperElement();
    wrap.className = wrap.className.replace(/\s*c7ntest-CodeMirror-fullscreen\b/, '');
    this.setState({ fullscreen: false });
    document.documentElement.style.overflow = '';
    const info = cm.state.fullScreenRestore;
    wrap.style.width = info.width; wrap.style.height = info.height;
    window.scrollTo(info.scrollLeft, info.scrollTop);
    cm.refresh();
    window.removeEventListener('keydown', (e) => {
      this.setNormal(e.which);
    });
  };

  /**
   * 日志go top
   */
  goTop = () => {
    const editor = this.editorLog.getCodeMirror();
    editor.execCommand('goDocStart');
  };

  /**
   * 显示日志
   * @param record 容器record
   */
  showLog = (record) => {
    const projectId = AppState.currentMenuType.id;
    loadPodParam(projectId, record.id)
      .then((data) => {
        if (data && data.length) {
          this.setState({
            envId: record.envId,
            namespace: record.namespace,
            containerArr: data,
            podName: data[0].podName,
            containerName: data[0].containerName,
            logId: data[0].logId,
            showSide: true,
          });
        }
        this.loadLog();
      });
  };

  /**
   * 关闭日志
   */
  closeSidebar = () => {
    const editor = this.editorLog.getCodeMirror();
    const { ws } = this.state;
    clearInterval(this.timer);
    this.timer = null;
    if (ws) {
      ws.close();
    }
    this.setState({
      showSide: false,
      containerArr: [],
    }, () => {
      editor.setValue('');
    });
  };

  /**
   * 加载日志
   */
  // @action
  loadLog = (followingOK) => {
    const {
      namespace, envId, logId, podName, containerName, following,
    } = this.state;
    const authToken = document.cookie.split('=')[1];
    const logs = [];
    let oldLogs = [];
    let editor = null;
    if (this.editorLog) {
      editor = this.editorLog.getCodeMirror();
      try {
        const ws = new WebSocket(`POD_WEBSOCKET_URL/ws/log?key=env:${namespace}.envId:${envId}.log:${logId}&podName=${podName}&containerName=${containerName}&logId=${logId}&token=${authToken}`);
        this.setState({ ws, following: true });
        if (!followingOK) {
          editor.setValue('Loading...');
        }
        ws.onopen = () => {
          editor.setValue('Loading...');
        };
        ws.onerror = (e) => {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          logs.push('连接出错，请重新打开');
          editor.setValue(_.join(logs, ''));
          editor.execCommand('goDocEnd');
        };
        ws.onclose = (e) => {
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          if (following) {
            logs.push('连接已断开');
            editor.setValue(_.join(logs, ''));
          }
          editor.execCommand('goDocEnd');
        };
        ws.onmessage = (e) => {
          if (e.data.size) {
            const reader = new FileReader();
            reader.readAsText(e.data, 'utf-8');
            reader.onload = () => {
              if (reader.result !== '') {
                logs.push(reader.result);
              }
            };
          }
          if (!logs.length) {
            const logString = _.join(logs, '');
            editor.setValue(logString);
          }
        };

        this.timer = setInterval(() => {
          if (logs.length > 0) {
            if (!_.isEqual(logs, oldLogs)) {
              const logString = _.join(logs, '');
              editor.setValue(logString);
              editor.execCommand('goDocEnd');
              // 如果没有返回数据，则不进行重新赋值给编辑器
              oldLogs = _.cloneDeep(logs);
            }
          } else if (!followingOK) {
            editor.setValue('Loading...');
          }
        });
      } catch (e) {
        editor.setValue('连接失败');
      }
    }
  };

  /**
   * 切换container日志
   * @param value
   */
  containerChange = (value) => {
    const { ws, logId } = this.state;
    if (logId !== value.split('+')[0]) {
      if (ws) {
        ws.close();
      }
      this.setState({
        containerName: value.split('+')[1],
        logId: value.split('+')[0],
      });
      setTimeout(() => {
        this.loadLog();
      }, 1000);
    }
  };

  /**
   * top log following
   */
  stopFollowing = () => {
    const { ws } = this.state;
    if (ws) {
      ws.close();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setState({
      following: false,
    });
  };

  toCreateAutoTest=() => {
    this.props.history.push(commonLink('/AutoTest/create'));
  }

  render() {
    const {
      appList, selectLoading, currentApp, historyList, loading, showSide, following,
      containerArr, containerName, fullscreen, podName,
    } = this.state;
    const appOptions = appList.map(app => <Option value={app.id}>{app.name}</Option>);
    const containerDom = containerArr.length && (_.map(containerArr, c => <Option key={c.logId} value={`${c.logId}+${c.containerName}`}>{c.containerName}</Option>));
    const columns = [{
      title: '容器状态',
      dataIndex: 'status',
      key: 'status',
      render: status => CiStatus(status),
    }, {
      title: '执行方',
      dataIndex: 'lastUpdateUser',
      key: 'lastUpdateUser',
      render: lastUpdateUser => <User user={lastUpdateUser} />,
    }, {
      title: '测试框架',
      dataIndex: 'testType',
      key: 'testType',
    }, {
      title: '应用版本',
      dataIndex: 'appVersion',
      key: 'appVersion',
    }, {
      title: '时长',
      dataIndex: 'during',
      key: 'during',
    }, {
      title: '执行时间',
      dataIndex: 'time',
      key: 'time',
      render: time => (
        <TimeAgo
          datetime={time}
          locale={Choerodon.getMessage('zh_CN', 'en')}
        />
      ),
    }, {
      title: '测试结果',
      dataIndex: 'result',
      key: 'result',
      render: result => TestResult(result),
    }, {
      title: '',
      dataIndex: 'action',
      key: 'action',
      render: (action, record) => {
        const { id, status } = record;
        return (
          <div style={{ display: 'flex' }}>
            <div className="c7ntest-flex-space" />
            <Tooltip title={<FormattedMessage id="container.log" />}>
              <Icon type="insert_drive_file" className="c7ntest-icon-in-table" onClick={this.showLog.bind(this, record)} />
            </Tooltip>
            <Tooltip title={status === 'failed' ? '重试' : '重新执行'}>
              <Icon type="replay" className="c7ntest-icon-in-table" style={{ marginLeft: 8 }} />
            </Tooltip>
            <Icon type="exit_to_app" className="c7ntest-icon-in-table" style={{ marginLeft: 8 }} />
          </div>
        );
      },
    }];
    const options = {
      readOnly: true,
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true,
      theme: 'base16-dark',
    };
    return (
      <Page className="c7ntest-AutoTestList">
        <Header title={<FormattedMessage id="autotestlist_title" />}>
          <Button onClick={this.toCreateAutoTest}>
            <Icon type="playlist_add icon" />
            <span>添加测试</span>
          </Button>
          <Button onClick={this.getTestHistoryByApp}>
            <Icon type="autorenew icon" />
            <span><FormattedMessage id="refresh" /></span>
          </Button>
        </Header>
        <Content
          // style={{
          //   padding: '0 0 10px 0',
          // }}
          title={<FormattedMessage id="autotestlist_content_title" values={{ name: getProjectName() }} />}
          description={<FormattedMessage id="autotestlist_content_description" />}
        // link="http://v0-8.choerodon.io/zh/docs/user-guide/test-management/test-report/report/"
        >
          <Spin spinning={loading}>
            <Select
              label="选择应用"
              style={{ width: 512, marginBottom: 20 }}
              filter
              value={currentApp}
              loading={selectLoading}
              onChange={this.handleDefectsChange}
              onFilterChange={this.getAppList}
            >
              {appOptions}
            </Select>
            <Table columns={columns} dataSource={historyList} />
            <Sidebar
              visible={showSide}
              title={<FormattedMessage id="container.log.header.title" />}
              onOk={this.closeSidebar}
              className="c7ntest-podLog-content c7ntest-region"
              okText={<FormattedMessage id="close" />}
              okCancel={false}
            >
              <Content className="sidebar-content" code="container.log" values={{ name: podName }}>
                <section className="c7ntest-podLog-section">
                  <div className="c7ntest-podLog-hei-wrap">
                    <div className="c7ntest-podShell-title">
                      <FormattedMessage id="container.term.log" />
                      {}
                      <Select value={containerName} onChange={this.containerChange}>
                        {containerDom}
                      </Select>
                      <Button type="primary" funcType="flat" shape="circle" icon="fullscreen" onClick={this.setFullscreen} />
                    </div>
                    {' '}
                    {following ? <div className={`c7ntest-podLog-action log-following ${fullscreen ? 'f-top' : ''}`} onClick={this.stopFollowing} role="none">Stop Following</div>
                      : <div className={`c7ntest-podLog-action log-following ${fullscreen ? 'f-top' : ''}`} onClick={this.loadLog.bind(this, true)} role="none">Start Following</div>}
                    <CodeMirror
                      ref={(editor) => { this.editorLog = editor; }}
                      value="Loading..."
                      className="c7ntest-podLog-editor"
                      onChange={code => this.props.ChangeCode(code)}
                      options={options}
                    />
                    <div className={`c7ntest-podLog-action log-goTop ${fullscreen ? 'g-top' : ''}`} onClick={this.goTop} role="none">Go Top</div>
                  </div>
                </section>
              </Content>
            </Sidebar>
          </Spin>
        </Content>
      </Page>
    );
  }
}

export default AutoTestList;
