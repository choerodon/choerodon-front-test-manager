import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
export function getCycle() {
  return axios.get('/test/v1/cycle/case/query/one/1');
}
export function getStatusList() {
  return axios.post('/test/v1/status/query', { statusType: 'CYCLE_CASE' });
}
export function getUsers(param) {
  const projectId = AppState.currentMenuType.id;
  if (param) {
    return axios.get(`/test/v1/user/${projectId}/users?param=${param}`);
  }
  return axios.get(`/test/v1/user/${projectId}/users`);
}
export function editCycle(cycle) {
  return axios.post('/test/v1/cycle/case/update', cycle);
}
