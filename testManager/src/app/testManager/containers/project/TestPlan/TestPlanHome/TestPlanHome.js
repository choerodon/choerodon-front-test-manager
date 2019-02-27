import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Page, Header, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Button, Icon, Spin, Modal,
} from 'choerodon-ui';
import { editExecuteDetail, deleteExecute } from '../../../../api/cycleApi';
import { getStatusList } from '../../../../api/TestStatusApi';
import { getPrioritys } from '../../../../api/agileApi';
import {
  EventCalendar, CreateCycle, EditStage, EditCycle, ExportSide, TreeArea,
} from '../../../../components/TestPlanComponent';
import { Injecter, NoCycle } from '../../../../components/CommonComponent';
import { TestPlanTable } from './components';
import TestPlanStore from '../../../../store/project/TestPlan/TestPlanStore';
import { executeDetailShowLink } from '../../../../common/utils';
import RunWhenProjectChange from '../../../../common/RunWhenProjectChange';
import './TestPlanHome.scss';

const { confirm } = Modal;
@observer
class TestPlanHome extends Component {
  state = {
    CreateCycleVisible: false,
    statusList: [],
    prioritys: [],
  }

  componentDidMount() {
    RunWhenProjectChange(TestPlanStore.clearStore);
    TestPlanStore.setFilters({});
    TestPlanStore.setAssignedTo(null);
    TestPlanStore.setLastUpdatedBy(null);
    this.refresh();
  }

  saveRef = name => (ref) => {
    this[name] = ref;
  }

  refresh = () => {
    Promise.all([getStatusList('CYCLE_CASE'), getPrioritys()]).then(([statusList, prioritys]) => {
      this.setState({ statusList, prioritys });
    });

    TestPlanStore.getTree();
  }

  handleItemClick = (item) => {
    const { type } = item;
    if (type === 'folder') {
      TestPlanStore.EditStage(item);
    } else if (type === 'cycle') {
      TestPlanStore.EditCycle(item);
    }
  }

  /**
   * 点击table的一项
   *
   * @memberof TestPlanHome
   */
  handleTableRowClick=(record) => {
    const { history } = this.props;
    history.push(executeDetailShowLink(record.executeId));
  }

  handleExecuteTableChange = (pagination, filters, sorter, barFilters) => {
    // window.console.log(pagination, filters, sorter);
    const Filters = { ...filters };
    if (barFilters && barFilters.length > 0) {
      Filters.summary = barFilters;
    }
    if (pagination.current) {
      TestPlanStore.setFilters(Filters);
      TestPlanStore.rightEnterLoading();
      TestPlanStore.setExecutePagination(pagination);
      TestPlanStore.reloadCycle();
    }
  }

  onDragEnd = (sourceIndex, targetIndex) => {
    let lastRank = null;
    let nextRank = null;
    const { testList } = TestPlanStore;
    if (sourceIndex < targetIndex) {
      lastRank = testList[targetIndex].rank;
      nextRank = testList[targetIndex + 1] ? testList[targetIndex + 1].rank : null;
    } else if (sourceIndex > targetIndex) {
      lastRank = testList[targetIndex - 1] ? testList[targetIndex - 1].rank : null;
      nextRank = testList[targetIndex].rank;
    }
    // window.console.log(sourceIndex, targetIndex, lastRank, nextRank);
    const source = testList[sourceIndex];
    const temp = { ...source };
    delete temp.defects;
    delete temp.caseAttachment;
    delete temp.testCycleCaseStepES;
    delete temp.issueInfosDTO;
    temp.assignedTo = temp.assignedTo || 0;
    TestPlanStore.rightEnterLoading();
    editExecuteDetail({
      ...temp,
      ...{
        lastRank,
        nextRank,
      },
    }).then((res) => {
      TestPlanStore.reloadCycle();
    }).catch((err) => {
      Choerodon.prompt('网络错误');
      TestPlanStore.rightLeaveLoading();
    });
  }

  handleLastUpdatedByChange=(value) => {
    TestPlanStore.setLastUpdatedBy(value);
    TestPlanStore.loadCycle();
  }

