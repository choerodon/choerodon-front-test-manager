import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getCycles() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/cycle/query`);
}

export function getCycleById(cycleId) {
  const projectId = AppState.currentMenuType.id;
  //   return axios.get(`/test/v1/cycle/case/query/${cycleId}`);
  return axios.get(`/test/v1/projects/${projectId}/cycle/case/query/${cycleId}`);
}
export function editCycleExecute(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/case/update`, data);
}
export function deleteExecute(executeId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/cycle/case?cycleCaseId=${executeId}`);
}
