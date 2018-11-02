
import { getProjectId, request } from '../common/utils';
import './AutoTestApiMock';

/**
 *获取当前用户
 *
 * @export
 * @returns
 */
export function getAppList() {
  return request.get('/getAppList');
}
export function getTestHistoryByApp() {
  return request.get('/getTestHistoryByApp');
}
export function getYaml() {
  return request.get('/getYaml');
}
export function loadPodParam(projectId, id, type) {
  return request.get(`devops/v1/projects/${getProjectId()}/app_pod/${5}/containers/logs`);
}
