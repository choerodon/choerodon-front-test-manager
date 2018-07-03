import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
export function getCycle() {
  return axios.get('/test/v1/cycle/case/query/one/1');
}
export function getStatusList(statusType) {
  return axios.post('/test/v1/status/query', { statusType });
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
export function getCycleDetails(cycleCaseId) {
  return axios.get(`/test/v1/cycle/case/step/query/${cycleCaseId}?size=5&page=1`);
}
