import { axios, stores } from 'choerodon-front-boot';
import { func } from 'prop-types';

const { AppState } = stores;
export function getReportsFromStory(pagination, search) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  // if (issueIds && issueIds.length > 0) {
  //   return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue/by/issueId?size=${size}&page=${page}`, issueIds);
  // }

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
