
import axios from 'axios';
import { getProjectId, request } from '../common/utils';
import './AutoTestApiMock';

/**
 *获取当前用户
 *
 * @export
 * @returns
 */
export function getAppList() {
  return axios.get('/getAppList');
}
export function getTestHistoryByApp() {
  return axios.get('/getTestHistoryByApp');
}
export function getYaml() {
  return axios.get('/getYaml');
}
export function loadPodParam(projectId, id, type) {
  return axios.get(`devops/v1/projects/${getProjectId()}/app_pod/${5}/containers/logs`);
}
export function getApps({
  page, size, sort, postData, 
}) {
  return request.post(`/devops/v1/projects/${getProjectId()}/apps/list_by_options?active=true&page=${page}&size=${size}&sort=${sort.field},${sort.order}`, JSON.stringify(postData));
}
export function getAppVersions(appId, flag = '') {
  return request.get(`/devops/v1/projects/${getProjectId()}/apps/${appId}/version/list?is_publish=${flag}`);
}
export function getEnvs() {
  return axios.get(`/devops/v1/projects/${getProjectId()}/envs?active=true`);   
}
