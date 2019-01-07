import { getProjectId, request } from '../common/utils';

export function getCycle(id) {
  return request.get(`/test/v1/projects/${getProjectId()}/cycle/case/query/one/${id}`);
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
export function getCycleDetails(pagination, cycleCaseId) {
  const { size, page } = pagination;

  return request.get(`test/v1/projects/${getProjectId()}/cycle/case/step/query/${cycleCaseId}?size=${size}&page=${page}`);
}
export function getCycleHistiorys(pagination, cycleCaseId) {
  const { size, page } = pagination;

  return request.get(`test/v1/projects/${getProjectId()}/cycle/case/history/${cycleCaseId}?size=${size}&page=${page}`);
}

/**
 * 增加缺陷弹框增加缺陷
 * 
 */
export function addBug(defectType, id, data) {
  return request.post(`test/v1/projects/${getProjectId()}/defect/createIssueAndDefect/${defectType}/${id}?applyType=agile`, data);
}
