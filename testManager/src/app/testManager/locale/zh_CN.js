// zh_CN.js
import { stores } from 'choerodon-front-boot';

const { AppState } = stores;
const projectName = AppState.currentMenuType.name;
// 文档地址前缀
const docServer = 'http://v0-7.choerodon.io/zh/docs';
// 界面标题描述统一管理
const pageDetail = {

  status_custom_home_title: `项目"${projectName}"的自定义状态`,
  status_custom_home_description: '下表显示可用测试执行状态，测试步骤状态。',

  // 报表
  report_content_title: `项目"${projectName}"的报表`,
  report_content_description: '两种可跟踪性报告可用：要求 -> 测试 -> 执行 -> 缺陷，缺陷 -> 执行 -> 测试 -> 。  点击您需要查看的报告类型可以查看具体的详细内容。',

  // 测试循环
  cycle_title: `项目"${projectName}"的循环摘要`,
  cycle_description: '循环摘要使用树状图查看本项目中不同版本所对应的测试情况。',
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
  confirm_delete: '确认删除吗？',
  confirm_deleteTip: '当你点击删除后，该条数据将被永久删除，不可恢复!',
  demand: '要求',
  test: '测试',
  step: '步骤',
  execute: '执行',
  bug: '缺陷',
  attachment: '附件',
  upload_attachment: '上传附件',
  status: '状态',
  version: '版本',
  cycle: '测试循环',
  type: '类型',
  comment: '说明',
  name: '名称',
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

  // 自定义状态
  status_title: '自定义状态',
  status_create: '创建状态',
  status_executeStatus: '测试执行状态',
  status_steptatus: '测试步骤状态',
  status_type: '类型',
  status_comment: '说明',
  status_color: '颜色',

  // 报表
  report_title: '报表',
  report_switch: '切换报表',
  report_dropDown_demand: '要求到缺陷',
  report_dropDown_defect: '缺陷到要求',
  report_dropDown_home: '主页',
  report_demandToDefect: '要求 -> 测试 -> 执行 -> 缺陷', 
  report_defectToDemand: '缺陷 -> 执行 -> 测试 -> 要求',
  report_demandToDefect_description: '从类型字段搜索要求或缺陷，然后选择合适版本以缩小范围，最后单击“生成” 创建可跟踪性报告。',
  report_defectToDemand_description: '从类型字段搜索要求或缺陷，然后选择合适版本以缩小范围，最后单击“生成” 创建可跟踪性报告。',
  report_chooseQuestion: '选择问题',
  report_defectCount: '缺陷数',
  report_total: '总共',
  // 选择问题侧边栏
  report_select_title: '选择问题',
  report_select_content_title: `项目“${projectName}”的报表选择问题`,
  report_select_content_description: '您可以选择任意问题生成报表',
  report_select_allVersion: '所有版本',
  report_select_questionId: '测试问题ID',
  report_select_summary: '摘要',

  // 测试循环
  cycle_name: '测试循环',
  cycle_cycleName: '循环名称',
  cycle_addCycle: '添加执行',
  cycle_build: '构建号',
  cycle_environment: '环境',
  cycle_createBy: '创建人',
  cycle_startTime: '开始时间',
  cycle_cycleExecute: '循环层执行数',
  cycle_endTime: '结束时间',
  cycle_totalExecute: '全层级执行数',
  cycle_totalExecuted: '全层级已执行数',
  cycle_comment: '说明',
  cycle_executeBy: '执行方',
  cycle_executeTime: '执行时间',
  cycle_assignedTo: '被指定人',
  // 循环树
  cycle_addFolder: '增加文件夹', 
  cycle_editCycle: '编辑循环',
  cycle_deleteCycle: '删除循环',
  cycle_cloneCycle: '克隆循环',
  cycle_editFolder: '编辑文件夹',
  cycle_deleteFolder: '删除文件夹',
  cycle_cloneFolder: '克隆文件夹',
  cycle_newFolder: '新文件夹',

  // 创建测试循环侧边
  cycle_create_title: '创建测试循环',
  cycle_create_content_title: `在项目“${projectName}”中创建测试循环`,
  cycle_create_content_description: '您可以在一个版本中创建一个测试循环。',
  // 创建执行侧边
  cycle_createExecute_title: '添加测试执行',
  cycle_createExecute_content_title: '添加测试执行到{type}“{title}”',
  cycle_createExecute_content_description: '您可以在目标版本创建多个测试执行，可以从问题或已有执行创建。',
  cycle_createExecute_createFromQuestion: '从问题添加',
  cycle_createExecute_createFromCycle: '从循环添加',
  cycle_createExecute_testQuestion: '测试问题',
  cycle_createExecute_me: '我',
  cycle_createExecute_others: '其他人',
  cycle_createExecute_selectAssign: '选择指派人',
  cycle_createExecute_folder: '文件夹',
};

export default zhCN;
