import React, { Component } from 'react';
import {
  Button, Select, Icon, Modal, Upload, Spin, 
} from 'choerodon-ui';
import _ from 'lodash';
import { removeDefect, addDefects } from '../../../api/CycleExecuteApi';
import { getIssueList } from '../../../api/agileApi';
import './DefectSelect.scss';
import SelectCreateIssueFooter from '../SelectCreateIssueFooter';

const { Option } = Select;
class DefectSelect extends Component {
  constructor(props) {
    super(props);
    const { defects } = this.props;
    this.state = {
      selectLoading: false,
      issueList: [],
      defects: defects || [],
      defectIds: defects ? defects.map(defect => defect.issueId.toString()) : [],
      originDefects: defects ? defects.map(defect => defect.issueId.toString()) : [],
    };
  }

  componentDidMount() {
    this.getIssueList();
  }

  getIssueList = () => {
    this.setState({
      selectLoading: true,
    });
    getIssueList().then((issueData) => {
      this.setState({
        issueList: issueData.content,
        selectLoading: false,
      });
    });
  }

  handleDefectsChange = (List) => {
    const {
      originDefects, defects, defectIds, issueList, 
    } = this.state;
    const oldList = [...defectIds];
    // window.console.log('old', oldList, 'new', List);
    // 删除元素
    if (oldList.length > List.length) {
      const deleteEle = oldList.filter(old => !List.includes(old));
      // 如果isse已存在，调用删除接口
      if (defectIds.includes(deleteEle[0])
        && _.find(defects, { issueId: Number(deleteEle[0]) })) {
        window.console.log(defects);
        removeDefect(_.find(defects, { issueId: Number(deleteEle[0]) }).id);
      }
      window.console.log('delete');
    } else {
      window.console.log('add', List.filter(item => !oldList.includes(item)));
    }
    // 收集需要添加的缺陷
    const needAdd = issueList
      .filter(issue => List.includes(issue.issueId.toString()))// 取到选中的issueList
      .filter(issue => !originDefects.includes(issue.issueId.toString()))// 去掉之前已有的
      .map(item => ({
        defectType: 'CASE_STEP',
        defectLinkId: this.props.executeStepId,
        issueId: item.issueId,
        defectName: item.issueNum,
      }));
    this.props.setNeedAdd(needAdd);
    this.setState({
      defectIds: List,
    });
  }

  render() {
    const {
      defects, selectLoading, defectIds, issueList, originDefects, 
    } = this.state;
    const defectsOptions = issueList.map(issue => (
      <Option key={issue.issueId} value={issue.issueId.toString()}>
        {issue.issueNum} 
        {' '}
        {issue.summary}
      </Option>
    ));
    return (     
      <Select          
        dropdownStyle={{        
          width: 300,  
        }}
        getPopupContainer={this.props.getPopupContainer}
        autoFocus
        filter
        mode="multiple"
        dropdownMatchSelectWidth={false}
        filterOption={false}
        loading={selectLoading}
        defaultValue={defects.map(defect => defect.issueId.toString())}
        footer={<SelectCreateIssueFooter />}
        style={{ width: '100%' }}
        onChange={this.handleDefectsChange}
        onFilterChange={(value) => {
          this.setState({
            selectLoading: true,
          });
          getIssueList(value).then((issueData) => {
            this.setState({
              issueList: issueData.content,
              selectLoading: false,
            });
          });
        }}
      >
        {defectsOptions}
      </Select>
    );
  }
}

DefectSelect.propTypes = {

};

export default DefectSelect;
