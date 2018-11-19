
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
