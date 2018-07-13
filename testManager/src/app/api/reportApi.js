import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;
export function getReportsFromStory(pagination, issueIds) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue?size=${size}&page=${page}`, {
    advancedSearchArgs: {
    
    }, 
    otherArgs: {
 
    },
  });  
}
export function getReports(pagination, issueIds) {
  const projectId = AppState.currentMenuType.id;
  const { size, page } = pagination;
  return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue?size=${size}&page=${page}`, issueIds);
  // return axios.post(`/test/v1/projects/${projectId}/case/get/reporter/from/issue/query?size=${size}&page=${page}`, issueIds);
}