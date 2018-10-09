import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getReportsFromStory(pagination, search) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue?size=${size}&page=${page}`, search);
}

export function getReportsFromDefect(pagination, search) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect?size=${size}&page=${page}`, search);
}
export function getReportsFromDefectByIssueIds(issueIds) {
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect/by/issueId`, issueIds);
}
