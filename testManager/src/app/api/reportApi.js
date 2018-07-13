import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getReports(pagination, issueIds) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  return axios.get(`/test/v1/projects/${projectId}/cycle/query?size=${size}&page=${page}`, issueIds);
}
