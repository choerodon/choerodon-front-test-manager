// zh_CN.js
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

const zhCN = {
  ...pageDetail,
  // public
  refresh: '刷新',
  detail: '详情',
  operate: '操作',
  save: '保存',
  active: '启用',
  edit: '修改',
  cancel: '取消',
  delete: '删除',
  'confirm.delete': '确认删除吗？',
  'confirm.delete.tip': '当你点击删除后，该条数据将被永久删除，不可恢复!',
  bug: '缺陷',
  attachment: '附件',
  upload_attachment: '上传附件',
  status: '状态',
  day: '天',
  // 执行详情
  execute_detail: '执行详情',
  execute_cycle_execute: '测试执行',
  execute_description: '描述',
  execute_edit_fullScreen: '全屏编辑',
  execute_status: '执行状态',
  execute_assignedTo: '已指定至',
  execute_executive: '执行方',
  execute_executeTime: '执行时间',
  execute_testDetail: '测试详细信息',
  execute_executeHistory: '执行历史记录',
  // 测试步骤表格
  execute_testStep: '测试步骤',
  execute_testData: '测试数据',
  execute_expectedOutcome: '预期结果',
  execute_stepAttachment: '步骤附件',
  execute_stepStatus: '状态',
  execute_comment: '注释',
  // 执行历史记录表格
  execute_history_oldValue: '原值',
  execute_history_newValue: '新值',
  // 编辑步骤详情侧边栏
  execute_stepDetail: '测试详细信息',
  execute_stepEditTitle: '修改步骤“{testStep}”的信息',


  // 测试摘要
  summary_title: '测试摘要',
  summary_totalTest: '总测试数量',
  summary_totalRest: '总剩余数量',
  summary_totalExexute: '总执行数量',
  summary_totalNotPlan: '总未规划数量',
  summary_testSummary: '测试统计',
  summary_summaryByVersion: '按版本',
  summary_summaryByComponent: '按模块',  
  summary_summaryByLabel: '按标签',
  summary_noVersion: '未规划',
  summary_noComponent: '无组件',
  summary_noLabel: '无标签',
  summary_version: '版本',
  summary_component: '组件',
  summary_label: '标签',
  summary_num: '数量',
  summary_summaryTimeLeap: '查看时段',
  summary_testCreate: '测试创建',
  summary_testExecute: '测试执行',
  summary_createNum: '创建数',
  summary_executeNum: '执行数',
  summary_testCreated: '创建测试',
  summary_testExecuted: '执行测试',
  summary_testLast: '过去',
};

export default zhCN;
