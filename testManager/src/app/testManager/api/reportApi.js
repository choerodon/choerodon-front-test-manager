import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getReportsFromStory(pagination, search) {
  const projectId = AppState.currentMenuType.id;
  const { organizationId } = AppState.currentMenuType;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue?size=${size}&page=${page}&organizationId=${organizationId}`, search);
}

export function getReportsFromDefect(pagination, search) {
  const projectId = AppState.currentMenuType.id;
  const { organizationId } = AppState.currentMenuType;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect?size=${size}&page=${page}&organizationId=${organizationId}`, search);
}
export function getReportsFromDefectByIssueIds(issueIds) {
  const { organizationId } = AppState.currentMenuType;
  const projectId = AppState.currentMenuType.id;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect/by/issueId?organizationId=${organizationId}`, issueIds);
}
