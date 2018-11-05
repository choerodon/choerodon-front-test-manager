import { getProjectId, getOrganizationId, request } from '../common/utils';

/**
 *获取当前项目的所有版本
 *
 * @export
 * @returns
 */
export function getProjectVersion() {
  return request.get(`agile/v1/projects/${getProjectId()}/product_version/versions`);
}
/**
 *获取
 *
 * @export
 * @param {*} summary
 * @returns
 */
export function getIssues(search) {
  return request.post(`agile/v1/projects/${getProjectId()}/issues/test_component/no_sub?organizationId=${getOrganizationId()}`, search);
}
/**
 *获取缺陷列表（排除test类型）
 *
 * @export
 * @param {*} summary
 * @returns
 */
export function getIssuesForDefects(summary) {
  const advancedSearchArgs = {
    typeCode: ['sub_task', 'story', 'task', 'issue_epic', 'bug'],
  };
  const searchArgs = {};
  if (summary) {
    searchArgs.summary = summary;
  }
  return getIssues({ advancedSearchArgs, searchArgs });
}
/**
 *获取根据筛选条件获取issues
 *
 * @export
 * @param {*} summary
 * @param {*} type
 * @returns
 */
export function getIssueList(summary, type) {
  const advancedSearchArgs = {};
  const searchArgs = {};
  if (type) {
    advancedSearchArgs.typeCode = ['issue_test'];
  }
  if (summary) {
    searchArgs.summary = summary;
  }
  return getIssues({ advancedSearchArgs, searchArgs });
}
/**
 *获取测试类型issue数量
 *
 * @export
 * @param {*} search
 * @returns
 */
export function getIssueCount(search) {
  return getIssues(search);
}
/**
 *获取当前项目的模块
 *
 * @export
 * @returns
 */
export function getModules() {
  return request.get(`agile/v1/projects/${getProjectId()}/component`);
}
/**
 *获取当前项目的标签
 *
 * @export
 * @returns
 */
export function getLabels() {
  return request.get(`agile/v1/projects/${getProjectId()}/issue_labels`);
}
/**
 *获取当前组织的issue优先级
 *
 * @export
 * @returns
 */
export function getPrioritys() {
  return request.get(`/issue/v1/organizations/${getOrganizationId()}/priority/list_by_org`);
}
/**
 *获取当前项目的issue状态列表
 *
 * @export
 * @returns
 */
export function getIssueStatus() {
  return request.get(`agile/v1/projects/${getProjectId()}/issue_status/list`);
}
/**
 *获取当前项目的issue类型列表
 *
 * @export
 * @returns
 */
export function getIssueTypes() {
  return request.get(`issue/v1/projects/${getProjectId()}/schemes/query_issue_types_with_sm_id?scheme_type=test`);
}
