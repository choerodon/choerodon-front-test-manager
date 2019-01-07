import { getProjectId, request } from '../common/utils';

// 123
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
  return request.post(`agile/v1/projects/${getProjectId()}/issues/test_component/no_sub`, search);
}
/**
 *获取当前项目的issue类型列表
 *
 * @export
 * @returns
 */
export function getIssueTypes(applyType) {
  return request.get(`/issue/v1/projects/${getProjectId()}/schemes/query_issue_types_with_sm_id?apply_type=${applyType || 'test'}`);
}
/**
 *获取缺陷列表（排除test类型）
 *
 * @export
 * @param {*} summary
 * @returns
 */
export function getIssuesForDefects(summary) {
  return new Promise(((resolve) => {
    getIssueTypes('agile').then((types) => {
      const advancedSearchArgs = {
        issueTypeId: types.map(type => type.id),
      };
      const searchArgs = {};
      if (summary) {
        searchArgs.summary = summary;
      }
      resolve(getIssues({ advancedSearchArgs, searchArgs }));
    });
  }));
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
    // advancedSearchArgs.typeCode = ['issue_test'];
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
  return new Promise(((resolve) => {
    getIssueTypes('test').then((types) => {
      const advancedSearchArgs = {
        issueTypeId: types.map(type => type.id),
      };
      const searchArgs = {};
      resolve(getIssues({ advancedSearchArgs, searchArgs }));
    });
  }));
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
  return request.get(`/issue/v1/projects/${getProjectId()}/priority/list_by_org`);
}
/**
 *获取当前项目的issue状态列表
 *
 * @export
 * @returns
 */
export function getIssueStatus(applyType) {
  return request.get(`/issue/v1/projects/${getProjectId()}/schemes/query_status_by_project_id?apply_type=${applyType || 'test'}`);
}
