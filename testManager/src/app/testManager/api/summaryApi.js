import { axios, stores } from 'choerodon-front-boot';

const { AppState } = stores;

export function getCaseNotPlain() {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotPlain`);
}

export function getCaseNotRun() {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/countCaseNotRun`);
}
export function getCaseNum() {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/test/v1/projects/${projectId}/cycle/case/countCaseSum`);
}

export function getCycleRange(day, range) {
  const projectId = AppState.currentMenuType.id;

  return axios.post(`/test/v1/projects/${projectId}/cycle/case/range/${day}/${range}`);
}
export function getCreateRange(range) {
  const projectId = AppState.currentMenuType.id;

  return axios.get(`/agile/v1/projects/${projectId}/issues/type/issue_test?timeSlot=${range}`);
}
