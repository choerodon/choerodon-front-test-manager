import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getCycles() {
  const projectId = AppState.currentMenuType.id;
  return axios.get(`/test/v1/projects/${projectId}/cycle/query`);
}
export function getStatusList(statusType) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/status/query`, { statusType, projectId });
}
export function getCycleById(pagination, cycleId, filters) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  //   return axios.get(`/test/v1/cycle/case/query/${cycleId}`);
  const Filters = { ...filters };
  Filters && Object.keys(Filters).forEach((filter) => {
    Filters[filter] = Filters[filter][0]; 
  },
  );
  return axios.post(`/test/v1/projects/${projectId}/cycle/case/query/cycleId?size=${size}&page=${page}`, { cycleId, ...Filters });
}
export function addCycle(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle`, data);
}
export function editCycleExecute(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/case/update`, data);
}
export function deleteExecute(executeId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/cycle/case?cycleCaseId=${executeId}`);
}
export function deleteCycleOrFolder(cycleId) {
  const projectId = AppState.currentMenuType.id;
  return axios.delete(`/test/v1/projects/${projectId}/cycle/delete/${cycleId}`);
}
export function clone(cycleId, data, type) {
  const projectId = AppState.currentMenuType.id;
  if (type === 'CLONE_FOLDER') {
    return axios.post(`/test/v1/projects/${projectId}/cycle/clone/folder/${cycleId}`, data);
  } else if (type === 'CLONE_CYCLE') {
    return axios.post(`/test/v1/projects/${projectId}/cycle/clone/cycle/${cycleId}`, data);
  }
  return axios.post(`/test/v1/projects/${projectId}/cycle/clone/folder/${cycleId}`, data);
}

export function addFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle`, data);
}
export function editFolder(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.put(`/test/v1/projects/${projectId}/cycle`, data);
}
export function createCycleExecute(data) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/case/insert/batch`, data);
}
export function createCycleExecuteFromCycle(fromCycleId, toCycleId, assignee, filter) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/case/insert/case/filter/${fromCycleId}/to/${toCycleId}/assigneeTo/${assignee}`, filter);
}

export function getCyclesByVersionId(versionId) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/query/cycle/versionId/${versionId}`);
}
export function getFoldersByCycleId(cycleId) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/cycle/query/folder/cycleId/${cycleId}`);
}
