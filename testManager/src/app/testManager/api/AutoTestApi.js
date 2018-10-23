import { stores, axios } from 'choerodon-front-boot';
import './AutoTestApiMock';
import { handleProptError } from '../common/utils';

const { AppState } = stores;

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
  return axios.get(`devops/v1/projects/${projectId}/app_pod/${5}/containers/logs`)
    .then(datas => handleProptError(datas));
}
