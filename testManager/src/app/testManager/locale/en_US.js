// 文档地址前缀
import { stores } from 'choerodon-front-boot';

const { AppState } = stores;
const projectName = AppState.currentMenuType.name;
const docServer = 'http://v0-7.choerodon.io/zh/docs';
// 界面标题描述统一管理
const pageDetail = {
  status_custom_home_title: `Custom status of project "${projectName}"`,
  status_custom_home_description: 'The table below shows the available test execution status, test step status.',
  // 报表
  report_content_title: `Reports of project "${projectName}"`,
  report_content_description: 'There are two kinks of report：demand -> test -> execute -> defect，defect -> execute -> test -> demand 。  Click to choose whick kind of report you want to see。',
};
const enUS = {
  ...pageDetail,
  // public
  edit: 'Edit',
  detail: 'Detail',
  save: 'Save',
  active: 'Active',
  stoped: 'Stopped',
  refresh: 'Refresh',
  operate: 'Operate',
  cancel: 'Cancel',
  delete: 'Delete',
  'confirm.delete': 'Confirm delete',
  'confirm.delete.tip': 'When you click delete, after which the data will be permanently deleted and irreversible!',
  demand: 'Demand',
  test: 'Test',
  step: 'Test Step',
  execute: 'Exexute',
  bug: 'Defects',
  attachment: 'Attachment',
  upload_attachment: 'Upload attachment',
  status: 'Status',
  day: 'days',
  // 测试执行
  execute_detail: 'Execution details',
  execute_cycle_execute: 'Test execution',
  execute_description: 'Description',
  execute_edit_fullScreen: 'Edit fullScreen',
  execute_status: 'Execute status',
  execute_assignedTo: 'Assigned to',
  execute_executive: 'Executive',
  execute_executeTime: 'Execute time',
  execute_testDetail: 'Test detail',
  execute_executeHistory: 'Execute history',
  // 测试步骤表格
  execute_testStep: 'Execute Step',
  execute_testData: 'Test Data',
  execute_expectedOutcome: 'Expected outcome',
  execute_stepAttachment: 'Step attachment', 
  execute_stepStatus: 'Status',
  execute_comment: 'Comment',    
  // 执行历史记录表格
  execute_history_oldValue: 'Old value',
  execute_history_newValue: 'New value',  
  // 编辑步骤详情侧边栏
  execute_stepDetail: 'Step detail',
  execute_stepEditTitle: 'Edit the info of test step“{testStep}”',

  // 测试摘要
  summary_title: 'Test Summary',
  summary_totalTest: 'Total Tests',
  summary_totalRest: 'Total Rests',
  summary_totalExexute: 'Total Execute',
  summary_totalNotPlan: 'Not Plan',
  summary_testSummary: 'Test Summary',
  summary_summaryByVersion: 'By Version',
  summary_summaryByComponent: 'By Component',  
  summary_summaryByLabel: 'By Label',
  summary_noVersion: 'Not Plan',
  summary_noComponent: 'No Component',
  summary_noLabel: 'No Label',
  summary_version: 'Version',
  summary_component: 'Component',
  summary_label: 'Label',
  summary_num: 'Number',
  summary_summaryTimeLeap: 'View Period',
  summary_testCreate: 'Test Create',
  summary_testExecute: 'Test Execute',
  summary_createNum: 'Created',
  summary_executeNum: 'Executed',
  summary_testCreated: 'Test Created',
  summary_testExecuted: 'Test Executed',
  summary_testLast: 'Last',

  // 自定义状态
  status_title: 'Custom Status',
  status_create: 'Create Status',
  status_executeStatus: 'Execute Status',
  status_steptatus: 'Step Status',
  status_type: 'Type',
  status_comment: 'Comment',
  status_color: 'Color',

  // 报表
  report_title: 'All reports',
  report_switch: 'Switch report',
  report_dropDown_demand: 'demand to defect',
  report_dropDown_defect: 'defect to demand',
  report_dropDown_home: 'home',
  report_demandToDefect: 'demand -> test -> execute -> defect', 
  report_defectToDemand: 'defect -> execute -> test -> demand',
  report_demandToDefect_description: 'Search for requirements or defects from the Type field, then select the appropriate version to narrow the scope, and finally click Generate to create a traceability report.',
  report_defectToDemand_description: 'Search for requirements or defects from the Type field, then select the appropriate version to narrow the scope, and finally click Generate to create a traceability report.',
  report_chooseQuestion: 'choose question',
  report_defectCount: 'Defect count',
  report_total: 'Total',
};
export default enUS;
