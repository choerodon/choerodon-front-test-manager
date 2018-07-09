import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getCycleByVersionId(versionId) {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/cycle/query/${versionId}`);
}

export function getFolderByCycleId(cycleId) {
  return axios.get(`test/v1/cycle/case/query/${cycleId}`);
}

export function filterCycleWithBar(parameter) {
  const projectId = AppState.currentMenuType.id;
  const parameters = {
    projectId: 144,
    parameter,
  };
  return axios.post(`/test/v1/projects/${projectId}/cycle/filter`, parameters);
}
export function getCycleById(cycleId) {
  const projectId = AppState.currentMenuType.id;
  //   return axios.get(`/test/v1/cycle/case/query/${cycleId}`);
  return axios.get(`/test/v1/projects/${projectId}/cycle/case/query/${cycleId}`);
}
