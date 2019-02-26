import { getProjectId, request } from '../common/utils';

export function getCycle(id, cycleId) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/case/query/one/${id}?cycleId=${cycleId || 0}`);
}

export function editCycle(cycle) {
  return request.post(`/test/v1/projects/${getProjectId()}/cycle/case/update`, cycle);
}
/**
 *增加缺陷
 *
 * @export
 * @param {*} defects
 * @returns
 */
export function addDefects(defects) {
  return request.post(`/test/v1/projects/${getProjectId()}/defect`, defects);
}
/**
 *移除缺陷
 *
 * @export
 * @param {*} defectId
 * @returns
 */
export function removeDefect(defectId) {
  return request.delete(`/test/v1/projects/${getProjectId()}/defect/delete/${defectId}`);
}
export function editCycleSide(data) {
  const axiosConfig = {
    headers: { 'content-type': 'multipart/form-datal' },
  };

  return request.post(`/zuul/test/v1/projects/${getProjectId()}/cycle/case/step/updateWithAttach`, data, axiosConfig);
}
export function editCycleStep(data) {
  return request.put(`/test/v1/projects/${getProjectId()}/cycle/case/step`, data);
}
export function getCycleDetails(cycleCaseId) {
  return request.get(`test/v1/projects/${getProjectId()}/cycle/case/step/query/${cycleCaseId}`);
}
export function getCycleHistiorys(pagination, cycleCaseId) {
  const { size, page } = pagination;

  return request.get(`test/v1/projects/${getProjectId()}/cycle/case/history/${cycleCaseId}?size=${size}&page=${page}`);
}

/**
 * 在执行详情中为执行或步骤增加缺陷
 * 
 */
export function addBugForExecuteOrStep(defectType, id, data) {
  return request.post(`test/v1/projects/${getProjectId()}/defect/createIssueAndDefect/${defectType}/${id}?applyType=agile`, data);
}
