import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getReportsFromStory(pagination, issueIds) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  if (issueIds && issueIds.length > 0) {
    return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue/by/issueId?size=${size}&page=${page}`, issueIds);
  }

  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue?size=${size}&page=${page}`, {
    advancedSearchArgs: {
      // typeCode: ['story'],
    },
    otherArgs: {

    },
  });
}

export function getReportsFromDefect(pagination, issueIds) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  if (issueIds && issueIds.length > 0) {
    return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect/by/issueId?size=${size}&page=${page}`, issueIds);
  }

  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/defect`);
}
