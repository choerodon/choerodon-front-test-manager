import { stores, axios } from 'choerodon-front-boot';
import './AutoTestApiMock';

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