  handleAssignedToChange=(value) => {
    TestPlanStore.setAssignedTo(value);
    TestPlanStore.loadCycle();
  }

  handleDeleteExecute = (record) => {
    const { executeId } = record;
    confirm({
      width: 560,
      title: Choerodon.getMessage('确认删除吗?', 'Confirm delete'),
      content: Choerodon.getMessage('当您点击删除后，该条执行将从此计划阶段中移除!', 'When you click delete, after which the data will be deleted !'),
      onOk: () => {
        TestPlanStore.rightEnterLoading();
        deleteExecute(executeId)
          .then((res) => {           
            TestPlanStore.reloadCycle();
          }).catch((err) => {
            console.log(err);
            Choerodon.prompt('网络异常');
            TestPlanStore.rightLeaveLoading();
          });
      },
      okText: '删除',
      okType: 'danger',
    });
  }

  render() {
    const { CreateCycleVisible, statusList, prioritys } = this.state;
    const {
      testList, executePagination, loading, rightLoading,
    } = TestPlanStore;

    return (
      <Page className="c7ntest-TestPlan">
        <Header title={<FormattedMessage id="testPlan_name" />}>
          <Button onClick={() => { this.setState({ CreateCycleVisible: true }); }}>
            <Icon type="playlist_add icon" />
            <FormattedMessage id="cycle_create_title" />
          </Button>
          <Button className="leftBtn" onClick={() => this.ExportSide.open()}>
            <Icon type="export icon" />
            <FormattedMessage id="export" />
          </Button>
          <Button onClick={this.refresh}>
            <Icon type="autorenew icon" />
            <FormattedMessage id="refresh" />
          </Button>
        </Header>
        <Content
          title={null}
          description={null}
          style={{ padding: 0, display: 'flex' }}
        >
          <Spin spinning={loading}>
            <div className="c7ntest-TestPlan-content">
              <Injecter store={TestPlanStore} item="EditCycleVisible">
                {visible => <EditCycle visible={visible} />}
              </Injecter>
              <Injecter store={TestPlanStore} item="EditStageVisible">
                {visible => <EditStage visible={visible} />}
              </Injecter>
              <CreateCycle
                visible={CreateCycleVisible}
                onCancel={() => { this.setState({ CreateCycleVisible: false }); }}
                onOk={() => { this.setState({ CreateCycleVisible: false }); this.refresh(); }}
              />
              <ExportSide ref={this.saveRef('ExportSide')} />
              <Injecter store={TestPlanStore} item="isTreeVisible">
                {isTreeVisible => <TreeArea isTreeVisible={isTreeVisible} setIsTreeVisible={TestPlanStore.setIsTreeVisible} />}
              </Injecter>
              <Injecter store={TestPlanStore} item={['currentCycle', 'getTimes', 'calendarShowMode', 'getTimesLength']}>
                {([currentCycle, times, calendarShowMode, getTimesLength]) => (currentCycle.key ? (
                  <div className="c7ntest-TestPlan-content-right">
                    <EventCalendar key={`${currentCycle.key}_${times.length}`} showMode={calendarShowMode} times={times} onItemClick={this.handleItemClick} />
                    {calendarShowMode === 'single' && (
                      <TestPlanTable
                        prioritys={prioritys}
                        statusList={statusList}
                        loading={rightLoading}
                        pagination={executePagination}
                        dataSource={testList}
                        onLastUpdatedByChange={this.handleLastUpdatedByChange}
                        onAssignedToChange={this.handleAssignedToChange}
                        onDragEnd={this.onDragEnd}                        
                        onTableChange={this.handleExecuteTableChange}
                        onTableRowClick={this.handleTableRowClick}
                        onDeleteExecute={this.handleDeleteExecute}
                      />
                    )}
                  </div> 
                ) : <NoCycle />)}
              </Injecter>
            </div>
          </Spin>
        </Content>
      </Page>
    );
  }
}

TestPlanHome.propTypes = {

};

export default TestPlanHome;
