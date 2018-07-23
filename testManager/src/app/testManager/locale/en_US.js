// 文档地址前缀
const docServer = 'http://v0-7.choerodon.io/zh/docs';
// 界面标题描述统一管理
const pageDetail = {

  // network
  'network.title': '项目"{name}"的网络配置',
  'network.description': '网络管理是定义了一种访问网络的策略，是指内部的负载均衡以及网络转发，会将网络流量定向转发到指定的单个或者多个实例容器组。',
  'network.link': `${docServer}/user-guide/deployment-pipeline/service/`,
  'network.create.title': '项目"{name}"中创建网络',
  'network.create.description': '请选择环境及实例，配置网络转发策略。目前支持内部和外部两种网络转发方式。\n' +
  '        转发内部网络，则只需定义端口即可，系统会自动为您分配集群内部IP；转发外部网络，则需要定义外部IP及端口。',
  'network.create.link': `${docServer}/user-guide/deployment-pipeline/service/`,
  'network.update.title': '对网络"{name}"进行修改',
  'network.update.description': '您可在此修改网络配置信息。',
  'network.update.link': `${docServer}/user-guide/deployment-pipeline/service/`,

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
  bug: 'Defects',
  attachment: 'Attachment',
  upload_attachment: 'Upload attachment',
  status: 'Status',
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
};
export default enUS;
