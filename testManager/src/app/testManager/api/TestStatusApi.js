import { stores, axios } from 'choerodon-front-boot';

const { AppState } = stores;
export function getStatusList(statusType) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/status/query`, { statusType, projectId });
}
export function editStatus(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/status/update`, { ...data, ...{ projectId: Number(projectId) } });
}
export function createStatus(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/status`, { ...data, ...{ projectId: Number(projectId) } });
}
export function deleteStatus(statusId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/status/${statusId}`);
}
