import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
export function getStatusList(statusType) {
  return axios.post('/test/v1/status/query', { statusType });
}
export function editStatus(data) {
  return axios.put('/test/v1/status/update', data);
}
export function createStatus(data) {
  return axios.post('/test/v1/status', data);
}
export function deleteStatus(statusId) {
  return axios.delete(`/test/v1/status/${statusId}`);
}
