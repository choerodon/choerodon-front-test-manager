
import { getProjectId, request } from '../common/utils';

export function getCycleTree(assignedTo) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/query${assignedTo ? `?assignedTo=${assignedTo}` : ''}`);
}
export function getExecutesByCycleId(pagination, cycleId, filters, type) {
  const { size, page } = pagination;
  const Filters = { ...filters };
  if (Filters) {
    Object.keys(Filters).forEach((filter) => {
      Filters[filter] = Filters[filter][0];
    });
  }
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/case/query/cycleId?size=${size}&page=${page}`, { cycleId, ...Filters });
}
export function addCycle(data) {
  return request.post(`/test/v1/projects/${getProjectId()}/cycle`, data);
}
export function editExecuteDetail(data) {
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/case/update`, data);
}
export function deleteExecute(executeId) {
  return request.delete(`/test/v1/projects/${getProjectId()}/cycle/case?cycleCaseId=${executeId}`);
}
export function deleteCycleOrFolder(cycleId) {
  return request.delete(`/test/v1/projects/${getProjectId()}/cycle/delete/${cycleId}`);
}
export function clone(cycleId, data, type) {
  if (type === 'CLONE_FOLDER') {
    return request.post(`/test/v1/projects/${getProjectId()}/cycle/clone/folder/${cycleId}`, data);
  } else if (type === 'CLONE_CYCLE') {
    return request.post(`/test/v1/projects/${getProjectId()}/cycle/clone/cycle/${cycleId}`, data);
  }
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/clone/folder/${cycleId}`, data);
}

export function addFolder(data) {
  return request.post(`/test/v1/projects/${getProjectId()}/cycle`, data);
}
export function editFolder(data) {
  return request.put(`/test/v1/projects/${getProjectId()}/cycle`, data);
}
export function exportCycle(cycleId) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/case/download/excel/${cycleId}`);
}
export function getCyclesByVersionId(versionId) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/get/cycles/all/in/version/${versionId}`);
}
export function getFoldersByCycleId(cycleId) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/query/folder/cycleId/${cycleId}`);
}
/**
 *获取导出历史
 *
 * @export
 * @returns
 */
export function getExportList() {
  return request.get(`/test/v1/projects/${getProjectId()}/test/fileload/history/cycle`);
}
